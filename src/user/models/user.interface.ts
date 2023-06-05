import { ApiProperty } from '@nestjs/swagger';

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
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  CHIEFEDITOR = 'chiefeditor',
  USER = 'user',
}
