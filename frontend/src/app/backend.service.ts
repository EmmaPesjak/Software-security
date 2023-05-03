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
   * Add (POST) a post.
   * @param post is the post with all its attributes to add.
   * @returns a Promise that resolves to an added post.
   */
  addPost(post: Post) {
    const endpoint = this.API_URL + '/api/posts';
    const body = {
      user: post.user,
      content: post.content
    };
    const responseObservable = this.http.post<Post>(endpoint, body);
    const responsePromise = firstValueFrom(responseObservable);
    return responsePromise;
  }

  /**
   * Delete a specific post.
   * @param postId is the ID of the post to delete.
   * @returns a Promise that resolves to the deleted post.
   */
  deletePost(post: Post) {
    const endpoint = this.API_URL + '/api/posts/' + post.postId;
    const responseObservable = this.http.delete<Post>(endpoint);
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

  // TODO: POST like
  // TODO: POST dislike
  // TODO: login?
  // TODO: PUT (update) post/messsage (om vi satsar på A)
}
