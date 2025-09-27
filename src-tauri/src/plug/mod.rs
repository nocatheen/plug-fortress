use buttplug::{
    client::{ButtplugClient, ButtplugClientError, ButtplugClientEvent},
    core::{
        connector::new_json_ws_client_connector, message::ClientGenericDeviceMessageAttributesV3,
    },
};
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::async_runtime::Mutex;

pub struct PlugState {
    pub client: ButtplugClient,
    pub scanning: bool,
    pub wsaddr: String,
}

impl PlugState {
    pub fn new() -> Self {
        let client = ButtplugClient::new("Plug Fortress");
        Self {
            client,
            scanning: false,
            wsaddr: String::from("ws://localhost:12345"),
        }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub struct PlugStateClient {
    pub scanning: bool,
    pub connected: bool,
}

#[tauri::command]
pub async fn get_plug_state(
    state: tauri::State<'_, Mutex<PlugState>>,
) -> Result<PlugStateClient, String> {
    let state = state.lock().await;
    Ok(PlugStateClient {
        scanning: state.scanning,
        connected: state.client.connected(),
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
    let state = state.lock().await;

    let connector = new_json_ws_client_connector(address);
    state.client.connect(connector).await?;
    println!("Connected to Buttplug server.");

    Ok(())
}

#[tauri::command]
pub async fn start_scanning(state: tauri::State<'_, Mutex<PlugState>>) -> Result<(), String> {
    let mut state = state.lock().await;
    let mut events = state.client.event_stream();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = events.next().await {
            match event {
                ButtplugClientEvent::DeviceAdded(device) => {
                    println!("Device {} Connected!", device.name());
                }
                ButtplugClientEvent::DeviceRemoved(info) => {
                    println!("Device {} Removed!", info.name());
                }
                ButtplugClientEvent::ScanningFinished => {
                    println!("Device scanning is finished!");
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
    Ok(())
}

#[tauri::command]
pub async fn list_devices(state: tauri::State<'_, Mutex<PlugState>>) -> Result<(), String> {
    let state = state.lock().await;

    for device in state.client.devices() {
        fn print_attrs(attrs: &Vec<ClientGenericDeviceMessageAttributesV3>) {
            for attr in attrs {
                println!(
                    "{}: {} - Steps: {}",
                    attr.actuator_type(),
                    attr.feature_descriptor(),
                    attr.step_count()
                );
            }
        }
        println!("{} supports these actions:", device.name());
        if let Some(attrs) = device.message_attributes().scalar_cmd() {
            print_attrs(attrs);
        }
    }

    Ok(())
}
