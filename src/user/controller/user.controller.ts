import { v4 as uuidv4 } from 'uuid';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { UserIsUserGuard } from 'src/auth/guards/userIsUser.guard';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileImages',
    filename: (req: Request, file: any, cb: any) => {
      const fileName: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${fileName}${extension}`);
    },
  }),
};

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User | object> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }

  @Post('login')
  login(@Body() user: User): Observable<object> {
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<User> {
    return this.userService.findOne(id);
  }

  @Get()
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'username',
    required: false,
  })
  index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('username') username: string,
  ): Observable<Pagination<User>> {
    console.log(
      '🚀 ~ file: user.controller.ts:71 ~ UserController ~ username:',
      username,
    );
    limit = limit > 100 ? 100 : limit;

    if (username === null || username === undefined)
      return this.userService.paginate({
        page,
        limit,
        route: 'http://localhost:3000/api/users',
      });
    return this.userService.paginateFilterByUserName(
      {
        page,
        limit,
        route: 'http://localhost:3000/api/users',
      },
      { username },
    );
  }

  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.userService.deleteOne(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard, UserIsUserGuard)
  @ApiBearerAuth('JWT-auth')
  updateOne(@Param('id') id: number, @Body() user: User): Observable<any> {
    return this.userService.updateOne(id, user);
  }

  @Put(':id/role')
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  updateRoleOfUser(
    @Param('id') id: string,
    @Body() user: User,
  ): Observable<User> {
    return this.userService.updateRoleOfUser(Number(id), user);
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Observable<object> {
    const user: User = req.user?.user;

    return this.userService
      .updateOne(user.id, {
        profileImage: file.filename,
      })
      .pipe(
        tap((user: User) => console.log(user)),
        map((user: User) => ({
          profileImage: user.profileImage,
        })),
      );
  }

  @Get('profile-image/:imagename')
  @ApiParam({
    name: 'imagename',
  })
  findProfileImage(
    @Param('imagename') imagename: any,
    @Res() res: any,
  ): Observable<object> {
    return of(
      res.sendFile(
        path.join(process.cwd(), 'uploads/profileImages/' + imagename),
      ),
    );
  }
}
