import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupsigninPageRoutingModule } from './signupsignin-routing.module';

import { SignupsigninPage } from './signupsignin.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupsigninPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SignupsigninPage]
})
export class SignupsigninPageModule {}
