"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errors_1 = require("@ocj/errors");
const errorMiddleware = (err, req, res, next) => {
    // If the error is an instance of AppError
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({
            status: 'Error',
            message: err.message,
        });
        return;
    }
    // Handle other unexpected errors (e.g. database errors, syntax errors)
    console.error('Unhandled Error:', err);
    res.status(500).json({
        status: 'Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    });
};
exports.errorMiddleware = errorMiddleware;
