import { Component, Output } from '@angular/core';
import { BackendService } from '../backend.service';
import { User } from '../user';
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

/**
 * Component for adding users.
 */
export class RegisterComponent {

  // TODO: password repeat validation
  // TODO: userID

  userId?: number;
  name: string;
  userName: string;
  email: string;
  password: string;
  passwordRepeat: string;

  message: string | undefined;

  constructor(private backend: BackendService) {
    this.userId = undefined;
    this.name = "";
    this.userName = "";
    this.email = "";
    this.password = "";
    this.passwordRepeat = "";
  }

  /**
   * Method for adding a user, communicate all input to the backend service.
   * Since the required attribute is used in each form item in the HTML, no further validation of the
   * user input is needed here.
   */
  addUser() {
    let addUserPromise: Promise<User>;

    addUserPromise = this.backend.addUser({
      userId: this.userId ?? 0,
      name: this.name,
      userName: this.userName,
      email: this.email,
      password: this.password
    });

    // Call the handle methods depending on the outcome of the promise.
    addUserPromise
      .then(user => this.handleAddedUser(user))
      .catch(error => this.handleError(error));
  }

  /**
   * Clears the user input and displays a message that the user has been added.
   * @param user is the user that has been added.
   */
  handleAddedUser(user: User) {

    // Clear user input.
    this.userId = undefined;
    this.name = "";
    this.userName = "";
    this.email = "";
    this.password = "";
    this.passwordRepeat = "";

    // Create and display a success message.
    const message: string = `The user ${user.name} was added`;
    this.displayMessage(message);
  }

  /**
   * Handles errors when adding users.
   * @param error is the error thrown by the client.
   */
  handleError(error: HttpErrorResponse) {
    console.error(`error adding user: ${error.status} ${error.statusText}`);
    const message: string = error.error.message;
    console.log(error);
    // Display the error message.
    this.displayMessage(message);
  }

  /**
   * Displays a message when the user is trying to add a user.
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
