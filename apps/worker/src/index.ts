import { env } from "./config/env.js";

const serviceName = "worker";
console.log({
  service: serviceName,
  env: env.NODE_ENV,
  message: "Hello World from WORKER SERVICE"
})

console.log("WORKER CONCURRENCY: ", env.WORKER_CONCURRENCY);