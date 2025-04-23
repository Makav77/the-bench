import Joi from 'joi';

export interface UserId {
    id: number;
}

export const UserIdValidation = Joi.object<UserId>({
    id: Joi.number()
        .required()
}).options({ abortEarly: false });