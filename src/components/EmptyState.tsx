import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={1.9} />
      </span>
      <h2 className="empty-title">{title}</h2>
      {body ? <p className="empty-body">{body}</p> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
