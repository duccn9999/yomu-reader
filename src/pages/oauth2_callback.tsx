export default function OAuth2Callback() {
  // extract access token from url
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get("access_token");
  localStorage.setItem("gdrive_access_token", accessToken || "");
  window.close();
  return <></>;
}
