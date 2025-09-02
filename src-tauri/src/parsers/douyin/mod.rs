mod a_bogus;
mod models;
mod ms_token;
mod utils;

use std::collections::HashMap;

use reqwest::header::{COOKIE, UPGRADE_INSECURE_REQUESTS};
use serde_json::Value;
use url::Url;

use crate::error::{LsarResult, RoomStateError};
use crate::network::http::Client;
use crate::parsers::ParsedResult;
use crate::platform::Platform;

use super::Parser;

use self::a_bogus::ABogusGenerator;
use self::models::{PartitionRoadMap, Resolution, RoomInfo, StreamData};
use self::ms_token::generate_ms_token;
use self::utils::{get_ac_nonce, get_ttwid};

const DOUYIN_LIVE_BASE_URL: &str = "https://live.douyin.com";
const DOUYIN_API_BASE_URL: &str = "https://live.douyin.com/webcast/room/web/enter/";
const DEFAULT_SCREEN_WIDTH: u32 = 1920;
const DEFAULT_SCREEN_HEIGHT: u32 = 1080;
const BROWSER_VERSION: &str = "139.0.0.0";
const ROOM_CLOSED_MESSAGE: &str = "该内容暂时无法无法查看";

#[derive(Debug)]
struct ApiParams {
    aid: u32,
    app_name: String,
    live_id: u32,
    device_platform: String,
    language: String,
    enter_from: String,
    cookie_enabled: bool,
    screen_width: u32,
    screen_height: u32,
    browser_language: String,
    browser_platform: String,
    browser_name: String,
    browser_version: String,
    web_rid: u64,
    enter_source: String,
    is_need_double_stream: bool,
    insert_task_id: String,
    live_reason: String,
}

impl Default for ApiParams {
    fn default() -> Self {
        Self {
            aid: 6383,
            app_name: "douyin_web".to_string(),
            live_id: 1,
            device_platform: "web".to_string(),
            language: "en".to_string(),
            enter_from: "web_live".to_string(),
            cookie_enabled: true,
            screen_width: DEFAULT_SCREEN_WIDTH,
            screen_height: DEFAULT_SCREEN_HEIGHT,
            browser_language: "en".to_string(),
            browser_platform: "MacIntel".to_string(),
            browser_name: "Chrome".to_string(),
            browser_version: BROWSER_VERSION.to_string(),
            web_rid: 0,
            enter_source: String::new(),
            is_need_double_stream: false,
            insert_task_id: String::new(),
            live_reason: String::new(),
        }
    }
}

pub struct DouyinParser {
    room_id: u64,
    room_url: String,
    client: Client,
    api_params: ApiParams,
}

impl DouyinParser {
    pub fn new(room_id: u64) -> Self {
        let api_params = ApiParams {
            web_rid: room_id,
            ..Default::default()
        };

        DouyinParser {
            room_id,
            room_url: format!("{}/{}", DOUYIN_LIVE_BASE_URL, room_id),
            client: Client::new(),
            api_params,
        }
    }

    async fn configure_request_headers(&mut self) -> LsarResult<()> {
        debug!("Configuring request headers for room {}", self.room_id);

        self.client.insert_header(UPGRADE_INSECURE_REQUESTS, "1")?;

        let ac_nonce = get_ac_nonce(&self.client, &self.room_url).await?;

        let cookie = format!("__ac_nonce={}", ac_nonce);
        self.client.insert_header(COOKIE, &cookie)?;

        let ttwid = get_ttwid(&self.client, &self.room_url).await?;

        let cookie = format!("__ac_nonce={}; ttwid={}", ac_nonce, ttwid);
        self.client.insert_header(COOKIE, &cookie)?;

        debug!("Request headers configured successfully");
        Ok(())
    }

    /// 生成 a_bogus
    fn generate_signature(params: &str) -> LsarResult<String> {
        let a_bogus = ABogusGenerator::new(None);
        Ok(a_bogus.generate_a_bogus(params, None, None, None, None, None))
    }

    /// 构建 API URL
    fn build_api_url(&self) -> LsarResult<Url> {
        let mut url = Url::parse(DOUYIN_API_BASE_URL)?;

        // 添加基础参数
        self.add_base_query_params(&mut url);

        // 添加认证参数
        let ms_token = generate_ms_token();
        url.query_pairs_mut().append_pair("msToken", &ms_token);

        // 添加签名
        let query_string = url.query().unwrap_or_default();
        let signature = Self::generate_signature(query_string)?;
        url.query_pairs_mut().append_pair("a_bogus", &signature);

        Ok(url)
    }

    /// 添加基础查询参数
    fn add_base_query_params(&self, url: &mut Url) {
        let params = &self.api_params;
        url.query_pairs_mut()
            .append_pair("aid", &params.aid.to_string())
            .append_pair("app_name", &params.app_name)
            .append_pair("live_id", &params.live_id.to_string())
            .append_pair("device_platform", &params.device_platform)
            .append_pair("language", &params.language)
            .append_pair("enter_from", &params.enter_from)
            .append_pair("cookie_enabled", &params.cookie_enabled.to_string())
            .append_pair("screen_width", &params.screen_width.to_string())
            .append_pair("screen_height", &params.screen_height.to_string())
            .append_pair("browser_language", &params.browser_language)
            .append_pair("browser_platform", &params.browser_platform)
            .append_pair("browser_name", &params.browser_name)
            .append_pair("browser_version", &params.browser_version)
            .append_pair("web_rid", &params.web_rid.to_string())
            .append_pair("enter_source", &params.enter_source)
            .append_pair(
                "is_need_double_stream",
                &params.is_need_double_stream.to_string(),
            )
            .append_pair("insert_task_id", &params.insert_task_id)
            .append_pair("live_reason", &params.live_reason);
    }

    /// 获取房间信息
    async fn fetch_room_info(&self) -> LsarResult<RoomInfo> {
        let api_url = self.build_api_url()?;

        trace!("Requesting room info from: {}", api_url);
        info!("Fetching room information for room {}", self.room_id);

        let response_data: Value = self.client.get_json(api_url.as_str()).await?;
        debug!("Room info response received: {}", response_data);

        self.validate_api_response(&response_data)?;

        let room_info: RoomInfo = serde_json::from_value(response_data)?;
        info!("Room information fetched successfully");
        Ok(room_info)
    }

    /// 验证 API 响应
    fn validate_api_response(&self, response: &Value) -> LsarResult<()> {
        let status_code = response["status_code"].as_i64().unwrap_or(0);

        if status_code != 0 {
            if let Some(prompts) = response["data"]["prompts"].as_str() {
                if prompts == ROOM_CLOSED_MESSAGE {
                    return Err(RoomStateError::IsClosed.into());
                }
            }
        }

        if let Some(enter_room_id) = response["data"]["enter_room_id"].as_str() {
            if enter_room_id.is_empty() {
                return Err(RoomStateError::NotExists.into());
            }
        }

        Ok(())
    }

    /// 从房间信息中提取解析结果
    fn extract_parsed_result(&self, room_info: RoomInfo) -> LsarResult<ParsedResult> {
        trace!("Extracting parsed result from room info");

        let room_data = &room_info.data.data[0];
        let user_info = &room_info.data.user;
        let partition_info = &room_info.data.partition_road_map;

        debug!("Room status: {}", room_data.status);

        let stream_urls = self.extract_stream_urls(room_data)?;
        let category = self.extract_category(partition_info);

        let result = ParsedResult {
            platform: Platform::Douyin,
            anchor: user_info.nickname.clone(),
            title: room_data.title.clone(),
            links: stream_urls,
            room_id: self.room_id,
            category,
        };

        info!("Room information parsed successfully");
        Ok(result)
    }

    /// 提取流媒体 URL
    fn extract_stream_urls(&self, room_data: &StreamData) -> LsarResult<Vec<String>> {
        let stream_url = room_data
            .stream_url
            .as_ref()
            .ok_or(RoomStateError::Offline)?;

        trace!("Extracting stream URLs");

        let flv_url = self.get_best_quality_url(&stream_url.flv_pull_url);
        let hls_url = self.get_best_quality_url(&stream_url.hls_pull_url_map);

        debug!("FLV URL available: {}", flv_url.is_some());
        debug!("HLS URL available: {}", hls_url.is_some());

        Ok(vec![
            flv_url.unwrap_or_default(),
            hls_url.unwrap_or_default(),
        ])
    }

    /// 获取最佳质量的 URL
    fn get_best_quality_url(&self, url_map: &HashMap<Resolution, String>) -> Option<String> {
        url_map
            .get(&Resolution::FullHd1)
            .or_else(|| url_map.get(&Resolution::Hd1))
            .cloned()
    }

    /// 提取分类信息
    fn extract_category(&self, partition: &PartitionRoadMap) -> String {
        trace!("Extracting stream category");

        let category = partition
            .sub_partition
            .as_ref()
            .map(|sp| sp.partition.title.clone())
            .or_else(|| partition.partition.as_ref().map(|p| p.title.clone()))
            .unwrap_or_else(|| {
                warn!("No category found for room {}", self.room_id);
                String::new()
            });

        debug!("Stream category: {}", category);
        category
    }
}

impl Parser for DouyinParser {
    async fn parse(&mut self) -> LsarResult<ParsedResult> {
        info!("Starting parse process for Douyin room {}", self.room_id);

        self.configure_request_headers().await?;
        let room_info = self.fetch_room_info().await?;
        self.extract_parsed_result(room_info)
    }
}

#[tauri::command]
pub async fn parse_douyin(room_id: u64) -> LsarResult<ParsedResult> {
    info!("Parsing Douyin stream for room {}", room_id);

    let mut parser = DouyinParser::new(room_id);
    let result = parser.parse().await;

    match &result {
        Ok(_) => info!("Successfully parsed Douyin stream for room {}", room_id),
        Err(e) => error!("Failed to parse Douyin stream for room {}: {}", room_id, e),
    }

    result
}
