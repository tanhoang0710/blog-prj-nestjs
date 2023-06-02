import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, catchError, map, of } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

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
  @UseGuards(JwtGuard, RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  findAll(): Observable<User[]> {
    return this.userService.findAll();
  }

  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.userService.deleteOne(id);
  }

  @Put(':id')
  updateOne(@Param('id') id: number, @Body() user: User): Observable<any> {
    return this.userService.updateOne(id, user);
  }
}
