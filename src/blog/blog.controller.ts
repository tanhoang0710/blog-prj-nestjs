import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { Observable } from 'rxjs';
import { BlogEntry } from './model/blog-entry.interface';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserIsAuthorGuard } from './guards/userIsAuthor.guard';

@Controller('blogs')
@ApiTags('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @UseGuards(JwtGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  create(@Body() blogEntry: BlogEntry, @Req() req: any): Observable<BlogEntry> {
    const user = req.user.user;
    return this.blogService.create(user, blogEntry);
  }

  @Get()
  @ApiQuery({
    name: 'userId',
    required: false,
  })
  findBlogEntries(@Query('userId') userId: number): Observable<BlogEntry[]> {
    if (userId == null) {
      return this.blogService.findAll();
    }
    return this.blogService.findByUser(userId);
  }

  @Get('/pageable')
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  index(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateAll({
      limit,
      page,
      route: 'http://localhost:3000/api/blogs',
    });
  }

  @Get('/pageable/user/:userId')
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiParam({
    name: 'userId',
    required: false,
  })
  indexByUser(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateByUser(
      {
        limit,
        page,
        route: 'http://localhost:3000/api/blogs',
      },
      userId,
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(id);
  }

  @UseGuards(JwtGuard, UserIsAuthorGuard)
  @Put(':id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiBearerAuth('JWT-auth')
  updateOne(
    @Param('id') id: number,
    @Body() blogEntry: BlogEntry,
  ): Observable<BlogEntry> {
    return this.blogService.updateOne(Number(id), blogEntry);
  }

  @UseGuards(JwtGuard, UserIsAuthorGuard)
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiBearerAuth('JWT-auth')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.blogService.deleteOne(Number(id));
  }
}
