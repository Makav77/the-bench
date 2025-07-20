import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
  Res,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from "@nestjs/common";
import { UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { extname } from "path";
import { MarketService } from "./market.service";
import { CreateMarketItemDTO } from "./dto/create-market-item.dto";
import { UpdateMarketItemDTO } from "./dto/update-market-item.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { MarketItem } from "./entities/market.entity";
import { User } from "../Users/entities/user.entity";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Resource } from "../Utils/resource.decorator";
import { UploadService } from "../Upload/upload.service";
import { Response } from "express";

interface S3File extends Express.Multer.File {
  location: string;
  key: string;
}

@Controller("market")
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly uploadService: UploadService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllItems(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: RequestWithResource<MarketItem>
  ): Promise<{
    data: MarketItem[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const user = req.user as User;
    return this.marketService.findAllItems(page, limit, user);
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Get(":id")
  async findOneItem(@Resource() marketItem: MarketItem): Promise<MarketItem> {
    return marketItem;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createItem(
    @Req() req: RequestWithResource<MarketItem>,
    @Res() res: Response
  ): Promise<void> {
    const user = req.user as User;
    const upload = this.uploadService.getMulterUploader().array("images", 5);

    upload(req, res, async (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res
          .status(400)
          .json({ message: "Upload failed: " + err.message });
      }

      const files = (req.files as S3File[]) || [];
      const endpoint = process.env.DO_SPACES_ENDPOINT!;
      const cdn = process.env.DO_SPACES_CDN!;
      const urls = files.map((f) => f.location.replace(endpoint, cdn));

      const raw = req.body;
      const dto: CreateMarketItemDTO = {
        title: raw.title,
        description: raw.description,
        price: raw.price ? parseFloat(raw.price) : undefined,
        contactEmail: raw.contactEmail,
        contactPhone: raw.contactPhone,
        images: urls,
        irisCode: raw.irisCode,
        irisName: raw.irisName,
      };

      const errors =
        await new (require("class-validator").Validator)().validate(
          Object.assign(new CreateMarketItemDTO(), dto)
        );

      if (errors.length > 0) {
        console.error("Validation errors:", errors);
        return res.status(400).json({
          message: errors.map((e) => Object.values(e.constraints)).flat(),
          error: "Bad Request",
          statusCode: 400,
        });
      }

      try {
        const item = await this.marketService.createItem(dto, user);
        return res.status(201).json(item);
      } catch (e) {
        console.error("Create failed:", e);
        return res
          .status(500)
          .json({ message: "Failed to create market item." });
      }
    });
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, IrisGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.error(
          "Validation failed:",
          errors.map((e) => ({
            property: e.property,
            value: e.value,
            constraints: e.constraints,
          }))
        );
        return new BadRequestException(errors);
      },
    })
  )
  async updateItem(
    @Resource() marketItem: MarketItem,
    @Req() req: RequestWithResource<MarketItem>,
    @Body() updateDTO: UpdateMarketItemDTO,
    @Res() res: Response
  ): Promise<void> {
    const user = req.user as User;
    const upload = this.uploadService.getMulterUploader().array("images", 5);

    upload(req, res, async (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res
          .status(400)
          .json({ message: "Upload failed: " + err.message });
      }

      const files = (req.files as S3File[]) || [];
      const endpoint = process.env.DO_SPACES_ENDPOINT!;
      const cdn = process.env.DO_SPACES_CDN!;
      const urls = files.map((f) => f.location.replace(endpoint, cdn));
      const allImages = marketItem.images
        ? [...marketItem.images, ...urls]
        : urls;

      try {
        const updated = await this.marketService.updateItem(
          marketItem.id,
          { ...updateDTO, images: allImages },
          user
        );
        return res.status(200).json(updated);
      } catch (e) {
        console.error("Update failed:", e);
        return res
          .status(500)
          .json({ message: "Failed to update market item." });
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeItem(
    @Resource() marketItem: MarketItem,
    @Req() req: RequestWithResource<MarketItem>
  ): Promise<void> {
    const user = req.user as User;
    return this.marketService.removeItem(marketItem.id, user);
  }
}
