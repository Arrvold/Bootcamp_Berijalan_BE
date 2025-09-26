import { NextFunction, Request, response, Response } from "express";
import { IGlobalResponse } from "../interfaces/global.interface";

export const MErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    NextFunction: NextFunction
): void => {
    console.error("Error: ", err);

    const isDevelopment = process.env.NODE_ENV === "development";

    if (err instanceof Error) {
        const response: IGlobalResponse = {
            status: false,
            message: err.message,
        };
        const errorObj: any = { message: err.message };

        if (err.name) {
            errorObj.name = err.name;
        }

        if (isDevelopment && err.stack) {
            errorObj.detail = err.stack;
        }

        response.error = errorObj;

        res.status(500).json(response);
    } else {
        const response: IGlobalResponse = {
            status: false,
            message: "Unknown error",
            error: {
                message: "An unknown error occurred",
                ...(isDevelopment && { detail: err }),
            }
        };

        res.status(500).json(response);
    }
};
