import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFile, Req } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { CreateUserDTO } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { ProfileSummaryDTO } from "./dto/profile-summary.dto";
import fs from "fs";
import path from "path";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get("search")
    @UseGuards(JwtAuthGuard)
    async searchUsers(@Query("query") query: string): Promise<{ id: string; firstname: string; lastname: string; }[]> {
        return this.userService.searchUsers(query);
    }

    @Get(":id")
    async findOne(@Param("id") id: string): Promise<User> {
        return this.userService.findOne(id);
    }

    @Get(":id/profile")
    async getProfileSummary(@Param("id") id: string): Promise<ProfileSummaryDTO> {
        return this.userService.getProfileSummary(id);
    }

    @Post()
    create(@Body() createUserDTO: CreateUserDTO): Promise<User> {
        return this.userService.create(createUserDTO);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateUserDTO: UpdateUserDTO): Promise <User> {
        return this.userService.update(id, updateUserDTO);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.userService.remove(id);
    }

    @Post("upload-profile")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("file", {
        storage: diskStorage({
            destination: "./uploads/profile",
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async uploadProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        const userId = req.user.id;
        const imagePath = `/uploads/profile/${file.filename}`;
        const user = await this.userService.findOne(userId);

        if (user.profilePicture && !user.profilePicture.includes("default.png")) {
            const oldFilename = path.basename(user.profilePicture);
            const oldPath = path.join(__dirname, "../../../uploads/profile", oldFilename);

            try {
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            } catch (error) {
                console.error("Erreur lors de la suppression de l'ancienne photo :", error);
            }
        }

        return this.userService.setProfilePicture(userId, imagePath);
    }
}
