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
 * Component for registering/adding users.
 */
export class RegisterComponent {
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
   */
  addUser() {
    // Ensure that the password and repeated password matches.
    if (this.password !== this.passwordRepeat) {
      this.displayMessage("Passwords do not match");
      return;
    }

    // Verify the email.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.displayMessage("Invalid email address");
      return;
    }

    // Verify the password.
    const smallLetters = /.*[a-z].*/.test(this.password);
    const bigLetters = /.*[A-Z].*/.test(this.password);
    const numbers = /.*[0-9].*/.test(this.password);
    const specialChars = /.*[!@#$%^&*()_+}{"':;?/>.<,].*/.test(this.password);
    const containsName = this.password.toLowerCase().includes(this.name.replace(/\s/g, "").toLowerCase());
    const containsUserName = this.password.toLowerCase().includes(this.userName.toLowerCase());
    const length = this.password.length;
    if (!smallLetters || !bigLetters || !numbers || !specialChars || length < 12 || containsName || containsUserName){
      this.displayMessage("Your password must contain: lowercase letters, uppercase letters, numbers, special symbols, have a minimum length of 12 characters, and cannot include your name or username.");
      return;
    }

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

  /**
   * Displays an info window for password requirements when clicked.
   */
  showPwdInfo() {
    var popup = document.getElementById("passPopup");
    if (popup != null) {
      popup.classList.toggle("show");
    }
  }
}
