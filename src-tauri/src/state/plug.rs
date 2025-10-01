use buttplug::{
    client::{ButtplugClient, ButtplugClientError, ButtplugClientEvent},
    core::connector::new_json_ws_client_connector,
};
use futures::StreamExt;
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
                        println!("Stopped scanning for devices.");
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

        Ok(())
    }

    pub fn set_max_step(&mut self, did: DeviceID, fid: FeatureID, value: u32) -> Result<(), &str> {
        if let Some(dev) = self.device_manager.devices.get_mut(&did) {
            if let Some(feat) = dev.features.get_mut(&fid) {
                feat.max_step = value;
                return Ok(());
            }
            return Err("This feature does not exist");
        }
        return Err("This device does not exist");
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


// for device in &state.client.devices() {
//     if d.id == device.index() {
//         let mut vibrator_values = Vec::<f64>::new();
//         for feat in &d.features {
//             vibrator_values.push(feat.max_step as f64 / feat.step_count as f64);
//         }
//         if active {
//             device
//                 .vibrate(&ScalarValueCommand::ScalarValueVec(vibrator_values))
//                 .await
//                 .map_err(|e| e.to_string())?;
//         } else {
//             device.stop().await.map_err(|e| e.to_string())?;
//         }
//         return Ok(());
//     }
// }
