import { ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../");

const collectProcessOutput = (process: ChildProcess): Promise<[string, string]> => {
  let stdout = "";
  let stderr = "";
  process.stdout!.on("data", (data) => {
    stdout += data.toString();
  });
  process.stderr!.on("data", (data) => {
    stderr += data.toString();
  });
  return new Promise((resolve) => {
    process.on("exit", () => {
      resolve([stdout, stderr]);
    });
  });
};

describe("jump-start help", () => {
  it("should print help", async () => {
    const childProcess = spawn("./bin/cli.ts", ["--help"], {
      cwd: root,
    });

    const [stdout, stderr] = await collectProcessOutput(childProcess);
    console.log(stdout, stderr);

    expect(stdout).toContain("Usage: ");
  });
});
