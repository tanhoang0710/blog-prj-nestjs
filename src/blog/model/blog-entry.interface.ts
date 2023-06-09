import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/user/models/user.interface';

export class BlogEntry {
  id?: number;

  @ApiPropertyOptional()
  title?: string;

  slug?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  body?: string;

  createdAt?: Date;

  updatedAt?: Date;

  likes?: number;

  author?: User;

  headerImage?: string;

  publishedDate?: Date;

  isPublished?: boolean;
}
