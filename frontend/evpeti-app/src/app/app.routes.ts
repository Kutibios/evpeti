import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ProfileComponent } from './profile.component';
import { ContactComponent } from './contact.component';
import { PetProfileComponent } from './pet-profile.component';
import { SitterProfileComponent } from './sitter-profile.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { ListingDetailComponent } from './listing-detail.component';
import { BookingsComponent } from './bookings.component';
import { BookingRequestsComponent } from './booking-requests.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'pet-profile', component: PetProfileComponent },
  { path: 'sitter-profile', component: SitterProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'listing/:id', component: ListingDetailComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'booking-requests', component: BookingRequestsComponent },
  { path: '**', redirectTo: '' }
];
