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

    async findAllNews(page = 1, limit = 5): Promise<{ data: (News & { totalLikes: number })[]; total: number; page: number; lastPage: number }> {
        const skip = (page - 1) * limit;
        const [newsList, total] = await Promise.all([
            this.newsModel
                .find({ status: "APPROVED", published: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true }),
            this.newsModel.countDocuments({ status: "APPROVED", published: true }),
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
        });
        return news.save();
    }

    async updateNews(id: string, updateNewsDTO: UpdateNewsDTO): Promise<News> {
        const updatedNews = await this.newsModel
            .findByIdAndUpdate(id, updateNewsDTO, { new: true })
            .exec();
        if (!updatedNews) {
            throw new NotFoundException("News not found for updating");
        }
        return updatedNews;
    }

    async removeNews(id: string): Promise<void> {
        const removed = await this.newsModel.findByIdAndDelete(id).exec();
        if (!removed) {
            throw new NotFoundException("News not found for removing");
        }
    }

    async toggleLike(newsId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }> {
        const news = await this.newsModel.findById(newsId);
        if (!news) {
            throw new NotFoundException("News not found");
        }

        const index = news.likedBy.indexOf(userId);
        const liked = index === -1;
        if (liked) {
            news.likedBy.push(userId);
        } else {
            news.likedBy.splice(index, 1);
        }

        await news.save();
        return { liked, totalLikes: news.likedBy.length };
    }

    async getLikes(newsId: string, userId: string): Promise<{ totalLikes: number; liked: boolean }> {
        const news = await this.newsModel.findById(newsId).lean();
        if (!news) {
            throw new NotFoundException("News not found");
        }
        return {
            totalLikes: news.likedBy.length,
            liked: news.likedBy.includes(userId),
        };
    }

    async findPendingNews(page = 1, limit = 5): Promise<{ data: News[]; total: number; page: number; lastPage: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.newsModel
                .find({ status: "PENDING" })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true }),
            this.newsModel.countDocuments({ status: "PENDING" }),
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
