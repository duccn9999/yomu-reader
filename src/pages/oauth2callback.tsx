import { useEffect } from "react";

export default function OAuth2Callback() {
  let url = window.location.href;
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    if (accessToken) {
      console.log("Access Token:", accessToken);
      // You can now use the access token to make API calls to Google Drive
    } else {
      console.error("Access token not found in URL.");
    }
  }, []);
  return <></>;
}
