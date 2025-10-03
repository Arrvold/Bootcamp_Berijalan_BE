import { Request, Response, NextFunction } from 'express';
import { SCreateAdmin, SLogin, SUpdateAdmin, SDeleteAdmin, SGetAdminById } from '../services/auth.service';
import { SGetAllAdmins } from '../services/auth.service';
import { AppError } from '../errors/AppError';


export const CLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, password } = req.body;
        const result = await SLogin(username, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const CCreateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await SCreateAdmin(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export const CGetAllAdmins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await SGetAllAdmins();
        res.status(200).json(result)
    } catch (error) {
        next(error);
    }
}

export const CUpdateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const adminId = parseInt(req.params.id ?? '', 10);
        const result = await SUpdateAdmin(adminId, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const CDeleteAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const adminId = parseInt(req.params.id ?? '', 10);
        const result = await SDeleteAdmin(adminId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export const CGetAdminById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: false, message: "Parameter 'id' is required" });
        }

        const adminId = parseInt(id, 10);
        if (isNaN(adminId)) throw AppError.badRequest("ID must be a number");

        const result = await SGetAdminById(adminId);
        res.json(result);
    } catch (error) { next(error); }
};