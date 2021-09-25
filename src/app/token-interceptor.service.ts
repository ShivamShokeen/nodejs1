import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { map, catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { from } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  localStorageToken: any;
  constructor(private cookieService: CookieService, public http: HttpClient, public toastController: ToastController, private activeRoute: ActivatedRoute, private route: Router) {
    if (this.cookieService.get('userDetails')) {
      this.localStorageToken = JSON.parse(this.cookieService.get('userDetails'));
      console.log("this.localStorageToken tokenInceptor", this.localStorageToken);
    }

  }
  // async

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // convert promise to observable using 'from' operator
    let splitURL = req.url.split('/');
    if (splitURL[splitURL.length - 1] != 'user/register_user' && splitURL[splitURL.length - 1] != 'jwt/verify_login') {
      let tokenR = req.clone({
        setHeaders: {
          'Authorization': 'Bearer ' + this.localStorageToken.sign_token
        }
      });


      return next.handle(tokenR).pipe(catchError((response) => {

        if (response.status === 403) {
          console.log("hit else part");
          return from(this.handle(req, next))
        }
        else {
          return next.handle(req);
        }
      }));
    }

  }

  async handle(req: HttpRequest<any>, next: HttpHandler) {
    await this.refreshTokenHit();
    let tokenR;
    if (this.localStorageToken != null) {

      tokenR = req.clone({
        setHeaders: {
          'Authorization': 'Bearer ' + this.localStorageToken.sign_token
        }
      });
      return next.handle(tokenR).pipe(catchError((response) => {

        if (response.status === 403) {

          console.log("this.cookieService set auth", this.cookieService.get('userDetails'));
          console.log("this.localStorageToken.sign_token auth", this.localStorageToken.sign_token);
          return next.handle(req.clone({
            setHeaders: { "Authorization": `Bearer ${this.localStorageToken.sign_token}` }
          }));

        }
        // logout on refresh token expire
        if (response.status == 400) {
          this.cookieService.deleteAll();
          this.toastErrorMessage('Token is expired. Please re-login');
          this.route.navigate(['/home']);
        }
      }), error => {
        return error
      }).toPromise();
    }
  }

  // intercept(req, next) {
  //   let splitURL = req.url.split('/');
  //   if (splitURL[splitURL.length - 1] != 'user/register_user' && splitURL[splitURL.length - 1] != 'jwt/verify_login') {
  //     if (this.localStorageToken != null) {
  //       // await this.refreshTokenHit();
  //       let tokenR = req.clone({
  //         setHeaders: {
  //           'Authorization': 'Bearer ' + this.localStorageToken.sign_token
  //         }
  //       });
  //       return next.handle(tokenR).pipe(catchError((response) => {

  //         if (response.status === 403) {

  //           // let latestRefreshToken: any;
  //           // this.http.post('http://localhost:9000/jwt/refresh_token', { id: this.localStorageToken.id, sign_token: this.localStorageToken.sign_token, refresh_token: this.localStorageToken.refresh_token }).subscribe(responseData => {
  //           //   latestRefreshToken = responseData;
  //           //   console.log("responseData refresh", responseData);
  //           //   if (responseData) {
  //           //     this.cookieService.set('userDetails', JSON.stringify(responseData));
  //           //     this.localStorageToken = JSON.parse(this.cookieService.get('userDetails'));
  //           //     console.log("this.cookieService set",this.cookieService.get('userDetails'));     
  //           //   }

  //           // }, error => {
  //           //   this.toastErrorMessage(error.error.message + " refresh_token API");
  //           // });

  //           console.log("this.cookieService set auth",this.cookieService.get('userDetails'));   
  //           console.log("this.localStorageToken.sign_token auth",this.localStorageToken.sign_token);
  //           return next.handle(req.clone({
  //             setHeaders: { "Authorization": `Bearer ${this.localStorageToken.sign_token}` }
  //           }));

  //         }
  //         // logout on refresh token expire
  //         if (response.status == 400) {
  //           this.cookieService.deleteAll();
  //           this.toastErrorMessage('Token is expired. Please re-login');
  //           this.route.navigate(['/home']);
  //         }
  //       }), error => {
  //         return error
  //       });
  //     }
  //     else {
  //       return next.handle(req);
  //     }
  //   }
  //   else {
  //     return next.handle(req);
  //   }
  // }

  async toastErrorMessage(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      color: 'danger'
    });
    toast.present();
  }

  refreshTokenHit() {
    return new Promise((resolve, reject) => {
      let latestRefreshToken: any;
      this.http.post('http://localhost:9000/jwt/refresh_token', { id: this.localStorageToken.id, sign_token: this.localStorageToken.sign_token, refresh_token: this.localStorageToken.refresh_token }).subscribe(responseData => {
        latestRefreshToken = responseData;
        console.log("responseData refresh", responseData);
        if (responseData) {
          this.cookieService.set('userDetails', JSON.stringify(responseData));
          this.localStorageToken = JSON.parse(this.cookieService.get('userDetails'));
          console.log("this.cookieService set", this.cookieService.get('userDetails'));
          resolve(this.localStorageToken)
        }

      }, error => {
        reject(error);
        this.toastErrorMessage(error.error.message + " refresh_token API");
      });
    })
  }
}
