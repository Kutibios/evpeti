import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { HomeComponent } from './home.component';
import { PetProfileComponent } from './pet-profile.component';
import { SitterProfileComponent } from './sitter-profile.component';
import { ProfileComponent } from './profile.component';
import { ContactComponent } from './contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pet-profile', component: PetProfileComponent },
  { path: 'sitter-profile', component: SitterProfileComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];
