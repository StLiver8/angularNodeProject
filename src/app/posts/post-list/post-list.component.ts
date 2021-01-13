import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from "rxjs";

import { PostModel } from "../post.model";
import { PostsService } from "../posts.service";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
  posts: PostModel[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private subPost: Subscription;
  private authStatusSub: Subscription;

  constructor(public postsService: PostsService,
              private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.subPost = this.postsService
      .getPostsUpdateListener()
      .subscribe((postData: { posts: PostModel[], postCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(itemId: string) {
    this.isLoading = true;
    this.postsService.deletePost(itemId)
      .subscribe(() => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage)
      }, () => {
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.subPost.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
