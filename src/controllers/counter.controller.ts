import { Request, Response, NextFunction } from 'express';
import * as counterService from '../services/counter.service';
import { AppError } from '../errors/AppError';

const validateAndParseId = (req: Request, res: Response): number | null => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ status: false, message: "Parameter 'id' is required" });
        return null;
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        res.status(400).json({ status: false, message: "Parameter 'id' must be a valid number" });
        return null;
    }
    return parsedId;
};


export const CGetAllCounters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await counterService.SGetAllCounters(page, limit);
        res.json(result);
    } catch (error) { next(error); }
};

export const CGetCounterById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateAndParseId(req, res);
        if (id === null) return; 

        const result = await counterService.SGetCounterById(id);
        res.json(result);
    } catch (error) { next(error); }
};

export const CCreateCounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await counterService.SCreateCounter(req.body);
        res.status(201).json(result);
    } catch (error) { next(error); }
};

export const CUpdateCounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateAndParseId(req, res);
        if (id === null) return; 

        const result = await counterService.SUpdateCounter(id, req.body);
        res.json(result);
    } catch (error) { next(error); }
};

export const CUpdateCounterStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateAndParseId(req, res);
        if (id === null) return; 
        const { status } = req.body;
        const result = await counterService.SUpdateCounterStatus(id, status);
        res.json(result);
    } catch (error) { next(error); }
};

export const CDeleteCounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateAndParseId(req, res);
        if (id === null) return; 

        const result = await counterService.SDeleteCounter(id);
        res.json(result);
    } catch (error) { next(error); }
};

export const CNextQueueForCounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw AppError.badRequest("Parameter 'id' for counter is required");
        }
        const counterId = parseInt(id, 10);
        if (isNaN(counterId)) {
            throw AppError.badRequest("Parameter 'id' for counter must be a valid number");
        }

        const result = await counterService.SNextQueueForCounter(counterId);
        res.json(result);
    } catch (error) { next(error); }
};

export const CGetCurrentCounters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await counterService.SGetCurrentCounters();
        res.json(result);
    } catch (error) { next(error); }
};

export const CResetCounters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const counterId = req.body.counter_id ? parseInt(req.body.counter_id, 10) : undefined;
        const result = await counterService.SResetCounters(counterId);
        res.json(result);
    } catch (error) { next(error); }
};