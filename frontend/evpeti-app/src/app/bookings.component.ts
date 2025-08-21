import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './auth.service';
import { DataService, Booking, Listing } from './services/data.service';
import { HeaderComponent } from './header.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  template: `
    <app-header [isLoggedIn]="isLoggedIn" [currentUser]="currentUser"></app-header>
    
    <div class="bookings-container">
      <div class="bookings-header">
        <h1>📅 Rezervasyonlarım</h1>
        <p>Evcil hayvanlarınız için yaptığınız rezervasyonları buradan takip edebilirsiniz.</p>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading">
        <div class="loading-spinner"></div>
        <p>Rezervasyonlar yükleniyor...</p>
      </div>

      <!-- Error State -->
      <div class="error-container" *ngIf="error">
        <h3>❌ Hata Oluştu</h3>
        <p>{{ error }}</p>
        <button (click)="loadBookings()" class="retry-btn">Tekrar Dene</button>
      </div>

      <!-- Bookings List -->
      <div class="bookings-list" *ngIf="!isLoading && !error">
        <div class="bookings-tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'all'"
            (click)="setActiveTab('all')">
            Tümü ({{ allBookings.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'pending'"
            (click)="setActiveTab('pending')">
            Bekleyen ({{ pendingBookings.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'accepted'"
            (click)="setActiveTab('accepted')">
            Kabul Edilen ({{ acceptedBookings.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'completed'"
            (click)="setActiveTab('completed')">
            Tamamlanan ({{ completedBookings.length }})
          </button>
        </div>

        <div class="bookings-grid" *ngIf="currentBookings.length > 0">
          <div class="booking-card" *ngFor="let booking of currentBookings">
            <div class="booking-header">
              <div class="booking-status" [class]="'status-' + booking.status.toLowerCase()">
                {{ getStatusText(booking.status) }}
              </div>
              <div class="booking-date">
                {{ booking.createdAt | date:'dd/MM/yyyy' }}
              </div>
            </div>

            <div class="booking-content">
              <div class="listing-info">
                <h3>{{ booking.listing?.title || 'İlan Başlığı Yok' }}</h3>
                <p class="location">📍 {{ booking.listing?.location }}</p>
                <p class="pet-type">🐾 {{ booking.listing?.type }}</p>
              </div>

              <div class="booking-details">
                <div class="detail-row">
                  <span class="label">Evcil Hayvan:</span>
                  <span class="value">{{ booking.petName }}</span>
                </div>
                <div class="detail-row" *ngIf="booking.petType">
                  <span class="label">Pet Türü:</span>
                  <span class="value">{{ getPetEmoji(booking.petType) }} {{ booking.petType }}</span>
                </div>
                <div class="detail-row" *ngIf="booking.petAge">
                  <span class="label">Pet Yaşı:</span>
                  <span class="value">{{ booking.petAge }} yaş</span>
                </div>
                <div class="detail-row">
                  <span class="label">Başlangıç:</span>
                  <span class="value">{{ booking.startDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Bitiş:</span>
                  <span class="value">{{ booking.endDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Toplam Tutar:</span>
                  <span class="value price">{{ booking.totalPrice }} TL</span>
                </div>
                <div class="detail-row" *ngIf="booking.notes">
                  <span class="label">Notlar:</span>
                  <span class="value">{{ booking.notes }}</span>
                </div>
              </div>

              <div class="booking-actions">
                <button 
                  class="action-btn chat-btn" 
                  (click)="openChat(booking)"
                  *ngIf="booking.status === 'Accepted'">
                  💬 Sohbet Et
                </button>
                <button 
                  class="action-btn cancel-btn" 
                  (click)="cancelBooking(booking)"
                  *ngIf="booking.status === 'Pending'">
                  ❌ İptal Et
                </button>
                <button 
                  class="action-btn view-btn" 
                  (click)="viewListing(booking.listingId)">
                  👁️ İlanı Gör
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="currentBookings.length === 0">
          <div class="empty-icon">📅</div>
          <h3>Henüz Rezervasyon Yok</h3>
          <p>Evcil hayvanlarınız için rezervasyon yapmaya başlayın!</p>
          <button (click)="goToHome()" class="primary-btn">İlanları Keşfet</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class BookingsComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  
  allBookings: Booking[] = [];
  activeTab: 'all' | 'pending' | 'accepted' | 'completed' = 'all';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Auth state'i dinle
    const authSub = this.authService.currentUser$.subscribe((user: User | null) => {
      this.isLoggedIn = user !== null;
      this.currentUser = user;
      
      if (user) {
        this.loadBookings();
      } else {
        this.router.navigate(['/login']);
      }
    });
    this.subscriptions.push(authSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBookings() {
    if (!this.currentUser?.id) return;
    
    this.isLoading = true;
    this.error = null;

    this.dataService.getUserBookings(this.currentUser.id).subscribe({
      next: (bookings) => {
        this.allBookings = bookings || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Rezervasyonlar yüklenirken hata:', error);
        this.error = 'Rezervasyonlar yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get currentBookings(): Booking[] {
    switch (this.activeTab) {
      case 'pending':
        return this.allBookings.filter(b => b.status === 'Pending');
      case 'accepted':
        return this.allBookings.filter(b => b.status === 'Accepted');
      case 'completed':
        return this.allBookings.filter(b => b.status === 'Completed');
      default:
        return this.allBookings;
    }
  }

  get pendingBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'Pending');
  }

  get acceptedBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'Accepted');
  }

  get completedBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'Completed');
  }

  setActiveTab(tab: 'all' | 'pending' | 'accepted' | 'completed') {
    this.activeTab = tab;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Pending': return 'Bekliyor';
      case 'Accepted': return 'Kabul Edildi';
      case 'Rejected': return 'Reddedildi';
      case 'Completed': return 'Tamamlandı';
      case 'Cancelled': return 'İptal Edildi';
      default: return status;
    }
  }

  getPetEmoji(petType: string): string {
    switch (petType.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      case 'rabbit': return '🐰';
      case 'hamster': return '🐹';
      case 'snake': return '🐍';
      case 'turtle': return '🐢';
      case 'lizard': return '🦎';
      default: return '🐾'; // Default emoji
    }
  }

  openChat(booking: Booking) {
    this.router.navigate(['/chat', booking.id]);
  }

  cancelBooking(booking: Booking) {
    if (confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      this.dataService.updateBookingStatus(booking.id!, 'Cancelled').subscribe({
        next: () => {
          this.loadBookings(); // Listeyi yenile
        },
        error: (error) => {
          console.error('Rezervasyon iptal edilirken hata:', error);
          alert('Rezervasyon iptal edilirken bir hata oluştu');
        }
      });
    }
  }

  viewListing(listingId: number) {
    this.router.navigate(['/listing', listingId]);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
