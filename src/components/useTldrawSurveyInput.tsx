import { useAtom } from "jotai";
import { sheetsAtom } from "@/atoms/sheetsAtom.ts";

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

    // **Ignore group types entirely**
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
      );
      shapes.push(diamondShape);
    }

    mainShape = createShape(`shape:${name}`, "rectangle", name, positionY, 600);
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
        );
        shapes.push(nextDiamond);
      }

      nextShape = createShape(
        `shape:${nextName}`,
        "rectangle",
        nextName,
        positionY + 150,
        600,
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
function createShape(id, shapeType, text, y, x) {
  return {
    x: x,
    y: y,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    meta: {},
    id: id,
    type: "geo",
    props: {
      w: shapeType === "diamond" ? 200 : 200,
      h: 50,
      geo: shapeType,
      color: shapeType === "diamond" ? "blue" : "black",
      labelColor: "black",
      fill: "none",
      dash: "draw",
      size: "m",
      font: "draw",
      text: text || "(No Label)",
      align: "middle",
      verticalAlign: "middle",
      growY: 0,
      url: "",
    },
    parentId: "page:page",
    index: "aC8Cw",
    typeName: "shape",
  };
}

// Function to create arrows
function createArrow(startShape, endShape, direction = "vertical") {
  return {
    x:
      direction === "horizontal"
        ? startShape.x + startShape.props.w + 100
        : startShape.x,
    y:
      direction === "horizontal"
        ? startShape.y
        : startShape.y + startShape.props.h / 2,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    meta: {},
    id: `shape:arrow-${startShape.id}-to-${endShape.id}`,
    type: "arrow",
    props: {
      dash: "draw",
      size: "m",
      fill: "none",
      color: "light-violet",
      labelColor: "black",
      bend: 0,
      start: { x: 0, y: 0 },
      end: {
        x: direction === "horizontal" ? endShape.x - startShape.x : 0,
        y: direction === "horizontal" ? 0 : endShape.y - startShape.y,
      },
      arrowheadStart: "none",
      arrowheadEnd: "arrow",
      text: "",
      labelPosition: 0.5,
      font: "draw",
      scale: 1,
    },
    parentId: "page:page",
    index: "a64b9",
    typeName: "shape",
  };
}

function createBindings(arrow, fromShape, toShape) {
  return [
    {
      meta: {},
      id: `binding:${arrow.id}-start`,
      type: "arrow",
      fromId: arrow.id,
      toId: fromShape.id,
      props: {
        isPrecise: false,
        isExact: false,
        normalizedAnchor: { x: 0.5, y: 0.5 },
        terminal: "start",
      },
      typeName: "binding",
    },
    {
      meta: {},
      id: `binding:${arrow.id}-end`,
      type: "arrow",
      fromId: arrow.id,
      toId: toShape.id,
      props: {
        isPrecise: false,
        isExact: false,
        normalizedAnchor: { x: 0.5, y: 0.5 },
        terminal: "end",
      },
      typeName: "binding",
    },
  ];
}
