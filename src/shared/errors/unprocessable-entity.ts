import { AppError } from "./app-error";

export class UnprocessableEntityError extends AppError {
  constructor(message: string = "Unprocessable Entity", details?: any) {
    super(message, 422, details);
  }
}
