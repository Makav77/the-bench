import { FlashPostsService } from './flashposts.service';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashPostsController } from './flashposts.controller';
import { FlashPost } from './entities/flash-post.entity';
import { PermissionsModule } from '../Permissions/permissions.module';
import { createInjectServiceMiddleware } from '../Utils/inject-resource-service.middleware';
import { LoadFlashPostResourceMiddleware } from './middlewares/load-flashpost-resource.middleware';

const InjectFlashPostServiceMiddleware = createInjectServiceMiddleware("flashPostsService", FlashPostsService);

@Module({
    imports: [
        TypeOrmModule.forFeature([FlashPost]),
        PermissionsModule,
    ],
    controllers: [FlashPostsController],
    providers: [FlashPostsService],
    exports: [FlashPostsService]
})

export class FlashpostsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(InjectFlashPostServiceMiddleware, LoadFlashPostResourceMiddleware)
            .forRoutes({ path: "flashposts/:id", method: RequestMethod.ALL });
    }
}
