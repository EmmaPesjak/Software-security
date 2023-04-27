import { Component, EventEmitter, Output } from '@angular/core';
import { BackendService } from '../backend.service';
import { Post } from '../post';
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})

/**
 * Component for adding posts.
 */
export class AddPostComponent {

  postId?: number;
  user: string;
  name: string;
  content: string;

  message: string | undefined;

  // Emitter for telling the post list in the parent component that a new post has been added.
  @Output() newPostEvent: EventEmitter<Post>;

  constructor(private backend: BackendService) {
    this.postId = undefined;
    this.user = "";
    this.name = "";
    this.content = "";
    this.newPostEvent = new EventEmitter<Post>();
  }

  /**
   * Method for adding a post, communicate all input to the backend service.
   * Since the required attribute is used in each form item in the HTML, no further validation of the
   * user input is needed here.
   */
  addPost() {
    let addPostPromise: Promise<Post>;

    addPostPromise = this.backend.addPost({
      postId: this.postId ?? 0,
      user: this.user,
      name: this.name,
      content: this.content,
      likes: 0,
      dislikes: 0
    });

    // Call the handle methods depending on the outcome of the promise.
    addPostPromise
      .then(post => this.handleAddedPost(post))
      .catch(error => this.handleError(error));
  }

  /**
   * Clears the user input and displays a message that the post has been added.
   * @param post is the post that has been added.
   */
  handleAddedPost(post: Post) {

    // Clear user input.
    this.postId = undefined;
    this.user = "";
    this.name = "";
    this.content = "";

    // Create and display a success message.
    const message: string = `The post ${post.postId} was added`;
    this.displayMessage(message);

    // Emit the post so that the parent component can update the list of posts.
    this.newPostEvent.emit(post)
  }

  /**
   * Handles errors when adding posts.
   * @param error is the error thrown by the client.
   */
  handleError(error: HttpErrorResponse) {
    console.error(`error adding post: ${error.status} ${error.statusText}`);
    const message: string = error.message;
    // Display the error message.
    this.displayMessage(message);
  }

  /**
   * Displays a message when the user is trying to add a post.
   * @param message is the message to display.
   */
  displayMessage(message: string) {
    this.message = message; // Hides the message if message parameter is undefined.

    // Set a timeout that ensures that the message is only displayed for 5 seconds.
    setTimeout(() => {
      this.message = undefined; 
    },
      5000);
  }
}
