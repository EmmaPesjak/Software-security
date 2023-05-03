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

  constructor(private backend: BackendService, private cookieService: CookieService, private router: Router) {}

  login(): void {
    if (this.username.length > 0 && this.password.length > 0) {
      if (this.cookieService.check('numberOfLoginAttemps')) {
        if (parseInt(this.cookieService.get('numberOfLoginAttemps')) >= 5) return;
        this.cookieService.set('numberOfLoginAttemps', (parseInt(this.cookieService.get('numberOfLoginAttemps')) + 1).toString());
      } else {
        this.cookieService.set('numberOfLoginAttemps', '1');
      }
      // console.log(parseInt(this.cookieService.get('numberOfLoginAttemps')));
      this.backend.login(this.username, this.password).subscribe((response) => {
        this.cookieService.set('username', response.body.username); // TODO Extract the user from `response`, not just the username.
        this.router.navigate(['/forum']);
      });
    }
  }
}
