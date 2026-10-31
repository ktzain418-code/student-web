import { AlertTriangle, FlaskConical, Info, ShieldAlert, X } from "lucide-react";
import type { ReactNode } from "react";

type NoticeTone = "info" | "warning" | "danger" | "demo";

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  danger: ShieldAlert,
  demo: FlaskConical,
} as const;

interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  action?: ReactNode;
}

export function Notice({ tone = "info", title, children, onDismiss, action }: NoticeProps) {
  const Icon = ICONS[tone];
  return (
    <div className={`notice notice--${tone}`} role="note">
      <Icon size={18} className="notice-icon" aria-hidden="true" />
      <div className="notice-content">
        {title ? <p className="notice-title">{title}</p> : null}
        <div className="notice-text">{children}</div>
        {action ? <div className="notice-action">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className="notice-close" aria-label="Dismiss message" onClick={onDismiss}>
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}
