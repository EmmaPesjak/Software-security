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

  // Create list of all posts.
  posts: Post[];

  showAddBox = false;
  showEditBox = false;
  postID = -1;

  searchText: string = "";

  loggedinUser = "";

  content: string;

  // Current post for editing.
  currentPost : Post |undefined;

  constructor(private backend: BackendService, private cookieService: CookieService, private router: Router) {
    this.content = "";
    this.posts = [];
    this.currentPost;
  }

  /**
   * Get the posts on init.
   */
  ngOnInit(): void {
    this.loggedinUser = this.cookieService.get('username');
    this.getPosts();
  }

  /**
   * Get the courses for the table element from the backend.
   */
  getPosts() {

    // Get posts. If there was an error, redirect to home.
    this.backend.getPosts().subscribe(
      (response) => {
        this.posts = response.body;
      },
      (error) => {
        console.log(error);
        this.router.navigate(['']);
      }
    );
    //In this example, the second argument is an error handling function that logs the error to the console. You can replace console.log(error) with your desired error handling code.
    //this.backend.getPosts().subscribe((response) => {
    //  this.posts = response.body;
      // TODO Implement error handling? See the original code below.
    //});
    // this.backend.getPosts()
    // .then((posts) => {
    //   console.log(posts);
    //   // this.posts = posts;
    // })
    // .catch((error) => console.error(`An error occurred getting all posts: ${error}`));
  }

  /**
   * Method for filtering the posts based on the inputted search text.
   * @param searchValue is the text input.
   */
  onSearchTextChanged(searchValue: string): void {
    this.searchText = searchValue;
  }

  /**
   * Method for showing the add post component.
   * The showAddBox boolean is set to true to make the child visible.
   */
  showAdd() {
    this.showAddBox = true;
  }

  /**
   * Method for showing the edit post box.
   * The showAddBox boolean is set to true to make the box visible.
   */
  showEdit(post: Post) {
    this.showEditBox = true;

    // Set current post to the one to be edited.
    this.currentPost = post;
  }

  /**
   * Edit a post.
   */
  submitEdit() {
    // Här får man ju lägga till så att det faktiskt submittar
    this.showEditBox = false;

    // Fattar inte men ok tjena mvh Ebba
    this.postID = -1;

    // If there is a current post, assign new content to post.
    if (this.currentPost){
      this.currentPost.content = this.content;
      this.backend.editPost(this.currentPost)
      .then(() => {
        this.getPosts();
      })
      .catch(error => console.error(`An error occurred when editing the post: ${error}`));
    }
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
    .catch(error => console.error(`An error occurred when liking the post: ${error}`));
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
    .catch(error => console.error(`An error occurred when disliking the post: ${error}`));
  }

  //TODO: obs! just nu kan man likea/dislikea hur som helst!

  logout(): void {
    this.cookieService.delete('numberOfLoginAttemps');
    this.cookieService.delete('username');
    this.router.navigate(['/']);
  }
}
