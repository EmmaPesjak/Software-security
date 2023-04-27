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

  showAddBox= false;

  searchText: string = "";

  constructor(private backend: BackendService) {
    this.posts = []; 
  }

  /**
   * Get the posts on init.
   */
  ngOnInit(): void {
    this.getPosts();
  }

  /**
   * Get the courses for the table element from the backend.
   */
  getPosts() {
    this.backend.getPosts()
      .then(posts => {
        this.posts = posts;
      })
      .catch(error => console.error(`An error occurred getting all posts: ${error}`));
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

  deletePost(post: Post) {
    this.backend.deletePost(post)
      .then(() => {

        // Get the index of the post in the array.
        const postIndex = this.posts.findIndex(
          
          postInArray => postInArray.postId == post.postId);
        

        // Do nothing if the restaurant does not exist.
        if (postIndex == -1) {
          return;
        }

        //Remove it from the array.
        this.posts.splice(postIndex, 1);
      })
      .catch(error => console.error(`An error occurred when deleting the post: ${error}`));
  }
}
