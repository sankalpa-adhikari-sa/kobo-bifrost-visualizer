import { createFileRoute } from "@tanstack/react-router";
import { useAtom } from "jotai/index";
import { sheetsAtom } from "@/atoms/sheetsAtom.ts";
import { extractSurveyData } from "@/utils/surveyUtils.ts";

export const Route = createFileRoute("/_home/relevant")({
  component: RelevantPage,
});

function RelevantPage() {
  const [sheets] = useAtom(sheetsAtom);

  if (!sheets || !sheets["survey"] || sheets["survey"].length === 0) {
    return (
      <div>
        No survey data available. Please upload a XLSForm file to continue.
      </div>
    );
  }

  const surveySheet = sheets["survey"];
  const headers = surveySheet[0];

  surveySheet.slice(1).forEach((row) => {
    const allData = extractSurveyData(headers, row);
    console.log(allData);
  });

  return <div>Hello "/home/sheets"!</div>;
}
