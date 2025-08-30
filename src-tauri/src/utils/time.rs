use std::time::{Duration, SystemTime, UNIX_EPOCH};

use crate::error::{LsarError, LsarResult};

pub fn now() -> LsarResult<Duration> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(LsarError::SystemTime)
}

pub fn now_millis() -> LsarResult<u64> {
    Ok(now()?.as_millis() as u64)
}
