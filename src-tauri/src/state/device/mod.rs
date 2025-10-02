use std::collections::HashMap;

use buttplug::{
    client::ButtplugClientDevice, core::message::ClientGenericDeviceMessageAttributesV3,
};

use crate::state::device::hash::{DeviceID, FeatureID};

pub mod hash;

pub struct Feature {
    pub index: u32,
    pub name: String,
    pub step_count: u32,
    pub max_step: u32,
    pub current_power: f64,
}

impl Feature {
    pub fn from_raw(feature: &ClientGenericDeviceMessageAttributesV3) -> Self {
        Self {
            index: *feature.index(),
            name: feature.actuator_type().to_string(),
            step_count: *feature.step_count(),
            max_step: *feature.step_count(),
            current_power: 0.0,
        }
    }
}

pub struct Device {
    pub name: String,
    pub enabled: bool,
    pub features: HashMap<FeatureID, Feature>,
}

impl Device {
    pub fn from_raw(device: &ButtplugClientDevice) -> Self {
        let mut features = HashMap::<FeatureID, Feature>::new();
        if let Some(attrs) = device.message_attributes().scalar_cmd() {
            for attr in attrs {
                features.insert(FeatureID::from_feature(attr), Feature::from_raw(attr));
            }
        }
        Self {
            name: device.name().to_string(),
            enabled: false,
            features,
        }
    }
}

pub struct DeviceManager {
    pub devices: HashMap<DeviceID, Device>,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            devices: HashMap::<DeviceID, Device>::new(),
        }
    }

    pub fn clear(&mut self) {
        self.devices.clear();
    }

    pub fn insert(&mut self, device: &ButtplugClientDevice) -> DeviceID {
        let id = DeviceID::from_device(device);
        self.devices.insert(id, Device::from_raw(device));
        id
    }

    pub fn get(&self, id: DeviceID) -> Option<&Device> {
        self.devices.get(&id)
    }

    pub fn remove(&mut self, id: DeviceID) -> Option<Device> {
        self.devices.remove(&id)
    }
}
