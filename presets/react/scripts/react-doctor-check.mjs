import { spawnSync } from "node:child_process";
import { stripVTControlCharacters } from "node:util";

import { doctorPassed } from "./react-doctor-result.mjs";

const result = spawnSync("pnpm", ["exec", "react-doctor", "--verbose", "--no-dead-code"], {
  encoding: "utf8",
});
const output = stripVTControlCharacters(`${result.stdout ?? ""}${result.stderr ?? ""}`);

process.stdout.write(output);

if (!doctorPassed(result.status, output)) {
  console.error("React Doctor failed, skipped its lint pass, or returned no recognized summary.");

  process.exitCode = 1;
}
