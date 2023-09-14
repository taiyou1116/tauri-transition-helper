use std::env;

pub struct Config {
    pub api_key: String,
}
impl Config {
    pub fn new() -> Result<Self, env::VarError> {
        let api_key = env::var("GOOGLE_TRANSLATE_API_KEY")?;
        Ok(Self { api_key })
    }
}
