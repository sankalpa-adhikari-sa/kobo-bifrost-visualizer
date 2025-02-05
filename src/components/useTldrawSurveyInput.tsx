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

  surveySheet.slice(1).forEach((row) => {
    const type = row[typeIndex];
    const name = row[nameIndex];
    const label = labelIndex >= 0 ? row[labelIndex] : null;
    const relevant = relevantIndex >= 0 ? row[relevantIndex] : null;

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
        350,
      );
      shapes.push(diamondShape);
    }

    mainShape = createShape(`shape:${name}`, "rectangle", name, positionY, 600);
    shapes.push(mainShape);

    if (previousShape) {
      if (lastDiamond) {
        const arrowToDiamond = createArrow(
          lastDiamond,
          diamondShape || mainShape,
        );
        const arrowToMain = createArrow(
          previousShape,
          diamondShape || mainShape,
        );

        shapes.push(arrowToDiamond, arrowToMain);
        bindings.push(
          ...createBindings(
            arrowToDiamond,
            lastDiamond,
            diamondShape || mainShape,
          ),
        );
        bindings.push(
          ...createBindings(
            arrowToMain,
            previousShape,
            diamondShape || mainShape,
          ),
        );
      } else {
        const arrow = createArrow(previousShape, diamondShape || mainShape);
        shapes.push(arrow);
        bindings.push(
          ...createBindings(arrow, previousShape, diamondShape || mainShape),
        );
      }
    }

    if (diamondShape) {
      const arrow = createArrow(diamondShape, mainShape, "horizontal");
      shapes.push(arrow);
      bindings.push(...createBindings(arrow, diamondShape, mainShape));
    }

    lastDiamond = diamondShape || lastDiamond;
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
      text: text,
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

function createArrow(startShape, endShape, direction = "vertical") {
  return {
    x:
      direction === "horizontal"
        ? startShape.x + startShape.props.w + 50
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
