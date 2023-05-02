import { Component } from '@angular/core';
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

  constructor(private backend: BackendService) {
    this.content = "";
    this.posts = [];
  }

  /**
   * Get the posts on init.
   */
  ngOnInit(): void {
    this.loggedinUser = this.backend.getUsername();
    this.getPosts();
    
  }

  /**
   * Get the courses for the table element from the backend.
   */
  getPosts() {
    this.backend.getPosts().subscribe((response) => {
      this.posts = response.body;
      // TODO Implement error handling? See the original code below.
    });
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
  showEdit(postID: number) {
    this.showEditBox = true;
    this.postID = postID;
  }

  /**
   * Edit a post.
   */
  submitEdit() {
    // Här får man ju lägga till så att det faktiskt submittar
    this.showEditBox = false;
    this.postID = -1;
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

        // Do nothing if the restaurant does not exist.
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
}
