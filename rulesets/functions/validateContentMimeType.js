// eslint-disable-next-line @typescript-eslint/no-unused-vars
function runRule(input) {
  // Input is <mimeType, Media Type Object>
  const getErrorMessage = (mimeType) => {
    // eslint-disable-next-line no-undef
    const rule = context.rule.id;
    if (rule === undefined || typeof rule !== "string") {
      throw new Error("Rule is undefined");
    }
    if (rule.includes("request")) {
      return "Request body content type is not a valid mime type: " + mimeType;
    }
    if (rule.includes("response")) {
      return "Response body content type is not a valid mime type: " + mimeType;
    }
    return "Invalid mime type: " + mimeType;
  };
  // Input is an array of string that might be mime types
  const validPrefixes = [
    "application/",
    "audio/",
    "font/",
    "image/",
    "message/",
    "model/",
    "multipart/",
    "text/",
    "video/",
  ];
  const disallowedChars = ["!", "#", "$", "&", "_"];
  const mimeTypeRegex = /\w+\/[-+.\w]+/g;
  const mimeTypes = Object.keys(input);
  if (mimeTypes.length === 0) {
    return;
  }

  for (const mimeType of mimeTypes) {
    const hasValidPrefix = validPrefixes.some((prefix) =>
      mimeType.startsWith(prefix),
    );
    if (!hasValidPrefix) {
      return [
        {
          message: getErrorMessage(mimeType),
        },
      ];
    }
    // Ex. text/plain; charset=utf-8 -> text/plain
    const mimeTypeNoCharset = mimeType.split(";")[0];
    const hasDisallowedChars = disallowedChars.some((char) =>
      mimeTypeNoCharset.includes(char),
    );
    if (hasDisallowedChars) {
      return [
        {
          message: getErrorMessage(mimeType),
        },
      ];
    }
    const matches = mimeTypeRegex.test(mimeTypeNoCharset);
    if (!matches) {
      return [
        {
          message: getErrorMessage(mimeType),
        },
      ];
    }
  }
}
