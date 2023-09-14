use reqwest;
use serde_json::Value;
use std::collections::HashMap;

pub async fn run(
    api_key: &str,
    text_to_be_translated: &str,
    client: &reqwest::Client,
) -> Result<(), reqwest::Error> {
    let target_language = "ja";

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
        .await?
        .json()
        .await?;

    match res["data"]["translations"][0]["translatedText"].as_str() {
        Some(translated_text) => println!("Translated text: {}", translated_text),
        None => println!("Translation failed"),
    }

    Ok(())
}
