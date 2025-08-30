use rand::{rng, Rng};

const MS_TOKEN_LENGTH: usize = 172;

pub(super) fn generate_ms_token() -> String {
    let mut token = String::new();
    let mut rng = rng();
    let chars = "ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789=";
    for _ in 0..MS_TOKEN_LENGTH {
        let random_index = rng.random_range(0..chars.len());
        token.push(chars.chars().nth(random_index).unwrap());
    }
    token
}
