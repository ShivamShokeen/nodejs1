import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  gamesList: any = [];
  userDetailsLocalStorage: any;

  constructor(public http: HttpClient, private router: Router) {
    this.http.get('http://localhost:9000/get-games', {}).subscribe((responseData) => {
      this.gamesList = responseData;
    });
  }


  ngOnInit() {
    this.userDetailsLocalStorage = localStorage.getItem('userDetails');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/signupsignin'], { queryParams: { type: 'sign in' } });
  }

}
