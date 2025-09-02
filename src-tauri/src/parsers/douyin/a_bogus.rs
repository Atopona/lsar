use std::iter::repeat_n;

use rand::Rng;
use sm3::{Digest, Sm3};

use crate::utils::now_millis;

/// Base64 编码字符集的不同变体
#[allow(dead_code)]
enum Base64Charset {
    /// 标准 Base64 字符集
    Standard,
    /// 自定义字符集变体 1
    CustomVariant1,
    /// 自定义字符集变体 2
    CustomVariant2,
    /// 自定义字符集变体 3
    CustomVariant3,
    /// 自定义字符集变体 4
    CustomVariant4,
}

impl Base64Charset {
    fn get_charset(&self) -> &str {
        match self {
            Base64Charset::Standard => {
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
            }
            Base64Charset::CustomVariant1 => {
                "Dkdpgh4ZKsQB80/Mfvw36XI1R25+WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe="
            }
            Base64Charset::CustomVariant2 => {
                "Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe="
            }
            Base64Charset::CustomVariant3 => {
                "ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe"
            }
            Base64Charset::CustomVariant4 => {
                "Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe"
            }
        }
    }
}

/// 哈希计算时使用的后缀字符串
const HASH_SUFFIX: &str = "cus";

/// RC4 加密使用的密钥
const RC4_KEY: &str = "y";

/// 随机数生成的最大值
const MAX_RANDOM_VALUE: u64 = 9999;

/// 默认屏幕参数
const DEFAULT_SCREEN_WIDTH: u32 = 1920;
const DEFAULT_SCREEN_HEIGHT: u32 = 1080;
const DEFAULT_SCREEN_Y_OFFSET: u32 = 30;
const DEFAULT_COLOR_DEPTH: u32 = 24;

/// a_bogus 参数生成器
/// 用于生成抖音 API 请求中的 a_bogus 参数
pub(super) struct ABogusGenerator {
    /// 用户代理编码数组
    user_agent_code: Vec<u8>,
    /// 浏览器信息字符串
    browser_fingerprint: String,
}

impl ABogusGenerator {
    /// 创建新的 a_bogus 生成器实例
    ///
    /// # 参数
    /// * `platform` - 可选的平台标识符 (如 "MacIntel", "Win32")
    pub(super) fn new(platform: Option<&str>) -> Self {
        // TODO: 用 generate_ua_code(user_agent) 生成
        // 当前使用固定的 UA 编码数组：Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36
        let ua_code = vec![
            76, 98, 15, 131, 97, 245, 224, 133, 122, 199, 241, 166, 79, 34, 90, 191, 128, 126, 122,
            98, 66, 11, 14, 40, 49, 110, 110, 173, 67, 96, 138, 252,
        ];

        let browser_fingerprint = match platform {
            Some(platform) => Self::generate_browser_fingerprint(platform),
            None => Self::get_default_browser_fingerprint(),
        };

        ABogusGenerator {
            user_agent_code: ua_code,
            browser_fingerprint,
        }
    }

    /// 获取默认的浏览器指纹信息
    fn get_default_browser_fingerprint() -> String {
        "1536|742|1536|864|0|0|0|0|1536|864|1536|864|1536|742|24|24|MacIntel".to_string()
    }

    /// 生成浏览器指纹信息
    ///
    /// # 参数
    /// * `platform` - 平台标识符
    fn generate_browser_fingerprint(platform: &str) -> String {
        let screen_params = [
            DEFAULT_SCREEN_WIDTH,    // 内部宽度
            DEFAULT_SCREEN_HEIGHT,   // 内部高度
            DEFAULT_SCREEN_WIDTH,    // 外部宽度
            DEFAULT_SCREEN_HEIGHT,   // 外部高度
            0,                       // 屏幕 X 偏移
            DEFAULT_SCREEN_Y_OFFSET, // 屏幕 Y 偏移
            0,
            0,                     // 保留字段
            DEFAULT_SCREEN_WIDTH,  // 重复的外部宽度
            DEFAULT_SCREEN_HEIGHT, // 重复的外部高度
            DEFAULT_SCREEN_WIDTH,  // 重复的外部宽度
            DEFAULT_SCREEN_HEIGHT, // 重复的外部高度
            DEFAULT_SCREEN_WIDTH,  // 重复的内部宽度
            DEFAULT_SCREEN_HEIGHT, // 重复的内部高度
            DEFAULT_COLOR_DEPTH,   // 颜色深度
            DEFAULT_COLOR_DEPTH,   // 重复的颜色深度
        ];

        let mut fingerprint_parts: Vec<String> = screen_params
            .iter()
            .map(|&param| param.to_string())
            .collect();

        fingerprint_parts.push(platform.to_string());
        fingerprint_parts.join("|")
    }

    /// 生成带位运算的随机字节数组
    ///
    /// # 参数
    /// * `seed` - 可选的随机种子
    /// * `mask1` - 第一个位掩码
    /// * `mask2` - 第二个位掩码
    /// * `or_val1` - 第一个 OR 值
    /// * `or_val2` - 第二个 OR 值
    /// * `or_val3` - 第三个 OR 值
    /// * `or_val4` - 第四个 OR 值
    fn generate_masked_random_bytes(
        seed: Option<u64>,
        mask1: u64,
        mask2: u64,
        or_val1: u64,
        or_val2: u64,
        or_val3: u64,
        or_val4: u64,
    ) -> Vec<u8> {
        let random_value = seed.unwrap_or_else(|| rand::rng().random_range(0..=MAX_RANDOM_VALUE));

        let low_byte = random_value & 0xFF;
        let high_byte = random_value >> 8;

        vec![
            (low_byte & mask1 | or_val1) as u8,
            (low_byte & mask2 | or_val2) as u8,
            (high_byte & mask1 | or_val3) as u8,
            (high_byte & mask2 | or_val4) as u8,
        ]
    }

    /// 生成第一类随机字节序列
    fn generate_random_sequence_type1(
        seed: Option<u64>,
        mask1: Option<u64>,
        mask2: Option<u64>,
        or_modifier: Option<u64>,
    ) -> Vec<u8> {
        let mask1 = mask1.unwrap_or(170); // 0xAA
        let mask2 = mask2.unwrap_or(85); // 0x55
        let or_modifier = or_modifier.unwrap_or(45);

        Self::generate_masked_random_bytes(seed, mask1, mask2, 1, 2, 5, or_modifier & mask1)
    }

    /// 生成第二类随机字节序列
    fn generate_random_sequence_type2(
        seed: Option<u64>,
        mask1: Option<u64>,
        mask2: Option<u64>,
    ) -> Vec<u8> {
        let mask1 = mask1.unwrap_or(170);
        let mask2 = mask2.unwrap_or(85);

        Self::generate_masked_random_bytes(seed, mask1, mask2, 1, 0, 0, 0)
    }

    /// 生成第三类随机字节序列
    fn generate_random_sequence_type3(
        seed: Option<u64>,
        mask1: Option<u64>,
        mask2: Option<u64>,
    ) -> Vec<u8> {
        let mask1 = mask1.unwrap_or(170);
        let mask2 = mask2.unwrap_or(85);

        Self::generate_masked_random_bytes(seed, mask1, mask2, 1, 0, 5, 0)
    }

    /// 构建固定格式的字节数组
    fn build_structured_byte_array(params: ByteArrayParams) -> Vec<u8> {
        vec![
            44,
            params.end_time_byte3,
            0,
            0,
            0,
            0,
            24,
            params.params_hash_21,
            params.method_hash_21,
            0,
            params.ua_code_23,
            params.end_time_byte2,
            0,
            0,
            0,
            1,
            0,
            239,
            params.params_hash_22,
            params.method_hash_22,
            params.ua_code_24,
            params.end_time_byte1,
            0,
            0,
            0,
            0,
            params.end_time_byte0,
            0,
            0,
            14,
            params.start_time_byte3,
            params.start_time_byte2,
            0,
            params.start_time_byte1,
            params.start_time_byte0,
            3,
            params.end_time_high,
            1,
            params.start_time_high,
            1,
            params.browser_length,
            0,
            0,
            0,
        ]
    }

    /// 生成第一部分字符串（由三个随机序列组成）
    fn generate_first_component(
        seed1: Option<u64>,
        seed2: Option<u64>,
        seed3: Option<u64>,
    ) -> String {
        let seq1 = Self::generate_random_sequence_type1(seed1, None, None, None);
        let seq2 = Self::generate_random_sequence_type2(seed2, None, None);
        let seq3 = Self::generate_random_sequence_type3(seed3, None, None);

        format!(
            "{}{}{}",
            String::from_utf8_lossy(&seq1),
            String::from_utf8_lossy(&seq2),
            String::from_utf8_lossy(&seq3)
        )
    }

    /// 计算 SM3 哈希值
    fn compute_sm3_hash(data: &[u8]) -> Vec<u8> {
        let mut hasher = Sm3::new();
        hasher.update(data);
        hasher.finalize().to_vec()
    }

    /// 生成 HTTP 方法的哈希编码
    fn generate_method_hash(method: &str) -> Vec<u8> {
        let input = format!("{}{}", method, HASH_SUFFIX);
        let first_hash = Self::compute_sm3_hash(input.as_bytes());
        Self::compute_sm3_hash(&first_hash)
    }

    /// 生成请求参数的哈希编码
    fn generate_params_hash(params: &str) -> Vec<u8> {
        let input = format!("{}{}", params, HASH_SUFFIX);
        let first_hash = Self::compute_sm3_hash(input.as_bytes());
        Self::compute_sm3_hash(&first_hash)
    }

    /// 生成第二部分的字节数组
    fn generate_second_component_bytes(
        &self,
        params: &str,
        method: &str,
        start_time: u64,
        end_time: u64,
    ) -> Vec<u8> {
        let actual_start_time = if start_time > 0 {
            start_time
        } else {
            now_millis().unwrap()
        };

        let actual_end_time = if end_time > 0 {
            end_time
        } else {
            // TODO: 添加 4-8 毫秒的随机延迟
            now_millis().unwrap() + 8
        };

        let params_hash = Self::generate_params_hash(params);
        let method_hash = Self::generate_method_hash(method);

        let byte_params = ByteArrayParams::new(
            actual_end_time,
            actual_start_time,
            &params_hash,
            &method_hash,
            &self.user_agent_code,
            self.browser_fingerprint.len() as u8,
        );

        Self::build_structured_byte_array(byte_params)
    }

    /// 计算 XOR 校验和
    fn calculate_xor_checksum(data: &[u8]) -> u8 {
        data.iter().fold(0, |acc, &byte| acc ^ byte)
    }

    /// RC4 加密算法实现
    fn rc4_encrypt(plaintext: &[u8], key: &[u8]) -> String {
        // 初始化 S 盒
        let mut s_box: Vec<u8> = (0..=255).collect();
        let mut j = 0usize;

        // KSA (Key Scheduling Algorithm)
        for i in 0..256 {
            j = (j + s_box[i] as usize + key[i % key.len()] as usize) % 256;
            s_box.swap(i, j);
        }

        // PRGA (Pseudo-Random Generation Algorithm)
        let mut i = 0usize;
        let mut j = 0usize;
        let mut ciphertext = Vec::with_capacity(plaintext.len());

        for &byte in plaintext {
            i = (i + 1) % 256;
            j = (j + s_box[i] as usize) % 256;
            s_box.swap(i, j);

            let keystream_byte = s_box[(s_box[i] as usize + s_box[j] as usize) % 256];
            ciphertext.push(byte ^ keystream_byte);
        }

        String::from_utf8_lossy(&ciphertext).to_string()
    }

    /// 生成第二部分字符串（加密后的数据）
    fn generate_second_component(
        &self,
        params: &str,
        method: &str,
        start_time: u64,
        end_time: u64,
    ) -> String {
        let mut data = self.generate_second_component_bytes(params, method, start_time, end_time);
        let checksum = Self::calculate_xor_checksum(&data);

        data.extend_from_slice(self.browser_fingerprint.as_bytes());
        data.push(checksum);

        Self::rc4_encrypt(&data, RC4_KEY.as_bytes())
    }

    /// 使用自定义 Base64 编码生成最终结果
    fn encode_with_custom_base64(data: &[u8], charset: &Base64Charset) -> String {
        let mut result = Vec::new();
        let charset_str = charset.get_charset();
        let charset_bytes: Vec<u8> = charset_str.bytes().collect();

        // 每次处理 3 个字节
        for chunk in data.chunks(3) {
            let mut buffer = 0u32;
            // let mut padding = 0;

            // 将字节打包到 24 位缓冲区
            for (i, &byte) in chunk.iter().enumerate() {
                buffer |= (byte as u32) << (16 - i * 8);
            }

            let padding = 3 - chunk.len();

            // 提取 6 位索引并编码
            let indices = [
                (buffer >> 18) & 0x3F,
                (buffer >> 12) & 0x3F,
                (buffer >> 6) & 0x3F,
                buffer & 0x3F,
            ];

            for (i, &index) in indices.iter().enumerate() {
                if i < 4 - padding {
                    result.push(charset_bytes[index as usize]);
                }
            }
        }

        // 添加填充
        let padding_needed = (4 - result.len() % 4) % 4;
        result.extend(repeat_n(b'=', padding_needed));

        String::from_utf8_lossy(&result).to_string()
    }

    /// 生成最终的 a_bogus 值
    ///
    /// # 参数
    /// * `params` - 请求参数字符串
    /// * `start_time` - 可选的开始时间戳
    /// * `end_time` - 可选的结束时间戳
    /// * `seed1` - 第一个随机种子
    /// * `seed2` - 第二个随机种子
    /// * `seed3` - 第三个随机种子
    ///
    /// # 返回值
    /// 生成的 a_bogus 参数字符串
    pub(super) fn generate_a_bogus(
        &self,
        params: &str,
        start_time: Option<u64>,
        end_time: Option<u64>,
        seed1: Option<u64>,
        seed2: Option<u64>,
        seed3: Option<u64>,
    ) -> String {
        let first_component = Self::generate_first_component(seed1, seed2, seed3);
        let second_component = self.generate_second_component(
            params,
            "GET",
            start_time.unwrap_or(0),
            end_time.unwrap_or(0),
        );

        let combined_data = format!("{}{}", first_component, second_component);
        Self::encode_with_custom_base64(combined_data.as_bytes(), &Base64Charset::CustomVariant4)
    }
}

/// 用于构建结构化字节数组的参数
struct ByteArrayParams {
    // 结束时间相关字节
    end_time_byte3: u8,
    end_time_byte2: u8,
    end_time_byte1: u8,
    end_time_byte0: u8,
    end_time_high: u8,

    // 开始时间相关字节
    start_time_byte3: u8,
    start_time_byte2: u8,
    start_time_byte1: u8,
    start_time_byte0: u8,
    start_time_high: u8,

    // 哈希相关字节
    params_hash_21: u8,
    params_hash_22: u8,
    method_hash_21: u8,
    method_hash_22: u8,

    // UA 代码相关字节
    ua_code_23: u8,
    ua_code_24: u8,

    // 浏览器长度
    browser_length: u8,
}

impl ByteArrayParams {
    fn new(
        end_time: u64,
        start_time: u64,
        params_hash: &[u8],
        method_hash: &[u8],
        ua_code: &[u8],
        browser_length: u8,
    ) -> Self {
        Self {
            end_time_byte3: ((end_time >> 24) & 0xFF) as u8,
            end_time_byte2: ((end_time >> 16) & 0xFF) as u8,
            end_time_byte1: ((end_time >> 8) & 0xFF) as u8,
            end_time_byte0: (end_time & 0xFF) as u8,
            end_time_high: (end_time >> 32) as u8,

            start_time_byte3: ((start_time >> 24) & 0xFF) as u8,
            start_time_byte2: ((start_time >> 16) & 0xFF) as u8,
            start_time_byte1: ((start_time >> 8) & 0xFF) as u8,
            start_time_byte0: (start_time & 0xFF) as u8,
            start_time_high: (start_time >> 32) as u8,

            params_hash_21: params_hash[21],
            params_hash_22: params_hash[22],
            method_hash_21: method_hash[21],
            method_hash_22: method_hash[22],

            ua_code_23: ua_code[23],
            ua_code_24: ua_code[24],

            browser_length,
        }
    }
}
