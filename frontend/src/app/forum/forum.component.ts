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
   * Method for the details buttons, passes the restaurant to the child 
   * component restaurant-info in the HTML which displays all details of the restaurant. 
   * The showInfo boolean is set to true to make the child visible.
   * @param restaurant is the reataurant to be displayed.
   */
  showAdd() {
    this.showAddBox = true;
  }
}
