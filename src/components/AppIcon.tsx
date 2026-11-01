import { useState } from "react";
import { hueFor, initialOf } from "../lib/format";

interface AppIconProps {
  appName: string;
  packageName: string;
  icon: string | null;
  size?: number;
}

/**
 * Shows the real launcher icon when the platform provided one, otherwise a
 * deterministic letter tile. Never a stock image pretending to be the app.
 */
export function AppIcon({ appName, packageName, icon, size = 48 }: AppIconProps) {
  const [failed, setFailed] = useState(false);
  const letter = initialOf(appName, packageName);
  const hue = hueFor(packageName);
  const frame = { width: size, height: size, borderRadius: Math.round(size * 0.3) };

  if (icon && !failed) {
    return (
      <img
        className="app-icon app-icon--image"
        src={icon}
        alt=""
        style={frame}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className="app-icon app-icon--letter"
      style={{
        ...frame,
        fontSize: Math.round(size * 0.4),
        background: `linear-gradient(140deg, hsl(${hue} 68% 52%), hsl(${(hue + 38) % 360} 74% 40%))`,
      }}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
