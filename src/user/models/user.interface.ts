import { ApiProperty } from '@nestjs/swagger';
import { BlogEntry } from 'src/blog/model/blog-entry.interface';

export class User {
  id?: number;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  username?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  password?: string;

  role?: UserRole;

  profileImage?: string;
  blogEntries?: BlogEntry[];
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  CHIEFEDITOR = 'chiefeditor',
  USER = 'user',
}
