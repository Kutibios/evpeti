import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { DataService, Pet, Listing } from './services/data.service';
import { UIService } from './services/ui.service';
import { HeaderComponent } from './header.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  user: any = null;
  pets: Pet[] = [];
  listings: Listing[] = [];
  
  // Header properties
  isLoggedIn = false;
  
  // UI state subscriptions
  private uiSubscription: Subscription;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showConfirmDialog = false;
  confirmDialogData: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private uiService: UIService,
    private cdr: ChangeDetectorRef
  ) {
    // UI state'i dinle
    this.uiSubscription = this.uiService.uiState$.subscribe(state => {
      this.isLoading = state.isLoading;
      this.errorMessage = state.errorMessage;
      this.successMessage = state.successMessage;
      this.showConfirmDialog = state.showConfirmDialog;
      this.confirmDialogData = state.confirmDialogData;
    });

    // DataService state'ini dinle - DL pattern
    this.dataService.pets$.subscribe({
      next: (pets) => {
        this.pets = pets || [];
        // SSR sırasında detectChanges çağırma
        if (typeof document !== 'undefined') {
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Pets subscription error:', error);
        this.pets = [];
        if (typeof document !== 'undefined') {
          this.cdr.detectChanges();
        }
      }
    });

    this.dataService.listings$.subscribe({
      next: (listings) => {
        this.listings = listings || [];
        if (typeof document !== 'undefined') {
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Listings subscription error:', error);
        this.listings = [];
        if (typeof document !== 'undefined') {
          this.cdr.detectChanges();
        }
      }
    });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.authService.getCurrentUser();
    this.isLoggedIn = true;
    
    if (!this.user || !this.user.id) {
      this.uiService.setError('Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın.');
      return;
    }
  }

  ngAfterViewInit() {
    // View init olduktan sonra veri yükle
    if (this.user && this.user.id) {
      this.loadUserData();
    } else {
      // Kullanıcı verisi hazır olana kadar bekle
      setTimeout(() => {
        if (this.user && this.user.id) {
          this.loadUserData();
        } else {
          this.uiService.setError('Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın.');
        }
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.uiSubscription) {
      this.uiSubscription.unsubscribe();
    }
    // DataService subscription'larını temizle ama state'i sıfırlama
    // this.dataService.clearState(); // Bu satırı kaldırdık
  }

  loadUserData() {
    // Kullanıcı kontrolü ekle
    if (!this.user || !this.user.id) {
      this.uiService.setError('Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın.');
      return;
    }
    
    this.uiService.setLoading(true);

    // DL Pattern: Data Layer'dan veri çek
    
    // Pets'i yükle
    this.dataService.getUserPets(this.user.id).subscribe({
      next: (pets) => {
        this.uiService.setLoading(false);
        if (typeof document !== 'undefined') {
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading pets:', error);
        this.uiService.setLoading(false);
        if (error.status === 0) {
          this.uiService.setError('Backend sunucusu çalışmıyor. Lütfen backend\'i başlatın.');
        } else {
          this.uiService.setError('Pet profilleri yüklenirken hata oluştu: ' + error.message);
        }
        if (typeof document !== 'undefined') {
          this.cdr.detectChanges();
        }
      }
    });

    // Listings'i yükle
    this.dataService.getUserListings(this.user.id).subscribe({
      next: (listings) => {
        this.listings = listings || [];
        this.uiService.setLoading(false);
        if (typeof document !== 'undefined') {
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading listings:', error);
        this.uiService.setLoading(false);
        if (error.status === 0) {
          this.uiService.setError('Backend sunucusu çalışmıyor. Lütfen backend\'i başlatın.');
        } else {
          this.uiService.setError('İlanlar yüklenirken hata oluştu: ' + error.message);
        }
        if (typeof document !== 'undefined') {
          this.cdr.detectChanges();
        }
      }
    });
  }



  goHome() {
    this.router.navigate(['/']);
  }

  createPetProfile() {
    this.router.navigate(['/pet-profile']);
  }

  createSitterProfile() {
    this.router.navigate(['/sitter-profile']);
  }

  logout() {
    // this.dataService.clearState(); // Bu satırı kaldırdık
    this.uiService.resetState();
    this.authService.logout();
    this.router.navigate(['/']);
  }



  editPet(pet: Pet) {
    console.log('Edit pet:', pet);
    this.router.navigate(['/pet-profile'], { queryParams: { edit: pet.id } });
  }

  deletePet(petId: number) {
    this.uiService.showConfirmDialog(
      'Pet Profili Sil',
      'Bu pet profilini silmek istediğinizden emin misiniz?',
      'Evet, Sil',
      'İptal',
      () => {
        console.log('Delete pet:', petId);
        this.uiService.setLoading(true);
        
        this.dataService.deletePet(petId).subscribe({
          next: () => {
            this.uiService.setSuccess('Pet profili başarıyla silindi');
            this.uiService.setLoading(false);
          },
          error: (error) => {
            console.error('Error deleting pet:', error);
            this.uiService.setError('Pet profili silinirken hata oluştu: ' + error.message);
            this.uiService.setLoading(false);
          }
        });
      }
    );
  }

  editListing(listing: Listing) {
    console.log('Edit listing:', listing);
    this.router.navigate(['/sitter-profile'], { queryParams: { edit: listing.id } });
  }

  deleteListing(listingId: number) {
    this.uiService.showConfirmDialog(
      'İlan Sil',
      'Bu ilanı silmek istediğinizden emin misiniz?',
      'Evet, Sil',
      'İptal',
      () => {
        console.log('Delete listing:', listingId);
        this.uiService.setLoading(true);
        
        this.dataService.deleteListing(listingId).subscribe({
          next: () => {
            this.uiService.setSuccess('İlan başarıyla silindi');
            this.uiService.setLoading(false);
          },
          error: (error) => {
            console.error('Error deleting listing:', error);
            this.uiService.setError('İlan silinirken hata oluştu: ' + error.message);
            this.uiService.setLoading(false);
          }
        });
      }
    );
  }

  // Confirm dialog methods
  onConfirmDialogConfirm() {
    if (this.confirmDialogData?.onConfirm) {
      this.confirmDialogData.onConfirm();
    }
    this.uiService.hideConfirmDialog();
  }

  onConfirmDialogCancel() {
    this.uiService.hideConfirmDialog();
  }

  onCloseSuccess() {
    this.uiService.clearSuccess();
  }

  // Fotoğraf modal'ı açma
  openImageModal(imageUrl: string, title: string) {
    // Basit bir modal açma (daha gelişmiş modal için ayrı component yapılabilir)
    window.open(imageUrl, '_blank');
  }

  // ImageUrls'i parse etme methodu
  getImageUrls(imageUrls: string | null): string[] {
    console.log('getImageUrls called with:', imageUrls);
    if (!imageUrls) {
      console.log('imageUrls is null or empty');
      return [];
    }
    try {
      const parsed = JSON.parse(imageUrls);
      console.log('Successfully parsed imageUrls:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error parsing imageUrls:', error);
      console.log('Raw imageUrls value:', imageUrls);
      return [];
    }
  }
} 