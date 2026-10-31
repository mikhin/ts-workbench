import { stripVTControlCharacters } from "node:util";

export const doctorPassed = (status, output) => {
  const text = stripVTControlCharacters(output);
  const summarized = /across \d+\/\d+ files/.test(text) || text.includes("No issues found!");

  return status === 0 && summarized && !/✗ [1-9]\d* errors?|non-fatal, skipping/.test(text);
};
