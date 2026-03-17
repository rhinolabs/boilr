import type { ErrorFormatter, ErrorResponse } from "../types/error.types.js";
import type { HttpException } from "./exceptions.js";

export const defaultFormatter: ErrorFormatter = (
  exception: HttpException,
  _request: { url: string; method: string },
): ErrorResponse => ({
  statusCode: exception.statusCode,
  message: exception.message,
  error: exception.name,
  details: exception.details,
});
