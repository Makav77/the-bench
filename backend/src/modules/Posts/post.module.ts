import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { PostsService } from './post.service';
import { PostsController } from './post.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Posts])],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostModule {}
