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
    if (this.cookieService.check('numberOfLoginAttempts')) {
      this.message = 'Number of login attempts: ' + parseInt(this.cookieService.get('numberOfLoginAttempts')) + '/5.';
    } else {
      this.message = 'Number of login attempts: ' + 0 + '/5.';
    }
  }

  login(): void {
    if (this.username.length > 0 && this.password.length > 0) {
      if (this.cookieService.check('numberOfLoginAttempts')) {
        if (this.cookieService.check('timer') && Date.now() > Date.parse(this.cookieService.get('timer'))) {
          this.cookieService.set('numberOfLoginAttempts', '0', undefined, '/');
          this.cookieService.delete('timer', '/');
        } else if (parseInt(this.cookieService.get('numberOfLoginAttempts')) >= 5) {
          this.message = 'You\'ve exceeded the maximum number of login attempts.';
          if (!this.cookieService.check('timer')) {
            const date: Date = new Date();
            date.setMinutes(date.getMinutes() + 5);
            this.cookieService.set('timer', date.toISOString(), undefined, '/');
          }
          return;
        }
        this.cookieService.set('numberOfLoginAttempts', (parseInt(this.cookieService.get('numberOfLoginAttempts')) + 1).toString(), undefined, '/');
      } else {
        this.cookieService.set('numberOfLoginAttempts', '1', undefined, '/');
      }
      this.message = 'Number of login attempts: ' + parseInt(this.cookieService.get('numberOfLoginAttempts')) + '/5.';
      this.backend.login(this.username, this.password).subscribe((data) => {
        this.cookieService.set('username', data.body.username, undefined, '/'); // TODO Extract the user from `response`, not just the username.
        this.cookieService.set('userid', data.body.userId, undefined, '/');
        this.router.navigate(['/forum']);
      }, (exception) => {
        this.message = exception.error;
      });
    }
  }
}
