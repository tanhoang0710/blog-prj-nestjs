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
}
