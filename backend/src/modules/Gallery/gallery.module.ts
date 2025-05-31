import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryItem } from './entities/gallery-item.entity';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { PermissionsModule } from '../Permissions/permissions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([GalleryItem]),
        PermissionsModule,
    ],
    controllers: [GalleryController],
    providers: [GalleryService],
    exports: [GalleryService],
})

export class GalleryModule { }
