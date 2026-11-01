import { Loader2 } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash-mark">AH</div>
      <div className="splash-text">
        <h1>App History</h1>
        <p>Remember the apps you've used.</p>
      </div>
      <Loader2 className="spin" size={22} aria-label="Loading" />
    </div>
  );
}
