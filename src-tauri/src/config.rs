use dotenv::dotenv;
use std::io::Write;
use std::{env, fs::File};

pub struct Config {
    pub api_key: String,
}
impl Config {
    pub fn new(mut file: &File) -> Result<Self, env::VarError> {
        let api_key = "API_KEY".to_string();
        Ok(Self { api_key })
    }
}
