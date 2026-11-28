use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::time::{Duration, Instant};
use tauri_plugin_opener::OpenerExt;

const KEYRING_SERVICE: &str = "neosantara_desktop_game";
const KEYRING_USER: &str = "google_refresh_token";

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopAuthResult {
    pub id_token: String,
    pub access_token: Option<String>,
}

#[derive(Debug, Deserialize)]
struct TokenResponse {
    id_token: Option<String>,
    access_token: Option<String>,
    refresh_token: Option<String>,
    error: Option<String>,
    error_description: Option<String>,
}

#[derive(Debug, Deserialize)]
struct IdTokenPayload {
    iss: Option<String>,
    aud: Option<String>,
    exp: Option<i64>,
    nonce: Option<String>,
}

fn generate_random_bytes(len: usize) -> Vec<u8> {
    let mut bytes = vec![0u8; len];
    rand::thread_rng().fill_bytes(&mut bytes);
    bytes
}

fn generate_pkce_verifier() -> String {
    // RFC 7636: 43 to 128 characters unreserved
    let raw = generate_random_bytes(64);
    URL_SAFE_NO_PAD.encode(&raw)
}

fn compute_s256_challenge(verifier: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(verifier.as_bytes());
    let hash = hasher.finalize();
    URL_SAFE_NO_PAD.encode(hash)
}

fn generate_random_string(byte_count: usize) -> String {
    let bytes = generate_random_bytes(byte_count);
    URL_SAFE_NO_PAD.encode(&bytes)
}

fn parse_jwt_payload_unverified(id_token: &str) -> Result<IdTokenPayload, String> {
    let parts: Vec<&str> = id_token.split('.').collect();
    if parts.len() != 3 {
        return Err("Malformed ID Token".to_string());
    }
    let payload_bytes = URL_SAFE_NO_PAD
        .decode(parts[1])
        .map_err(|_| "Invalid base64 in ID Token payload".to_string())?;
    let payload: IdTokenPayload = serde_json::from_slice(&payload_bytes)
        .map_err(|e| format!("Failed to parse ID Token payload: {}", e))?;
    Ok(payload)
}

fn validate_id_token_claims(
    id_token: &str,
    expected_client_id: &str,
    expected_nonce: &str,
) -> Result<(), String> {
    let payload = parse_jwt_payload_unverified(id_token)?;

    // 1. Validasi Issuer
    match payload.iss.as_deref() {
        Some("https://accounts.google.com") | Some("accounts.google.com") => {}
        _ => return Err("Invalid token issuer (iss)".to_string()),
    }

    // 2. Validasi Audience (Client ID)
    if payload.aud.as_deref() != Some(expected_client_id) {
        return Err("Audience (aud) does not match client ID".to_string());
    }

    // 3. Validasi Nonce
    if payload.nonce.as_deref() != Some(expected_nonce) {
        return Err("Nonce in token does not match generated nonce".to_string());
    }

    // 4. Validasi Expiration
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs() as i64;

    if let Some(exp) = payload.exp {
        if exp < now {
            return Err("Token is expired".to_string());
        }
    } else {
        return Err("Missing token expiration (exp)".to_string());
    }

    Ok(())
}

fn save_refresh_token(refresh_token: &str) {
    if let Ok(entry) = keyring::Entry::new(KEYRING_SERVICE, KEYRING_USER) {
        let _ = entry.set_password(refresh_token);
    }
}

pub fn delete_stored_refresh_token() {
    if let Ok(entry) = keyring::Entry::new(KEYRING_SERVICE, KEYRING_USER) {
        let _ = entry.delete_credential();
    }
}

pub fn get_stored_refresh_token() -> Option<String> {
    if let Ok(entry) = keyring::Entry::new(KEYRING_SERVICE, KEYRING_USER) {
        entry.get_password().ok()
    } else {
        None
    }
}

/// Menangani koneksi HTTP callback di 127.0.0.1
fn handle_callback_stream(
    mut stream: TcpStream,
    expected_state: &str,
) -> Result<String, String> {
    let mut buffer = [0u8; 4096];
    let bytes_read = stream
        .read(&mut buffer)
        .map_err(|e| format!("Failed to read callback request: {}", e))?;

    let request_str = String::from_utf8_lossy(&buffer[..bytes_read]);

    let mut lines = request_str.lines();
    let first_line = lines.next().ok_or("Empty HTTP request")?;
    let parts: Vec<&str> = first_line.split_whitespace().collect();

    if parts.len() < 2 || parts[0] != "GET" {
        let response = "HTTP/1.1 405 Method Not Allowed\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        let _ = stream.write_all(response.as_bytes());
        return Err("Method not allowed (only GET is accepted)".to_string());
    }

    let raw_path = parts[1];
    let url = url::Url::parse(&format!("http://127.0.0.1{}", raw_path))
        .map_err(|_| "Malformed request URL".to_string())?;

    if url.path() != "/callback" {
        let response = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        let _ = stream.write_all(response.as_bytes());
        return Err(format!("Invalid callback path: {}", url.path()));
    }

    let mut code_opt = None;
    let mut state_opt = None;
    let mut error_opt = None;

    for (k, v) in url.query_pairs() {
        if k == "code" {
            code_opt = Some(v.to_string());
        } else if k == "state" {
            state_opt = Some(v.to_string());
        } else if k == "error" {
            error_opt = Some(v.to_string());
        }
    }

    if let Some(err) = error_opt {
        let html = r#"<!DOCTYPE html><html><head><meta charset="utf-8"><title>Login Dibatalkan</title><style>body{background:#090d16;color:#f87171;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}div{text-align:center;padding:2rem;border:1px solid #dc2626;border-radius:12px;background:#18181b}h1{font-size:1.5rem}p{color:#94a3b8}</style></head><body><div><h1>Login Dibatalkan atau Gagal</h1><p>Anda dapat menutup jendela ini dan mencoba kembali di aplikasi NEOSANTARA.</p></div></body></html>"#;
        let response = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
            html.len(),
            html
        );
        let _ = stream.write_all(response.as_bytes());
        return Err(format!("Google login error: {}", err));
    }

    let state = state_opt.ok_or("State parameter missing from Google callback")?;
    if state != expected_state {
        let response = "HTTP/1.1 400 Bad Request\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        let _ = stream.write_all(response.as_bytes());
        return Err("State mismatch: possible CSRF or invalid session".to_string());
    }

    let code = code_opt.ok_or("Authorization code missing from Google callback")?;

    let html = r#"<!DOCTYPE html><html><head><meta charset="utf-8"><title>NEOSANTARA - Login Berhasil</title><style>body{background:#020617;color:#10b981;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}div{text-align:center;padding:2.5rem;border:1px solid #10b981;border-radius:12px;background:#090d16;box-shadow:0 0 30px rgba(16,185,129,0.2)}h1{font-size:1.6rem;margin-bottom:0.5rem}p{color:#94a3b8;font-size:0.95rem}</style></head><body><div><h1>✓ Login Berhasil!</h1><p>Autentikasi akun Google Anda telah diterima.<br>Silakan tutup tab browser ini dan kembali ke aplikasi NEOSANTARA.</p></div><script>setTimeout(function(){window.close();}, 2000);</script></body></html>"#;
    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        html.len(),
        html
    );
    let _ = stream.write_all(response.as_bytes());

    Ok(code)
}

/// Menjalankan loopback listener di 127.0.0.1 port acak
pub fn wait_for_authorization_code(
    listener: TcpListener,
    expected_state: &str,
    timeout_secs: u64,
) -> Result<String, String> {
    listener
        .set_nonblocking(true)
        .map_err(|e| format!("Failed to set nonblocking mode: {}", e))?;

    let start_time = Instant::now();
    let timeout = Duration::from_secs(timeout_secs);

    loop {
        if start_time.elapsed() > timeout {
            return Err("Waktu proses login di browser telah habis (timeout 3 menit). Silakan coba lagi.".to_string());
        }

        match listener.accept() {
            Ok((stream, addr)) => {
                // Keamanan: Tolak jika bukan berasal dari loopback 127.0.0.1
                if !addr.ip().is_loopback() {
                    let mut stream = stream;
                    let _ = stream.write_all(b"HTTP/1.1 403 Forbidden\r\n\r\n");
                    continue;
                }

                stream
                    .set_read_timeout(Some(Duration::from_secs(5)))
                    .map_err(|e| e.to_string())?;

                return handle_callback_stream(stream, expected_state);
            }
            Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                std::thread::sleep(Duration::from_millis(100));
            }
            Err(e) => {
                return Err(format!("Network error on loopback listener: {}", e));
            }
        }
    }
}

/// Pertukaran authorization code dengan token ke oauth2.googleapis.com
pub async fn exchange_code_for_tokens(
    client_id: &str,
    client_secret: Option<&str>,
    code: &str,
    code_verifier: &str,
    redirect_uri: &str,
    expected_nonce: &str,
) -> Result<DesktopAuthResult, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let mut params = vec![
        ("code", code),
        ("client_id", client_id),
        ("code_verifier", code_verifier),
        ("redirect_uri", redirect_uri),
        ("grant_type", "authorization_code"),
    ];

    if let Some(secret) = client_secret {
        if !secret.trim().is_empty() {
            params.push(("client_secret", secret));
        }
    }

    let res = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Network request to Google token endpoint failed: {}", e))?;

    let status = res.status();
    let token_resp: TokenResponse = res
        .json()
        .await
        .map_err(|e| format!("Failed to parse Google token response: {}", e))?;

    if !status.is_success() {
        let err_msg = token_resp
            .error_description
            .or(token_resp.error)
            .unwrap_or_else(|| format!("HTTP status {}", status));
        return Err(format!("Google token exchange failed: {}", err_msg));
    }

    let id_token = token_resp
        .id_token
        .ok_or("No ID token returned by Google")?;

    validate_id_token_claims(&id_token, client_id, expected_nonce)?;

    if let Some(ref refresh_tok) = token_resp.refresh_token {
        save_refresh_token(refresh_tok);
    }

    Ok(DesktopAuthResult {
        id_token,
        access_token: token_resp.access_token,
    })
}

/// Menukar refresh_token yang tersimpan di keychain menjadi id_token baru
pub async fn refresh_stored_token(
    client_id: &str,
    client_secret: Option<&str>,
) -> Result<DesktopAuthResult, String> {
    let refresh_token = get_stored_refresh_token()
        .ok_or("No stored refresh token found in OS keychain")?;

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let mut params = vec![
        ("client_id", client_id),
        ("refresh_token", refresh_token.as_str()),
        ("grant_type", "refresh_token"),
    ];

    if let Some(secret) = client_secret {
        if !secret.trim().is_empty() {
            params.push(("client_secret", secret));
        }
    }

    let res = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Network request to Google refresh endpoint failed: {}", e))?;

    let status = res.status();
    let token_resp: TokenResponse = res
        .json()
        .await
        .map_err(|e| format!("Failed to parse Google refresh response: {}", e))?;

    if !status.is_success() {
        // Jika token tidak valid / revoked, hapus dari keychain
        delete_stored_refresh_token();
        let err_msg = token_resp
            .error_description
            .or(token_resp.error)
            .unwrap_or_else(|| format!("HTTP status {}", status));
        return Err(format!("Google token refresh failed: {}", err_msg));
    }

    let id_token = token_resp
        .id_token
        .ok_or("No ID token returned during refresh by Google")?;

    if let Some(ref new_refresh) = token_resp.refresh_token {
        save_refresh_token(new_refresh);
    }

    Ok(DesktopAuthResult {
        id_token,
        access_token: token_resp.access_token,
    })
}

/// Perintah utama login Google Desktop via Browser Luar + PKCE Loopback
pub async fn execute_desktop_google_sign_in<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    client_id: &str,
    client_secret: Option<&str>,
) -> Result<DesktopAuthResult, String> {
    if client_id.trim().is_empty() {
        return Err("Google Desktop Client ID belum dikonfigurasi.".to_string());
    }

    // 1. Bind hanya ke 127.0.0.1 port 0 (OS akan memilih port acak yang bebas)
    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|e| format!("Gagal mengalokasikan port lokal loopback: {}", e))?;

    let port = listener
        .local_addr()
        .map_err(|e| e.to_string())?
        .port();

    let redirect_uri = format!("http://127.0.0.1:{}/callback", port);

    // 2. Buat PKCE code_verifier (>=64 byte acak) & code_challenge S256
    let code_verifier = generate_pkce_verifier();
    let code_challenge = compute_s256_challenge(&code_verifier);
    let state = generate_random_string(32);
    let nonce = generate_random_string(32);

    // 3. Bangun URL otorisasi Google
    let mut auth_url = url::Url::parse("https://accounts.google.com/o/oauth2/v2/auth")
        .map_err(|e| e.to_string())?;

    auth_url.query_pairs_mut()
        .append_pair("client_id", client_id)
        .append_pair("redirect_uri", &redirect_uri)
        .append_pair("response_type", "code")
        .append_pair("scope", "openid email profile")
        .append_pair("code_challenge", &code_challenge)
        .append_pair("code_challenge_method", "S256")
        .append_pair("state", &state)
        .append_pair("nonce", &nonce)
        .append_pair("access_type", "offline")
        .append_pair("prompt", "select_account");

    let auth_url_string = auth_url.to_string();

    // 4. Buka URL menggunakan tauri-plugin-opener ke browser sistem default
    app.opener()
        .open_url(&auth_url_string, None::<&str>)
        .map_err(|e| format!("Gagal membuka browser sistem: {}", e))?;

    // 5. Tunggu callback kode otorisasi di loopback listener (timeout 3 menit / 180 detik)
    let state_clone = state.clone();
    let auth_code = tokio::task::spawn_blocking(move || {
        wait_for_authorization_code(listener, &state_clone, 180)
    })
    .await
    .map_err(|e| format!("Task execution error: {}", e))??;

    // 6. Tukar code dengan token di Rust melalui HTTPS ke oauth2.googleapis.com
    let result = exchange_code_for_tokens(
        client_id,
        client_secret,
        &auth_code,
        &code_verifier,
        &redirect_uri,
        &nonce,
    )
    .await?;

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pkce_generation() {
        let verifier = generate_pkce_verifier();
        assert!(verifier.len() >= 64, "PKCE verifier length must be >= 64");
        let challenge = compute_s256_challenge(&verifier);
        assert!(!challenge.is_empty(), "PKCE challenge must not be empty");
        // Pastikan deterministik
        let challenge2 = compute_s256_challenge(&verifier);
        assert_eq!(challenge, challenge2);
    }

    #[test]
    fn test_loopback_state_mismatch_rejected() {
        let listener = TcpListener::bind("127.0.0.1:0").expect("Failed to bind test listener");
        let port = listener.local_addr().unwrap().port();
        let expected_state = "correct_secret_state_123";

        let handle = std::thread::spawn(move || {
            wait_for_authorization_code(listener, expected_state, 5)
        });

        // Kirim request dengan state yang salah
        let mut client = TcpStream::connect(format!("127.0.0.1:{}", port)).expect("Failed to connect");
        let req = "GET /callback?code=testcode123&state=wrong_state HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n";
        client.write_all(req.as_bytes()).unwrap();

        let result = handle.join().unwrap();
        assert!(result.is_err(), "Harus menolak state yang tidak cocok");
        assert!(result.unwrap_err().contains("State mismatch"));
    }

    #[test]
    fn test_loopback_invalid_path_rejected() {
        let listener = TcpListener::bind("127.0.0.1:0").expect("Failed to bind test listener");
        let port = listener.local_addr().unwrap().port();
        let expected_state = "valid_state";

        let handle = std::thread::spawn(move || {
            wait_for_authorization_code(listener, expected_state, 5)
        });

        let mut client = TcpStream::connect(format!("127.0.0.1:{}", port)).expect("Failed to connect");
        let req = "GET /malicious-path?code=123&state=valid_state HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n";
        client.write_all(req.as_bytes()).unwrap();

        let result = handle.join().unwrap();
        assert!(result.is_err(), "Harus menolak request path selain /callback");
    }

    #[test]
    fn test_id_token_validation_aud_and_nonce() {
        // Buat dummy token dengan aud dan nonce
        let header = URL_SAFE_NO_PAD.encode(r#"{"alg":"RS256","typ":"JWT"}"#);
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let payload_json = serde_json::json!({
            "iss": "https://accounts.google.com",
            "aud": "my-client-id.apps.googleusercontent.com",
            "exp": now + 3600,
            "nonce": "correct_nonce_456"
        });
        let payload = URL_SAFE_NO_PAD.encode(payload_json.to_string());
        let dummy_token = format!("{}.{}.fake_sig", header, payload);

        // Kasus 1: Cocok
        let valid = validate_id_token_claims(&dummy_token, "my-client-id.apps.googleusercontent.com", "correct_nonce_456");
        assert!(valid.is_ok(), "Token harus valid jika claims cocok");

        // Kasus 2: Client ID mismatch
        let wrong_aud = validate_id_token_claims(&dummy_token, "other-client-id.apps.googleusercontent.com", "correct_nonce_456");
        assert!(wrong_aud.is_err(), "Audience mismatch harus ditolak");

        // Kasus 3: Nonce mismatch
        let wrong_nonce = validate_id_token_claims(&dummy_token, "my-client-id.apps.googleusercontent.com", "wrong_nonce");
        assert!(wrong_nonce.is_err(), "Nonce mismatch harus ditolak");
    }
}

