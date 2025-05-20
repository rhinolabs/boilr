import { spawn } from "node:child_process";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { findCompiledServerFile, isBuilt } from "../utils/filesystem.js";
import { build } from "./build.js";

/**
 * Start the production server
 */
export async function start() {
  const s = p.spinner();
  s.start("Starting production server");

  try {
    // Make sure the project is built
    if (!(await isBuilt())) {
      s.message("Project not built yet, building first...");
      await build();
    }

    // Find the compiled server file
    const serverFile = await findCompiledServerFile();

    if (!serverFile) {
      s.stop(`${pc.red("Error:")} Could not find compiled server file after build`);
      process.exit(1);
    }

    s.stop(`${pc.green("✓")} Starting server from ${pc.cyan(serverFile)}`);
    p.log.info("Starting production server...");
    p.log.info("Press Ctrl+C to stop");
    p.log.info("");

    // Start the Node.js server
    const proc = spawn("node", [serverFile], {
      stdio: "inherit",
      shell: true,
    });

    proc.on("error", (err) => {
      p.log.error(`Failed to start server: ${err}`);
      process.exit(1);
    });
  } catch (err) {
    s.stop(`${pc.red("Error:")} Failed to start server`);
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
