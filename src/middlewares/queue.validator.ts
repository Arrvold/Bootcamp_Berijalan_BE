import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const createQueueSchema = Joi.object({
    counterId: Joi.number().integer().required()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('waiting', 'processing', 'done', 'cancelled', 'called', 'skipped', 'released', 'reset').required()
});

const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const errors = error.details.map(detail => ({ field: detail.path[0], message: detail.message }));
        return res.status(400).json({ status: false, message: 'Validation failed', error: errors });
    }
    next();
};

export const validateCreateQueue = validate(createQueueSchema);
export const validateUpdateStatus = validate(updateStatusSchema);