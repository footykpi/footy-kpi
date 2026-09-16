import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service")({
  component: () => <Navigate to="/terms" />,
});
