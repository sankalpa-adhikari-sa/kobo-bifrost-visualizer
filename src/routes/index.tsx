import { createFileRoute } from "@tanstack/react-router";
import XlsxReader from "@/components/XlsxReader.tsx";
import TldrawComponent from "@/components/tldrawComponent.tsx";
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const handleFileParsed = (data) => {
    console.log("Parsed Data:", data);
  };

  return (
    <div className="pt-4 pl-4">
      <h1 className="text-xl font-bold mb-2">XLSForm</h1>
      <XlsxReader onFileParsed={handleFileParsed} />
      <TldrawComponent />
    </div>
  );
}
