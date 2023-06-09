import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, map, switchMap } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { BlogService } from '../blog.service';
import { User } from 'src/user/models/user.interface';
import { BlogEntry } from '../model/blog-entry.interface';

@Injectable()
export class UserIsAuthorGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private blogService: BlogService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user.user;
    const blogEntryId: number = request.params.id;
    return this.userService.findOne(user.id).pipe(
      switchMap((user: User) =>
        this.blogService.findOne(blogEntryId).pipe(
          map((blogEntry: BlogEntry) => {
            let hasPermission = false;

            if (user.id === blogEntry.author.id) {
              hasPermission = true;
            }

            return user && hasPermission;
          }),
        ),
      ),
    );
  }
}
