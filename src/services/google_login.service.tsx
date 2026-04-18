import { useContext } from "react";
import { SignalContext } from "../contexts/signal_context";

const width = 500;
const height = 600;
const left = (window.innerWidth - width) / 2;
const top = (window.innerHeight - height) / 2;
const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_ENDPOINT;
const clientId = import.meta.env.VITE_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const scope = import.meta.env.VITE_GOOGLE_SCOPE;
const authUrl = `${googleAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;

// rename to make it clear it's a hook
export function useGoogleLogin(onClose?: () => void) {
  function login() {
    const popup = window.open(
      authUrl,
      "googleOAuth",
      `width=${width},height=${height},top=${top},left=${left}`,
    );

    if (!popup) return;

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        onClose?.();
      }
    }, 500);
  }

  return { login };
}
