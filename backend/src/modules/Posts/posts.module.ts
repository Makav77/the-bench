import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PermissionsModule } from '../Permissions/permissions.module';
import { createInjectServiceMiddleware } from '../Utils/inject-resource-service.middleware';
import { LoadPostResourceMiddleware } from './middlewares/load-post-resource.middleware';

const InjectPostsServiceMiddleware = createInjectServiceMiddleware("postsService", PostsService);

@Module({
    imports: [
        TypeOrmModule.forFeature([Posts]),
        PermissionsModule,
    ],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService]
})

export class PostsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(InjectPostsServiceMiddleware, LoadPostResourceMiddleware)
            .forRoutes({ path: "posts/:id", method: RequestMethod.ALL });
    }
}
