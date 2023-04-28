import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  username: string = '';
  password: string = '';

  constructor(private backend: BackendService, private router: Router) {}

  login(): void {
    if (this.username.length > 0 && this.password.length > 0) {
      this.backend.login(this.username, this.password).subscribe((response) => {
        this.backend.userName = response.body.username; // TODO Extract the user from `response`, not just the username.
        this.router.navigate(['/forum']);
      });
    }
  }
}
