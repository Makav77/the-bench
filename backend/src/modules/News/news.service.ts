import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { News, NewsDocument } from "./news.schema";
import { CreateNewsDTO } from "./dto/create-news.dto";
import { UpdateNewsDTO } from "./dto/update-news.dto";

@Injectable()
export class NewsService {
    constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) {}

    async findAllNews(page = 1, limit = 5): Promise<{ data: News[]; total: number; page: number; lastPage: number; }> {
        const skip = (page - 1) * limit;
        const total = await this.newsModel.countDocuments();
        const data = await this.newsModel
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

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

    async createNews(createNewsDTO: CreateNewsDTO): Promise<News> {
        const createdNews = new this.newsModel(createNewsDTO);
        return await createdNews.save();
    }

    async updateNews(id: string, updateNewsDTO: UpdateNewsDTO): Promise<News> {
        const updatedNews = await this.newsModel.findByIdAndUpdate(id, updateNewsDTO, { new: true }).exec();
        if (!updatedNews) {
            throw new NotFoundException("News not found for updating");
        }
        return updatedNews;
    }

    async removeNews(id: string): Promise<void> {
        const removed = await this.newsModel.findByIdAndDelete(id).exec();
        if (!removed) {
            throw new NotFoundException("News not found for removing")
        }
    }

    async toggleLike(newsId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }> {
        const news = await this.newsModel.findById(newsId);
        if (!news) {
            throw new NotFoundException("News not found");
        }

        const index = news.likedBy.indexOf(userId);
        let liked: boolean;
        if (index > -1) {
            news.likedBy.splice(index, 1);
            liked = false;
        } else {
            news.likedBy.push(userId);
            liked = true;
        }

        await news.save();
        return { liked, totalLikes: news.likedBy.length };
    }

    async getLikes(newsId: string, userId: string): Promise<{ totalLikes: number; liked: boolean }> {
        const news = await this.newsModel.findById(newsId).lean();
        if (!news) {
            throw new NotFoundException("News not found");
        }

        return { totalLikes: news.likedBy.length, liked: news.likedBy.includes(userId) };
    }
}
