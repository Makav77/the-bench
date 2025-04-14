import Joi from 'joi';

export interface PostingId {
    id: number;
}

export const PostingIdValidation = Joi.object<PostingId>({
    id: Joi.number()
        .required()
}).options({ abortEarly: false });