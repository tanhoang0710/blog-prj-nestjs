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
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, catchError, map, of } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';

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
  index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    return this.userService.paginate({
      page,
      limit,
      route: 'http://localhost:3000/api/users',
    });
  }

  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.userService.deleteOne(id);
  }

  @Put(':id')
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
}
