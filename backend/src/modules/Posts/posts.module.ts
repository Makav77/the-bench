import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PermissionsModule } from '../Permissions/permissions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Posts]),
        PermissionsModule,
    ],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService]
})

export class PostsModule { }
