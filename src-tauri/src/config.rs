use dotenv::dotenv;
use std::io::Write;
use std::{env, fs::File};

pub struct Config {
    pub api_key: String,
}
impl Config {
    pub fn new(mut file: &File) -> Result<Self, env::VarError> {
        if let Err(e) = dotenv() {
            writeln!(file, "dotenverror: {}", e).expect("dotenverror: e");
        }
        let api_key = env::var("GOOGLE_TRANSLATE_API_KEY")?;
        Ok(Self { api_key })
    }
}
