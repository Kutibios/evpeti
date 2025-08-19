import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { DataService, Listing } from './services/data.service';
import { UIService } from './services/ui.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sitter-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sitter-profile.component.html',
  styleUrls: ['./sitter-profile.component.css']
})
export class SitterProfileComponent implements OnInit, OnDestroy {
  listingForm = {
    title: '',
    type: '',
    description: '',
    price: 0,
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    isAvailable: true,
    status: 'active',
    experience: 0,
    services: '',
    imageUrls: [] as string[],
    isActive: true
  };

  isEditMode = false;
  editListingId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Fotoğraf URL ekleme
  newImageUrl = '';

  private uiSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dataService: DataService,
    private uiService: UIService
  ) {
    // UI state'i dinle
    this.uiSubscription = this.uiService.uiState$.subscribe(state => {
      this.isLoading = state.isLoading;
      this.errorMessage = state.errorMessage;
      this.successMessage = state.successMessage;
    });
  }

  ngOnInit() {
    // Query parameter'dan edit mode'u kontrol et
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;
        this.editListingId = +params['edit'];
        this.loadListingForEdit(this.editListingId);
      }
    });
  }

  loadListingForEdit(listingId: number) {
    this.uiService.setLoading(true);
    
    // Mevcut listing'leri yükle ve düzenlenecek olanı bul
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.dataService.getUserListings(user.id).subscribe({
        next: (listings) => {
          const listingToEdit = listings.find(l => l.id === listingId);
          if (listingToEdit) {
            this.listingForm = {
              title: listingToEdit.title || '',
              type: listingToEdit.type || '',
              description: listingToEdit.description || '',
              price: listingToEdit.price,
              location: listingToEdit.location || '',
              startDate: new Date(listingToEdit.startDate),
              endDate: new Date(listingToEdit.endDate),
              isAvailable: listingToEdit.isAvailable,
              status: listingToEdit.status || 'active',
              experience: listingToEdit.experience || 0,
              services: listingToEdit.services || '',
              imageUrls: this.parseImageUrls(listingToEdit.imageUrls || null),
              isActive: listingToEdit.isActive !== undefined ? listingToEdit.isActive : true
            };
          }
          this.uiService.setLoading(false);
        },
        error: (error) => {
          console.error('Error loading listing for edit:', error);
          this.uiService.setError('İlan bilgileri yüklenirken hata oluştu');
          this.uiService.setLoading(false);
        }
      });
    }
  }

  onSubmit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Form validation
    if (!this.listingForm.title || !this.listingForm.title.trim()) {
      this.uiService.setError('İlan başlığı gereklidir');
      return;
    }
    
    if (!this.listingForm.type || !this.listingForm.type.trim()) {
      this.uiService.setError('Hayvan türü seçimi gereklidir');
      return;
    }
    
    if (!this.listingForm.location || !this.listingForm.location.trim()) {
      this.uiService.setError('Konum bilgisi gereklidir');
      return;
    }
    
    if (this.listingForm.price <= 0) {
      this.uiService.setError('Günlük ücret 0\'dan büyük olmalıdır');
      return;
    }
    
    // Tarih validation
    if (!this.listingForm.startDate) {
      this.uiService.setError('Başlangıç tarihi gereklidir');
      return;
    }
    
    if (!this.listingForm.endDate) {
      this.uiService.setError('Bitiş tarihi gereklidir');
      return;
    }
    
    if (this.listingForm.startDate >= this.listingForm.endDate) {
      this.uiService.setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    this.uiService.setLoading(true);

    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      this.uiService.setError('Kullanıcı bilgileri bulunamadı');
      this.uiService.setLoading(false);
      return;
    }

    // Fotoğraf URL'leri kullan
    let finalImageUrls = [...this.listingForm.imageUrls];
    
    console.log('Mevcut fotoğraflar:', finalImageUrls.length);

          const listingData = {
        ...this.listingForm,
        userId: user.id,
        status: 'active', // Status alanını ekle
        // Backend'de ImageUrls string olarak saklanıyor, JSON string'e çevir
        imageUrls: finalImageUrls.length > 0 ? JSON.stringify(finalImageUrls) : null
      };

          console.log('Listing data hazırlandı:', listingData);
      console.log('API çağrısı yapılıyor...');
      console.log('Backend URL:', 'http://localhost:5083/api/listings');
      console.log('ImageUrls JSON string:', listingData.imageUrls);
      console.log('ImageUrls parsed:', listingData.imageUrls ? JSON.parse(listingData.imageUrls) : []);
      
      // Test için basit bir listing oluştur
      const testListingData = {
        userId: user.id,
        title: 'Test İlan',
        type: 'Köpek',
        price: 50,
        location: 'İstanbul',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
        isAvailable: true,
        status: 'active',
        experience: 2,
        services: 'Günlük bakım',
        description: 'Test açıklama',
        imageUrls: null,
        isActive: true
      };
      
      console.log('Test listing data:', testListingData);

    if (this.isEditMode && this.editListingId) {
      // Update existing listing
      this.dataService.updateListing(this.editListingId, listingData).subscribe({
        next: (updatedListing) => {
          console.log('Listing updated successfully:', updatedListing);
          this.uiService.setSuccess('İlan başarıyla güncellendi!');
          this.uiService.setLoading(false);
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating listing:', error);
          this.handleApiError(error);
        }
      });
          } else {
        // Create new listing - önce test listing ile deneyelim
        console.log('Test listing ile API çağrısı yapılıyor...');
        this.dataService.createListing(testListingData).subscribe({
          next: (newListing) => {
            console.log('Test listing created successfully:', newListing);
            this.uiService.setSuccess('Test ilan başarıyla oluşturuldu!');
            this.uiService.setLoading(false);
            setTimeout(() => {
              this.router.navigate(['/profile']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error creating test listing:', error);
            console.log('Şimdi gerçek listing ile deneyelim...');
            
            // Test başarısız olursa gerçek listing ile dene
            this.dataService.createListing(listingData).subscribe({
              next: (newListing) => {
                console.log('Listing created successfully:', newListing);
                this.uiService.setSuccess('İlan başarıyla oluşturuldu!');
                this.uiService.setLoading(false);
                setTimeout(() => {
                  this.router.navigate(['/profile']);
                }, 1500);
              },
              error: (error2) => {
                console.error('Error creating listing:', error2);
                this.handleApiError(error2);
              }
            });
          }
        });
      }
  }

  private handleApiError(error: any) {
    this.uiService.setLoading(false);
    
    console.error('handleApiError called with:', error);
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);
    console.error('Error error:', error.error);
    
    if (error.status === 0) {
      this.uiService.setError('Backend sunucusuna bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
    } else if (error.status === 400) {
      this.uiService.setError('Geçersiz veri: ' + (error.error || 'Bilinmeyen hata'));
    } else if (error.status === 500) {
      this.uiService.setError('Sunucu hatası: ' + (error.error || 'Bilinmeyen hata'));
    } else {
      this.uiService.setError('İlan işlemi sırasında hata oluştu: ' + (error.error || error.message || 'Bilinmeyen hata'));
    }
  }

  // Fotoğraf URL ekleme metodları
  addImageUrl() {
    if (!this.newImageUrl || this.newImageUrl.trim() === '') {
      this.uiService.setError('Lütfen geçerli bir URL girin');
      return;
    }

    if (this.listingForm.imageUrls.length >= 5) {
      this.uiService.setError('En fazla 5 fotoğraf ekleyebilirsiniz');
      return;
    }

    // URL formatını kontrol et
    try {
      new URL(this.newImageUrl);
    } catch {
      this.uiService.setError('Geçerli bir URL formatı girin');
      return;
    }

    this.listingForm.imageUrls.push(this.newImageUrl.trim());
    this.newImageUrl = ''; // Input'u temizle
    this.uiService.setSuccess('Fotoğraf URL\'si eklendi');
  }

  removeExistingImage(index: number) {
    if (this.listingForm.imageUrls && this.listingForm.imageUrls.length > index) {
      this.listingForm.imageUrls.splice(index, 1);
      this.uiService.setSuccess('Fotoğraf kaldırıldı');
    }
  }

  // ImageUrls'i parse etme methodu
  private parseImageUrls(imageUrls: string | null): string[] {
    if (!imageUrls) return [];
    try {
      return JSON.parse(imageUrls);
    } catch (error) {
      console.error('Error parsing imageUrls:', error);
      return [];
    }
  }

  onCancel() {
    this.router.navigate(['/profile']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.uiSubscription) {
      this.uiSubscription.unsubscribe();
    }
  }
} 