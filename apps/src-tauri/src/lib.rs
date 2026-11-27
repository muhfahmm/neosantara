use serde::{Deserialize, Serialize};
#[cfg(target_os = "android")]
use tauri::Manager;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativePlayGamesAuthConfig {
  firebase_api_key: String,
  firebase_android_app_id: String,
  firebase_project_id: String,
  firebase_messaging_sender_id: String,
  server_client_id: String,
  play_games_project_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeAuthState {
  is_signed_in: bool,
  uid: Option<String>,
  display_name: Option<String>,
  email: Option<String>,
}

#[cfg(target_os = "android")]
struct PlayGamesAuthPluginState(tauri::plugin::PluginHandle<tauri::Wry>);

fn play_games_auth_plugin() -> tauri::plugin::TauriPlugin<tauri::Wry> {
  tauri::plugin::Builder::<tauri::Wry>::new("play-games-auth")
    .setup(|app, api| {
      #[cfg(target_os = "android")]
      {
        let handle =
          api.register_android_plugin("com.presiden.simulator", "PlayGamesAuthPlugin")?;
        app.manage(PlayGamesAuthPluginState(handle));
      }
      #[cfg(not(target_os = "android"))]
      let _ = (app, api);
      Ok(())
    })
    .build()
}

#[tauri::command]
async fn play_games_sign_in(
  app: tauri::AppHandle<tauri::Wry>,
  config: NativePlayGamesAuthConfig,
) -> Result<NativeAuthState, String> {
  #[cfg(target_os = "android")]
  {
    let plugin = app.state::<PlayGamesAuthPluginState>();
    plugin
      .0
      .run_mobile_plugin_async("signIn", config)
      .await
      .map_err(|error| error.to_string())
  }
  #[cfg(not(target_os = "android"))]
  {
    let _ = (app, config);
    Err("Google Play Games sign-in is only available in the Android app.".into())
  }
}

#[tauri::command]
async fn play_games_current_user(
  app: tauri::AppHandle<tauri::Wry>,
  config: NativePlayGamesAuthConfig,
) -> Result<NativeAuthState, String> {
  #[cfg(target_os = "android")]
  {
    let plugin = app.state::<PlayGamesAuthPluginState>();
    plugin
      .0
      .run_mobile_plugin_async("currentUser", config)
      .await
      .map_err(|error| error.to_string())
  }
  #[cfg(not(target_os = "android"))]
  {
    let _ = (app, config);
    Err("Google Play Games sign-in is only available in the Android app.".into())
  }
}

#[tauri::command]
async fn play_games_id_token(
  app: tauri::AppHandle<tauri::Wry>,
  config: NativePlayGamesAuthConfig,
) -> Result<serde_json::Value, String> {
  #[cfg(target_os = "android")]
  {
    let plugin = app.state::<PlayGamesAuthPluginState>();
    plugin
      .0
      .run_mobile_plugin_async("idToken", config)
      .await
      .map_err(|error| error.to_string())
  }
  #[cfg(not(target_os = "android"))]
  {
    let _ = (app, config);
    Err("Google Play Games sign-in is only available in the Android app.".into())
  }
}

#[tauri::command]
async fn play_games_sign_out(
  app: tauri::AppHandle<tauri::Wry>,
  config: NativePlayGamesAuthConfig,
) -> Result<NativeAuthState, String> {
  #[cfg(target_os = "android")]
  {
    let plugin = app.state::<PlayGamesAuthPluginState>();
    plugin
      .0
      .run_mobile_plugin_async("signOut", config)
      .await
      .map_err(|error| error.to_string())
  }
  #[cfg(not(target_os = "android"))]
  {
    let _ = (app, config);
    Err("Google Play Games sign-in is only available in the Android app.".into())
  }
}

#[cfg(not(target_os = "android"))]
pub mod desktop_auth;

#[tauri::command]
async fn desktop_google_sign_in(
  app: tauri::AppHandle<tauri::Wry>,
  client_id: String,
) -> Result<serde_json::Value, String> {
  #[cfg(not(target_os = "android"))]
  {
    let auth_result = desktop_auth::execute_desktop_google_sign_in(&app, &client_id).await?;
    serde_json::to_value(auth_result).map_err(|e| e.to_string())
  }
  #[cfg(target_os = "android")]
  {
    let _ = (app, client_id);
    Err("desktop_google_sign_in is only available on desktop platforms.".into())
  }
}

#[tauri::command]
async fn desktop_google_sign_out() -> Result<(), String> {
  #[cfg(not(target_os = "android"))]
  {
    desktop_auth::delete_stored_refresh_token();
    Ok(())
  }
  #[cfg(target_os = "android")]
  {
    Ok(())
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(play_games_auth_plugin())
    .invoke_handler(tauri::generate_handler![
      play_games_sign_in,
      play_games_current_user,
      play_games_id_token,
      play_games_sign_out,
      desktop_google_sign_in,
      desktop_google_sign_out
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
