use std::collections::HashMap;

use buttplug::{
    client::{ButtplugClient, ButtplugClientError, ButtplugClientEvent, ScalarValueCommand},
    core::connector::new_json_ws_client_connector,
};
use futures::StreamExt;
use num::clamp;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};

use crate::state::{
    app::AppState,
    device::{
        hash::{DeviceID, FeatureID},
        DeviceManager,
    },
};

pub struct PlugState {
    pub websocket_address: String,
    client: ButtplugClient,
    device_manager: DeviceManager,
    scanning: bool,
}

#[derive(Serialize, Clone)]
pub struct DeviceDisplay {
    pub id: DeviceID,
    pub name: String,
    pub enabled: bool,
    pub features: Vec<FeatureDisplay>,
}

#[derive(Serialize, Clone)]
pub struct FeatureDisplay {
    pub id: FeatureID,
    pub name: String,
    pub step_count: u32,
    pub max_step: u32,
}

#[derive(Serialize, Clone)]
pub struct PlugDisplay {
    pub websocket_address: String,
    pub devices: Vec<DeviceDisplay>,
    pub scanning: bool,
    pub connected: bool,
}

impl PlugState {
    pub fn new(websocket_address: String) -> Self {
        let client = ButtplugClient::new("Plug Fortress");
        Self {
            websocket_address,
            client,
            device_manager: DeviceManager::new(),
            scanning: false,
        }
    }

    pub async fn init(&mut self, app_handle: &AppHandle) {
        let app = app_handle.clone();
        tauri::async_runtime::spawn(async move {
            let binding = app.state::<AppState>();
            let mut events = binding.plug.lock().await.client.event_stream();
            while let Some(event) = events.next().await {
                let mut state = binding.plug.lock().await;
                match event {
                    ButtplugClientEvent::DeviceAdded(device) => {
                        println!("Device added: {}", device.name());
                        let id = state.device_manager.insert(&device);
                        app.emit("bp-device-added", state.display_device(id))
                            .unwrap();
                        app.emit("bp-state-update", state.display()).unwrap();
                    }
                    ButtplugClientEvent::DeviceRemoved(info) => {
                        println!("Device removed: {}", info.name());
                        let id = DeviceID::from_device(&info);
                        app.emit("bp-device-removed", state.display_device(id))
                            .unwrap();
                        state.device_manager.remove(id).unwrap();
                        app.emit("bp-state-update", state.display()).unwrap();
                    }
                    ButtplugClientEvent::ScanningFinished => {
                        println!("Scanning session has finished.");
                        state.device_manager.clear();
                        for dev in state.client.devices() {
                            state.device_manager.insert(&dev);
                        }
                        state.scanning = false;
                        app.emit("bp-state-update", state.display()).unwrap();
                    }
                    ButtplugClientEvent::ServerDisconnect => {
                        println!("Disconnected from Buttplug server.");
                        state.device_manager.clear();
                        app.emit("bp-state-update", state.display()).unwrap();
                    }
                    _ => (),
                }
            }
        });
        let app_local = app_handle.clone();
        if let Err(e) = self.connect(app_local).await {
            eprintln!("{e}");
        }
        self.stop_vibration();
    }

    fn display_device(&self, id: DeviceID) -> Option<DeviceDisplay> {
        let device = self.device_manager.get(id)?;
        let mut features = Vec::<FeatureDisplay>::new();
        for (id, f) in device.features.iter() {
            features.push(FeatureDisplay {
                id: *id,
                name: f.name.clone(),
                step_count: f.step_count,
                max_step: f.max_step,
            });
        }
        Some(DeviceDisplay {
            id: id.clone(),
            name: device.name.clone(),
            enabled: device.enabled,
            features,
        })
    }

    pub fn display(&self) -> PlugDisplay {
        let devs = self
            .device_manager
            .devices
            .keys()
            .map(|id| self.display_device(*id).unwrap());
        PlugDisplay {
            websocket_address: self.websocket_address.clone(),
            devices: Vec::from_iter(devs),
            scanning: self.scanning,
            connected: self.client.connected(),
        }
    }

    pub async fn connect(&mut self, app_handle: AppHandle) -> Result<(), ButtplugClientError> {
        let connector = new_json_ws_client_connector(&self.websocket_address);
        self.client.connect(connector).await?;
        println!("Connected to Buttplug server.");
        self.device_manager.clear();
        for dev in self.client.devices() {
            self.device_manager.insert(&dev);
        }
        app_handle.emit("bp-state-update", self.display()).unwrap();
        Ok(())
    }

    pub async fn start_scanning(&mut self) -> Result<(), String> {
        self.client
            .start_scanning()
            .await
            .map_err(|e| e.to_string())?;
        self.scanning = true;
        println!("Started scanning for devices.");
        Ok(())
    }

    pub async fn stop_scanning(&mut self) -> Result<(), String> {
        self.client
            .stop_scanning()
            .await
            .map_err(|e| e.to_string())?;
        self.scanning = false;
        println!("Stopped scanning for devices.");
        Ok(())
    }

    pub fn set_max_step(
        &mut self,
        did: DeviceID,
        fid: FeatureID,
        value: u32,
    ) -> Result<(), String> {
        if let Some(dev) = self.device_manager.devices.get_mut(&did) {
            if let Some(feat) = dev.features.get_mut(&fid) {
                feat.max_step = value;
                return Ok(());
            }
            return Err("This feature does not exist".to_string());
        }
        return Err("This device does not exist".to_string());
    }

    pub async fn toggle_device(&mut self, did: DeviceID, enable: bool) -> Result<(), String> {
        if let Some(dev) = self.device_manager.devices.get_mut(&did) {
            dev.enabled = enable;
            self.update_vibration().await;
            return Ok(());
        }
        return Err("This device does not exist".to_string());
    }

    pub fn stop_vibration(&mut self) {
        for (_, device) in &mut self.device_manager.devices {
            for (_, feature) in &mut device.features {
                feature.current_power = 0.0;
            }
        }
    }

    pub async fn vibrate_add(&mut self, power: f64) {
        for (_, device) in &mut self.device_manager.devices {
            for (_, feature) in &mut device.features {
                feature.current_power +=
                    power * (feature.max_step as f64 / feature.step_count as f64) as f64;
                feature.current_power = clamp(feature.current_power, 0.0, 1.0);
            }
        }
        self.update_vibration().await;
    }
    pub async fn vibrate_remove(&mut self, power: f64) {
        for (_, device) in &mut self.device_manager.devices {
            for (_, feature) in &mut device.features {
                feature.current_power -=
                    power * (feature.max_step as f64 / feature.step_count as f64) as f64;
                feature.current_power = clamp(feature.current_power, 0.0, 1.0);
            }
        }
        self.update_vibration().await;
    }

    async fn update_vibration(&self) {
        for device in &self.client.devices() {
            let _ = device.stop().await.inspect_err(|e| println!("{e}"));
            let dev = self
                .device_manager
                .get(DeviceID::from_device(&device))
                .unwrap();
            if dev.enabled {
                let mut vibvec = HashMap::<u32, f64>::new();
                for (_, feature) in &dev.features {
                    vibvec.insert(feature.index, feature.current_power);
                }
                let _ = device
                    .vibrate(&ScalarValueCommand::ScalarValueMap(vibvec))
                    .await
                    .inspect_err(|e| println!("{e}"));
            }
        }
    }
}

#[tauri::command]
pub async fn connect_to_server(app_handle: AppHandle) {
    if app_handle
        .state::<AppState>()
        .plug
        .lock()
        .await
        .client
        .connected()
    {
        return;
    }
    if let Err(e) = app_handle
        .state::<AppState>()
        .plug
        .lock()
        .await
        .connect(app_handle.clone())
        .await
    {
        eprintln!("{e}");
    }
}

#[tauri::command]
pub async fn start_scanning(app_handle: AppHandle) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut state = state.plug.lock().await;
    let res = state.start_scanning().await;
    app_handle.emit("bp-state-update", state.display()).unwrap();
    res
}

#[tauri::command]
pub async fn stop_scanning(app_handle: AppHandle) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut state = state.plug.lock().await;
    let res = state.stop_scanning().await;
    app_handle.emit("bp-state-update", state.display()).unwrap();
    res
}

#[tauri::command]
pub async fn toggle_device(
    app_handle: AppHandle,
    device: DeviceID,
    enable: bool,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut state = state.plug.lock().await;
    let res = state.toggle_device(device, enable).await;
    app_handle.emit("bp-state-update", state.display()).unwrap();
    res
}

#[tauri::command]
pub async fn set_max_step(
    app_handle: AppHandle,
    device: DeviceID,
    feature: FeatureID,
    value: u32,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut state = state.plug.lock().await;
    let res = state.set_max_step(device, feature, value);
    app_handle.emit("bp-state-update", state.display()).unwrap();
    res
}

// pub async fn vibrate_once(&self, power: f64) {
//     // async fn vibrate_fade_out(
//     //     device: std::sync::Arc<ButtplugClientDevice>,
//     //     vibrator_values: Vec<f64>,
//     // ) -> Result<(), ButtplugClientError> {
//     //     let steps = 10;
//     //     let delay = Duration::from_millis(100);

//     //     for i in (0..steps).rev() {
//     //         let factor = i as f64 / steps as f64;
//     //         let values: Vec<f64> = vibrator_values.iter().map(|v| v * factor).collect();
//     //         device
//     //             .vibrate(&ScalarValueCommand::ScalarValueVec(values))
//     //             .await?;
//     //         tokio::time::sleep(delay).await;
//     //     }

//     //     device.stop().await?;
//     //     Ok(())
//     // }

//     for device in self.client.devices() {
//         let did = DeviceID::from_device(&device);
//         if !self.device_manager.get(did).unwrap().enabled {
//             continue;
//         }

//         let dev = self.device_manager.get(did).unwrap();
//         let mut vibrator_values = Vec::<f64>::new();
//         if let Some(attrs) = device.message_attributes().scalar_cmd() {
//             for attr in attrs {
//                 let feat = dev.features.get(&FeatureID::from_feature(attr)).unwrap();
//                 let max_power = feat.max_step as f64 / feat.step_count as f64;
//                 feat.current_power += max_power * power;
//                 vibrator_values
//                     .push(clamp_max(feat.current_power + max_power * power, max_power));
//             }
//         }

//         tauri::async_runtime::spawn(vibrate_fade_out(device, vibrator_values));
//     }
// }

// pub async fn vibrate_start(&self, power: f64) {
//     for device in self.client.devices() {
//         let did = DeviceID::from_device(&device);
//         if !self.device_manager.get(did).unwrap().enabled {
//             continue;
//         }

//         let dev = self.device_manager.get(did).unwrap();
//         let mut vibrator_values = Vec::<f64>::new();
//         if let Some(attrs) = device.message_attributes().scalar_cmd() {
//             for attr in attrs {
//                 let feat = dev.features.get(&FeatureID::from_feature(attr)).unwrap();
//                 let max_power = feat.max_step as f64 / feat.step_count as f64;
//                 vibrator_values.push(max_power * power);
//             }
//         }

//         tauri::async_runtime::spawn(
//             device.vibrate(&ScalarValueCommand::ScalarValueVec(vibrator_values)),
//         );
//     }
// }
// pub async fn vibrate_stop(&self) {
//     for device in self.client.devices() {
//         let did = DeviceID::from_device(&device);
//         if !self.device_manager.get(did).unwrap().enabled {
//             continue;
//         }

//         tauri::async_runtime::spawn(device.stop());
//     }
// }
