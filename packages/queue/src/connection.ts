import type { ConnectionOptions } from "bullmq";

export function createRedisConnectionOptions(
  redisUrl: string,
): ConnectionOptions {
  const url = new URL(redisUrl);

  const databasePath = url.pathname.replace("/", "");
  const database = databasePath === "" ? 0 : Number(databasePath);

  return {
    host: url.hostname,
    port: url.port === "" ? 6379 : Number(url.port),
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number.isNaN(database) ? 0 : database,
  };
}