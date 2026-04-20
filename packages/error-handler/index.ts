export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: number, isOperational : boolean, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details; 
    (Error as any).captureStackTrace(this);
    
}
}

//Not found error
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true);
  }
}

//Validation error
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, true, details);
  }
}

//Authentication error
export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
  }
}

//Forbidden error
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true);
  }
}

//Database error
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', details?: any) {
    super(message, 500, true, details);
  }
}

