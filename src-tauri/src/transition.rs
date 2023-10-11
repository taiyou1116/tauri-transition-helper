use reqwest;
use serde_json::Value;
use std::collections::HashMap;

pub async fn run(
    api_key: &str,
    text_to_be_translated: &str,
    client: &reqwest::Client,
) -> Result<String, String> {
    let ln = std::env::var("LANGUAGE").unwrap();
    let target_language = &ln;

    let url = format!(
        "https://translation.googleapis.com/language/translate/v2?key={}",
        api_key
    );

    let mut payload = HashMap::new();
    payload.insert("q", text_to_be_translated);
    payload.insert("target", target_language);

    let res: Value = client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    match res["data"]["translations"][0]["translatedText"].as_str() {
        Some(translated_text) => {
            println!("{}", translated_text);
            Ok(translated_text.to_string())
        }
        None => Err("Translation failed".to_string()),
    }
}
