use crate::error::LsarResult;
use crate::network::http::Client;

pub struct RoomPageFetcher {
    http_client: Client,
}

impl RoomPageFetcher {
    pub fn new(http_client: Client) -> Self {
        RoomPageFetcher { http_client }
    }

    pub async fn fetch(&self, room_id: u64) -> LsarResult<String> {
        let url = format!("https://www.douyu.com/{}", room_id);
        debug!("Fetching room page from URL: {}", url);

        let html = self.http_client.get_text(&url).await?;

        trace!("Room page fetched successfully");
        Ok(html)
    }
}
