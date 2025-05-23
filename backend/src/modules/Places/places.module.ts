import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';

@Module({
    imports: [
        HttpModule.register({ timeout: 5000 })
    ],
    providers: [PlacesService],
    controllers: [PlacesController],
    exports: [PlacesService],
})

export class PlacesModule { }
