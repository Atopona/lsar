use std::iter::repeat_n;

use rand::seq::IndexedRandom;
use sm3::{Digest, Sm3};

use crate::utils::now_millis;

#[allow(dead_code)]
enum SmMix {
    S0,
    S1,
    S2,
    S3,
    S4,
}

impl SmMix {
    fn as_str(&self) -> &str {
        match self {
            SmMix::S0 => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            SmMix::S1 => "Dkdpgh4ZKsQB80/Mfvw36XI1R25+WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=",
            SmMix::S2 => "Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=",
            SmMix::S3 => "ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe",
            SmMix::S4 => "Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe",
        }
    }
}

const END_STRING: &str = "cus";

pub(super) struct ABogus {
    ua_code: Vec<u8>,
    browser: String,
}

impl ABogus {
    pub(super) fn new(platform: Option<&str>) -> Self {
        // Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36
        // TODO: 用 generate_ua_code(user_agent) 生成
        let ua_code = vec![
            76, 98, 15, 131, 97, 245, 224, 133, 122, 199, 241, 166, 79, 34, 90, 191, 128, 126, 122,
            98, 66, 11, 14, 40, 49, 110, 110, 173, 67, 96, 138, 252,
        ];

        // MacIntel/Win32
        let browser = match platform {
            Some(platform) => Self::generate_browser_info(platform),
            None => {
                "1536|742|1536|864|0|0|0|0|1536|864|1536|864|1536|742|24|24|MacIntel".to_string()
            }
        };

        ABogus { ua_code, browser }
    }

    fn generate_browser_info(platform: &str) -> String {
        let platform = platform.to_string();

        let inner_width = 1920;
        let inner_height = 1080;
        let outer_width = 1920;
        let outer_height = 1080;
        let screen_x = 0;
        let screen_y = 30;
        let list = vec![
            inner_width,
            inner_height,
            outer_width,
            outer_height,
            screen_x,
            screen_y,
            0,
            0,
            outer_width,
            outer_height,
            outer_width,
            outer_height,
            inner_width,
            inner_height,
            24,
            24,
        ];

        let mut info_list = list.iter().map(|n| n.to_string()).collect::<Vec<String>>();
        info_list.push(platform);

        info_list.join("|")
    }

    fn random_list(a: Option<u64>, b: u64, c: u64, d: u64, e: u64, f: u64, g: u64) -> Vec<u8> {
        let r = a.unwrap_or_else(|| {
            let mut rng = rand::rng();
            let nums: Vec<u64> = (0..9999).collect();
            *nums.choose(&mut rng).unwrap()
        });
        let mut array = vec![r, r & 255, r >> 8];
        let s = array[1] & b | d;
        array.push(s);
        let s = array[1] & c | e;
        array.push(s);
        let s = array[2] & b | f;
        array.push(s);
        let s = array[2] & c | g;
        array.push(s);

        array[array.len() - 4..].iter().map(|n| *n as u8).collect()
    }

    fn list_1<N: Into<Option<u64>>>(random_num: Option<u64>, a: N, b: N, c: N) -> Vec<u8> {
        let a: u64 = a.into().unwrap_or(170);
        let b: u64 = b.into().unwrap_or(85);
        let c: u64 = c.into().unwrap_or(45);
        Self::random_list(random_num, a, b, 1, 2, 5, c & a)
    }

    fn list_2<N: Into<Option<u64>>>(random_num: Option<u64>, a: N, b: N) -> Vec<u8> {
        let a: u64 = a.into().unwrap_or(170);
        let b: u64 = b.into().unwrap_or(85);
        Self::random_list(random_num, a, b, 1, 0, 0, 0)
    }

    fn list_3<N: Into<Option<u64>>>(random_num: Option<u64>, a: N, b: N) -> Vec<u8> {
        let a: u64 = a.into().unwrap_or(170);
        let b: u64 = b.into().unwrap_or(85);
        Self::random_list(random_num, a, b, 1, 0, 5, 0)
    }

    fn list_4(
        a: u8,
        b: u8,
        c: u8,
        d: u8,
        e: u8,
        f: u8,
        g: u8,
        h: u8,
        i: u8,
        j: u8,
        k: u8,
        m: u8,
        n: u8,
        o: u8,
        p: u8,
        q: u8,
        r: u8,
    ) -> Vec<u8> {
        [
            44, a, 0, 0, 0, 0, 24, b, n, 0, c, d, 0, 0, 0, 1, 0, 239, e, o, f, g, 0, 0, 0, 0, h, 0,
            0, 14, i, j, 0, k, m, 3, p, 1, q, 1, r, 0, 0, 0,
        ]
        .to_vec()
    }

    fn generate_string_1(
        random_num_1: Option<u64>,
        random_num_2: Option<u64>,
        random_num_3: Option<u64>,
    ) -> String {
        let binding = Self::list_1(random_num_1, None, None, None);
        let s1 = String::from_utf8_lossy(&binding);
        let binding = Self::list_2(random_num_2, None, None);
        let s2 = String::from_utf8_lossy(&binding);
        let binding = Self::list_3(random_num_3, None, None);
        let s3 = String::from_utf8_lossy(&binding);

        format!("{s1}{s2}{s3}")
    }

    fn sm3_to_array(bytes: &[u8]) -> Vec<u8> {
        let mut hasher = Sm3::new();
        hasher.update(bytes);
        let hash = hasher.finalize();
        hash.to_vec()
    }

    fn generate_method_code(method: &str) -> Vec<u8> {
        let s = format!("{method}{END_STRING}");
        let array1 = Self::sm3_to_array(s.as_bytes());
        let array2 = Self::sm3_to_array(array1.as_slice());

        array2
    }

    fn generate_params_code(params: &str) -> Vec<u8> {
        let s = format!("{params}{END_STRING}");
        let array1 = Self::sm3_to_array(s.as_bytes());
        let array2 = Self::sm3_to_array(array1.as_slice());

        array2
    }

    fn generate_string_2_list(
        &self,
        params: &str,
        method: &str,
        start_time: u64,
        end_time: u64,
    ) -> Vec<u8> {
        let start_time = if start_time > 0 {
            start_time
        } else {
            now_millis().unwrap()
        };

        let end_time = if end_time > 0 {
            end_time
        } else {
            // TODO: start_time 随机加4到8毫秒
            now_millis().unwrap() + 8
        };

        let params_array = Self::generate_params_code(params);
        let method_array = Self::generate_method_code(method);

        Self::list_4(
            ((end_time >> 24) & 255) as u8,
            params_array[21],
            self.ua_code[23],
            ((end_time >> 16) & 255) as u8,
            params_array[22],
            self.ua_code[24],
            ((end_time >> 8) & 255) as u8,
            ((end_time >> 0) & 255) as u8,
            ((start_time >> 24) & 255) as u8,
            ((start_time >> 16) & 255) as u8,
            ((start_time >> 8) & 255) as u8,
            ((start_time >> 0) & 255) as u8,
            method_array[21],
            method_array[22],
            ((end_time / 256 / 256 / 256 / 256) >> 0) as u8,
            ((start_time / 256 / 256 / 256 / 256) >> 0) as u8,
            self.browser.len() as u8,
        )
    }

    fn end_check_num(a: &[u8]) -> u8 {
        let mut r = 0;
        for i in a {
            r ^= i;
        }
        r
    }

    fn rc4_encrypt(plaintext: &[u8], key: &[u8]) -> String {
        let mut s = (0..=255).collect::<Vec<u8>>();
        let mut j = 0;

        for i in 0..256 {
            j = ((j as u16 + s[i] as u16 + key[i % key.len()] as u16) % 256) as usize;
            s.swap(i, j as usize);
        }

        let mut i = 0;
        let mut j = 0;
        let mut result = Vec::with_capacity(plaintext.len());

        for &b in plaintext {
            i = (i + 1) % 256;
            j = ((j as u16 + s[i] as u16) % 256) as usize;
            s.swap(i, j);
            let idx = ((s[i] as u16 + s[j] as u16) % 256) as usize;
            result.push(b ^ s[idx]);
        }

        return String::from_utf8_lossy(&result).to_string();
    }

    fn generate_string_2(
        &self,
        params: &str,
        method: &str,
        start_time: u64,
        end_time: u64,
    ) -> String {
        let mut a = self.generate_string_2_list(params, method, start_time, end_time);
        let e = Self::end_check_num(&a);
        a.extend(self.browser.as_bytes());
        a.push(e);

        Self::rc4_encrypt(&a, "y".as_bytes())
    }

    fn generate_result(s: &[u8], mix: &SmMix) -> String {
        let mut r = vec![];

        let p1: u32 = 16;
        let p2: u32 = 8;

        for i in (0..s.len()).step_by(3) {
            let n: u32;
            if i + 2 < s.len() {
                n = (s[i] as u32) << p1 | (s[i + 1] as u32) << p2 | (s[i + 2] as u32);
            } else if i + 1 < s.len() {
                n = (s[i] as u32) << p1 | (s[i + 1] as u32) << p2;
            } else {
                n = (s[i] as u32) << p1;
            }

            let keys: Vec<i32> = (0..=18).rev().step_by(6).collect(); // [18, 12, 6, 0]
            let values: [i32; 4] = [0xFC0000, 0x03F000, 0x0FC0, 0x3F];
            for (j, k) in keys.iter().zip(values.iter()) {
                if *j == 6 && i + 1 >= s.len() {
                    break;
                } else if *j == 0 && i + 2 >= s.len() {
                    break;
                } else {
                    let idx = (n as i32 & k) >> j;
                    r.push(mix.as_str().chars().nth(idx as usize).unwrap() as u8);
                }
            }
        }
        r.extend(repeat_n(b'=', (4 - r.len() % 4) % 4));
        String::from_utf8_lossy(&r).to_string()
    }

    pub(super) fn get_value(
        &self,
        params: &str,
        start_time: Option<u64>,
        end_time: Option<u64>,
        random_num_1: Option<u64>,
        random_num_2: Option<u64>,
        random_num_3: Option<u64>,
    ) -> String {
        let string_1 = Self::generate_string_1(random_num_1, random_num_2, random_num_3);
        let string_2 = self.generate_string_2(
            params,
            "GET",
            start_time.unwrap_or(0),
            end_time.unwrap_or(0),
        );
        let string = format!("{}{}", string_1, string_2);

        Self::generate_result(string.as_bytes(), &SmMix::S4)
    }
}
