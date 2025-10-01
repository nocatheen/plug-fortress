use buttplug::{
    client::ButtplugClientDevice, core::message::ClientGenericDeviceMessageAttributesV3,
};
use serde::Serialize;
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
pub struct DeviceID([u8; 32]);

impl DeviceID {
    pub fn from_device(device: &ButtplugClientDevice) -> Self {
        let mut hasher = Sha256::new();

        if let Some(attrs) = device.message_attributes().scalar_cmd() {
            for attr in attrs {
                hasher.update(attr.actuator_type().to_string().as_bytes());
                hasher.update(attr.step_count().to_string().as_bytes());
            }
        }
        hasher.update(device.name().as_bytes());

        let hash = hasher.finalize();
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&hash);
        DeviceID(arr)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
pub struct FeatureID([u8; 32]);

impl FeatureID {
    pub fn from_feature(feature: &ClientGenericDeviceMessageAttributesV3) -> Self {
        let mut hasher = Sha256::new();

        hasher.update(feature.actuator_type().to_string().as_bytes());
        hasher.update(feature.step_count().to_string().as_bytes());
        hasher.update(feature.feature_descriptor().as_bytes());

        let hash = hasher.finalize();
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&hash);
        FeatureID(arr)
    }
}
