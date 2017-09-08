import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { Angulartics2GoogleAnalytics, Angulartics2Module } from 'angulartics2';

import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { FormsComponent } from './forms/forms.component';
import { ConnectComponent } from './connect/connect.component';


const appRoutes: Routes = [
  {
    path: '',
    component: ConnectComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'forms',
    component: FormsComponent
  },
  {
    path: 'connect',
    component: ConnectComponent
  },
  {
    path: '**', component: PageNotFoundComponent
  }
];

export const appRoutingProviders: any[] = [
  //Angulartics2GoogleAnalytics
];

export const RoutingModule: ModuleWithProviders = RouterModule.forRoot(appRoutes);
