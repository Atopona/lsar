use serde::{Deserialize, Serialize};

use crate::error::LsarResult;
use crate::network::http::Client;
use crate::parsers::{ParsedResult, Parser};
use crate::platform::Platform;

#[derive(Debug, Serialize, Deserialize)]
struct RoomInfo {
    #[serde(rename = "clientBigoId")]
    client_bigo_id: String,
    hls_src: String,
    #[serde(rename = "roomType")]
    room_type: String,
    #[serde(rename = "roomTopic")]
    room_topic: String,
    nick_name: String,
    #[serde(rename = "roomStatus")]
    room_status: i8,
}

#[derive(Debug, Serialize, Deserialize)]
struct Response {
    msg: String,
    data: RoomInfo,
}

pub struct BigoParser {
    room_id: u64,
    http_client: Client,
}

impl BigoParser {
    fn new(room_id: u64) -> Self {
        Self {
            room_id,
            http_client: Client::new(),
        }
    }

    async fn get_real_url(&self) -> LsarResult<RoomInfo> {
        const URL: &str = "https://ta.bigo.tv/official_website/studio/getInternalStudioInfo";
        let body = [("siteId", self.room_id)];
        let resp: Response = self.http_client.post_form(URL, &body).await?;

        Ok(resp.data)
    }
}

impl Parser for BigoParser {
    async fn parse(&mut self) -> LsarResult<ParsedResult> {
        let result = self.get_real_url().await?;

        Ok(ParsedResult {
            platform: Platform::Bigo,
            title: result.room_topic,
            anchor: result.nick_name,
            room_id: self.room_id,
            category: "".to_string(),
            links: vec![result.hls_src],
        })
    }
}

#[tauri::command]
pub async fn parse_bigo(room_id: u64) -> LsarResult<ParsedResult> {
    let mut douyu = BigoParser::new(room_id);
    douyu.parse().await
}
