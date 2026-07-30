import { env } from "./config/env.js";

const serviceName = "api";


console.log({
  service: serviceName,
  env: env.NODE_ENV,
  message: "Hello World from API SERVICE"
})

console.log("Server is running on PORT: ", env.API_PORT);