const SHAPE_TYPES = {
  DIAMOND: "diamond",
  RHOMBUS: "rhombus",
  RECTANGLE: "rectangle",
};

const METADATA_TYPES = [
  "start",
  "end",
  "today",
  "deviceid",
  "phonenumber",
  "username",
  "email",
  "audit",
];

const EMOJI_MAP = {
  integer: "🔢",
  text: "🔤",
  select_one: "🔘",
  select_multiple: "📋",
  audio: "🎤",
  video: "🎥",
  geopoint: "📍",
  decimal: "💯",
};

const ARROW_COLORS = {
  HORIZONTAL_DIAMOND: "light-green",
  DEFAULT: "light-violet",
};

const ARROW_LABELS = {
  HORIZONTAL_DIAMOND: "Yes",
};

function getEmoji(type) {
  if (type.startsWith("select_one")) return EMOJI_MAP.select_one;
  if (type.startsWith("select_multiple")) return EMOJI_MAP.select_multiple;
  return EMOJI_MAP[type] || "";
}

export function createShape(id, shapeType, text, y, x, type) {
  const isMetadata = METADATA_TYPES.includes(text);
  const isCalculate = type === "calculate";
  const emoji = getEmoji(type);

  return {
    x,
    y,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    meta: {},
    id,
    type: "geo",
    props: {
      w: shapeType === SHAPE_TYPES.DIAMOND ? 200 : 200,
      h: 50,
      geo: isCalculate ? SHAPE_TYPES.RHOMBUS : shapeType,
      color: isMetadata
        ? "yellow"
        : shapeType === SHAPE_TYPES.DIAMOND
          ? "blue"
          : "black",
      labelColor: "black",
      fill: isMetadata ? "pattern" : "none",
      dash: "draw",
      size: "m",
      font: "draw",
      text: `${emoji} ${text}`,
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

export function createArrow(startShape, endShape, direction = "vertical") {
  const isHorizontal = direction === "horizontal";
  const isDiamond = startShape.props.geo === SHAPE_TYPES.DIAMOND;

  return {
    x: isHorizontal ? startShape.x + startShape.props.w + 100 : startShape.x,
    y: isHorizontal ? startShape.y : startShape.y + startShape.props.h / 2,
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
      color:
        isHorizontal && isDiamond
          ? ARROW_COLORS.HORIZONTAL_DIAMOND
          : ARROW_COLORS.DEFAULT,
      labelColor: "black",
      bend: 0,
      start: { x: 0, y: 0 },
      end: {
        x: isHorizontal ? endShape.x - startShape.x : 0,
        y: isHorizontal ? 0 : endShape.y - startShape.y,
      },
      arrowheadStart: "none",
      arrowheadEnd: "arrow",
      text: isHorizontal && isDiamond ? ARROW_LABELS.HORIZONTAL_DIAMOND : "",
      labelPosition: 0.5,
      font: "draw",
      scale: 1,
    },
    parentId: "page:page",
    index: "a64b9",
    typeName: "shape",
  };
}

export function createBindings(arrow, fromShape, toShape) {
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
