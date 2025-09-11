// mod a_bogus;
mod models;
// mod ms_token;
mod utils;

use std::collections::HashMap;

use regex::Regex;
use reqwest::header::{COOKIE, UPGRADE_INSECURE_REQUESTS};
use serde_json::Value;

use crate::error::{LsarError, LsarResult, RoomStateError};
use crate::network::http::Client;
use crate::parsers::douyin::models::{RoomData, UserInfo};
use crate::parsers::ParsedResult;
use crate::platform::Platform;

use super::Parser;

use self::models::{PartitionRoadMap, Resolution, RoomInfo, StreamData};
use self::utils::{get_ac_nonce, get_ttwid};

const DOUYIN_LIVE_BASE_URL: &str = "https://live.douyin.com";
// const ROOM_CLOSED_MESSAGE: &str = "该内容暂时无法无法查看";

pub struct DouyinParser {
    room_id: u64,
    room_url: String,
    client: Client,
}

impl DouyinParser {
    pub fn new(room_id: u64) -> Self {
        DouyinParser {
            room_id,
            room_url: format!("{}/{}", DOUYIN_LIVE_BASE_URL, room_id),
            client: Client::new(),
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

    /// 获取房间信息
    async fn fetch_room_info(&self) -> LsarResult<RoomInfo> {
        debug!("Fetching room page: {}", self.room_url);

        let body = self.client.get_text(&self.room_url).await?;
        let state_regex = Regex::new(r#"\{\\"state\\":(.+?\}),\\"children\\":"#)?;
        let state_match = state_regex
            .captures(&body)
            .ok_or_else(|| LsarError::Other("Failed to find room state in page".to_string()))?;

        let state_str = state_match.get(1).unwrap().as_str();
        debug!("Found room state: {}", state_str);

        let state_json = state_str.replace("\\\"", "\"").replace("\\\\\"", "\\\"");
        let state: Value = serde_json::from_str(&state_json)?;
        let room_info = &state["roomStore"]["roomInfo"];
        let anchor = &room_info["anchor"];
        if anchor.is_null() {
            return Err(RoomStateError::NotExists.into());
        }

        let nickname = anchor["nickname"].as_str().unwrap().to_string();
        let room = &room_info["room"];

        if room.is_null() {
            return Err(RoomStateError::Offline.into());
        }

        let stream_data: StreamData = serde_json::from_value(room.clone())?;

        let room_info = RoomInfo {
            data: RoomData {
                data: vec![stream_data],
                user: UserInfo { nickname },
                partition_road_map: None,
            },
        };
        info!("Room info: {:?}", room_info);

        Ok(room_info)
    }

    /// 从房间信息中提取解析结果
    fn extract_parsed_result(&self, room_info: RoomInfo) -> LsarResult<ParsedResult> {
        trace!("Extracting parsed result from room info");

        let room_data = &room_info.data.data[0];
        let user_info = &room_info.data.user;
        let partition_info = &room_info.data.partition_road_map;

        debug!("Room status: {}", room_data.status);
        if room_data.status == 4 {
            return Err(RoomStateError::Offline.into());
        }

        let stream_urls = self.extract_stream_urls(room_data)?;
        let category = partition_info
            .as_ref()
            .map(|pi| self.extract_category(pi))
            .unwrap_or_default();

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
