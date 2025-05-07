import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketItem } from './entities/market.entity';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';

@Module({
    imports: [TypeOrmModule.forFeature([MarketItem])],
    controllers: [MarketController],
    providers: [MarketService],
    exports: [MarketService],
})

export class MarketModule {}
