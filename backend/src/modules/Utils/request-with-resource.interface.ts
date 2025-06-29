import { Request } from 'express';

export interface RequestWithResource<T> extends Request {
    resource?: T;
}
