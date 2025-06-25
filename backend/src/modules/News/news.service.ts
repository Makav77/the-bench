import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { News, NewsDocument } from "./news.schema";
import { CreateNewsDTO } from "./dto/create-news.dto";
import { UpdateNewsDTO } from "./dto/update-news.dto";
import { ValidateNewsDTO } from "./dto/validate-news.dto";
import { User } from "../Users/entities/user.entity";

@Injectable()
export class NewsService {
    constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) {}

    async findAllNews(page = 1, limit = 5, user: User): Promise<{ data: (News & { totalLikes: number })[]; total: number; page: number; lastPage: number }> {
        const skip = (page - 1) * limit;

        const filter: Partial<News> = {
            status: "APPROVED",
            published: true,
        };
        if (user.role !== "admin") {
            filter.irisCode = user.irisCode;
        }

        const [newsList, total] = await Promise.all([
            this.newsModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true }),
            this.newsModel.countDocuments(filter),
        ]);

        const data = newsList.map(item => ({
            ...item,
            id: item.id || item._id?.toString(),
            totalLikes: item.likedBy.length,
        }));

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneNews(id: string): Promise<News> {
        const news = await this.newsModel.findById(id).exec();
        if (!news) {
            throw new NotFoundException("News not found.");
        }
        return news;
    }

    async createNews(createNewsDTO: CreateNewsDTO, author: User): Promise<News> {
        const news = new this.newsModel({
            ...createNewsDTO,
            authorId: author.id,
            authorFirstname: author.firstname,
            authorLastname: author.lastname,
            authorProfilePicture: author.profilePicture,
            status: "PENDING",
            published: false,
            irisCode: author.irisCode,
            irisName: author.irisName,
        });
        return news.save();
    }

    async updateNews(id: string, updateNewsDTO: UpdateNewsDTO, user: User): Promise<News> {
        const news = await this.newsModel.findById(id);
        if (!news) {
            throw new NotFoundException("News not found.");
        }

        if (user.role !== "admin" && news.irisCode !== user.irisCode) {
            throw new ForbiddenException("You are not allowed to edit news from another iris.");
        }

        if (news.authorId !== user.id && user.role !== "admin" && user.role !== "moderator") {
            throw new ForbiddenException("You are not allowed to edit this news.");
        }

        Object.assign(news, updateNewsDTO);
        await news.save();
        return news;
    }

    async removeNews(id: string, user: User): Promise<void> {
        const news = await this.newsModel.findById(id);
        if (!news) {
            throw new NotFoundException("News not found for removing");
        }

        if (user.role !== "admin" && news.irisCode !== user.irisCode) {
            throw new ForbiddenException("Not allowed to remove news from another iris.");
        }

        if (news.authorId !== user.id && user.role !== "admin" && user.role !== "moderator") {
            throw new ForbiddenException("You are not allowed to remove this news.");
        }

        await news.deleteOne();
    }

    async toggleLike(newsId: string, user: User): Promise<{ liked: boolean; totalLikes: number }> {
        const news = await this.newsModel.findById(newsId);
        if (!news) {
            throw new NotFoundException("News not found");
        }

        if (user.role !== "admin" && news.irisCode !== user.irisCode) {
            throw new ForbiddenException("Not allowed to like news from another iris.");
        }

        const index = news.likedBy.indexOf(user.id);
        const liked = index === -1;
        if (liked) {
            news.likedBy.push(user.id);
        } else {
            news.likedBy.splice(index, 1);
        }

        await news.save();
        return { liked, totalLikes: news.likedBy.length };
    }

    async getLikes(newsId: string, user: User): Promise<{ totalLikes: number; liked: boolean }> {
        const news = await this.newsModel.findById(newsId).lean();
        if (!news) {
            throw new NotFoundException("News not found");
        }

        if (user.role !== "admin" && news.irisCode !== user.irisCode) {
            throw new ForbiddenException("Not allowed to access likes from another iris.");
        }

        return {
            totalLikes: news.likedBy.length,
            liked: news.likedBy.includes(user.id),
        };
    }

    async findPendingNews(page = 1, limit = 5, user: User): Promise<{ data: News[]; total: number; page: number; lastPage: number }> {
        const skip = (page - 1) * limit;

        const filter: Partial<News> = { status: "PENDING" };
        if (user.role !== "admin") {
            filter.irisCode = user.irisCode;
        }

        const [data, total] = await Promise.all([
            this.newsModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true }),
            this.newsModel.countDocuments(filter),
        ]);
        const dataWithId = data.map((item: any) => ({
            ...item,
            id: item.id || item._id?.toString(),
        }));
        const lastPage = Math.ceil(total / limit);
        return { data: dataWithId, total, page, lastPage };
    }

    async validateNews(id: string, validateNewsDTO: ValidateNewsDTO, user: User): Promise<News> {
        const news = await this.newsModel.findById(id);
        if (!news) {
            throw new NotFoundException("News not found.");
        }

        if (user.role !== "admin" && news.irisCode !== user.irisCode) {
            throw new ForbiddenException("Not allowed to validate news from another iris.");
        }

        if (news.authorId !== user.id && user.role !== "admin" && user.role !== "moderator") {
            throw new ForbiddenException("You are not allowed to validate this news.");
        }
        
        if (validateNewsDTO.validated) {
            news.status = "APPROVED";
            news.rejectionReason = undefined;
            news.published = true;
        } else {
            news.status = "REJECTED";
            news.rejectionReason = validateNewsDTO.rejectionReason;
            news.published = false;
        }
        return news.save();
    }

    async findAllPublished(page = 1, limit = 10): Promise<{ data: News[]; total: number; page: number; lastPage: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.newsModel.find({ status: "APPROVED", published: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.newsModel.countDocuments({ status: "APPROVED", published: true }),
        ]);
        const lastPage = Math.ceil(total / limit) || 1;
        return { data, total, page, lastPage };
    }
}
