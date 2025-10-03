import { Request, Response, NextFunction } from "express";
import { UVerifyToken } from "../utils/jwt.util";
import { AppError } from "../errors/AppError";

interface AdminPayload {
    id: number;
    username: string;
}

export const MAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("Authentication token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw AppError.unauthorized("Authentication token is required");
    }

    const decoded = await UVerifyToken(token);
    
    const payload = decoded as AdminPayload;

    req.admin = {
        id: payload.id,
        username: payload.username
    };

    next();
  } catch (error) {
    next(AppError.unauthorized());
  }
};