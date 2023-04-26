import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Post } from './post';
import { User } from './user';

// Allow the service to be visible in the entire app.
@Injectable({
  providedIn: 'root'
})

/**
 * Class responsible for communication with the backend.
 */
export class BackendService {

  readonly API_URL = "http://localhost:3000"; // TODO: Correct url here!!!

  constructor(private http: HttpClient) { }

  /**
   * Get all posts.
   * @returns a Promise that resolves to an array of posts.
   */
  getPosts(): Promise<Post[]> {
    const endpoint = this.API_URL + '/api/posts';
    const responseObservable = this.http.get<Post[]>(endpoint);
    const responsePromise = firstValueFrom(responseObservable);
    return responsePromise;
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
      content: post.content,
      likes: post.likes,
      dislikes: post.dislikes
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
  deletePost(postId: string) {
    const endpoint = this.API_URL + '/api/posts/' + postId;
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
