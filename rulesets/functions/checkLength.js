// eslint-disable-next-line @typescript-eslint/no-unused-vars
function runRule(input) {
  // eslint-disable-next-line no-undef
  const functionOptions = context.ruleAction.functionOptions;
  const min = functionOptions.min;
  const max = functionOptions.max;
  const length = input.length;
  if (length < min) {
    return [
      {
        message: "String is too short: " + length + " < " + min,
      },
    ];
  } else if (length > max) {
    return [
      {
        message: "String is too long: " + length + " > " + max,
      },
    ];
  }
}
