import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService, Theme } from './services/theme.service';
import { DataService } from './services/data.service';
import { Subscription } from 'rxjs';

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

        <!-- Tema Değiştirici -->
        <div class="theme-switcher">
          <button class="theme-toggle-btn" (click)="toggleThemeDropdown()" [title]="'Mevcut Tema: ' + currentTheme?.displayName">
            <span class="theme-icon">🎨</span>
            <span class="theme-name">{{ currentTheme?.displayName }}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="theme-dropdown" [class.show]="showThemeDropdown">
            <div class="theme-option" *ngFor="let theme of availableThemes" (click)="selectTheme(theme)">
              <div class="theme-preview" [style.background]="theme.primaryColor"></div>
              <span class="theme-label">{{ theme.displayName }}</span>
              <span class="theme-check" *ngIf="theme.name === currentTheme?.name">✓</span>
            </div>
            <div class="theme-divider"></div>
            <div class="theme-option" (click)="cycleTheme()">
              <span class="theme-icon">🔄</span>
              <span class="theme-label">Sonraki Tema</span>
            </div>
          </div>
        </div>

        <!-- Giriş yapmamış kullanıcılar için -->
        <div class="auth-buttons" *ngIf="!isLoggedIn">
          <button routerLink="/login">Giriş Yap</button>
          <button routerLink="/register">Kayıt Ol</button>
        </div>

        <!-- Giriş yapmış kullanıcılar için -->
        <div class="user-menu" *ngIf="isLoggedIn">
                     <div class="user-info">
             <span class="user-name">{{ currentUser?.username }}</span>
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
                <div class="profile-dropdown-item" (click)="goToBookingRequests()">
                  <i>📋</i>
                  Rezervasyon Talepleri
                  <span class="notification-badge" *ngIf="unreadNotificationCount > 0">{{ unreadNotificationCount }}</span>
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
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isLoggedIn: boolean = false;
  @Input() currentUser: any = null;
  showProfileDropdown: boolean = false;
  showThemeDropdown: boolean = false;
  
  currentTheme: Theme | null = null;
  availableThemes: Theme[] = [];
  unreadNotificationCount: number = 0;
  
  private themeSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.availableThemes = this.themeService.getThemes();
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Bildirim sayısını yükle
    if (this.isLoggedIn && this.currentUser?.id) {
      this.loadNotificationCount();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // currentUser değiştiğinde bildirim sayısını güncelle
    if (changes['currentUser'] && changes['currentUser'].currentValue?.id) {
      this.loadNotificationCount();
    }
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleThemeDropdown() {
    this.showThemeDropdown = !this.showThemeDropdown;
    // Profile dropdown'ı kapat
    this.showProfileDropdown = false;
  }

  selectTheme(theme: Theme) {
    this.themeService.setTheme(theme.name);
    this.showThemeDropdown = false;
  }

  cycleTheme() {
    this.themeService.cycleTheme();
    this.showThemeDropdown = false;
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    // Theme dropdown'ı kapat
    this.showThemeDropdown = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showProfileDropdown = false;
  }

  goToMyBookings() {
    this.router.navigate(['/bookings']);
    this.showProfileDropdown = false;
  }

  goToBookingRequests() {
    this.router.navigate(['/booking-requests']);
    this.showProfileDropdown = false;
  }

  goToMessages() {
    this.router.navigate(['/messages']);
    this.showProfileDropdown = false;
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToContact() {
    this.router.navigate(['/contact']);
  }

  loadNotificationCount() {
    if (this.currentUser?.id) {
      this.dataService.getUnreadNotificationCount(this.currentUser.id).subscribe({
        next: (count) => {
          this.unreadNotificationCount = count;
        },
        error: (error) => {
          console.error('Bildirim sayısı yüklenirken hata:', error);
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showProfileDropdown = false;
  }
}
