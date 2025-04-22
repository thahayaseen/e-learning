import { Request, Response, NextFunction } from "express";
import { LoginUsecase } from "../../config/dependencies";
import { userError } from "../../app/useCases/enum/User";

interface AuthServices extends Request {
  error?: string;
  user?: any;
}

