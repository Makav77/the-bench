import Joi from 'joi';
import { Tag } from '../../../db/models/posting';

const HOURS_DELAY = 5
const MIN_ENDDATE_DELAY_MS = HOURS_DELAY * 60 * 60 * 1000;
const tagValueArray = Object.values(Tag);

export interface CreatePostingRequest {
    title: string;
    description: string;
    endDate: Date;
    tags: Tag[];
}

export const CreatePostingValidation = Joi.object<CreatePostingRequest>({
    title: Joi.string()
        .pattern(/^[A-Za-z][A-Za-z0-9\s\-]{4,25}$/)
        .min(5)
        .max(25)
        .error(new Error('Title must be at minimum 5 and at maximum 25 characters, letters only (may include spaces or dashes'))
        .required(),
    description: Joi.string()
        .pattern(/^.{10,100}$/)
        .min(10)
        .max(100)
        .error(new Error('Description msut contain between 10 and 100 characters.'))
        .required(),
    endDate: Joi.date()
        .min(new Date(Date.now() + MIN_ENDDATE_DELAY_MS))
        .error(new Error(`End Date must be at least ${HOURS_DELAY} hours from now`))
        .required(),        
    tags: Joi.array()
        .items(Joi.valid(...tagValueArray))
        .min(1)
        .max(5)
        .error(new Error('Must have at least one tag'))
        .required(),
}).options({ abortEarly: false });