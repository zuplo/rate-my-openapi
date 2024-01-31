// eslint-disable-next-line @typescript-eslint/no-unused-vars
function runRule(input) {
  // Input is an array of tags
  const nameSet = new Set();
  for (const tag of input) {
    if (nameSet.has(tag.name)) {
      // eslint-disable-next-line no-undef
      const rule = context.rule.id;
      if (rule === undefined || typeof rule !== "string") {
        throw new Error("Rule is undefined");
      }
      return [
        {
          message: "Duplicate tag found: " + tag.name,
        },
      ];
    }
    nameSet.add(tag.name);
  }
}
