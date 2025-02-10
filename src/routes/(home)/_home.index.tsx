import { createFileRoute } from "@tanstack/react-router";
import TldrawComponent from "@/components/tldrawComponent.tsx";

export const Route = createFileRoute("/(home)/_home/")({
  component: TLDrawPage,
});

function TLDrawPage() {
  return (
    <div className="flex position-absolute inset-0">
      <TldrawComponent />
    </div>
  );
}
