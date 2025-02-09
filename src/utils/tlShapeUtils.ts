const SHAPE_TYPES = {
  DIAMOND: "diamond",
  RHOMBUS: "rhombus",
  RECTANGLE: "rectangle",
  OVAL: "oval",
  CLOUD: "cloud",
  TRAPEZOID: "trapezoid",
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
  calculate: "➗",
};

const STYLE_CONFIG = {
  default: {
    width: 400,
    height: 50,
    color: "black",
    labelColor: "black",
    fill: "none",
    dash: "draw",
    size: "m",
    font: "draw",
  },
  conditions: {
    note: {
      shape: SHAPE_TYPES.CLOUD,
      color: "light-green",
      fill: "solid",
    },
    constraint: {
      shape: SHAPE_TYPES.RHOMBUS,
      color: "light-red",
      width: 400,
      dash: "dashed",
    },
    calculate: {
      shape: SHAPE_TYPES.RECTANGLE,

      fill: "solid",
      color: "light-blue",
    },
    metadata: {
      color: "yellow",
      fill: "pattern",
    },
    diamond: {
      shape: SHAPE_TYPES.DIAMOND,
      color: "blue",
      width: 300,
    },
    selectMultiple: {
      shape: SHAPE_TYPES.TRAPEZOID,
    },
  },
};

function getEmoji(type) {
  if (type.startsWith("select_one")) return EMOJI_MAP.select_one;
  if (type.startsWith("select_multiple")) return EMOJI_MAP.select_multiple;
  return EMOJI_MAP[type] || "";
}

function getShapeStyle(shapeType, type, metadata = {}, text) {
  const baseStyle = { ...STYLE_CONFIG.default };
  const conditions = [];

  if (type === "note") conditions.push(STYLE_CONFIG.conditions.note);
  if (type.startsWith("select_one"))
    conditions.push(STYLE_CONFIG.conditions.selectMultiple);
  if (metadata.constraint?.trim())
    conditions.push(STYLE_CONFIG.conditions.constraint);
  if (type === "calculate") conditions.push(STYLE_CONFIG.conditions.calculate);
  if (METADATA_TYPES.includes(text))
    conditions.push(STYLE_CONFIG.conditions.metadata);
  if (shapeType === SHAPE_TYPES.DIAMOND)
    conditions.push(STYLE_CONFIG.conditions.diamond);

  const finalStyle = conditions.reduce(
    (acc, condition) => ({
      ...acc,
      ...condition,
    }),
    baseStyle,
  );

  return finalStyle;
}

const DEFAULT_METADATA = {
  constraint: "",
  constraintMessage: "",
  label: "",
  hint: "",
  guidanceHint: "",
  readonly: "",
  defaultValue: "",
  required: "",
  requiredMessage: "",
  note: "",
  appearance: "",
  relevant: "",
};

export function createShape(id, shapeType, text, y, x, type, metadata) {
  const shapeMetadata = { ...DEFAULT_METADATA, ...(metadata || {}) };
  const emoji = getEmoji(type);
  const style = getShapeStyle(shapeType, type, shapeMetadata, text);

  return {
    x,
    y,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    meta: shapeMetadata,
    id,
    type: "geo",
    props: {
      w: style.width,
      h: style.height,
      geo: style.shape || shapeType,
      color: style.color,
      labelColor: style.labelColor,
      fill: style.fill,
      dash: style.dash,
      size: style.size,
      font: style.font,
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

const ARROW_STYLES = {
  default: {
    color: "light-violet",
    dash: "draw",
    size: "m",
    fill: "none",
    labelColor: "black",
    bend: 0,
    arrowheadStart: "none",
    arrowheadEnd: "arrow",
    font: "draw",
    scale: 1,
  },
  horizontalDiamond: {
    color: "light-green",
    text: "Yes",
  },
};

export function createArrow(startShape, endShape, direction = "vertical") {
  const isHorizontal = direction === "horizontal";
  const isDiamond = startShape.props.geo === SHAPE_TYPES.DIAMOND;

  const style = {
    ...ARROW_STYLES.default,
    ...(isHorizontal && isDiamond ? ARROW_STYLES.horizontalDiamond : {}),
  };

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
      ...style,
      start: { x: 0, y: 0 },
      end: {
        x: isHorizontal ? endShape.x - startShape.x : 0,
        y: isHorizontal ? 0 : endShape.y - startShape.y,
      },
      labelPosition: 0.5,
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
