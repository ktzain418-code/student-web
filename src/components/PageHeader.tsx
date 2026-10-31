import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, back = false, right }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <div className="topbar-row">
        {back ? (
          <button
            type="button"
            className="icon-btn"
            aria-label="Go back"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          >
            <ArrowLeft size={20} />
          </button>
        ) : null}
        <div className="topbar-titles">
          <h1 className="topbar-title">{title}</h1>
          {subtitle ? <p className="topbar-subtitle">{subtitle}</p> : null}
        </div>
        {right ? <div className="topbar-actions">{right}</div> : null}
      </div>
    </header>
  );
}
