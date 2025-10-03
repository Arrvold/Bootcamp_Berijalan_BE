export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }

    // Metode statis untuk error umum
    public static unauthorized(message: string = "Unauthorized"): AppError {
        return new AppError(message, 401);
    }

    public static notFound(message: string = "Not Found"): AppError {
        return new AppError(message, 404);
    }

    public static badRequest(message: string = "Bad Request"): AppError {
        return new AppError(message, 400);
    }
}