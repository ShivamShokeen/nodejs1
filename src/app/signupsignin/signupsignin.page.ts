import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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
    password: new FormControl('')
  });
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });
  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, public toastController: ToastController, public http: HttpClient,private router : Router) { }

  ngOnInit() {
    this.routeType = this.route.snapshot.queryParams.type;
  }

  save(type) {
    if (type == 'register') {
      if (this.registerForm.valid) {
        this.http.post('http://localhost:9000/add-registration', this.registerForm.value).subscribe((responseData) => {
          responseData
        }, error => {
          console.log("error",error);
          if(error.status == 401){
            this.toastErrorMessage('This email id was already existed');
          }
          if(error.status == 200){
            this.toastSuccessMessage('Register successfully');
            // this.routeType = 'sign in';
          }
          if(error.status == 400){
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
        this.http.post('http://localhost:9000/verify-login', this.loginForm.value).subscribe((responseData) => {
          this.router.navigate(['/home']);
          // localStorage.setItem(responseData);
        }, error => {
          if(error.status == 204){
            this.toastErrorMessage('This email id was already exist');
          }
          if(error.status == 400){
            this.toastErrorMessage(error.error.text);
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