use std::fmt;

use serde::{Serialize, Serializer};

use crate::eval::EvalError;

pub(super) type LsarResult<T> = std::result::Result<T, LsarError>;

#[derive(Debug, thiserror::Error)]
pub(super) enum LsarError {
    #[error(transparent)]
    Sqlite(#[from] sqlx::Error),
    #[error(transparent)]
    Http(#[from] HTTPError),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    TomlSerialize(#[from] toml::ser::Error),
    #[error(transparent)]
    TomlDeserialize(#[from] toml::de::Error),
    #[error(transparent)]
    Update(#[from] tauri_plugin_updater::Error),
    #[error(transparent)]
    Regex(#[from] regex::Error),
    #[error(transparent)]
    SystemTime(#[from] std::time::SystemTimeError),
    #[error(transparent)]
    RoomState(#[from] RoomStateError),
    #[error(transparent)]
    Request(#[from] RequestError),
    #[error(transparent)]
    MissKeyField(#[from] MissKeyFieldError),
    #[error(transparent)]
    UrlParse(#[from] url::ParseError),
    #[error(transparent)]
    Eval(#[from] EvalError),
    #[error(transparent)]
    SerdeJSON(#[from] serde_json::Error),
    #[error(transparent)]
    VarError(#[from] std::env::VarError),
    #[error(transparent)]
    ParseInt(#[from] std::num::ParseIntError),
    #[error("{0}")]
    Other(String),
}

impl Serialize for LsarError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Debug, thiserror::Error)]
pub enum HTTPError {
    #[error("连接错误")]
    Connect(String),
    #[error("请求超时")]
    Timeout,
    #[error("响应体解码错误试")]
    Decode,
    #[error("其他错误: {0}")]
    Other(String),
}

// { kind: Request, url: "https://www.douyu.com/100", source: hyper_util::client::legacy::Error(Connect, ConnectError("dns error", Os { code: 11001, kind: Uncategorized, message: "不知道这样的主机。" })) }
impl From<reqwest::Error> for HTTPError {
    fn from(value: reqwest::Error) -> Self {
        if value.is_connect() {
            Self::Connect(value.to_string())
        } else if value.is_timeout() {
            Self::Timeout
        } else if value.is_decode() {
            Self::Decode
        } else {
            Self::Other(value.to_string())
        }
    }
}

impl From<reqwest::Error> for LsarError {
    fn from(value: reqwest::Error) -> Self {
        LsarError::Http(value.into())
    }
}

#[derive(Debug, Serialize, thiserror::Error)]
pub(super) enum RoomStateError {
    Offline,
    NotExists,
    IsClosed,
    IsReplay,
}

impl fmt::Display for RoomStateError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let string = match self {
            RoomStateError::Offline => "该房间未开播",
            RoomStateError::NotExists => "房间号不存在",
            RoomStateError::IsClosed => "该房间已被关闭",
            RoomStateError::IsReplay => "该房间正在重播",
        };
        write!(f, "{}", string)
    }
}

#[derive(Debug, Serialize, thiserror::Error)]
pub(super) enum RequestError {
    BadRequest,
}

impl fmt::Display for RequestError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            RequestError::BadRequest => "非法请求",
        };
        write!(f, "{}", s)
    }
}

#[derive(Debug, thiserror::Error)]
pub(super) enum MissKeyFieldError {
    #[error("解析标题失败")]
    Title,
    #[error("解析主播名失败")]
    AnchorName,
    #[error("解析签名函数失败")]
    SignatureFunction,
    #[error("解析随机数失败")]
    RandomNumber,
    #[error("解析房间号失败，请检查房间号是否正确")]
    RoomId,
}

impl From<&str> for LsarError {
    fn from(value: &str) -> Self {
        LsarError::Other(value.to_owned())
    }
}

impl From<String> for LsarError {
    fn from(value: String) -> Self {
        LsarError::Other(value)
    }
}
