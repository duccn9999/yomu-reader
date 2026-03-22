const width = 500;
const height = 600;
const left = (window.innerWidth - width) / 2;
const top = (window.innerHeight - height) / 2;
const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_ENDPOINT;
const clientId = import.meta.env.VITE_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const scope = import.meta.env.VITE_GOOGLE_SCOPE;
const authUrl = `${googleAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;

export function GoogleLogin() {
  window.open(
    authUrl,
    "googleOAuth",
    `width=${width},height=${height},top=${top},left=${left}`,
  ); // Redirect to Google OAuth
}
