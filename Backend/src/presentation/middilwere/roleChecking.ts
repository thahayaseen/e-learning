import { NextFunction, Request, Response } from "express";
import { Roles } from "../../app/useCases/enum/User";
import { HttpStatusCode } from "../../app/useCases/enum/Status";

// 👇 Middleware factory function
export function roleChecker(requiredRole: Roles) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = (req as any).user; // Adjust typing if needed

      console.log(role, "role is ");
      console.log(role, "required role is", requiredRole);

      if (!role || role !== requiredRole) {
        throw new Error("Don't have access");
      }

      next();
    } catch (error) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "You don't have access to this api",
      });
    }
  };
}
