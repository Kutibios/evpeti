import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
