export function extractTimestamps(srtContent: string): string {
  const blocks = srtContent.trim().split(/\n\s*\n/);
  const result: string[] = [];
  let index = 1;

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    // Find the timestamp line (contains " --> ")
    const timestampLine = lines.find((l) => l.includes(" --> "));
    if (timestampLine) {
      result.push(`${index}`);
      result.push(timestampLine.trim());
      result.push(""); // empty subtitle text line
      result.push(""); // block separator
      index++;
    }
  }

  return result.join("\n").trim();
}
