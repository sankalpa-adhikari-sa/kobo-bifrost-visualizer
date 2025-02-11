export function extractSurveyData(headers, row, fieldsToExtract = null) {
  const allFields = {
    type: headers.indexOf("type"),
    name: headers.indexOf("name"),
    label: headers.findIndex(
      (header) => typeof header === "string" && header.startsWith("label"),
    ),
    hint: headers.findIndex(
      (header) => typeof header === "string" && header.startsWith("hint"),
    ),
    guidanceHint: headers.findIndex(
      (header) =>
        typeof header === "string" && header.startsWith("guidance_hint"),
    ),
    required: headers.indexOf("required"),
    requiredMessage: headers.findIndex(
      (header) =>
        typeof header === "string" && header.startsWith("required_message"),
    ),
    readonly: headers.indexOf("readonly"),
    relevant: headers.indexOf("relevant"),
    appearance: headers.indexOf("appearance"),
    defaultValue: headers.indexOf("default"),
    constraint: headers.indexOf("constraint"),
    constraintMessage: headers.findIndex(
      (header) =>
        typeof header === "string" && header.startsWith("constraint_message"),
    ),
    calculation: headers.indexOf("calculation"),
    trigger: headers.indexOf("trigger"),
    choiceFilter: headers.indexOf("choice_filter"),
    parameters: headers.indexOf("parameters"),
    repeatCount: headers.indexOf("repeat_count"),
    image: headers.findIndex(
      (header) => typeof header === "string" && header.startsWith("image"),
    ),
    audio: headers.findIndex(
      (header) => typeof header === "string" && header.startsWith("audio"),
    ),
    video: headers.findIndex(
      (header) => typeof header === "string" && header.startsWith("video"),
    ),
    note: headers.findIndex(
      (header) => typeof header === "string" && header.startsWith("note"),
    ),
  };

  if (fieldsToExtract) {
    return fieldsToExtract.reduce((acc, field) => {
      const index = allFields[field];
      acc[field] = index >= 0 ? row[index] : null;
      return acc;
    }, {});
  }

  return Object.keys(allFields).reduce((acc, field) => {
    const index = allFields[field];
    acc[field] = index >= 0 ? row[index] : null;
    return acc;
  }, {});
}
