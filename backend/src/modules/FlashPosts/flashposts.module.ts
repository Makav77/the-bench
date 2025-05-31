import { FlashPostsService } from './flashposts.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashPostsController } from './flashposts.controller';
import { FlashPost } from './entities/flash-post.entity';
import { PermissionsModule } from '../Permissions/permissions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([FlashPost]),
        PermissionsModule,
    ],
    controllers: [FlashPostsController],
    providers: [FlashPostsService],
    exports: [FlashPostsService]
})

export class FlashpostsModule { }
