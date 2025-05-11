import { Controller, Get, Post, Delete, Param, Query, UseGuards, Req, DefaultValuePipe, ParseIntPipe, UploadedFile, UseInterceptors, Body, BadRequestException } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { GalleryService } from "./gallery.service";
import { CreateGalleryItemDTO } from "./dto/create-gallery-item.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Request } from "express";
import { GalleryItem } from "./entities/gallery-item.entity";
import { User } from "../Users/entities/user.entity";

const multerOptions = {
    storage: diskStorage({
        destination: "./uploads/gallery",
        filename: (_req, file, callback) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
    }),
    fileFilter: (_req: any, file: { mimetype: string; }, callback: (arg0: Error | null, arg1: boolean) => void) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            callback(null, true);
        } else {
            callback(new Error("Unsupported file type."), false);
        }
    },
    limits: { fileSize: 3 * 1024 * 1024 },
};

@Controller("gallery")
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllGalleryItems(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(30), ParseIntPipe) limit: number,
    ): Promise<{ data: GalleryItem[]; total: number; page: number; lastPage: number; }> {
        return this.galleryService.findAllGalleryItems(page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOneGalleryItem(@Param("id") id: string): Promise<GalleryItem> {
        return this.galleryService.findOneGalleryItem(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor("images", multerOptions))
    async createGalleryItem(
        @UploadedFile() file: Express.Multer.File,
        @Body() createGalleryItemDTO: CreateGalleryItemDTO,
        @Req() req: Request,
    ): Promise<GalleryItem> {
        const user = req.user as User;
        if (!file) {
            throw new BadRequestException("You must upload one image.");
        }
        const url = `/uploads/gallery/${file.filename}`;
        return this.galleryService.createGalleryItem( createGalleryItemDTO, url, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/like")
    async toggleLike(
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<GalleryItem> {
        const user = req.user as User;
        return this.galleryService.toggleLike(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeGalleryItem(
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<void> {
        const user = req.user as User;
        return this.galleryService.removeGalleryItem(id, user);
    }
}
