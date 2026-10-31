import { CheckCircle2 } from "lucide-react";

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <CheckCircle2 size={16} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
