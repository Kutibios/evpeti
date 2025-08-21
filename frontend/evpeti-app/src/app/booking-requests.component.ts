import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthService } from './auth.service';
import { DataService, Booking, User } from './services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-booking-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <app-header [isLoggedIn]="isLoggedIn" [currentUser]="currentUser"></app-header>
    
    <div class="booking-requests-container">
      <!-- Header -->
      <div class="booking-requests-header">
        <h1>📋 Rezervasyon Talepleri</h1>
        <p>Size gelen rezervasyon taleplerini yönetin</p>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading">
        <div class="loading-spinner"></div>
        <p>Rezervasyon talepleri yükleniyor...</p>
      </div>

      <!-- Error State -->
      <div class="error-container" *ngIf="error">
        <h3>❌ Hata Oluştu</h3>
        <p>{{ error }}</p>
        <button (click)="loadBookingRequests()" class="retry-btn">Tekrar Dene</button>
      </div>

      <!-- Tab Navigation -->
      <div class="booking-tabs" *ngIf="!isLoading && !error">
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
          Kabul Edildi ({{ acceptedBookings.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'rejected'"
          (click)="setActiveTab('rejected')">
          Reddedildi ({{ rejectedBookings.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'all'"
          (click)="setActiveTab('all')">
          Tümü ({{ allBookings.length }})
        </button>
      </div>

      <!-- Booking Requests Grid -->
      <div class="booking-requests-grid" *ngIf="!isLoading && !error && currentBookings.length > 0">
        <div class="booking-request-card" *ngFor="let booking of currentBookings">
          <!-- Booking Header -->
          <div class="booking-header">
            <div class="booking-info">
              <h3>{{ booking.listing?.title || 'İlan' }}</h3>
              <span class="booking-date">{{ booking.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <span class="booking-status" [ngClass]="'status-' + booking.status.toLowerCase()">
              {{ getStatusText(booking.status) }}
            </span>
          </div>

          <!-- User Info -->
          <div class="user-info">
            <div class="user-avatar">
              {{ booking.user?.username?.charAt(0) || 'U' }}
            </div>
            <div class="user-details">
              <h4>{{ booking.user?.username || 'İsimsiz Kullanıcı' }}</h4>
              <p>📧 {{ booking.userEmail || booking.user?.email || 'Email bulunmuyor' }}</p>
              <p>📞 {{ booking.userPhone || 'Telefon bulunmuyor' }}</p>
            </div>
          </div>

          <!-- Pet Info -->
          <div class="pet-info">
            <h5>🐾 Evcil Hayvan Bilgileri</h5>
            <div class="pet-details">
              <div class="pet-detail">
                <strong>Ad:</strong> {{ booking.petName }}
              </div>
              <div class="pet-detail" *ngIf="booking.petType">
                <strong>Tür:</strong> {{ getPetEmoji(booking.petType) }} {{ booking.petType }}
              </div>
              <div class="pet-detail" *ngIf="booking.petAge">
                <strong>Yaş:</strong> {{ booking.petAge }} yaş
              </div>
            </div>
          </div>

          <!-- Booking Details -->
          <div class="booking-details">
            <div class="detail-row">
              <span class="label">Başlangıç:</span>
              <span class="value">{{ booking.startDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Bitiş:</span>
              <span class="value">{{ booking.endDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Toplam Gün:</span>
              <span class="value">{{ getTotalDays(booking.startDate, booking.endDate) }} gün</span>
            </div>
            <div class="detail-row">
              <span class="label">Toplam Tutar:</span>
              <span class="value price">{{ booking.totalPrice }} TL</span>
            </div>
          </div>

          <!-- Notes -->
          <div class="booking-notes" *ngIf="booking.notes">
            <h5>📝 Özel Notlar</h5>
            <p>{{ booking.notes }}</p>
          </div>

          <!-- Actions -->
          <div class="booking-actions" *ngIf="booking.status === 'Pending'">
            <button 
              class="action-btn accept-btn" 
              (click)="acceptBooking(booking)"
              [disabled]="isProcessing">
              ✅ Kabul Et
            </button>
            <button 
              class="action-btn reject-btn" 
              (click)="rejectBooking(booking)"
              [disabled]="isProcessing">
              ❌ Reddet
            </button>
            <button 
              class="action-btn chat-btn" 
              (click)="openChat(booking)"
              [disabled]="isProcessing">
              💬 Mesaj Gönder
            </button>
          </div>

          <!-- Accepted Actions -->
          <div class="booking-actions" *ngIf="booking.status === 'Accepted'">
            <button 
              class="action-btn chat-btn" 
              (click)="openChat(booking)">
              💬 Sohbet Et
            </button>
            <button 
              class="action-btn complete-btn" 
              (click)="completeBooking(booking)"
              [disabled]="isProcessing">
              ✅ Tamamlandı
            </button>
          </div>

          <!-- Status Info -->
          <div class="status-info" *ngIf="booking.status !== 'Pending'">
            <p *ngIf="booking.acceptedAt" class="status-date">
              ✅ Kabul edildi: {{ booking.acceptedAt | date:'dd/MM/yyyy HH:mm' }}
            </p>
            <p *ngIf="booking.rejectedAt" class="status-date">
              ❌ Reddedildi: {{ booking.rejectedAt | date:'dd/MM/yyyy HH:mm' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && !error && currentBookings.length === 0">
        <div class="empty-icon">📋</div>
        <h3>{{ getEmptyMessage() }}</h3>
        <p>{{ getEmptyDescription() }}</p>
        <button (click)="goToHome()" class="primary-btn">Ana Sayfaya Dön</button>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class BookingRequestsComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  isProcessing: boolean = false;
  
  allBookings: Booking[] = [];
  activeTab: string = 'pending';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Auth state'i kontrol et
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = !!user;
    this.currentUser = user;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadBookingRequests();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBookingRequests() {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.error = null;

    // Kullanıcının sahip olduğu ilanlar için rezervasyonları getir
    const sub = this.dataService.getOwnerBookings(this.currentUser.id).subscribe({
      next: (bookings) => {
        console.log('Rezervasyon talepleri yüklendi:', bookings);
        this.allBookings = bookings || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Rezervasyon talepleri yüklenirken hata:', error);
        this.error = 'Rezervasyon talepleri yüklenirken bir hata oluştu.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(sub);
  }

  get pendingBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'Pending');
  }

  get acceptedBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'Accepted');
  }

  get rejectedBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'Rejected');
  }

  get currentBookings(): Booking[] {
    switch (this.activeTab) {
      case 'pending': return this.pendingBookings;
      case 'accepted': return this.acceptedBookings;
      case 'rejected': return this.rejectedBookings;
      default: return this.allBookings;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Pending': return 'Bekleyen';
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
      default: return '🐾';
    }
  }

  getTotalDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  acceptBooking(booking: Booking) {
    if (!booking.id) return;

    this.isProcessing = true;
    
    const sub = this.dataService.updateBookingStatus(booking.id, 'Accepted').subscribe({
      next: (updatedBooking) => {
        console.log('Rezervasyon kabul edildi:', updatedBooking);
        
        // Local state'i güncelle
        const index = this.allBookings.findIndex(b => b.id === booking.id);
        if (index !== -1) {
          this.allBookings[index] = updatedBooking;
        }
        
        this.isProcessing = false;
        this.cdr.detectChanges();
        
        alert('Rezervasyon başarıyla kabul edildi!');
      },
      error: (error) => {
        console.error('Rezervasyon kabul edilirken hata:', error);
        this.isProcessing = false;
        alert('Rezervasyon kabul edilirken bir hata oluştu.');
      }
    });

    this.subscriptions.push(sub);
  }

  rejectBooking(booking: Booking) {
    if (!booking.id) return;

    const reason = prompt('Reddetme nedeninizi belirtin (isteğe bağlı):');
    
    this.isProcessing = true;
    
    const sub = this.dataService.updateBookingStatus(booking.id, 'Rejected').subscribe({
      next: (updatedBooking) => {
        console.log('Rezervasyon reddedildi:', updatedBooking);
        
        // Local state'i güncelle
        const index = this.allBookings.findIndex(b => b.id === booking.id);
        if (index !== -1) {
          this.allBookings[index] = updatedBooking;
        }
        
        this.isProcessing = false;
        this.cdr.detectChanges();
        
        alert('Rezervasyon reddedildi.');
      },
      error: (error) => {
        console.error('Rezervasyon reddedilirken hata:', error);
        this.isProcessing = false;
        alert('Rezervasyon reddedilirken bir hata oluştu.');
      }
    });

    this.subscriptions.push(sub);
  }

  completeBooking(booking: Booking) {
    if (!booking.id) return;

    if (!confirm('Bu rezervasyonu tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) {
      return;
    }

    this.isProcessing = true;
    
    const sub = this.dataService.updateBookingStatus(booking.id, 'Completed').subscribe({
      next: (updatedBooking) => {
        console.log('Rezervasyon tamamlandı:', updatedBooking);
        
        // Local state'i güncelle
        const index = this.allBookings.findIndex(b => b.id === booking.id);
        if (index !== -1) {
          this.allBookings[index] = updatedBooking;
        }
        
        this.isProcessing = false;
        this.cdr.detectChanges();
        
        alert('Rezervasyon tamamlandı olarak işaretlendi!');
      },
      error: (error) => {
        console.error('Rezervasyon tamamlanırken hata:', error);
        this.isProcessing = false;
        alert('Rezervasyon tamamlanırken bir hata oluştu.');
      }
    });

    this.subscriptions.push(sub);
  }

  openChat(booking: Booking) {
    // Chat sayfasına yönlendir
    this.router.navigate(['/messages'], { queryParams: { bookingId: booking.id } });
  }

  getEmptyMessage(): string {
    switch (this.activeTab) {
      case 'pending': return 'Bekleyen rezervasyon talebi yok';
      case 'accepted': return 'Kabul edilmiş rezervasyon yok';
      case 'rejected': return 'Reddedilmiş rezervasyon yok';
      default: return 'Henüz rezervasyon talebi yok';
    }
  }

  getEmptyDescription(): string {
    switch (this.activeTab) {
      case 'pending': return 'Yeni rezervasyon talepleri geldiğinde burada görünecek.';
      case 'accepted': return 'Kabul ettiğiniz rezervasyonlar burada görünecek.';
      case 'rejected': return 'Reddettiğiniz rezervasyonlar burada görünecek.';
      default: return 'İlanlarınıza rezervasyon talepleri geldiğinde burada görünecek.';
    }
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
