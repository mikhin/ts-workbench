import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import { CoverageReport } from "monocart-coverage-reports";
import type { CoverageReportOptions, V8CoverageEntry } from "monocart-coverage-reports";

const options: CoverageReportOptions = {
  entryFilter: (entry) => /\/src\/.+\.tsx?(\?|$)/.test(entry.url),
  name: "E2E coverage",
  outputDir: "reports/e2e-coverage",
  reports: ["v8", "json", "console-summary"],
  sourcePath: (filePath, info) => {
    const { pathname } = new URL(info.distFile ?? filePath, "https://host/");

    return pathname.slice(pathname.indexOf("/src/") + 1).replace(/-t=\d+$/, "");
  },
};

export default class CoverageReporter implements Reporter {
  private readonly missing: string[] = [];
  private readonly pending: Promise<unknown>[] = [];
  private readonly report = new CoverageReport(options);

  public async onEnd(): Promise<void> {
    if (this.missing.length > 0) {
      throw new Error(`Import test from tests/fixtures: ${this.missing.join(", ")}`);
    }

    await Promise.all(this.pending);

    await this.report.generate();
  }

  public onTestEnd(test: TestCase, result: TestResult): void {
    if (
      result.status !== "skipped" &&
      !result.attachments.some((attachment) => attachment.name === "v8-coverage")
    ) {
      this.missing.push(test.title);
    }

    for (const attachment of result.attachments) {
      if (attachment.name === "v8-coverage" && attachment.body) {
        const entries = JSON.parse(attachment.body.toString("utf8")) as V8CoverageEntry[];

        this.pending.push(this.report.add(entries));
      }
    }
  }
}
