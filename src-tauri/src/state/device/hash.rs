use buttplug::{
    client::ButtplugClientDevice, core::message::ClientGenericDeviceMessageAttributesV3,
};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct DeviceID([u8; 32]);

impl Serialize for DeviceID {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&hex::encode(self.0))
    }
}

impl<'de> Deserialize<'de> for DeviceID {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let bytes = hex::decode(&s).map_err(serde::de::Error::custom)?;
        if bytes.len() != 32 {
            return Err(serde::de::Error::custom("invalid length"));
        }
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&bytes);
        Ok(DeviceID(arr))
    }
}

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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct FeatureID([u8; 32]);

impl Serialize for FeatureID {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&hex::encode(self.0))
    }
}

impl<'de> Deserialize<'de> for FeatureID {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let bytes = hex::decode(&s).map_err(serde::de::Error::custom)?;
        if bytes.len() != 32 {
            return Err(serde::de::Error::custom("invalid length"));
        }
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&bytes);
        Ok(FeatureID(arr))
    }
}

impl FeatureID {
    pub fn from_feature(feature: &ClientGenericDeviceMessageAttributesV3) -> Self {
        let mut hasher = Sha256::new();

        hasher.update(feature.index().to_string().as_bytes());
        hasher.update(feature.actuator_type().to_string().as_bytes());
        hasher.update(feature.step_count().to_string().as_bytes());
        hasher.update(feature.feature_descriptor().as_bytes());

        let hash = hasher.finalize();
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&hash);
        FeatureID(arr)
    }
}
