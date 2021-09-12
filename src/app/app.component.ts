import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  
  manageGamesMenu: boolean = false;
  constructor() {}

  nestedMenu(type){
    if(type == 'manageGames'){
      this.manageGamesMenu = !this.manageGamesMenu;
    }
    
  }
}
