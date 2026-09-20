import { Suspense } from "react";
import AdminTeamsPage from "@/components/Admin/AdminTeamsPage";

function AdminTeams() {
  // AdminTeamsPage reads ?team= and ?member= via useSearchParams, which on a
  // prerendered route client-renders everything up to the nearest Suspense
  // boundary. Without one, Next refuses to build this page.
  return (
    <Suspense fallback={null}>
      <AdminTeamsPage />
    </Suspense>
  );
}

export default AdminTeams;
