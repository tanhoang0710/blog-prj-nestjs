import { Injectable } from '@nestjs/common';
import { User } from 'src/user/models/user.interface';
import { BlogEntry } from './model/blog-entry.interface';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntryEntity } from './model/blog-entry.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/service/user.service';
import slugify from 'slugify';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
    private userService: UserService,
  ) {}

  create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return from(this.blogRepository.save(blogEntry));
      }),
    );
  }

  findAll(): Observable<BlogEntry[]> {
    return from(
      this.blogRepository.find({
        relations: ['author'],
      }),
    );
  }

  findByUser(userId: number): Observable<BlogEntry[]> {
    return from(
      this.blogRepository
        .createQueryBuilder('blog-entry')
        .leftJoinAndSelect('blog-entry.author', 'user')
        .where('blog-entry.author = :author', { author: userId })
        .getMany(),
    ).pipe(map((blogEntries: BlogEntry[]) => blogEntries));
  }

  findOne(id: number): Observable<BlogEntry> {
    return from(
      this.blogRepository.findOne({
        where: {
          id,
        },
        relations: ['author'],
      }),
    );
  }

  updateOne(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
    return from(this.blogRepository.update(id, blogEntry)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.blogRepository.delete(id));
  }

  generateSlug(title: string): Observable<string> {
    return of(slugify(title));
  }
}
