import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  localStorageToken: any;
  constructor(private cookieService: CookieService,public http: HttpClient) {
    if (cookieService.get('userDetails')) {
      this.localStorageToken = JSON.parse(cookieService.get('userDetails'));
      console.log("this.localStorageToken", this.localStorageToken);
      // refresh_token
    }

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let splitURL = req.url.split('/');
    if (splitURL[splitURL.length - 1] != 'add-registration' && splitURL[splitURL.length - 1] != 'verify-login') {
      if (this.localStorageToken != null) {
        let tokenR = req.clone({
          setHeaders: {
            'Authorization': 'Bearer ' + this.localStorageToken.sign_token
          }
        });
        // this.http.post('http://localhost:9000/refresh-token',{id : this.localStorageToken.id , sign_token : this.localStorageToken.sign_token,refresh_token : this.localStorageToken.refresh_token }).subscribe(responseData =>{
        //   // latestRefreshToken = responseData;
        //   console.log("responseData",responseData);
        // });
        return next.handle(tokenR).pipe(catchError((response) => {
          console.log("response", response);
          console.log("response", response.body);
          if (response.status === 403) {
           let latestRefreshToken : any;
            this.http.post('http://localhost:9000/refresh-token',{id : this.localStorageToken.id , sign_token : this.localStorageToken.sign_token,refresh_token : this.localStorageToken.refresh_token }).subscribe(responseData =>{
              latestRefreshToken = responseData;
              console.log("responseData",responseData);
            });
            return next.handle(req.clone({
              setHeaders: { "Authorization": `Bearer ${this.localStorageToken.sign_token}` }
            }));

          }

        }), error => {
          return error
        });
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
