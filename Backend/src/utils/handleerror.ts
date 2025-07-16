import { Response } from "express";
export interface HandleErrointerface{
res:Response,
error:unknown,
statusCode:number
}
export const handleError = (res: Response, error: unknown, statusCode = 500) => {
  console.error("Controller Error:", error);
  const message = error instanceof Error ? error.message : "Unknown error";
  res.status(statusCode).json({ success: false, message });
  return;
};
