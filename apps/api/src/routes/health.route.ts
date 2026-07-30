import { Router } from "express";
import type { Request, Response } from "express";
import { env } from "../config/env.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    "success": true,
    "data": {
      "service": "api",
      "status": "ok",
      "environment": env.NODE_ENV,
    }
  });
});

export default router;