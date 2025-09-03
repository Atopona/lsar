use std::{ffi, fmt};

use serde::Deserialize;
use windows::{
    core::Result,
    Wdk::System::SystemServices::RtlGetVersion,
    Win32::{
        Foundation::{HWND, STATUS_SUCCESS},
        Graphics::Dwm::{
            DwmSetWindowAttribute, DWMWA_CAPTION_COLOR, DWMWA_USE_IMMERSIVE_DARK_MODE,
        },
        System::SystemInformation::OSVERSIONINFOW,
    },
};

pub fn set_window_color_mode(window_handle: HWND, color_mode: ColorMode) -> Result<()> {
    trace!(mode = ?color_mode, "Attempting to set window color mode");

    // Determine color based on Windows version
    let result = if is_windows_11_or_newer() {
        set_windows_11_caption_color(window_handle, &color_mode)
    } else {
        set_legacy_dark_mode(window_handle, &color_mode)
    };

    match result {
        Ok(_) => {
            info!(mode = ?color_mode, "Window color mode set successfully");
            Ok(())
        }
        Err(error) => {
            error!(mode = ?color_mode, error = %error, "Failed to set window color mode");
            Err(error)
        }
    }
}

fn set_windows_11_caption_color(window_handle: HWND, color_mode: &ColorMode) -> Result<()> {
    let caption_color = color_mode.color();

    debug!(mode = ?color_mode, color=caption_color, "Setting Windows 11+ caption color");

    unsafe {
        DwmSetWindowAttribute(
            window_handle,
            DWMWA_CAPTION_COLOR,
            &caption_color as *const u32 as *const std::ffi::c_void,
            std::mem::size_of::<u32>() as u32,
        )
    }
}

fn set_legacy_dark_mode(window_handle: HWND, color_mode: &ColorMode) -> Result<()> {
    let dark_mode_value: u32 = color_mode.attribute();

    debug!(mode = ?color_mode, value = dark_mode_value, "Setting legacy dark mode");

    unsafe {
        DwmSetWindowAttribute(
            window_handle,
            DWMWA_USE_IMMERSIVE_DARK_MODE,
            &dark_mode_value as *const _ as *const ffi::c_void,
            std::mem::size_of::<u32>() as u32,
        )
        .map_err(|e| {
            error!(error = %e, "Failed to set legacy dark mode");
            e
        })
    }
}

fn is_windows_11_or_newer() -> bool {
    let mut os_version_info = OSVERSIONINFOW {
        dwOSVersionInfoSize: std::mem::size_of::<OSVERSIONINFOW>() as u32,
        ..Default::default()
    };

    let version_check_status = unsafe { RtlGetVersion(&mut os_version_info) };

    if version_check_status != STATUS_SUCCESS {
        warn!(status_code = ?version_check_status, "Failed to retrieve Windows version");
        return false;
    }

    debug!(
        build_number = os_version_info.dwBuildNumber,
        "Windows version detected"
    );

    // Windows 11 starts from build 22000
    // All Windows 10 versions have build numbers < 22000
    os_version_info.dwBuildNumber >= 22000
}

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum ColorMode {
    Light,
    Dark,
}

impl ColorMode {
    fn color(&self) -> u32 {
        match self {
            ColorMode::Light => 0xFFFFFF,
            ColorMode::Dark => 0x292929,
        }
    }

    fn attribute(&self) -> u32 {
        match self {
            ColorMode::Light => 0,
            ColorMode::Dark => 1,
        }
    }
}

impl fmt::Display for ColorMode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ColorMode::Light => write!(f, "Light"),
            ColorMode::Dark => write!(f, "Dark"),
        }
    }
}
