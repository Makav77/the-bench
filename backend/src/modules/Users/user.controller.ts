import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException } from "@nestjs/common";
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

interface RequestWithUser extends Request {
    user: User;
}

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get("staff")
    async getStaff(@Req() req: RequestWithUser) {
        const userId = req.user.id;
        return this.userService.getStaff(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get("search")
    async searchUsers(
        @Query("query") query: string,
        @Req() req: RequestWithUser
    ): Promise<{ id: string; firstname: string; lastname: string; }[]> {
        const user = req.user;
        return this.userService.searchUsers(query, user.irisCode, user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<User> {
        return this.userService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/profile")
    async getProfileSummary(
        @Param("id") id: string,
        @Req() req: RequestWithUser
    ): Promise<ProfileSummaryDTO> {
        const currentUserId = req.user?.id;
        return this.userService.getProfileSummary(id, currentUserId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/friends")
    async getFriends(@Param("id") userId: string): Promise<{ id: string; firstname: string; lastname: string; profilePicture: string }[]> {
        return this.userService.getFriends(userId);
    }

    @Post()
    create(@Body() createUserDTO: CreateUserDTO): Promise<User> {
        return this.userService.create(createUserDTO);
    }

    @UseGuards(JwtAuthGuard)
    @Post("upload-profile")
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

    @UseGuards(JwtAuthGuard)
    @Post(":id/friend-request")
    async sendFriendRequest(
        @Param("id") toId: string,
        @Req() req: RequestWithUser
    ): Promise<void> {
        const fromId = req.user.id;
        return this.userService.sendFriendRequest(fromId, toId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/accept-friend")
    async acceptFriendRequest(
        @Param("id") requesterId: string,
        @Req() req: RequestWithUser,
    ): Promise<void> {
        const currentUserId = req.user.id;
        return this.userService.acceptFriendRequest(currentUserId, requesterId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    update(@Param("id") id: string, @Body() updateUserDTO: UpdateUserDTO): Promise <User> {
        return this.userService.update(id, updateUserDTO);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.userService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id/reject-friend")
    async rejectFriendRequest(
        @Param("id") senderId: string,
        @Req() req: RequestWithUser
    ): Promise<void> {
        const currentUserId = req.user.id;
        return this.userService.rejectFriendRequest(currentUserId, senderId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id/remove-friend")
    async removeFriend(
        @Param("id") friendId: string,
        @Req() req: RequestWithUser
    ): Promise<void> {
        const currentUserId = req.user.id;
        return this.userService.removeFriend(currentUserId, friendId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/friend-status")
    async getFriendStatus(
        @Param("id") targetUserId: string,
        @Req() req: RequestWithUser
    ): Promise<{ areFriends: boolean; requestSent: boolean; requestReceived: boolean; }> {
        const currentUserId = req.user.id;
        return this.userService.getFriendStatus(currentUserId, targetUserId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch("me/address")
    async updateAddress(
        @Req() req: RequestWithUser,
        @Body() body: { street: string; postalCode: string; city: string }
    ) {
        const userId = req.user.id;
        return this.userService.updateAddress(userId, body.street, body.postalCode, body.city);
    }
}
