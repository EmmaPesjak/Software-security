import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

/**
 * Interceptor class which inserts an "Authorization" header with a CSRF token in each HTTP request. 
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private cookieService: CookieService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const csrfToken = this.cookieService.get("csrfToken");
    const jwtToken = this.cookieService.get("jwtToken");
    
    console.log("this is in auth jwt: " +jwtToken);
    console.log("this is in auth csrf: " +csrfToken);
    

    if (csrfToken && jwtToken) {

      const headers = request.headers
      .set("X-CSRF-Token", csrfToken)
      .set("Authorization", `Bearer ${jwtToken}`);
    
      const cloned = request.clone({
        headers: headers
      });

      /*const cloned = request.clone({
        headers: request.headers.set("Authorization", "Bearer " + csrfToken)
      });

      if (jwtToken) {
        cloned.headers = cloned.headers.set("Authorization", "Bearer " + jwtToken);
      }*/

      return next.handle(cloned);
    } else {
      return next.handle(request);
    }
  }
}
