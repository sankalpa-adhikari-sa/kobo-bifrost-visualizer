import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { sheetsAtom } from "@/atoms/sheetsAtom.ts";
import { useAtom } from "jotai";
import { extractSurveyData } from "@/utils/surveyUtils.ts";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button.tsx";
import { CheckIcon, PlusCircle } from "lucide-react";

export const Route = createFileRoute("/_home/relevant")({
  component: RelevantPage,
});

const getBaseType = (type: string) => {
  const baseType = type.split(" ")[0];
  return baseType;
};

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
      <CardContent className="space-y-2">
        <div>
          <strong className="font-medium">Name:</strong> {question.name}
        </div>
        <div>
          <strong className="font-medium">Type:</strong> {question.type}
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
const TypeFilter = ({ types, selectedTypes, onTypeChange }) => {
  const options = types.map((type) => ({
    value: type,
    label: type,
  }));

  const selectedValues = new Set(selectedTypes);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          Filter by Type
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search types..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newSelectedTypes = new Set(selectedValues);
                      if (isSelected) {
                        newSelectedTypes.delete(option.value);
                      } else {
                        newSelectedTypes.add(option.value);
                      }
                      onTypeChange(Array.from(newSelectedTypes));
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onTypeChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
const FilterSection = ({
  types,
  selectedTypes,
  onTypeChange,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-row gap-4 items-center mb-2">
      <Input
        id="search"
        placeholder="Search by name or label..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-md"
      />

      <TypeFilter
        types={types}
        selectedTypes={selectedTypes}
        onTypeChange={onTypeChange}
      />
    </div>
  );
};

const extractVariables = (expression?: string): string[] => {
  if (!expression) return [];
  const matches = expression.match(/\$\{(.*?)\}/g);
  return matches ? matches.map((m) => m.replace(/\$\{|\}/g, "")) : [];
};

function RelevantPage() {
  const [sheets] = useAtom(sheetsAtom);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);

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

  const questionTypes = Array.from(
    new Set(relevantRows.map((row) => getBaseType(row.type))),
  ).sort();

  const filteredRows = relevantRows.filter((row) => {
    const matchesSearch =
      searchTerm === "" ||
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.label && row.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.includes(getBaseType(row.type));

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Relevant Survey Questions</h1>

      <FilterSection
        types={questionTypes}
        selectedTypes={selectedTypes}
        onTypeChange={setSelectedTypes}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {filteredRows.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No matching questions found.
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredRows.map((rowData, index) => (
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
