import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getCookie, setCookie } from "./utils/cookies";
import './index.css'
import App from './App'

// Check if Guest session cookie exists
let guestSession = getCookie("guest_session_id");
if (!guestSession) {
  guestSession = crypto.randomUUID();
  setCookie("guest_session_id", guestSession, 7); // 7 days expiry
  console.log("Guest session created:", guestSession);
} else {
  console.log("Existing guest session:", guestSession);
}

// get session start time
let sessionStart = getCookie("session_start_time");
if (!sessionStart) {
  sessionStart = Date.now().toString();
  setCookie("session_start_time", sessionStart, 1); // 1 day expiry
  console.log("Session start time set:", sessionStart);
} else {
  console.log("Existing session start time:", sessionStart);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
