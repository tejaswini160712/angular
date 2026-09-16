import { Routes } from '@angular/router';
import { Registration } from './registration/registration';
import { Signin } from './signin/signin';

export const routes: Routes = [
    { path: '', component: Registration },
     { path: 'signin', component: Signin }
];