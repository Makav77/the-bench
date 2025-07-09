import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { GalleryService } from '../gallery.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { GalleryItem } from '../entities/gallery-item.entity';

@Injectable()
export class LoadGalleryItemResourceMiddleware implements NestMiddleware {
    constructor(private readonly galleryService: GalleryService) {}

    async use(
        req: RequestWithResource<GalleryItem>,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const galleryItem = await this.galleryService.findOneGalleryItem(id);
            if (!galleryItem) {
                throw new NotFoundException("GalleryItem not found");
            }
            req.resource = galleryItem;
        }
        next();
    }
}
