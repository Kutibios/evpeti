// TODO: Router events kullanarak navigation tamamlandığında ilan detayı yükleniyor
// TODO: SSR kontrolleri kaldırıldı, basit ve etkili çözüm
// TODO: NavigationEnd event'i ile timing sorunu çözüldü

import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './auth.service';
import { DataService, Listing, Pet } from './services/data.service';
import { HeaderComponent } from './header.component';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  template: `
    <app-header [isLoggedIn]="isLoggedIn" [currentUser]="currentUser"></app-header>
    
    <div class="listing-detail-container" *ngIf="listing">
      <!-- İlan Başlığı -->
      <div class="listing-header">
        <h1>{{ listing.title || 'Ev İlanı' }}</h1>
        <div class="listing-meta">
          <span class="location">📍 {{ listing.location }}</span>
          <span class="price">💰 {{ listing.price }} TL</span>
          <span class="status" [class]="listing.isAvailable ? 'available' : 'unavailable'">
            {{ listing.isAvailable ? '✅ Müsait' : '❌ Müsait Değil' }}
          </span>
        </div>
      </div>

      <!-- İlan Fotoğrafları -->
      <div class="listing-images" *ngIf="imageUrls.length > 0">
        <div class="main-image">
          <img [src]="imageUrls[0]" [alt]="listing.title || 'İlan fotoğrafı'" (click)="openImageModal(imageUrls[0])">
        </div>
        <div class="thumbnail-images" *ngIf="imageUrls.length > 1">
          <img 
            *ngFor="let imageUrl of imageUrls.slice(1); let i = index" 
            [src]="imageUrl" 
            [alt]="'İlan fotoğrafı ' + (i + 2)"
            (click)="openImageModal(imageUrl)"
            class="thumbnail">
        </div>
      </div>

      <!-- İlan Detayları -->
      <div class="listing-content">
        <div class="main-details">
          <div class="detail-section">
            <h3>📋 İlan Detayları</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Hayvan Türü:</strong> {{ getPetEmoji(listing.type) }} {{ listing.type }}
              </div>
              <div class="detail-item">
                <strong>Deneyim:</strong> {{ listing.experience }} yıl
              </div>
              <div class="detail-item">
                <strong>Başlangıç:</strong> {{ listing.startDate | date:'dd/MM/yyyy' }}
              </div>
              <div class="detail-item">
                <strong>Bitiş:</strong> {{ listing.endDate | date:'dd/MM/yyyy' }}
              </div>
              <div class="detail-item">
                <strong>Hizmetler:</strong> {{ listing.services || 'Belirtilmemiş' }}
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>📝 Açıklama</h3>
            <p>{{ listing.description || 'Açıklama bulunmuyor.' }}</p>
          </div>

          <!-- Bakıcı Bilgileri -->
          <div class="detail-section">
            <h3>👤 Bakıcı Bilgileri</h3>
            <div class="sitter-info">
              <div class="sitter-avatar">
                {{ listing.userName?.charAt(0) || 'U' }}
              </div>
              <div class="sitter-details">
                <h4>{{ listing.userName || 'İsimsiz' }}</h4>
                <p>📧 {{ listing.userEmail || 'Email bulunmuyor' }}</p>
                <p>📞 {{ listing.userPhone || 'Telefon bulunmuyor' }}</p>
                <p>⭐ {{ listing.userRating ? (listing.userRating + '/5') : 'Değerlendirme yok' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Rezervasyon Formu -->
        <div class="booking-section" *ngIf="listing.isAvailable">
          <h3>📅 Rezervasyon Yap</h3>
          <form (ngSubmit)="submitBooking()" #bookingForm="ngForm">
            <div class="form-group">
              <label for="startDate">Başlangıç Tarihi:</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate" 
                [(ngModel)]="booking.startDate" 
                required
                [min]="getTodayDate()">
            </div>

            <div class="form-group">
              <label for="endDate">Bitiş Tarihi:</label>
              <input 
                type="date" 
                id="endDate" 
                name="endDate" 
                [(ngModel)]="booking.endDate" 
                required
                [min]="booking.startDate">
            </div>

            <div class="form-group">
              <label for="petName">Evcil Hayvan Seçin:</label>
              <select 
                id="petName" 
                name="petName" 
                [(ngModel)]="selectedPetId" 
                (change)="updateSelectedPet()"
                required
                class="form-control"
                *ngIf="userPets.length > 0">
                <option value="">Pet seçin...</option>
                <option 
                  *ngFor="let pet of userPets" 
                  [value]="pet.id"
                  [selected]="pet.id === selectedPetId">
                  {{ pet.name }} ({{ pet.type }}, {{ pet.age }} yaş)
                </option>
              </select>
              <div class="no-pets-message" *ngIf="userPets.length === 0">
                <p>🐾 Henüz kayıtlı evcil hayvanınız yok.</p>
                <p>Rezervasyon yapabilmek için önce bir evcil hayvan eklemelisiniz.</p>
                <button type="button" (click)="goToAddPet()" class="add-pet-btn">Pet Ekle</button>
              </div>
              <small class="form-help" *ngIf="userPets.length > 0">Rezervasyon yapmak istediğiniz evcil hayvanı seçin</small>
            </div>

            <div class="form-group" *ngIf="selectedPetId">
              <label>Seçilen Pet Bilgileri:</label>
              <div class="selected-pet-info" *ngIf="getSelectedPet()">
                <div class="pet-detail">
                  <strong>Ad:</strong> {{ getSelectedPet()?.name }}
                </div>
                <div class="pet-detail">
                  <strong>Tür:</strong> {{ getPetEmoji(getSelectedPet()?.type || '') }} {{ getSelectedPet()?.type }}
                </div>
                <div class="pet-detail">
                  <strong>Yaş:</strong> {{ getSelectedPet()?.age }} yaş
                </div>
                <div class="pet-detail">
                  <strong>Cinsiyet:</strong> {{ getSelectedPet()?.gender || 'Belirtilmemiş' }}
                </div>
                <div class="pet-detail" *ngIf="getSelectedPet()?.description">
                  <strong>Açıklama:</strong> {{ getSelectedPet()?.description }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="notes">Özel Notlar:</label>
              <textarea 
                id="notes" 
                name="notes" 
                [(ngModel)]="booking.notes" 
                rows="3"
                placeholder="Evcil hayvanınız hakkında özel notlar..."></textarea>
            </div>

            <div class="booking-summary">
              <h4>Rezervasyon Özeti</h4>
              <div class="summary-item">
                <span>Günlük Ücret:</span>
                <span>{{ listing.price }} TL</span>
              </div>
              <div class="summary-item">
                <span>Toplam Gün:</span>
                <span>{{ getTotalDays() }} gün</span>
              </div>
              <div class="summary-item total">
                <span>Toplam Tutar:</span>
                <span>{{ getTotalPrice() }} TL</span>
              </div>
            </div>

            <button type="submit" class="booking-btn" [disabled]="!bookingForm.valid || isSubmitting">
              {{ isSubmitting ? 'Gönderiliyor...' : 'Rezervasyon Yap' }}
            </button>
          </form>
        </div>

        <!-- Giriş Gerekli Mesajı -->
        <div class="login-required" *ngIf="!isLoggedIn && listing.isAvailable">
          <h3>🔐 Rezervasyon için Giriş Gerekli</h3>
          <p>Rezervasyon yapabilmek için lütfen giriş yapın.</p>
          <button (click)="goToLogin()" class="login-btn">Giriş Yap</button>
        </div>

        <!-- Müsait Değil Mesajı -->
        <div class="unavailable-message" *ngIf="!listing.isAvailable">
          <h3>❌ Bu İlan Şu Anda Müsait Değil</h3>
          <p>Bu ilan şu anda rezervasyona kapalı. Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="isLoading">
      <div class="loading-spinner"></div>
      <p>İlan detayları yükleniyor...</p>
    </div>

    <!-- Error State -->
    <div class="error-container" *ngIf="error">
      <h3>❌ Hata Oluştu</h3>
      <p>{{ error }}</p>
      <button (click)="goBack()" class="back-btn">Geri Dön</button>
    </div>

    <!-- Image Modal -->
    <div class="image-modal" *ngIf="selectedImage" (click)="closeImageModal()">
      <div class="modal-content">
        <img [src]="selectedImage" alt="Büyük fotoğraf">
        <button class="close-modal" (click)="closeImageModal()">✕</button>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class ListingDetailComponent implements OnInit, OnDestroy {
  listing: Listing | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  isSubmitting: boolean = false;
  selectedImage: string | null = null;
  mainImageUrl: string = '';
  
  // Pet seçimi için
  userPets: Pet[] = [];
  selectedPetId: number | string | null = null;
  
  private subscriptions: Subscription[] = [];

  booking = {
    startDate: '',
    endDate: '',
    petName: '',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    console.log('ListingDetailComponent ngOnInit başladı');
    
    // Auth state'i dinle
    const authSub = this.authService.currentUser$.subscribe((user: User | null) => {
      this.isLoggedIn = user !== null;
      this.currentUser = user;
      
      // Kullanıcı giriş yapmışsa petlerini yükle
      if (user) {
        this.loadUserPets();
      }
    });
    this.subscriptions.push(authSub);

    // Router events'i dinle - navigation tamamlandığında ilan detayını yükle
    const routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const listingId = +this.route.snapshot.params['id'];
      if (listingId) {
        console.log('Navigation tamamlandı, ilan ID:', listingId);
        // Küçük delay ile ilan detayını yükle
        setTimeout(() => {
          this.loadListingDetail(listingId);
        }, 100);
      }
    });
    this.subscriptions.push(routerSub);

    // İlk yükleme için de route parametrelerini kontrol et
    const listingId = +this.route.snapshot.params['id'];
    if (listingId) {
      console.log('İlk yükleme, ilan ID:', listingId);
      setTimeout(() => {
        this.loadListingDetail(listingId);
      }, 200);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadListingDetail(listingId: number) {
    this.isLoading = true;
    this.error = null;

    console.log(`İlan detayı yükleniyor - ID: ${listingId}`);

    // Direkt olarak tek ilan getir
    this.dataService.getListingById(listingId).subscribe({
      next: (response) => {
        if (response) {
          this.listing = response;
          
          // Change detection'ı manuel olarak tetikle
          this.cdr.detectChanges();
          
          // Ana görseli ayarla
          const imageUrls = this.getImageUrls(this.listing.imageUrls || null);
          if (imageUrls && imageUrls.length > 0) {
            this.setMainImage(imageUrls[0]);
          } else {
            this.setMainImage('https://via.placeholder.com/600x400?text=No+Image'); // Varsayılan görsel
          }

        } else {
          this.error = 'İlan bulunamadı';
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('İlan detayı yüklenirken hata:', error);
        if (error.status === 404) {
          this.error = 'İlan bulunamadı';
        } else {
          this.error = 'İlan yüklenirken bir hata oluştu';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUserPets() {
    if (!this.currentUser?.id) return;
    
    this.dataService.getUserPets(this.currentUser.id).subscribe({
      next: (pets) => {
        this.userPets = pets || [];
        console.log('Kullanıcı petleri yüklendi:', this.userPets);
        
        // İlk peti varsayılan olarak seç
        if (this.userPets.length > 0) {
          this.selectedPetId = this.userPets[0].id;
          this.updateSelectedPet();
        }
      },
      error: (error) => {
        console.error('Pet bilgileri yüklenirken hata:', error);
      }
    });
  }

  updateSelectedPet() {
    console.log('updateSelectedPet çağrıldı, selectedPetId:', this.selectedPetId, 'tip:', typeof this.selectedPetId);
    console.log('Mevcut petler:', this.userPets);
    
    if (this.selectedPetId) {
      // String'den number'a çevir (HTML select'ten string gelir)
      const petId = typeof this.selectedPetId === 'string' ? parseInt(this.selectedPetId) : this.selectedPetId;
      const selectedPet = this.userPets.find(p => p.id === petId);
      console.log('Bulunan pet:', selectedPet);
      
      if (selectedPet) {
        this.booking.petName = selectedPet.name;
        this.selectedPetId = petId; // Sayısal değer olarak sakla
      }
    }
  }

  getSelectedPet(): Pet | undefined {
    if (!this.selectedPetId) return undefined;
    // String'den number'a çevir (HTML select'ten string gelir)
    const petId = typeof this.selectedPetId === 'string' ? parseInt(this.selectedPetId) : this.selectedPetId;
    return this.userPets.find(p => p.id === petId);
  }

  get imageUrls(): string[] {
    if (!this.listing?.imageUrls) return [];
    try {
      return JSON.parse(this.listing.imageUrls);
    } catch (error) {
      console.error('Error parsing imageUrls:', error);
      return [];
    }
  }

  getImageUrls(imageUrlsJson: string | null): string[] {
    if (!imageUrlsJson) {
      return [];
    }
    try {
      const urls = JSON.parse(imageUrlsJson);
      return Array.isArray(urls) ? urls : [];
    } catch (e) {
      console.error('Error parsing image URLs:', e);
      return [];
    }
  }

  setMainImage(url: string) {
    this.mainImageUrl = url;
  }

  getPetEmoji(type: string): string {
    switch (type?.toLowerCase()) {
      case 'köpek': return '🐕';
      case 'kedi': return '🐱';
      case 'kuş': return '🦜';
      case 'balık': return '🐠';
      case 'hamster': return '🐹';
      case 'tavşan': return '🐰';
      default: return '🐾';
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTotalDays(): number {
    if (!this.booking.startDate || !this.booking.endDate) return 0;
    
    const start = new Date(this.booking.startDate);
    const end = new Date(this.booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // Başlangıç günü dahil
  }

  getTotalPrice(): number {
    if (!this.listing) return 0;
    return this.getTotalDays() * this.listing.price;
  }

  submitBooking() {
    if (!this.isLoggedIn) {
      this.goToLogin();
      return;
    }

    if (!this.booking.startDate || !this.booking.endDate || !this.selectedPetId) {
      alert('Lütfen tüm gerekli alanları doldurun (tarih ve pet seçimi)');
      return;
    }

    if (!this.listing) {
      alert('Rezervasyon yapılacak ilan bulunamadı');
      return;
    }

    const selectedPet = this.getSelectedPet();
    console.log('submitBooking - selectedPet:', selectedPet);
    console.log('submitBooking - selectedPetId:', this.selectedPetId);
    
    if (!selectedPet) {
      alert('Lütfen geçerli bir pet seçin');
      return;
    }

    this.isSubmitting = true;
    
    const bookingData = {
      userId: this.currentUser?.id || 0,
      listingId: this.listing.id,
      startDate: this.booking.startDate,
      endDate: this.booking.endDate,
      petName: selectedPet.name,
      petId: selectedPet.id,
      petType: selectedPet.type,
      petAge: selectedPet.age,
      notes: this.booking.notes,
      totalPrice: this.getTotalPrice(),
      status: 'Pending' as const,
      userEmail: this.currentUser?.email || ''
    };

    console.log('Rezervasyon gönderiliyor:', bookingData);

    this.dataService.createBooking(bookingData).subscribe({
      next: (newBooking) => {
        console.log('Rezervasyon başarıyla oluşturuldu:', newBooking);
        alert('Rezervasyon talebiniz başarıyla gönderildi! İlan sahibi ile iletişime geçeceğiz.');
        this.isSubmitting = false;
        
        // Form'u temizle
        this.booking = {
          startDate: '',
          endDate: '',
          petName: '',
          notes: ''
        };
        this.selectedPetId = null;
        
        // Rezervasyonlarım sayfasına yönlendir
        this.router.navigate(['/bookings']);
      },
      error: (error) => {
        console.error('Rezervasyon oluşturulurken hata:', error);
        alert('Rezervasyon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        this.isSubmitting = false;
      }
    });
  }

  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  closeImageModal() {
    this.selectedImage = null;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToAddPet() {
    this.router.navigate(['/pet-profile']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
