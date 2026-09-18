import { Routes } from '@angular/router';
import { Registration } from './registration/registration';
import { Signin } from './signin/signin';
import { Dashboard } from './dashboard/dashboard';
import { Cart } from './cart/cart';

export const routes: Routes = [
  { path: '', component: Registration },
  { path: 'signin', component: Signin },
  { path: 'dashboard', component: Dashboard },
  { path: 'cart', component: Cart },
];