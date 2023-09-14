use reqwest;
use serde_json::Value;
use std::collections::HashMap;

pub async fn run(api_key: &str, text: &str) -> Result<(), reqwest::Error> {
    let text_to_translate = text;
    let target_language = "ja";

    let url = format!(
        "https://translation.googleapis.com/language/translate/v2?key={}",
        api_key
    );

    let mut payload = HashMap::new();
    payload.insert("q", text_to_translate);
    payload.insert("target", target_language);

    let client = reqwest::Client::new();
    let res: Value = client
        .post(&url)
        .json(&payload)
        .send()
        .await?
        .json()
        .await?;

    match res["data"]["translations"][0]["translatedText"].as_str() {
        Some(translated_text) => println!("Translated text: {}", translated_text),
        None => println!("Translation failed"),
    }

    Ok(())
}
