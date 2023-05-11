import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { BackendService } from '../backend.service';
import { Post } from '../post';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent {
  posts: Post[];

  showAddBox = false;
  searchText: string = "";
  loggedinUser = "";
  content: string;

  // The ID of the post to be edited.
  currentPostId = -1;

  constructor(private backend: BackendService, private cookieService: CookieService, private router: Router) {
    this.content = "";
    this.posts = [];
  }

  /**
   * Get the posts on init.
   */
  ngOnInit(): void {
    this.loggedinUser = this.cookieService.get('username');
    this.getPosts();
    // this.getLikedPosts();
    // this.mapPosts();
  }

  /**
   * Get the posts for the table element from the backend.
   */
  getPosts() {
    // Get posts. If there is an error, redirect to home.
    this.backend.getPosts().subscribe(
      (response) => {
        this.posts = response.body;
      },
      (exception) => {
        console.log(exception.error);
        this.router.navigate(['']);
      }
    );
  }

  // /**
  //  * Get the users liked post.
  //  */
  // getLikedPosts(){
  //   // Get liked posts.
  //   this.backend.getLikedPosts().subscribe(
  //     (response) => {
  //       this.likedPosts = response.body;
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // }

  // /**
  //  * Flag if post is liked or not.
  //  */
  // mapPosts(){
  //   this.posts.forEach(post => {
  //     // Check if the post is in the likedPosts array
  //     if (this.likedPosts.some(likedPost => likedPost.postId === post.postId)) {
  //       // Set the `liked` flag to `true`
  //       post.likedByUser = true;
  //     } else {
  //       post.likedByUser = false;
  //     }
  //   });
  // }

  // /**
  //  * Check if post is liked.
  //  * @param post
  //  * @returns
  //  */
  // isPostLiked(post: Post): boolean {
  //   return this.likedPosts.some(likedPost => likedPost.postId === post.postId);
  // }

  /**
   * Method for filtering the posts based on the inputted search text.
   * @param searchValue is the text input.
   */
  onSearchTextChanged(searchValue: string): void {
    this.searchText = searchValue;
  }

  /**
   * Updates the list of posts with the new post and updates the page.
   * @param newPost is the new post.
   */
  onNewPost(newPost: Post) {
    this.posts.push(newPost);
    this.getPosts();
  }

  /**
   * Method for showing the add post component.
   * The showAddBox boolean is set to true to make the child visible.
   */
  showAdd() {
    if (this.showAddBox) {
      this.showAddBox = false;
    } else {
      this.showAddBox = true;
    }
  }

  /**
   * Sets the given post to be edited.
   */
  showEdit(post: Post) {
    this.currentPostId = post.postId;
    this.content = post.content;
  }

  /**
   * Edit a post.
   */
  submitEdit() {
    // Find the index of the post being edited using currentPostId.
    const index = this.posts.findIndex(post => post.postId === this.currentPostId);

    // Update the content of the post at that index.
    if (index !== -1) {
      this.posts[index].content = this.content;


      // Call the backend service to update the post in the database.
      this.backend.editPost(this.posts[index])
        .then(() => {
          this.getPosts();
        })
        .catch(error => console.error(`An error occurred when editing the post: ${error}`));
    }

    // Reset the currentPostId.
    this.currentPostId = -1;
    // Reset content.
    this.content = "";
  }

  /**
   * Delete a post on the forum.
   * @param post is the post to delete.
   */
  deletePost(post: Post) {
    this.backend.deletePost(post)
      .then(() => {
        // Get the index of the post in the array.
        const postIndex = this.posts.findIndex(postInArray => postInArray.postId == post.postId);

        // Do nothing if the post does not exist.
        if (postIndex == -1) {
          return;
        }

        //Remove it from the array.
        this.posts.splice(postIndex, 1);
      })
      .catch(error => console.error(`An error occurred when deleting the post: ${error}`));
  }

  /**
   * Likes a specific post.
   * @param post is the post.
   */
  like(post: Post) {
    this.backend.likePost(post)
    .then(() => {
      this.getPosts();
    })
    .catch((exception) => console.error(`An error occurred when liking the post: ${exception.error}.`));
  }

  /**
   * Dislikes a specific post.
   * @param post is the post.
   */
  dislike(post: Post) {
    this.backend.dislikePost(post)
    .then(() => {
      this.getPosts();
    })
    .catch((exception) => console.error(`An error occurred when disliking the post: ${exception.error}.`));
  }

  /**
   * Logs out the user.
   */
  logout(): void {
    console.log("HOLA");
    this.backend.logout().subscribe((data) => {
      // Clears the cookies set by the client.
      this.cookieService.deleteAll('/');
      this.router.navigate(['/']);
    }, (exception) => {
      console.log(exception.error); // TODO Add error handling.
    });
  }
}
