export const addedLines = (diff) => {
  const lines = new Set();

  for (const hunk of diff.matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(hunk[1]);
    const count = hunk[2] === undefined ? 1 : Number(hunk[2]);

    for (let line = start; line < start + count; line++) lines.add(line);
  }

  return lines;
};
