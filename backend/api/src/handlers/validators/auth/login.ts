import Joi from 'joi';

export interface LoginUserValidationRequest {
    email: string;
    password: string;
}

export const LoginUserValidation = Joi.object<LoginUserValidationRequest>({
    email: Joi.string()
        .email()
        .error(new Error('Email must be a valid email address.'))
        .required(),
    password: Joi.string()
        .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .error(new Error('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.'))
        .required()
}).options({ abortEarly: false });