import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupsigninPage } from './signupsignin.page';

const routes: Routes = [
  {
    path: '',
    component: SignupsigninPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupsigninPageRoutingModule {}
