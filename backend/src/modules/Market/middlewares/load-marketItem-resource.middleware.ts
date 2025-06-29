import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { MarketService } from '../market.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { MarketItem } from '../entities/market.entity';

@Injectable()
export class LoadMarketItemResourceMiddleware implements NestMiddleware {
    constructor(private readonly marketService: MarketService) {}

    async use(
        req: RequestWithResource<MarketItem>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const marketItem = await this.marketService.findOneItem(id);
            if (!marketItem) {
                throw new NotFoundException("MarketItem not found");
            }
            req.resource = marketItem;
        }
        next();
    }
}
