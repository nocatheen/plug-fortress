use buttplug::{
    client::{ButtplugClient, ButtplugClientError, ButtplugClientEvent, ScalarValueCommand},
    core::connector::new_json_ws_client_connector,
};
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::{async_runtime::Mutex, AppHandle, Emitter, Manager};

#[derive(Clone, Serialize)]
pub struct Feature {
    pub id: u32,
    pub name: String,
    pub step_count: u32,
    pub max_step: u32,
}

#[derive(Clone, Serialize)]
pub struct Device {
    pub id: u32,
    pub name: String,
    pub features: Vec<Feature>,
}

impl Device {
    pub fn new() -> Self {
        Self {
            id: 0,
            name: String::new(),
            features: Vec::<Feature>::new(),
        }
    }
}

pub struct PlugState {
    pub client: ButtplugClient,
    pub scanning: bool,
    pub wsaddr: String,
    pub devices: Vec<Device>,
    pub selected_device_id: i64,
}

impl PlugState {
    pub fn new() -> Self {
        let client = ButtplugClient::new("Plug Fortress");
        Self {
            client,
            scanning: false,
            wsaddr: String::from("ws://localhost:12345"),
            devices: Vec::<Device>::new(),
            selected_device_id: -1,
        }
    }

    pub fn find_feature_by_id(
        &mut self,
        device_id: u32,
        feature_id: u32,
    ) -> Result<&mut Feature, String> {
        for device in &mut self.devices {
            if device.id == device_id {
                for feature in &mut device.features {
                    if feature.id == feature_id {
                        return Ok(feature);
                    }
                }
                return Err(String::from(format!(
                    "Feature {feature_id} doesn't exist in this device!"
                )));
            }
        }
        Err(String::from(format!("Device {device_id} doesn't exist!")))
    }

    pub fn get_selected_device(&self) -> Option<&Device> {
        for device in &self.devices {
            if device.id as i64 == self.selected_device_id {
                return Some(device);
            }
        }
        None
    }

    pub fn update_devices(&mut self) {
        let mut devs = Vec::<Device>::new();

        for device in self.client.devices() {
            let mut cdev = Device {
                id: device.index(),
                name: device.name().to_string(),
                features: Vec::<Feature>::new(),
            };
            if let Some(attrs) = device.message_attributes().scalar_cmd() {
                for attr in attrs {
                    let mut max_step = *attr.step_count();
                    if let Ok(saved_feat) = self.find_feature_by_id(device.index(), *attr.index()) {
                        max_step = saved_feat.max_step;
                    }
                    cdev.features.push(Feature {
                        id: *attr.index(),
                        name: attr.actuator_type().to_string(),
                        step_count: *attr.step_count(),
                        max_step,
                    });
                }
            }
            devs.push(cdev);
        }

        // Selecting the first device by default if nothing is currently selected
        let mut flag = false;
        for d in &devs {
            if d.id as i64 == self.selected_device_id {
                flag = true;
            }
        }

        if devs.len() > 0 && !flag {
            self.selected_device_id = devs[0].id as i64;
        }

        self.devices = devs;
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub struct PlugStateClient {
    pub scanning: bool,
    pub connected: bool,
    pub selected_device_id: i64,
}

#[tauri::command]
pub async fn get_plug_state(
    state: tauri::State<'_, Mutex<PlugState>>,
) -> Result<PlugStateClient, String> {
    let state = state.lock().await;
    Ok(PlugStateClient {
        scanning: state.scanning,
        connected: state.client.connected(),
        selected_device_id: state.selected_device_id,
    })
}

pub async fn check_connection(
    state: tauri::State<'_, Mutex<PlugState>>,
    address: &str,
) -> Result<(), String> {
    {
        let mut state = state.lock().await;
        if state.client.connected() && address == state.wsaddr {
            return Ok(());
        }
        state.wsaddr = String::from(address);
    }
    connect_to_server(state, address)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

async fn connect_to_server(
    state: tauri::State<'_, Mutex<PlugState>>,
    address: &str,
) -> Result<(), ButtplugClientError> {
    let mut state = state.lock().await;

    let connector = new_json_ws_client_connector(address);
    state.client.connect(connector).await?;
    println!("Connected to Buttplug server.");
    state.update_devices();

    Ok(())
}

#[tauri::command]
pub async fn start_scanning(
    app_handle: AppHandle,
    state: tauri::State<'_, Mutex<PlugState>>,
) -> Result<(), String> {
    let mut state = state.lock().await;
    let mut events = state.client.event_stream();
    tauri::async_runtime::spawn(async move {
        let state = app_handle.state::<Mutex<PlugState>>();
        while let Some(event) = events.next().await {
            match event {
                ButtplugClientEvent::DeviceAdded(device) => {
                    println!("Device added: {}", device.name());
                    let mut state = state.lock().await;
                    state.update_devices();
                    app_handle
                        .emit(
                            "device-added",
                            Device {
                                id: device.index(),
                                name: device.name().to_owned(),
                                features: Vec::new(),
                            },
                        )
                        .unwrap();
                }
                ButtplugClientEvent::DeviceRemoved(info) => {
                    println!("Device removed: {}", info.name());
                    app_handle
                        .emit(
                            "device-removed",
                            Device {
                                id: info.index(),
                                name: info.name().to_owned(),
                                features: Vec::new(),
                            },
                        )
                        .unwrap();
                }
                ButtplugClientEvent::ScanningFinished => {
                    break;
                }
                _ => {}
            }
        }
    });
    state
        .client
        .start_scanning()
        .await
        .map_err(|e| e.to_string())?;
    state.scanning = true;
    println!("Started scanning for devices.");
    Ok(())
}

#[tauri::command]
pub async fn stop_scanning(state: tauri::State<'_, Mutex<PlugState>>) -> Result<(), String> {
    let mut state = state.lock().await;
    state
        .client
        .stop_scanning()
        .await
        .map_err(|e| e.to_string())?;
    state.scanning = false;
    state.update_devices();
    println!("Stopped scanning for devices.");
    Ok(())
}

#[tauri::command]
pub async fn list_devices(
    state: tauri::State<'_, Mutex<PlugState>>,
) -> Result<Vec<Device>, String> {
    let state = state.lock().await;
    Ok(state.devices.clone())
}

#[tauri::command]
pub async fn set_feature_max_step(
    state: tauri::State<'_, Mutex<PlugState>>,
    device_id: u32,
    feature_id: u32,
    max_step: u32,
) -> Result<(), String> {
    let mut state = state.lock().await;
    let feat = state.find_feature_by_id(device_id, feature_id)?;
    feat.max_step = max_step;
    Ok(())
}

#[tauri::command]
pub async fn select_device(
    state: tauri::State<'_, Mutex<PlugState>>,
    device_id: u32,
) -> Result<(), String> {
    let mut state = state.lock().await;
    for device in &state.devices {
        if device.id == device_id {
            state.selected_device_id = device_id as i64;
            return Ok(());
        }
    }
    Err(String::from(format!("Device {device_id} doesn't exist!")))
}

#[tauri::command]
pub async fn test_selected(
    state: tauri::State<'_, Mutex<PlugState>>,
    active: bool,
) -> Result<(), String> {
    let state = state.lock().await;

    if let Some(d) = state.get_selected_device() {
        for device in &state.client.devices() {
            if d.id == device.index() {
                // I guess we only support vibration now. Aww :(
                let mut vibrator_values = Vec::<f64>::new();
                for feat in &d.features {
                    vibrator_values.push(feat.max_step as f64 / feat.step_count as f64);
                }
                if active {
                    device
                        .vibrate(&ScalarValueCommand::ScalarValueVec(vibrator_values))
                        .await
                        .map_err(|e| e.to_string())?;
                } else {
                    device.stop().await.map_err(|e| e.to_string())?;
                }
                return Ok(());
            }
        }
    }

    if active {
        return Err(String::from("No device is selected!"));
    }

    Ok(())
}
