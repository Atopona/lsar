fn get_target_os() -> &'static str {
    if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "linux") {
        "linux"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else if cfg!(target_os = "android") {
        "android"
    } else {
        "unknown"
    }
}

pub async fn track() {
    let client = reqwest::Client::new();
    if let Err(e) = client
        .post(format!(
            "https://app.thepoy.cc/api/track/lsar?platform={}",
            get_target_os()
        ))
        .send()
        .await
    {
        error!("上传追踪记录失败: {}", e);
    }
}
