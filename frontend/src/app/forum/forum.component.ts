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
  likedPosts: Post[];

  showAddBox = false;

  searchText: string = "";

  loggedinUser = "";

  content: string;

  // Current post for editing.
  //currentPost : Post |undefined;
  currentPostId = -1;

  constructor(private backend: BackendService, private cookieService: CookieService, private router: Router) {
    this.content = "";
    this.posts = [];
    this.likedPosts = [];
  }

  /**
   * Get the posts on init.
   */
  ngOnInit(): void {
    this.loggedinUser = this.cookieService.get('username');
    this.getPosts();
    //this.getLikedPosts();  // #TODO KIRRA FORFEN
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
   * Get the users liked post. 
   */
  getLikedPosts(){
    // Get liked posts.
    this.backend.getLikedPosts().subscribe(
      (response) => {
        this.likedPosts = response.body;

        this.posts.forEach(post => {
          // Check if the post is in the likedPosts array
          if (this.likedPosts.some(likedPost => likedPost.postId === post.postId)) {
            // Set the `liked` flag to `true`
            post.likedByUser = true;
          } else {
            post.likedByUser = false;
          }
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  isPostLiked(post: Post): boolean {
    return this.likedPosts.some(likedPost => likedPost.postId === post.postId);
  }

  /**
   * Method for filtering the posts based on the inputted search text.
   * @param searchValue is the text input.
   */
  onSearchTextChanged(searchValue: string): void {
    this.searchText = searchValue;
  }

  // #TODO the view only updates the content, but not the other associated info to post. getPost???
  onNewPost(newPost: Post) {
    // Update the list of posts with the new post
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
   * Method for showing the edit post box.
   */
  showEdit(post: Post) {

    // Set current post to the one to be edited.
    //this.currentPost = post;
    this.currentPostId = post.postId;
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
    })   // #TODO don't catch error??? the error is most likely that the user hasnt disliked before (see backend code)
    .catch(error => console.error(`An error occurred when liking the post: ${error.message}`));
  }

  /**
   * Dislikes a specific post.
   * @param post is the post.
   */
  dislike(post: Post) {
    this.backend.dislikePost(post)
    .then(() => {
      this.getPosts();
    }) // #TODO don't catch error??? the error is most likely that the user hasnt liked before (see backend code)
    .catch(error => console.error(`An error occurred when disliking the post: ${error}`));
  }

  logout(): void {
    this.cookieService.delete('numberOfLoginAttemps');
    this.cookieService.delete('username');
    this.router.navigate(['/']);
  }
}
