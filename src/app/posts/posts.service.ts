import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { environment } from "../../environments/environment";
import { PostModel } from "./post.model";

const BACKEND_URL =  environment.apiUrl + '/posts/';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: PostModel[] = [];
  private postsUpdated = new Subject<{ posts: PostModel[], postCount: number }>();

  constructor(private http: HttpClient,
              private router: Router) {}

  getPosts(postPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postPerPage}&page=${currentPage}`;
    this.http.get<{ massage: string, posts: any, maxPosts: number }>(BACKEND_URL + queryParams)
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator
              }
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostsData => {
        this.posts = transformedPostsData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postCount: transformedPostsData.maxPosts });
      });
  }

  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    // return { ...this.posts.find(post => post.id === id) };
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<{ massage: string, post: PostModel }>(BACKEND_URL, postData)
      .subscribe(resData => {
        this.router.navigate(['/'])
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let post: PostModel | FormData;
    if (typeof(image) === 'object') {
      post = new FormData();
      post.append('id', id);
      post.append('title', title);
      post.append('content', content);
      post.append('image', image, title);
    } else {
      post = {
        id, title, content,
        imagePath: image,
        creator: null
      }
    }
    this.http.put(BACKEND_URL + id, post)
      .subscribe(response => {
        this.router.navigate(['/'])
      })
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
