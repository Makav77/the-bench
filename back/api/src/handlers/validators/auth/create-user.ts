import Joi from 'joi';
import { Role } from '../../../db/models/user';

export interface CreateUserRequest {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    role: Role;
}

export const CreateUserValidation = Joi.object<CreateUserRequest>({
    firstname: Joi.string()
        .pattern(/^[a-zA-Z]+$/)
        .min(1)
        .max(25)
        .error(new Error('First name must be alphabetic and contain a maximum of 25 characters.'))
        .required(),
    lastname: Joi.string()
        .pattern(/^[a-zA-Z]+$/)
        .min(1)
        .max(25)
        .error(new Error('Last name must be alphabetic and contain a maximum of 25 characters.'))
        .required(),
    email: Joi.string()
        .email()
        .error(new Error('Email must be a valid email address.'))
        .required(),
    password: Joi.string()
        .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .error(new Error('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.'))
        .required(),
    dateOfBirth: Joi.date()
        .error(new Error('Date of birth must be a valid date.'))
        .required(),
    role: Joi.string()
        .valid(...Object.values(Role))
        .error(new Error('Role must be one of: user, admin or superadmin'))
        .required(),
}).options({ abortEarly: false });