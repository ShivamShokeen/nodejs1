import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  manageGamesMenu: boolean = false;
  constructor(private cookieService: CookieService) {
    if (this.cookieService.get('userDetails')) {
      let cookieData: any = JSON.parse(this.cookieService.get('userDetails'));
    }

  }

  nestedMenu(type) {
    if (type == 'manageGames') {
      this.manageGamesMenu = !this.manageGamesMenu;
    }

  }
}
