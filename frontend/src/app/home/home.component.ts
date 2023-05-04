import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  username: string = '';
  password: string = '';
  message: string;

  constructor(private backend: BackendService, private cookieService: CookieService, private router: Router) {
    if (this.cookieService.check('numberOfLoginAttemps')) {
      this.message = 'Number of login attempts: ' + parseInt(this.cookieService.get('numberOfLoginAttemps')) + '/5.';
    } else {
      this.message = 'Number of login attempts: ' + 0 + '/5.';
    }
  }

  login(): void {
    if (this.username.length > 0 && this.password.length > 0) {
      /*if (this.cookieService.check('numberOfLoginAttemps')) {
        if (parseInt(this.cookieService.get('numberOfLoginAttemps')) >= 5) {
          this.message = 'You\'ve exceeded the maximum number of login attempts.';
          return;
        }
        this.cookieService.set('numberOfLoginAttemps', (parseInt(this.cookieService.get('numberOfLoginAttemps')) + 1).toString());
      } else {
        this.cookieService.set('numberOfLoginAttemps', '1');
      }
      this.message = 'Number of login attempts: ' + parseInt(this.cookieService.get('numberOfLoginAttemps')) + '/5.';*/
      this.backend.login(this.username, this.password).subscribe((data) => {
        this.cookieService.set('username', data.body.username); // TODO Extract the user from `response`, not just the username.
        this.cookieService.set('userid', data.body.userId);  // WHY IS IT NOT GETTING THE USERID?
        this.router.navigate(['/forum']);
      }, (exception) => {
        this.message = exception.error;
      });
    }
  }
}
