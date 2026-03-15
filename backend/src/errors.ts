// errors.ts
import type { Request, Response, NextFunction } from 'express';

// ─── Error Codes ──────────────────────────────────────────────────────────────
export const ERROR_CODES = {
    // User / Auth
    USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    USER_EMAIL_TAKEN: 'USER_EMAIL_TAKEN',
    USER_USERNAME_TAKEN: 'USER_USERNAME_TAKEN',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',

    // Input
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_FIELDS: 'MISSING_FIELDS',

    // General
    NOT_FOUND: 'NOT_FOUND',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    CONFLICT: 'CONFLICT',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ─── AppError Class ───────────────────────────────────────────────────────────
export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly status: number;

    constructor(code: ErrorCode, message: string, status: number = 400) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.status = status;
        Object.setPrototypeOf(this, AppError.prototype); // needed for instanceof checks in TS
    }
}

// ─── Pre-built Errors ─────────────────────────────────────────────────────────
export const Errors = {
    emailTaken: (msg = 'An account with this email already exists.') => new AppError(ERROR_CODES.USER_EMAIL_TAKEN, msg, 409),
    usernameTaken: (msg = 'This username is already taken.') => new AppError(ERROR_CODES.USER_USERNAME_TAKEN, msg, 409),
    userNotFound: (msg = 'User not found.') => new AppError(ERROR_CODES.USER_NOT_FOUND, msg, 404),
    invalidCredentials: (msg = 'Invalid email or password.') => new AppError(ERROR_CODES.INVALID_CREDENTIALS, msg, 401),
    unauthorized: (msg = 'You must be logged in.') => new AppError(ERROR_CODES.UNAUTHORIZED, msg, 401),
    forbidden: (msg = 'You do not have permission to do this.') => new AppError(ERROR_CODES.FORBIDDEN, msg, 403),
    validationError: (msg = 'Invalid input.') => new AppError(ERROR_CODES.VALIDATION_ERROR, msg, 422),
    notFound: (msg = 'Resource not found.') => new AppError(ERROR_CODES.NOT_FOUND, msg, 404),
    internal: (msg = 'Something went wrong. Please try again later.') => new AppError(ERROR_CODES.INTERNAL_ERROR, msg, 500),
} satisfies Record<string, (msg?: string) => AppError>;

// ─── Response Shape ───────────────────────────────────────────────────────────
export interface ErrorResponse {
    failure: true;
    code: ErrorCode;
    message: string;
}

// ─── Global Error Handler Middleware ─────────────────────────────────────────
export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof AppError) {
        res.status(err.status).json({
            failure: true,
            code: err.code,
            message: err.message,
        } satisfies ErrorResponse);
        return;
    }

    console.error(err);
    res.status(500).json({
        failure: true,
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Something went wrong.',
    } satisfies ErrorResponse);
}