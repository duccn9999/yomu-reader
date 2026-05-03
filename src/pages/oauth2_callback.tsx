export default function OAuth2Callback() {
  // extract access token + expires_in from URL hash
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  const accessToken = hashParams.get("access_token");
  const expiresIn = hashParams.get("expires_in");

  if (accessToken) {
    localStorage.setItem("gdrive_access_token", accessToken);

    if (expiresIn) {
      const expiresAt = Date.now() + Number(expiresIn) * 1000;

      localStorage.setItem("gdrive_expires_at", expiresAt.toString());
    }
  }

  window.close();

  return <></>;
}
