import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header>
      <nav>
        <div class="logo">
          <a routerLink="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 0.5rem;">
            <img src="assets/logo.png" alt="EvPeti Logo">
            <span>EvPeti</span>
          </a>
        </div>
        <div class="nav-links">
          <a routerLink="/" (click)="goToHome()">Ana Sayfa</a>
          <a routerLink="/contact" (click)="goToContact()">İletişim</a>
        </div>

        <!-- Giriş yapmamış kullanıcılar için -->
        <div class="auth-buttons" *ngIf="!isLoggedIn">
          <button routerLink="/login">Giriş Yap</button>
          <button routerLink="/register">Kayıt Ol</button>
        </div>

        <!-- Giriş yapmış kullanıcılar için -->
        <div class="user-menu" *ngIf="isLoggedIn">
          <div class="user-info">
            <span class="user-name">{{ currentUser?.name }}</span>
            <span class="user-rating">⭐ {{ currentUser?.rating }}</span>
          </div>
          <div class="user-buttons">
            <div class="profile-btn-container">
              <button class="profile-btn" (click)="toggleProfileDropdown()">
                <i>👤</i>
                Profilim
                <i>▼</i>
              </button>
              <div class="profile-dropdown" [class.show]="showProfileDropdown">
                <div class="profile-dropdown-item" (click)="goToProfile()">
                  <i>👤</i>
                  Profilim
                </div>
                <div class="profile-dropdown-item" (click)="goToMyBookings()">
                  <i>📅</i>
                  Rezervasyonlarım
                </div>
                <div class="profile-dropdown-item" (click)="goToMessages()">
                  <i>💬</i>
                  Mesajlarım
                </div>
                <div class="profile-dropdown-item" (click)="logout()">
                  <i>🚪</i>
                  Çıkış Yap
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
  styleUrls: ['./app.css']
})
export class HeaderComponent {
  @Input() isLoggedIn: boolean = false;
  @Input() currentUser: any = null;
  showProfileDropdown: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showProfileDropdown = false;
  }

  goToMyBookings() {
    // TODO: Implement
    this.showProfileDropdown = false;
  }

  goToMessages() {
    // TODO: Implement
    this.showProfileDropdown = false;
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToContact() {
    this.router.navigate(['/contact']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showProfileDropdown = false;
  }
}
