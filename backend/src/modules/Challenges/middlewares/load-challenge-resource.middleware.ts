import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { ChallengesService } from '../challenges.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { Challenge } from '../entities/challenge.entity'; 
import { isUUID } from 'class-validator';

@Injectable()
export class LoadChallengeResourceMiddleware implements NestMiddleware {
    constructor(private readonly challengesService: ChallengesService) {}

    async use(
        req: RequestWithResource<Challenge>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id && isUUID(id)) {
            const challenge = await this.challengesService.findOneChallenge(id);
            if (!challenge) {
                throw new NotFoundException("Challenge not found");
            }
            req.resource = challenge;
        }
        next();
    }
}
