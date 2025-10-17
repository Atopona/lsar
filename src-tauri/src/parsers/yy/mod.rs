use std::collections::HashMap;

use regex::Regex;
use serde_json::Value;

use crate::error::{LsarResult, MissKeyFieldError};
use crate::network::http::Client;
use crate::parsers::{ParsedResult, Parser};
use crate::platform::Platform;
use crate::utils::{decode_uri_component, now};

pub struct YYParser {
    room_id: u64,
    http_client: Client,
}

impl YYParser {
    fn new(room_id: u64) -> Self {
        Self {
            room_id,
            http_client: Client::new(),
        }
    }

    async fn get_room_info(&self) -> LsarResult<ParsedResult> {
        debug!(room_id = self.room_id, "Parsing YY room info");
        let url = format!("https://www.yy.com/{}", self.room_id);
        let resp = self.http_client.get_text(&url).await?;

        let regex = Regex::new(
            r#"(?s)nick: "(.+?)".+?roomName: decodeURIComponent\("(.+?)"\).+?stringBiz: "(.*?)""#,
        )?;

        let caps = regex
            .captures(&resp)
            .ok_or("Failed to parse room info")
            .inspect_err(|e| error!("{}", e))?;

        let nickname = caps
            .get(1)
            .ok_or(MissKeyFieldError::AnchorName)?
            .as_str()
            .to_string();

        let room_name = caps
            .get(2)
            .ok_or(MissKeyFieldError::Title)?
            .as_str()
            .to_string();
        let title = decode_uri_component(&room_name)?;

        // category 可能为空字符串，但此字段在响应体中一定存在
        let category = caps
            .get(3)
            .ok_or(MissKeyFieldError::Category)?
            .as_str()
            .to_string();

        debug!(nickname, title, category, "Parse room info success");

        Ok(ParsedResult {
            platform: Platform::YY,
            title,
            anchor: nickname,
            room_id: self.room_id,
            category,
            links: Vec::new(),
        })
    }

    async fn get_streams(&self) -> LsarResult<Vec<String>> {
        let now = now()?;
        let sequence = now.as_millis();
        let url = format!("https://stream-manager.yy.com/v3/channel/streams?uid=3071000363&cid={}&sid={}&appid=0&sequence={}&encode=json", self.room_id, self.room_id, sequence);

        let body = format!(
            r#"{{"head":{{"seq":{},"appidstr":"0","bidstr":"120","cidstr":"{}","sidstr":"{}","uid64":0,"client_type":108,"client_ver":"5.19.4","stream_sys_ver":1,"app":"yylive_web","playersdk_ver":"5.19.4","thundersdk_ver":"0","streamsdk_ver":"5.19.4"}},"client_attribute":{{"client":"web","model":"web0","cpu":"","graphics_card":"","os":"chrome","osversion":"141.0.0.0","vsdk_version":"","app_identify":"","app_version":"","business":"","width":"1536","height":"960","scale":"","client_type":8,"h265":0}},"avp_parameter":{{"version":1,"client_type":8,"service_type":0,"imsi":0,"send_time":{},"line_seq":-1,"gear":2,"ssl":1,"stream_format":0}}}}"#,
            sequence,
            self.room_id,
            self.room_id,
            sequence / 1000
        );

        let resp: Value = self.http_client.post_plain(&url, &body).await?;
        let streams: HashMap<String, Value> =
            serde_json::from_value(resp["avp_info_res"]["stream_line_addr"].clone())?;

        let urls = streams
            .values()
            .map(|value| value["cdn_info"]["url"].as_str().unwrap().to_string())
            .collect();

        Ok(urls)
    }
}

impl Parser for YYParser {
    async fn parse(&mut self) -> LsarResult<ParsedResult> {
        let mut result = self.get_room_info().await?;
        let streams = self.get_streams().await?;
        result.links = streams;

        Ok(result)
    }
}

#[tauri::command]
pub async fn parse_yy(room_id: u64) -> LsarResult<ParsedResult> {
    let mut yy = YYParser::new(room_id);
    yy.parse().await
}
