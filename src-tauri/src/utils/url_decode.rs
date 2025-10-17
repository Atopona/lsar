use crate::{error::LsarError, LsarResult};

/// javascript 的`decodeURIComponent`方法
pub fn decode_uri_component(s: &str) -> LsarResult<String> {
    let mut result = Vec::new();
    let bytes = s.as_bytes();
    let mut i = 0;

    while i < bytes.len() {
        if bytes[i] == b'%' {
            if i + 2 >= bytes.len() {
                return Err(LsarError::UrlDeocde(format!(
                    "Invalid percent encoding at position {}",
                    i,
                )));
            }

            let hex_str = match std::str::from_utf8(&bytes[i + 1..i + 3]) {
                Ok(s) => s,
                Err(_) => {
                    return Err(LsarError::UrlDeocde(format!(
                        "Invalid hex characters at position {}",
                        i + 1
                    )))
                }
            };

            let byte = match u8::from_str_radix(hex_str, 16) {
                Ok(b) => b,
                Err(_) => {
                    return Err(LsarError::UrlDeocde(format!(
                        "Invalid hex value '{}' at position {}",
                        hex_str,
                        i + 1
                    )))
                }
            };

            result.push(byte);
            i += 3;
        } else {
            result.push(bytes[i]);
            i += 1;
        }
    }

    match String::from_utf8(result) {
        Ok(s) => Ok(s),
        Err(e) => Err(LsarError::UrlDeocde(format!(
            "Invalid UTF-8 sequence: {}",
            e
        ))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_decoding() {
        assert_eq!(
            decode_uri_component("Hello%20World").unwrap(),
            "Hello World"
        );
    }

    #[test]
    fn test_chinese_characters() {
        assert_eq!(decode_uri_component("%E4%BD%A0%E5%A5%BD").unwrap(), "你好");
    }

    #[test]
    fn test_email_encoding() {
        assert_eq!(
            decode_uri_component("test%40example.com").unwrap(),
            "test@example.com"
        );
    }

    #[test]
    fn test_special_characters() {
        assert_eq!(decode_uri_component("%21%40%23%24%25").unwrap(), "!@#$%");
    }

    #[test]
    fn test_mixed_content() {
        assert_eq!(
            decode_uri_component("Rust%20%E7%BC%96%E7%A8%8B").unwrap(),
            "Rust 编程"
        );
    }

    #[test]
    fn test_percentage_encoding() {
        assert_eq!(
            decode_uri_component("100%25%20complete").unwrap(),
            "100% complete"
        );
    }

    #[test]
    fn test_no_encoding() {
        assert_eq!(decode_uri_component("HelloWorld").unwrap(), "HelloWorld");
    }

    #[test]
    fn test_plus_sign_strict() {
        // 严格模式不转换 + 号
        assert_eq!(decode_uri_component("Hello+World").unwrap(), "Hello+World");
    }

    #[test]
    fn test_invalid_incomplete_encoding() {
        assert!(decode_uri_component("test%2").is_err());
    }

    #[test]
    fn test_invalid_hex() {
        assert!(decode_uri_component("test%GG").is_err());
    }

    #[test]
    fn test_invalid_trailing_percent() {
        assert!(decode_uri_component("test%").is_err());
    }

    #[test]
    fn test_invalid_utf8_sequence() {
        // %FF 不是有效的 UTF-8 起始字节
        assert!(decode_uri_component("%FF%FF").is_err());
    }

    #[test]
    fn test_lowercase_hex() {
        assert_eq!(decode_uri_component("test%2fpath").unwrap(), "test/path");
    }

    #[test]
    fn test_uppercase_hex() {
        assert_eq!(decode_uri_component("test%2Fpath").unwrap(), "test/path");
    }

    #[test]
    fn test_mixed_hex_case() {
        assert_eq!(decode_uri_component("%E4%bd%A0%e5%A5%BD").unwrap(), "你好");
    }

    #[test]
    fn test_url_with_query_params() {
        assert_eq!(
            decode_uri_component("name%3DJohn%26age%3D30").unwrap(),
            "name=John&age=30"
        );
    }

    #[test]
    fn test_empty_string() {
        assert_eq!(decode_uri_component("").unwrap(), "");
    }
}
