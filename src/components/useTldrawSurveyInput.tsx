import { useAtom } from "jotai";
import { sheetsAtom } from "@/atoms/sheetsAtom.ts";
import {
  createShape,
  createArrow,
  createBindings,
} from "@/utils/tlShapeUtils.ts";
import { extractSurveyData } from "@/utils/surveyUtils.ts";
export function useTldrawSurveyInput() {
  const [sheets] = useAtom(sheetsAtom);

  if (!sheets || sheets.length === 0) {
    return { shapes: [], bindings: [] };
  }

  const surveySheet = sheets["survey"];
  if (!surveySheet || surveySheet.length === 0) {
    return { shapes: [], bindings: [] };
  }

  let shapes = [];
  let bindings = [];
  let positionY = 100;
  let previousShape = null;
  let lastDiamond = null;

  const headers = surveySheet[0];

  if (!Array.isArray(headers) || headers.length < 3) {
    console.error("Error: Invalid header row.");
    return { shapes: [], bindings: [] };
  }

  const typeIndex = headers.indexOf("type");
  const nameIndex = headers.indexOf("name");

  const labelIndex = headers.findIndex(
    (header) => typeof header === "string" && header.startsWith("label"),
  );

  const relevantIndex = headers.indexOf("relevant");

  if (typeIndex === -1 || nameIndex === -1 || labelIndex === -1) {
    console.error("Error: Missing mandatory columns in header row.");
    return { shapes: [], bindings: [] };
  }

  surveySheet.slice(1).forEach((row, rowIndex, array) => {
    const allData = extractSurveyData(headers, row);

    const metadata = {
      constraint: allData.constraint ? String(allData.constraint) : "",
      constraintMessage: allData.constraintMessage
        ? String(allData.constraintMessage)
        : "",
      label: allData.label ? String(allData.label) : "",
      hint: allData.hint ? String(allData.hint) : "",
      guidanceHint: allData.guidanceHint ? String(allData.guidanceHint) : "",
      readonly: allData.readonly ? String(allData.readonly) : "",
      defaultValue: allData.defaultValue ? String(allData.defaultValue) : "",
      required: allData.required ? String(allData.required) : "",
      requiredMessage: allData.requiredMessage
        ? String(allData.requiredMessage)
        : "",
      note: allData.note ? String(allData.note) : "",
      appearance: allData.appearance ? String(allData.appearance) : "",
      relevant: allData.relevant ? String(allData.relevant) : "",
    };

    // Todo: group the question, currently ignoring groups for prototyping.
    if (allData.type === "begin_group" || allData.type === "end_group") {
      return;
    }

    let relevantShape = null;
    let mainShape = null;

    if (allData.relevant) {
      relevantShape = createShape(
        `shape:condition-${allData.name}`,
        "diamond",
        allData.relevant,
        positionY,
        400,
        allData.type,
      );
      shapes.push(relevantShape);
    }

    mainShape = createShape(
      `shape:${allData.name}`,
      "rhombus",
      allData.name,
      positionY,
      900,
      allData.type,
      metadata,
    );
    shapes.push(mainShape);

    let nextRowIndex = rowIndex + 1;
    while (
      nextRowIndex < array.length &&
      (array[nextRowIndex][typeIndex] === "begin_group" ||
        array[nextRowIndex][typeIndex] === "end_group")
    ) {
      nextRowIndex++;
    }
    const nextRow = nextRowIndex < array.length ? array[nextRowIndex] : null;

    let nextShape = null;
    let nextDiamond = null;

    if (nextRow) {
      const nextName = nextRow[nameIndex];
      const nextRelevant = relevantIndex >= 0 ? nextRow[relevantIndex] : null;

      if (nextRelevant) {
        nextDiamond = createShape(
          `shape:condition-${nextName}`,
          "diamond",
          nextRelevant,
          positionY,
          400,
          allData.type,
        );
        shapes.push(nextDiamond);
      }

      nextShape = createShape(
        `shape:${nextName}`,
        "rhombus",
        nextName,
        positionY + 150,
        900,
        allData.type,
        metadata,
      );
      shapes.push(nextShape);
    }

    if (previousShape) {
      const arrowToCurrent = createArrow(
        previousShape,
        relevantShape || mainShape,
      );
      shapes.push(arrowToCurrent);
      bindings.push(
        ...createBindings(
          arrowToCurrent,
          previousShape,
          relevantShape || mainShape,
        ),
      );
    }

    if (relevantShape) {
      const arrowToMain = createArrow(relevantShape, mainShape, "horizontal");
      shapes.push(arrowToMain);
      bindings.push(...createBindings(arrowToMain, relevantShape, mainShape));

      if (nextShape) {
        const arrowToNext = createArrow(
          relevantShape,
          nextDiamond || nextShape,
        );
        shapes.push(arrowToNext);
        bindings.push(
          ...createBindings(
            arrowToNext,
            relevantShape,
            nextDiamond || nextShape,
          ),
        );
      }

      lastDiamond = relevantShape;
    }

    if (mainShape && nextShape) {
      const arrowToNext = createArrow(mainShape, nextDiamond || nextShape);
      shapes.push(arrowToNext);
      bindings.push(
        ...createBindings(arrowToNext, mainShape, nextDiamond || nextShape),
      );
    }

    previousShape = mainShape;
    if (relevantShape) {
      shapes.push(relevantShape);
      positionY += 100;
    }
    positionY += 150;
  });

  return { shapes, bindings };
}
