import { useAtom } from "jotai";
import { sheetsAtom } from "@/atoms/sheetsAtom";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, CartesianGrid, LabelList } from "recharts";
import {
  AlertTriangle,
  ClipboardList,
  Calculator,
  Database,
  CalendarIcon,
  Layers,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const Route = createFileRoute("/_home/information")({
  component: InformationPage,
});

interface SurveyQuestion {
  name: string;
  type: string;
  required?: "yes" | "true" | string;
  label?: string;
  constraint?: string;
  constraint_message?: string;
  required_message?: string;
  relevant?: string;
  calculate?: string;
  [key: string]: any;
}

interface ValidationStats {
  required: number;
  missingRequiredMsg: number;
  constraint: number;
  missingConstraintMsg: number;
  relevant: number;
  calculate: number;
}

interface ChartDataItem {
  name: string;
  count: number;
  missing?: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  warning?: string | null;
  missingQuestions?: SurveyQuestion[] | null;
  type?: "required" | "constraint" | null;
}

const METADATA_TYPES = [
  "start",
  "end",
  "today",
  "deviceid",
  "phonenumber",
  "username",
  "email",
  "audit",
] as const;

const CHART_CONFIG = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-2))",
  },
  missing: {
    label: "Missing",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const getBaseType = (type: string): string => type.split(" ")[0];

const isGroupType = (type: string): boolean => {
  const baseType = getBaseType(type);
  return baseType === "begin_group" || baseType === "end_group";
};

const isMetadataType = (type: string): boolean => {
  return METADATA_TYPES.includes(
    getBaseType(type) as (typeof METADATA_TYPES)[number],
  );
};

const isCalculateType = (type: string): boolean =>
  getBaseType(type) === "calculate";

const isNoteType = (type: string): boolean => getBaseType(type) === "note";

const isActualQuestion = (type: string): boolean => {
  return (
    !isMetadataType(type) &&
    !isCalculateType(type) &&
    !isNoteType(type) &&
    !isGroupType(type)
  );
};

const getFieldValue = (
  question: SurveyQuestion,
  fieldName: string,
): string | undefined => {
  if (question[fieldName] !== undefined) {
    return question[fieldName];
  }

  const matchingField = Object.keys(question).find((key) =>
    key.startsWith(`${fieldName}::`),
  );

  return matchingField ? question[matchingField] : undefined;
};

const useSurveyValidation = (surveyData: SurveyQuestion[]) => {
  return surveyData.reduce<ValidationStats>((acc, question) => {
    if (isActualQuestion(question.type)) {
      if (question.required === "yes" || question.required === "true") {
        acc.required = (acc.required || 0) + 1;
        if (!getFieldValue(question, "required_message")) {
          acc.missingRequiredMsg = (acc.missingRequiredMsg || 0) + 1;
        }
      }
      if (getFieldValue(question, "constraint")) {
        acc.constraint = (acc.constraint || 0) + 1;
        if (!getFieldValue(question, "constraint_message")) {
          acc.missingConstraintMsg = (acc.missingConstraintMsg || 0) + 1;
        }
      }
      if (getFieldValue(question, "relevant")) {
        acc.relevant = (acc.relevant || 0) + 1;
      }
      if (getFieldValue(question, "calculate")) {
        acc.calculate = (acc.calculate || 0) + 1;
      }
    }
    return acc;
  }, {} as ValidationStats);
};

const ValidationStats: React.FC<{ surveyData: SurveyQuestion[] }> = ({
  surveyData,
}) => {
  const stats = useSurveyValidation(surveyData);

  const chartData: ChartDataItem[] = [
    {
      name: "Required",
      count: stats.required || 0,
      missing: stats.missingRequiredMsg || 0,
    },
    {
      name: "Constraint",
      count: stats.constraint || 0,
      missing: stats.missingConstraintMsg || 0,
    },
    { name: "Relevant", count: stats.relevant || 0 },
    { name: "Calculate", count: stats.calculate || 0 },
  ];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Validation Rules Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="min-h-[200px] max-h-[800px]"
          config={CHART_CONFIG}
        >
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={4}
              name="Total"
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
            <Bar
              dataKey="missing"
              fill="var(--color-missing)"
              radius={4}
              name="Missing Message"
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const QuestionTypes: React.FC<{ surveyData: SurveyQuestion[] }> = ({
  surveyData,
}) => {
  const typeCount = surveyData.reduce<Record<string, number>>(
    (acc, question) => {
      const baseType = getBaseType(question.type);
      if (isActualQuestion(question.type)) {
        acc[baseType] = (acc[baseType] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  const chartData = Object.entries(typeCount)
    .map(([type, count]) => ({
      type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Question Types Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="min-h-[200px] max-h-[600px]"
          config={{ count: CHART_CONFIG.count }}
        >
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              textAnchor="end"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const MissingMessagesSheet: React.FC<{
  questions: SurveyQuestion[];
  type: "required" | "constraint";
  trigger: React.ReactNode;
}> = ({ questions, type, trigger }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-3/4 md:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Missing {type} Messages</SheetTitle>
          <SheetDescription>
            {questions.length} questions require attention
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                {type === "constraint" && <TableHead>Constraint</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{question.name}</TableCell>
                  <TableCell>{getFieldValue(question, "label")}</TableCell>
                  <TableCell>{question.type}</TableCell>
                  {type === "constraint" && (
                    <TableCell>
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">
                        {getFieldValue(question, "constraint")}
                      </code>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  warning = null,
  missingQuestions = null,
  type = null,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {warning && (
          <div className="space-y-2">
            {missingQuestions && missingQuestions.length > 0 ? (
              <MissingMessagesSheet
                questions={missingQuestions}
                type={type!}
                trigger={
                  <div className="text-sm text-red-500 mt-1 flex items-center gap-1 cursor-pointer hover:text-red-600 transition-colors">
                    <AlertTriangle className="h-4 w-4" />
                    {warning}
                  </div>
                }
              />
            ) : (
              <div className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {warning}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function InformationPage() {
  const [sheets] = useAtom(sheetsAtom);

  if (!sheets?.survey?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No survey data available. Please upload an XLSForm file to continue.
      </div>
    );
  }

  const surveySheet = sheets.survey;
  const headers = surveySheet[0];
  const surveyData: SurveyQuestion[] = surveySheet.slice(1).map((row) => {
    const rowData: SurveyQuestion = { name: "", type: "" };
    headers.forEach((header: string, index: number) => {
      rowData[header] = row[index];
    });
    return rowData;
  });

  const questionCount = surveyData.filter((item) =>
    isActualQuestion(item.type),
  ).length;
  const metadataCount = surveyData.filter((item) =>
    isMetadataType(item.type),
  ).length;
  const calculateCount = surveyData.filter((item) =>
    isCalculateType(item.type),
  ).length;
  const noteCount = surveyData.filter((item) => isNoteType(item.type)).length;

  const requiredQuestions = surveyData.filter(
    (item) =>
      isActualQuestion(item.type) &&
      (item.required === "yes" || item.required === "true"),
  );
  const missingRequiredMsg = requiredQuestions.filter(
    (item) => !getFieldValue(item, "required_message"),
  );

  const constraintQuestions = surveyData.filter(
    (item) => isActualQuestion(item.type) && getFieldValue(item, "constraint"),
  );
  const missingConstraintMsg = constraintQuestions.filter(
    (item) => !getFieldValue(item, "constraint_message"),
  );

  const totalBeginGroup = surveyData.filter(
    (item) => getBaseType(item.type) === "begin_group",
  ).length;
  const totalEndGroup = surveyData.filter(
    (item) => getBaseType(item.type) === "end_group",
  ).length;
  const totalGroup = Math.min(totalBeginGroup, totalEndGroup);
  const missingGroupClosure = Math.abs(totalBeginGroup - totalEndGroup);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Survey Sheet Information</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Questions"
          value={questionCount}
          icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Groups"
          value={totalGroup}
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
          warning={
            missingGroupClosure
              ? `Missing ${missingGroupClosure} group closure`
              : null
          }
        />

        <StatCard
          title="Required Questions"
          value={requiredQuestions.length}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          warning={
            missingRequiredMsg.length
              ? `${missingRequiredMsg.length} missing messages`
              : null
          }
          missingQuestions={missingRequiredMsg}
          type="required"
        />
        <StatCard
          title="Questions with Constraints"
          value={constraintQuestions.length}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          warning={
            missingConstraintMsg.length
              ? `${missingConstraintMsg.length} missing messages`
              : null
          }
          missingQuestions={missingConstraintMsg}
          type="constraint"
        />
        <StatCard
          title="Metadata Fields"
          value={metadataCount}
          icon={<Database className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Calculate Fields"
          value={calculateCount}
          icon={<Calculator className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Notes"
          value={noteCount}
          icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuestionTypes surveyData={surveyData} />
        <ValidationStats surveyData={surveyData} />
      </div>
    </div>
  );
}
