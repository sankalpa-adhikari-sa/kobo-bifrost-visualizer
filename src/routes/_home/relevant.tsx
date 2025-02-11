import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { createFileRoute } from "@tanstack/react-router";
import { sheetsAtom } from "@/atoms/sheetsAtom.ts";
import { useAtom } from "jotai";
import { extractSurveyData } from "@/utils/surveyUtils.ts";

export const Route = createFileRoute("/_home/relevant")({
  component: RelevantPage,
});

const VariableHoverCard = ({ variable, surveyMap }) => {
  const variableData = surveyMap[variable];

  return (
    <HoverCard>
      <HoverCardTrigger className="cursor-pointer underline decoration-dotted">
        {variable}
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-4">
        <div className="space-y-2">
          {variableData ? (
            <>
              <div>
                <strong className="font-medium">Label:</strong>{" "}
                {variableData.label || "No Label"}
              </div>
              <div>
                <strong className="font-medium">Type:</strong>{" "}
                {variableData.type || "Unknown"}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              Variable not found in survey.
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const DynamicLabel = ({ label, surveyMap }) => {
  if (!label) return null;

  const parts = label.split(/\$\{(.*?)\}/g);

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return <span key={index}>{part}</span>;
        }
        return (
          <VariableHoverCard
            key={index}
            variable={part}
            surveyMap={surveyMap}
          />
        );
      })}
    </>
  );
};

const DependenciesList = ({ variables, surveyMap }) => {
  if (!variables.length) return null;

  return (
    <div className="flex flex-row gap-2">
      <p className="font-medium">Depends on:</p>

      {variables.map((variable) => (
        <Badge key={variable} variant="default">
          <VariableHoverCard variable={variable} surveyMap={surveyMap} />
        </Badge>
      ))}
    </div>
  );
};

const QuestionCard = ({ question, surveyMap }) => {
  const relevantVariables = extractVariables(question.relevant);
  const labelVariables = extractVariables(question.label || "");
  const allDependentVariables = Array.from(
    new Set([...relevantVariables, ...labelVariables]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <DynamicLabel label={question.label} surveyMap={surveyMap} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong className="font-medium">Name:</strong> {question.name}
        </div>
        {question.relevant && (
          <div>
            <strong className="font-medium">Relevant Condition:</strong>{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              {question.relevant}
            </code>
          </div>
        )}
        <DependenciesList
          variables={allDependentVariables}
          surveyMap={surveyMap}
        />
      </CardContent>
    </Card>
  );
};

const extractVariables = (expression?: string): string[] => {
  if (!expression) return [];
  const matches = expression.match(/\$\{(.*?)\}/g);
  return matches ? matches.map((m) => m.replace(/\$\{|\}/g, "")) : [];
};

function RelevantPage() {
  const [sheets] = useAtom(sheetsAtom);

  if (!sheets?.survey?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No survey data available. Please upload an XLSForm file to continue.
      </div>
    );
  }

  const surveySheet = sheets["survey"];
  const headers = surveySheet[0];
  const surveyData = surveySheet
    .slice(1)
    .map((row) => extractSurveyData(headers, row));
  const surveyMap = Object.fromEntries(
    surveyData.map((row) => [row.name, row]),
  );

  const relevantRows = surveyData.filter(
    (rowData) =>
      rowData.relevant ||
      (rowData.label && extractVariables(rowData.label).length > 0),
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Relevant Survey Questions</h1>
      {relevantRows.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No relevant conditions found in the survey.
        </p>
      ) : (
        <div className="grid gap-4">
          {relevantRows.map((rowData, index) => (
            <QuestionCard
              key={index}
              question={rowData}
              surveyMap={surveyMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
