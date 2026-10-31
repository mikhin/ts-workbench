export const doctorPassed = (status, output) => {
  if (status !== 0) return false;

  try {
    const report = JSON.parse(output);

    return (
      report.ok === true &&
      report.summary?.errorCount === 0 &&
      report.projects?.length > 0 &&
      report.projects.every(
        (project) =>
          project.complete === true &&
          project.analyzedFileCount > 0 &&
          Array.isArray(project.skippedChecks) &&
          project.skippedChecks.length === 0,
      )
    );
  } catch {
    return false;
  }
};
