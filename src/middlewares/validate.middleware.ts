import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { IGlobalResponse } from '../interfaces/global.interface';

const createAdminSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.base': `"username" should be a type of 'text'`,
        'string.empty': `"username" cannot be an empty field`,
        'string.min': `"username" should have a minimum length of {#limit}`,
        'any.required': `"username" is a required field`
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': `"password" should have a minimum length of 6 characters`,
        'any.required': `"password" is a required field`
    }),
    email: Joi.string().email().required().messages({
        'string.email': `"email" must be a valid email`,
        'any.required': `"email" is a required field`
    }),
    name: Joi.string().required().messages({
        'any.required': `"name" is a required field`
    })
});

export const validateCreateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await createAdminSchema.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            const errorDetails = error.details.map(detail => ({
                field: String(detail.path[0]),
                message: detail.message
            }));

            const response: IGlobalResponse = {
                status: false,
                message: "Validation failed",
                error: errorDetails
            };
            res.status(400).json(response); 
        } else {
        }
    }
};