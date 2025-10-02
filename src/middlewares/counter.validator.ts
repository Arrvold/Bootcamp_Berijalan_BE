import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const createCounterSchema = Joi.object({
    name: Joi.string().required(),
    maxQueue: Joi.number().integer().min(1).default(99)
});

const updateCounterSchema = Joi.object({
    name: Joi.string(),
    maxQueue: Joi.number().integer().min(1)
}).min(1); // At least one field is required

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('active', 'inactive', 'disable').required()
});

const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const errors = error.details.map(detail => ({ field: detail.path[0], message: detail.message }));
        return res.status(400).json({ status: false, message: 'Validation failed', error: errors });
    }
    next();
};

export const validateCreateCounter = validate(createCounterSchema);
export const validateUpdateCounter = validate(updateCounterSchema);
export const validateUpdateStatus = validate(updateStatusSchema);