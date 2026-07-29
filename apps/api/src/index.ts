const serviceName = "api";

console.log("Hello World");
console.log({
  service: serviceName,
  env: process.env.NODE_ENV ?? "DEVELOPMENT",
  id: process.pid ?? "2401",
  startedAt: new Date().toISOString()
})

