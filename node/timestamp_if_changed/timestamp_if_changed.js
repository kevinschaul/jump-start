#!/usr/bin/env node

/*
 * node timestamp_if_changed.js LATEST_FILE
 *
 * Given a file, make a copy of LATEST_FILE with the current timestamp appended to the filename if the file is different from the previous version. The previous version is the file in the directory of LATEST_FILE with the same prefix as LATEST_FILE that has the most recent timestamp in its filename.
 *
 * e.g. "evacuations-latest.geojson" would become "evacuations-2025-01-08T12:03:01.geojson"
 *
 */

const fs = require("fs").promises;
const path = require("path");

async function findMostRecentVersion(directory, prefix) {
  try {
    const files = await fs.readdir(directory);

    // Filter files that start with the prefix and have a timestamp
    const timestampedFiles = files.filter(
      (file) =>
        file.startsWith(prefix) &&
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(file),
    );

    if (timestampedFiles.length === 0) {
      return null;
    }

    // Sort files by timestamp in filename (descending)
    timestampedFiles.sort((a, b) => b.localeCompare(a));
    return timestampedFiles[0];
  } catch (error) {
    console.error("Error reading directory:", error);
    return null;
  }
}

async function compareFiles(file1Path, file2Path) {
  try {
    const [content1, content2] = await Promise.all([
      fs.readFile(file1Path),
      fs.readFile(file2Path),
    ]);
    return content1.equals(content2);
  } catch (error) {
    // If either file doesn't exist or there's an error reading, consider them different
    return false;
  }
}

async function main() {
  // Check if filename argument is provided
  if (process.argv.length !== 3) {
    console.error("Usage: node timestamp_if_changed.js LATEST_FILE");
    process.exit(1);
  }

  const latestFile = process.argv[2];
  const directory = path.dirname(latestFile);
  const extension = path.extname(latestFile);
  const baseNameWithoutExt = path.basename(latestFile, extension);

  // Remove "-latest" suffix if it exists to get the base prefix
  const prefix = baseNameWithoutExt.replace(/-latest$/, "");

  // Find the most recent timestamped version
  const mostRecentVersion = await findMostRecentVersion(directory, prefix);
  const mostRecentPath = mostRecentVersion
    ? path.join(directory, mostRecentVersion)
    : null;

  // Compare files if a previous version exists
  const hasChanged =
    !mostRecentPath || !(await compareFiles(latestFile, mostRecentPath));

  if (hasChanged) {
    // Generate new filename with timestamp
    const timestamp = new Date().toISOString().replace(/\.\d+Z$/, "");
    const newFileName = `${prefix}-${timestamp}${extension}`;
    const newPath = path.join(directory, newFileName);

    try {
      await fs.copyFile(latestFile, newPath);
      console.log(`File has changed. Created new version: ${newFileName}`);
    } catch (error) {
      console.error("Error creating timestamped copy:", error);
      process.exit(1);
    }
  } else {
    console.log("File has not changed since the last version.");
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
