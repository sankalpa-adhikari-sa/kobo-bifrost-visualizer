import { useAtom } from "jotai";
import { sheetsAtom } from "@/atoms/sheetsAtom.ts";
import {
  createShape,
  createArrow,
  createBindings,
} from "@/utils/tlShapeUtils.ts";
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
  console.log(surveySheet);

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
    const type = row[typeIndex];
    const name = row[nameIndex];
    const label = labelIndex >= 0 ? row[labelIndex] : null;
    const relevant = relevantIndex >= 0 ? row[relevantIndex] : null;

    // Todo: group the question, currently ignoring groups for prototyping.
    if (type === "begin_group" || type === "end_group") {
      return;
    }

    let diamondShape = null;
    let mainShape = null;

    if (relevant) {
      diamondShape = createShape(
        `shape:condition-${name}`,
        "diamond",
        relevant,
        positionY,
        300,
        type,
      );
      shapes.push(diamondShape);
    }

    mainShape = createShape(
      `shape:${name}`,
      "rectangle",
      name,
      positionY,
      600,
      type,
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
          positionY + 150,
          300,
          type,
        );
        shapes.push(nextDiamond);
      }

      nextShape = createShape(
        `shape:${nextName}`,
        "rectangle",
        nextName,
        positionY + 150,
        600,
        type,
      );
      shapes.push(nextShape);
    }

    if (previousShape) {
      const arrowToCurrent = createArrow(
        previousShape,
        diamondShape || mainShape,
      );
      shapes.push(arrowToCurrent);
      bindings.push(
        ...createBindings(
          arrowToCurrent,
          previousShape,
          diamondShape || mainShape,
        ),
      );
    }

    if (diamondShape) {
      const arrowToMain = createArrow(diamondShape, mainShape, "horizontal");
      shapes.push(arrowToMain);
      bindings.push(...createBindings(arrowToMain, diamondShape, mainShape));

      if (nextShape) {
        const arrowToNext = createArrow(diamondShape, nextDiamond || nextShape);
        shapes.push(arrowToNext);
        bindings.push(
          ...createBindings(
            arrowToNext,
            diamondShape,
            nextDiamond || nextShape,
          ),
        );
      }

      lastDiamond = diamondShape;
    }

    if (mainShape && nextShape) {
      const arrowToNext = createArrow(mainShape, nextDiamond || nextShape);
      shapes.push(arrowToNext);
      bindings.push(
        ...createBindings(arrowToNext, mainShape, nextDiamond || nextShape),
      );
    }

    previousShape = mainShape;
    positionY += 150;
  });

  return { shapes, bindings };
}
