import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from "@nestjs/common";
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
import { RecommendationService } from "./recommendation.service";
import { Response } from "express";
import { UploadService } from "../Upload/upload.service";

export interface RequestWithUser extends Request {
  user: User;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly recommendationService: RecommendationService,
    private readonly uploadService: UploadService
  ) {}

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
  ): Promise<{ id: string; firstname: string; lastname: string }[]> {
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
  async getFriends(@Param("id") userId: string): Promise<
    {
      id: string;
      firstname: string;
      lastname: string;
      profilePicture: string;
    }[]
  > {
    return this.userService.getFriends(userId);
  }

  @Post()
  create(@Body() createUserDTO: CreateUserDTO): Promise<User> {
    return this.userService.create(createUserDTO);
  }

  @Post("upload-profile")
  @UseGuards(JwtAuthGuard)
  async uploadProfilePicture(
    @Req() req: RequestWithUser,
    @Res() res: Response
  ): Promise<void> {
    const userId = req.user.id;
    const upload = this.uploadService
      .getMulterUploader({ folder: "profile" })
      .single("file");

    upload(req as any, res, async (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res
          .status(400)
          .json({ message: "Upload failed: " + err.message });
      }

      const file = req.file as Express.Multer.File & { location?: string };
      if (!file?.location) {
        return res
          .status(400)
          .json({ message: "Missing uploaded file or location." });
      }

      const endpoint = process.env.DO_SPACES_ENDPOINT!;
      const cdn = process.env.DO_SPACES_CDN!;
      const imagePath = file.location.replace(endpoint, cdn);

      const user = await this.userService.findOne(userId);

      if (
        user.profilePicture &&
        !user.profilePicture.includes("default.png") &&
        user.profilePicture.startsWith("/uploads/")
      ) {
        const oldFilename = path.basename(user.profilePicture);
        const oldPath = path.join(
          __dirname,
          "../../../uploads/profile",
          oldFilename
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const updated = await this.userService.setProfilePicture(
        userId,
        imagePath
      );
      return res.status(200).json(updated);
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/pending-friend-requests")
  async getPendingFriendRequests(@Param("id") userId: string) {
    return this.userService.getPendingFriendRequests(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/cancel-friend-request")
  async cancelFriendRequest(
    @Param("id") targetUserId: string,
    @Req() req: RequestWithUser
  ): Promise<void> {
    const currentUserId = req.user.id;
    return this.userService.cancelFriendRequest(currentUserId, targetUserId);
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
    @Req() req: RequestWithUser
  ): Promise<void> {
    const currentUserId = req.user.id;
    return this.userService.acceptFriendRequest(currentUserId, requesterId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateUserDTO: UpdateUserDTO
  ): Promise<User> {
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
  ): Promise<{
    areFriends: boolean;
    requestSent: boolean;
    requestReceived: boolean;
  }> {
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
    return this.userService.updateAddress(
      userId,
      body.street,
      body.postalCode,
      body.city
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/recommendations")
  async getRecommendations(@Param("id") userId: string) {
    return this.recommendationService.getRecommendationsForUser(userId);
  }
}
