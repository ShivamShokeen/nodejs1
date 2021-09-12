import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http'
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  gamesList : any = [];
  userDetailsLocalStorage : any;

  constructor(public http : HttpClient) {
    this.userDetailsLocalStorage = localStorage.getItem('userDetails');
    this.http.get('http://localhost:9000/get-games',{}).subscribe((responseData) =>{
      this.gamesList = responseData;
      console.log("this.gamesList",this.gamesList);
    });
    
    this.http.get('http://localhost:9000/get-registration',{}).subscribe((responseData) =>{
      console.log("responseData registration",responseData);
    });

    console.log("userDetailsLocalStorage",this.userDetailsLocalStorage);
  }

  logout(){
    localStorage.clear();
  }

}
