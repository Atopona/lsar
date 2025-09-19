use reqwest::{header::USER_AGENT, Client};
use tauri::http::{HeaderMap, HeaderValue};

use crate::error::LsarResult;

pub struct HTMLFetcher<'a> {
    client: &'a Client,
    url: &'a str,
}

impl<'a> HTMLFetcher<'a> {
    pub fn new(client: &'a Client, url: &'a str) -> Self {
        HTMLFetcher { client, url }
    }

    pub async fn fetch(&self) -> LsarResult<String> {
        debug!("Fetching page HTML from: {}", self.url);
        let mut headers = HeaderMap::new();
        headers.insert(
            USER_AGENT,
            HeaderValue::from_static(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
            ),
        );

        let response = self
            .client
            .get(self.url)
            .headers(headers)
            .send()
            .await
            .map_err(|e| {
                let err_msg = format!("Failed to send request: {}", e);
                error!("{}", err_msg);
                err_msg
            })?;

        let html = response.text().await.map_err(|e| {
            let err_msg = format!("Failed to get response text: {}", e);
            error!("{}", err_msg);
            err_msg
        })?;

        debug!(
            "Successfully fetched HTML. Length: {} characters",
            html.len()
        );
        Ok(html)
    }
}
