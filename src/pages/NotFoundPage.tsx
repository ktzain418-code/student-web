import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="page">
      <PageHeader title="Not found" back />
      <div className="page-body">
        <EmptyState
          icon={Compass}
          title="That screen does not exist"
          body="The link may be out of date. Everything in App History is reachable from the bottom navigation."
          action={
            <Link to="/" className="btn btn-primary">
              Go to dashboard
            </Link>
          }
        />
      </div>
    </div>
  );
}
