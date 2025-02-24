export interface IAppError extends Error {
  statusCode: number;
}
export class AppError extends Error implements IAppError {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
