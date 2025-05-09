import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashPostDTO } from './create-flash-post.dto';

export class UpdateFlashPostDTO extends PartialType(CreateFlashPostDTO) { }
