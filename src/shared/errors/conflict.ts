import { AppError } from "./app-error";

export class ConflictError extends AppError {
  constructor(message: string = "Conflict Error", details?: any) {
    super(message, 400, details);
  }
}
