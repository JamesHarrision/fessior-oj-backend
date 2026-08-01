import { env } from "./config/env.js";
import { systemWorker } from "./workers/system.worker.js";

const serviceName = "worker";
console.log({
  service: serviceName,
  env: env.NODE_ENV,
  message: "Hello World from WORKER SERVICE"
})

type ShutdownSignal = "SIGINT" | "SIGTERM";

let isShuttingDown = false;

async function shutdown(signal: ShutdownSignal): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`Received ${signal}. Shutting down worker...`);

  try {
    await systemWorker.close();

    console.log("System worker closed");
    process.exitCode = 0;
  } catch (error) {
    console.error("Worker shutdown failed:", error);
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});