import { AppError } from "./index";
import {Request, Response, NextFunction} from 'express';

export function errorMiddleware(err: AppError, req: Request, res: Response, next: NextFunction) {

    if(err instanceof AppError) {
        return res.status(err.statusCode).json({  // ✅ add return
            status: 'error',
            message: err.message,
            ...(err.details && {details: err.details})
        });
    }
    
    // This only runs for non-AppError (unexpected errors)
    console.log('Unexpected error:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong, Please try again later.'
    });
}