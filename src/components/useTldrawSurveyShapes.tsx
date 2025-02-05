import { useAtom } from "jotai";
import { sheetsAtom } from "@/atoms/sheetsAtom.ts";

export function useTldrawSurveyShapes() {
  const [sheets] = useAtom(sheetsAtom);

  if (!sheets || sheets.length === 0) {
    return [];
  }

  const surveySheet = sheets["survey"];
  if (!surveySheet || surveySheet.length === 0) {
    return [];
  }

  let shapes = [];
  let positionY = 100;
  const headers = surveySheet[0];

  if (!Array.isArray(headers) || headers.length < 3) {
    console.error("Error: Invalid header row.");
    return [];
  }

  const typeIndex = headers.indexOf("type");
  const nameIndex = headers.indexOf("name");
  const labelIndex = headers.findIndex((header) => header.startsWith("label"));
  const requiredIndex = headers.indexOf("required");
  const constraintIndex = headers.indexOf("constraint");

  if (typeIndex === -1 || nameIndex === -1 || labelIndex === -1) {
    console.error("Error: Missing mandatory columns in header row.");
    return [];
  }

  // Iterate through each row of the survey data (skipping the header row)
  surveySheet.slice(1).forEach((row) => {
    const type = row[typeIndex];
    const name = row[nameIndex];
    const label = row[labelIndex];
    const required = requiredIndex >= 0 ? row[requiredIndex] : null;
    const constraint = constraintIndex >= 0 ? row[constraintIndex] : null;

    if (type === "begin_group" || type === "end_group") {
      return;
    }

    let shape = {
      x: 792,
      y: positionY,
      rotation: 0,
      isLocked: false,
      opacity: 1,
      meta: {},
      id: `shape:${name}`,
      type: "text",
      props: {
        color: "black",
        size: "m",
        w: 94,
        text: label,
        font: "draw",
        textAlign: "start",
        autoSize: true,
        scale: 1,
      },
      parentId: "page:page",
      index: "aC8Cw",
      typeName: "shape",
    };

    shapes.push(shape);
    positionY += 50;
  });

  return shapes;
}
