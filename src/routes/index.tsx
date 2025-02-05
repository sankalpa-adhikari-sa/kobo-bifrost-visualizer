import { createFileRoute } from "@tanstack/react-router";
import XlsxReader from "@/components/XlsxReader.tsx";
import TldrawComponent from "@/components/tldrawComponent.tsx";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="pt-4 pl-4">
      <h1 className="text-xl font-bold mb-2">XLSForm</h1>
      <XlsxReader />
      <TldrawComponent />
    </div>
  );
}
