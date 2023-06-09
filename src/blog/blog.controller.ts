import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { Observable } from 'rxjs';
import { BlogEntry } from './model/blog-entry.interface';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

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

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: false,
  })
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(id);
  }
}
