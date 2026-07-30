import { error } from "console";
import type { RequestHandler, Request, Response } from "express";

export const notFoundHandler: RequestHandler = (req: Request, res: Response) => {
  const { method, originalUrl } = req;

  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Cannot ${method} ${originalUrl}`,
    }
  })
}