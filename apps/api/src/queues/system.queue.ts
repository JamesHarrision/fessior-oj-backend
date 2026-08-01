import { createSystemQueue } from "@fessior/queue";

import { env } from "../config/env.js";

export const systemQueue = createSystemQueue(env.REDIS_URL);