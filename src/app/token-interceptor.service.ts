import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  localStorageToken: any = localStorage.getItem('userDetails');
  constructor() {
    this.localStorageToken = JSON.parse(this.localStorageToken);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let splitURL = req.url.split('/');
    if (splitURL[splitURL.length - 1] != 'add-registration' && splitURL[splitURL.length - 1] != 'verify-login') {
      if (this.localStorageToken != null) {
        let tokenR = req.clone({
          setHeaders: {
            'Authorization': 'Bearer ' + this.localStorageToken.token
          }
        });
        return next.handle(tokenR);
      }
      else {
        return next.handle(req);
      }
    }
    else {
      return next.handle(req);
    }
  }
}
