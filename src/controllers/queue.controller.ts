import { Request, Response, NextFunction } from 'express';
import * as queueService from '../services/queue.service';
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

export const CGetAllQueues = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const counterId = req.query.counterId ? parseInt(req.query.counterId as string) : undefined;
        const result = await queueService.SGetAllQueues(page, limit, counterId);
        res.json(result);
    } catch (error) { next(error); }
};

export const CGetQueueById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateAndParseId(req, res);
        if (id === null) return;
        const result = await queueService.SGetQueueById(id);
        res.json(result);
    } catch (error) { next(error); }
};

export const CCreateQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await queueService.SCreateQueue(req.body);
        res.status(201).json(result);
    } catch (error) { next(error); }
};

export const CUpdateQueueStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateAndParseId(req, res);
        if (id === null) return;
        const { status } = req.body;
        const result = await queueService.SUpdateQueueStatus(id, status);
        res.json(result);
    } catch (error) { next(error); }
};

export const CDeleteQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateAndParseId(req, res);
        if (id === null) return;
        const result = await queueService.SDeleteQueue(id);
        res.json(result);
    } catch (error) { next(error); }
};

export const CClaimQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await queueService.SClaimQueue();
        res.status(201).json(result);
    } catch (error) { next(error); }
};

export const CReleaseQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateAndParseId(req, res);
        if (id === null) return;
        const result = await queueService.SReleaseQueue(id);
        res.json(result);
    } catch (error) { next(error); }
};

export const CNextQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { counter_id } = req.params;
        if (!counter_id) {
            throw AppError.badRequest("Parameter 'counter_id' is required");
        }
        const counterId = parseInt(counter_id, 10);
        if (isNaN(counterId)) {
            throw AppError.badRequest("Parameter 'counter_id' must be a valid number");
        } const result = await queueService.SNextQueue(counterId);
        res.json(result);
    } catch (error) { next(error); }
};

export const CSkipQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { counter_id } = req.params;
        if (!counter_id) {
            throw AppError.badRequest("Parameter 'counter_id' is required");
        }
        const counterId = parseInt(counter_id, 10);
        if (isNaN(counterId)) {
            throw AppError.badRequest("Parameter 'counter_id' must be a valid number");
        } const result = await queueService.SSkipQueue(counterId);
        res.json(result);
    } catch (error) { next(error); }
};

export const CGetQueueMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await queueService.SGetQueueMetrics();
        res.json(result);
    } catch (error) { next(error); }
};