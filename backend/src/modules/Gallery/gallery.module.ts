import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryItem } from './entities/gallery-item.entity';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { PermissionsModule } from '../Permissions/permissions.module';
import { createInjectServiceMiddleware } from '../Utils/inject-resource-service.middleware';
import { LoadGalleryItemResourceMiddleware } from './middlewares/load-galleryItem-resource.middleware';

const InjectGalleryItemServiceMiddleware = createInjectServiceMiddleware("galleryService", GalleryService);

@Module({
    imports: [
        TypeOrmModule.forFeature([GalleryItem]),
        PermissionsModule,
    ],
    controllers: [GalleryController],
    providers: [GalleryService],
    exports: [GalleryService],
})

export class GalleryModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(InjectGalleryItemServiceMiddleware, LoadGalleryItemResourceMiddleware)
            .forRoutes(
                { path: "gallery/:id", method: RequestMethod.ALL },
                { path: "gallery/:id/like", method: RequestMethod.ALL },
            );
    }
}
