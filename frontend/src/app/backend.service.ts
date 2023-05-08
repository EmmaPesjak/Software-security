import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Post } from './post';
import { User } from './user';
import { CookieService } from 'ngx-cookie-service';

// Allow the service to be visible in the entire app.
@Injectable({
  providedIn: 'root'
})

/**
 * Class responsible for communication with the backend.
 */
export class BackendService {
  readonly API_URL: string = "http://localhost:3000"; // TODO: Correct url here!!!

  constructor(private cookieService: CookieService, private http: HttpClient) {}

  /**
   * Logs in the specified user.
   * @param userName The user's username.
   * @returns A promise that resolves to a logged in user.
   */
  login(userName: string, password: string): Observable<any> {
    const endpoint = this.API_URL + "/api/users/" + userName,
    body = {
      password: password,
    },
    options: {headers: any; observe: any; withCredentials: any} = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      observe: "response",
      withCredentials: true,
    };
    return this.http.post(endpoint, body, options);
  }

  /**
   * Get all posts.
   * @returns A promise that resolves to an array of posts.
   */
  getPosts(): Observable<any> {
    const endpoint = this.API_URL + "/api/users/" + this.cookieService.get('username') + "/posts",
    options: {headers: any; observe: any; withCredentials: any} = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      observe: "response",
      withCredentials: true,
    };
    return this.http.get(endpoint, options);
  }

  /**
   * Get all liked posts.
   * @returns 
   */
  getLikedPosts(): Observable<any> {
    const endpoint = this.API_URL + "/api/posts/liked/" + this.cookieService.get('userid'),
    options: {headers: any; observe: any; withCredentials: any} = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      observe: "response",
      withCredentials: true,
    };
    return this.http.get(endpoint, options);
  }

  /**
   * Add (POST) a post.
   * @param post is the post with all its attributes to add.
   * @returns a Promise that resolves to an added post.
   */
  addPost(contenthej: string) {
    const endpoint = this.API_URL + '/api/posts';
    const body = {
      content: contenthej,
      username: this.cookieService.get('username'),
    };
    const options = {
      withCredentials: true
    };
    const responseObservable = this.http.post<Post>(endpoint, body, options);
    const responsePromise = firstValueFrom(responseObservable);
    return responsePromise;
  }

  /**
   * Delete a specific post.
   * @param post is the post to delete.
   * @returns a Promise that resolves to the deleted post.
   */
  deletePost(post: Post) {
    const endpoint = this.API_URL + '/api/posts/' + post.postId;
    const options = {
      withCredentials: true
    };
    const responseObservable = this.http.delete<Post>(endpoint, options);
    const responsePromise = firstValueFrom(responseObservable);
    return responsePromise;
  }

  /**
   * Likes a specific post.
   * @param post is the post to like.
   * @returns a Promise that resolves to the liked post.
   */
  likePost(post: Post) {
    const endpoint = this.API_URL + '/api/posts/like/' + post.postId;
    const body = {
      postId: post.postId,
      user: post.user
    };

    const options = {
      withCredentials: true
    };
    const responseObservable = this.http.post<Post>(endpoint, body, options);
    const responsePromise = firstValueFrom(responseObservable);
    return responsePromise;
  }

  /**
   * Dislikes a specific post.
   * @param post is the post to dislike.
   * @returns a Promise that resolves to the disliked post.
   */
  dislikePost(post: Post) {
    const endpoint = this.API_URL + '/api/posts/dislike/' + post.postId;
    const body = {
      postId: post.postId,
      user: post.user
    };
    const options = {
      withCredentials: true
    };
    const responseObservable = this.http.post<Post>(endpoint, body, options);
    const responsePromise = firstValueFrom(responseObservable);
    return responsePromise;
  }

  /**
   * Add (POST) a user.
   * @param user is the user with all its attributes to add.
   * @returns a Promise that resolves to an added user.
   */
  addUser(user: User) {
    const endpoint = this.API_URL + '/api/users';
    const body = {
      name: user.name,
      userName: user.userName,
      email: user.email,
      password: user.password
    };
    const responseObservable = this.http.post<User>(endpoint, body);
    const responsePromise = firstValueFrom(responseObservable);
    return responsePromise;
  }

  /**
   * Edit a post.
   * @param post post with new content.
   * @returns a Promise that resolves to edited post.
   */
  editPost(post: Post) {
    const endpoint = this.API_URL + '/api/posts/' + post.postId;
    const body = {
      content: post.content,
      user: post.user  
    }
    const options = {
      withCredentials: true
    };
    
    const responseObservable = this.http.patch<Post>(endpoint, body, options);
    const responsePromise = firstValueFrom(responseObservable);
    return responsePromise;
  }
}
