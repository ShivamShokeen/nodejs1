import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  gamesList: any = [];
  userDetailsCookie: any;

  constructor(public http: HttpClient, private router: Router,private cookieService : CookieService) {
    this.http.get('http://localhost:9000/get-games', {}).subscribe((responseData) => {
      this.gamesList = responseData;
    });
  }


  ngOnInit() {
    if (this.cookieService.get('userDetails')) {
      let cookieData: any = JSON.parse(this.cookieService.get('userDetails'));
      this.userDetailsCookie = cookieData;
    }
    
  }

  logout() {
    localStorage.clear();
    this.cookieService.delete('userDetails');
    this.router.navigate(['/signupsignin'], { queryParams: { type: 'sign in' } });
  }

}
