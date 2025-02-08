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

  if (!Array.isArray(headers) || headers.length < 3) {
    console.error("Error: Invalid header row.");
    return { shapes: [], bindings: [] };
  }

  const typeIndex = headers.indexOf("type");
  const nameIndex = headers.indexOf("name");

  const labelIndex = headers.findIndex(
    (header) => typeof header === "string" && header.startsWith("label"),
  );
  const hintIndex = headers.findIndex(
    (header) => typeof header === "string" && header.startsWith("hint"),
  );
  const guidanceHintIndex = headers.findIndex(
    (header) =>
      typeof header === "string" && header.startsWith("guidance_hint"),
  );
  const requiredIndex = headers.indexOf("required");
  const requiredMessageIndex = headers.findIndex(
    (header) =>
      typeof header === "string" && header.startsWith("required_message"),
  );
  const readonlyIndex = headers.indexOf("readonly");
  const relevantIndex = headers.indexOf("relevant");
  const appearanceIndex = headers.indexOf("appearance");
  const defaultIndex = headers.indexOf("default");
  const constraintIndex = headers.indexOf("constraint");
  const constraintMessageIndex = headers.findIndex(
    (header) =>
      typeof header === "string" && header.startsWith("constraint_message"),
  );
  const calculationIndex = headers.indexOf("calculation");
  const triggerIndex = headers.indexOf("trigger");
  const choiceFilterIndex = headers.indexOf("choice_filter");
  const parametersIndex = headers.indexOf("parameters");
  const repeatCountIndex = headers.indexOf("repeat_count");
  const imageIndex = headers.findIndex(
    (header) => typeof header === "string" && header.startsWith("image"),
  );
  const audioIndex = headers.findIndex(
    (header) => typeof header === "string" && header.startsWith("audio"),
  );
  const videoIndex = headers.findIndex(
    (header) => typeof header === "string" && header.startsWith("video"),
  );
  const noteIndex = headers.findIndex(
    (header) => typeof header === "string" && header.startsWith("note"),
  );

  if (typeIndex === -1 || nameIndex === -1 || labelIndex === -1) {
    console.error("Error: Missing mandatory columns in header row.");
    return { shapes: [], bindings: [] };
  }

  surveySheet.slice(1).forEach((row, rowIndex, array) => {
    const type = row[typeIndex];
    const name = row[nameIndex];

    const label = labelIndex >= 0 ? row[labelIndex] : null;
    const hint = hintIndex >= 0 ? row[hintIndex] : null;
    const guidanceHint = guidanceHintIndex >= 0 ? row[guidanceHintIndex] : null;
    const required = requiredIndex >= 0 ? row[requiredIndex] : null;
    const requiredMessage =
      requiredMessageIndex >= 0 ? row[requiredMessageIndex] : null;
    const readonly = readonlyIndex >= 0 ? row[readonlyIndex] : null;
    const relevant = relevantIndex >= 0 ? row[relevantIndex] : null;
    const appearance = appearanceIndex >= 0 ? row[appearanceIndex] : null;
    const defaultValue = defaultIndex >= 0 ? row[defaultIndex] : null; // Renamed to defaultValue for clarity
    const constraint = constraintIndex >= 0 ? row[constraintIndex] : null;
    const constraintMessage =
      constraintMessageIndex >= 0 ? row[constraintMessageIndex] : null;
    const calculation = calculationIndex >= 0 ? row[calculationIndex] : null;
    const trigger = triggerIndex >= 0 ? row[triggerIndex] : null;
    const choiceFilter = choiceFilterIndex >= 0 ? row[choiceFilterIndex] : null;
    const parameters = parametersIndex >= 0 ? row[parametersIndex] : null;
    const repeatCount = repeatCountIndex >= 0 ? row[repeatCountIndex] : null;
    const image = imageIndex >= 0 ? row[imageIndex] : null;
    const audio = audioIndex >= 0 ? row[audioIndex] : null;
    const video = videoIndex >= 0 ? row[videoIndex] : null;
    const note = noteIndex >= 0 ? row[noteIndex] : null;

    const metadata = {
      constraint: constraint ? String(constraint) : "",
      constraintMessage: constraintMessage ? String(constraintMessage) : "",
      label: label ? String(label) : "",
      hint: hint ? String(hint) : "",
      guidanceHint: guidanceHint ? String(guidanceHint) : "",
      readonly: readonly ? String(readonly) : "",
      defaultValue: defaultValue ? String(defaultValue) : "",
      required: required ? String(required) : "",
      requiredMessage: requiredMessage ? String(requiredMessage) : "",
      note: note ? String(note) : "",
      appearance: appearance ? String(appearance) : "",
      relevant: relevant ? String(relevant) : "",
    };

    // Todo: group the question, currently ignoring groups for prototyping.
    if (type === "begin_group" || type === "end_group") {
      return;
    }

    let relevantShape = null;
    let mainShape = null;

    if (relevant) {
      relevantShape = createShape(
        `shape:condition-${name}`,
        "diamond",
        relevant,
        positionY,
        400,
        type,
      );
      shapes.push(relevantShape);
    }

    mainShape = createShape(
      `shape:${name}`,
      "rectangle",
      name,
      positionY,
      900,
      type,
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
          type,
        );
        shapes.push(nextDiamond);
      }

      nextShape = createShape(
        `shape:${nextName}`,
        "rectangle",
        nextName,
        positionY + 150,
        900,
        type,
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
