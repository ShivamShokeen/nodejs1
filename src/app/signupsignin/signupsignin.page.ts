import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-signupsignin',
  templateUrl: './signupsignin.page.html',
  styleUrls: ['./signupsignin.page.scss'],
})
export class SignupsigninPage implements OnInit {

  routeType = 'register';
  registerForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    dateCreation: new FormControl(new Date())
  });
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });
  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, public toastController: ToastController, public http: HttpClient, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
    this.routeType = this.route.snapshot.queryParams.type;
  }

  save(type) {
    if (type == 'register') {
      if (this.registerForm.valid) {
        this.http.post('http://localhost:9000/add-registration', this.registerForm.value).subscribe((responseData: any) => {
          let getResponse: any = { id: responseData.id, sign_token: responseData.sign_token, refresh_token: responseData.refresh_token };
          this.cookieService.set('userDetails', JSON.stringify(getResponse));
          this.router.navigate(['/home']).then(() => { window.location.reload() });
          // this.router.navigate(['/home']);
        }, error => {
          console.log("error", error);
          if (error.status == 401) {
            this.toastErrorMessage(this.registerForm.value.email + ' was already existed.');
          }
          if (error.status == 200) {
            this.toastSuccessMessage('Register successfully');
            this.routeType = 'sign in';
          }
          if (error.status == 400) {
            this.toastErrorMessage(error.error.text);
          }
        });
      }
      else {
        this.toastErrorMessage('Please fill required details');
      }

    }
    if (type == 'login') {
      if (this.loginForm.valid) {
        this.http.post('http://localhost:9000/verify-login', this.loginForm.value).subscribe((responseData: any) => {
          let getResponse: any = { id: responseData.id, sign_token: responseData.sign_token, refresh_token: responseData.refresh_token };
          this.cookieService.set('userDetails', JSON.stringify(getResponse));
          this.router.navigate(['/home']).then(() => { window.location.reload() });
          // this.router.navigate(['/home']);
        }, error => {
          if (error.status == 400) {
            if (error.error == 'Your password is wrong') {
              this.toastErrorMessage('Your password is wrong.')
            }
            else if (error.error == 'Email id not exist') {
              this.toastErrorMessage('Email id not exist.')
            }
            else {
              this.toastErrorMessage(error.error.text);
            }

          }
        });
      }
      else {
        this.toastErrorMessage('Please fill required details');
      }
    }

  }

  async toastSuccessMessage(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }

  async toastErrorMessage(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
}
