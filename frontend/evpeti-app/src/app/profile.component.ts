import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
    private uiService: UIService
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
        console.log('Pets subscription triggered:', pets);
        this.pets = pets || [];
        console.log('Pets updated from DataService:', this.pets);
      },
      error: (error) => {
        console.error('Pets subscription error:', error);
        this.pets = [];
      }
    });

    this.dataService.listings$.subscribe({
      next: (listings) => {
        console.log('Listings subscription triggered:', listings);
        this.listings = listings || [];
        console.log('Listings updated from DataService:', this.listings);
      },
      error: (error) => {
        console.error('Listings subscription error:', error);
        this.listings = [];
      }
    });
  }

  ngOnInit() {
    console.log('ProfileComponent ngOnInit started');
    
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.authService.getCurrentUser();
    this.isLoggedIn = true;
    console.log('Current user loaded:', this.user);
    
    if (!this.user || !this.user.id) {
      console.error('User or user ID is missing:', this.user);
      this.uiService.setError('Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın.');
      return;
    }
    
    console.log('User ID:', this.user.id);
  }

  ngAfterViewInit() {
    // View init olduktan sonra veri yükle
    console.log('ngAfterViewInit triggered');
    this.loadUserData();
  }

  ngOnDestroy() {
    if (this.uiSubscription) {
      this.uiSubscription.unsubscribe();
    }
    // DataService subscription'larını temizle ama state'i sıfırlama
    // this.dataService.clearState(); // Bu satırı kaldırdık
  }

  loadUserData() {
    console.log('Loading user data for user ID:', this.user.id);
    this.uiService.setLoading(true);

    // DL Pattern: Data Layer'dan veri çek
    console.log('=== DL Pattern: Loading Data ===');
    
    // Pets'i yükle
    this.dataService.getUserPets(this.user.id).subscribe({
      next: (pets) => {
        console.log('DL: Pets loaded successfully:', pets);
        console.log('DL: Pets count:', pets?.length || 0);
        this.uiService.setLoading(false);
      },
      error: (error) => {
        console.error('DL: Error loading pets:', error);
        this.uiService.setLoading(false);
        if (error.status === 0) {
          this.uiService.setError('Backend sunucusu çalışmıyor. Lütfen backend\'i başlatın.');
        } else {
          this.uiService.setError('Pet profilleri yüklenirken hata oluştu: ' + error.message);
        }
      }
    });

    // Listings'i yükle
    this.dataService.getUserListings(this.user.id).subscribe({
      next: (listings) => {
        console.log('DL: Listings loaded successfully:', listings);
        console.log('DL: Listings count:', listings?.length || 0);
        this.listings = listings || []; // Listings'i component'e ata
        console.log('DL: Listings assigned to component:', this.listings);
        console.log('DL: First listing imageUrls:', this.listings[0]?.imageUrls);
        this.uiService.setLoading(false);
      },
      error: (error) => {
        console.error('DL: Error loading listings:', error);
        this.uiService.setLoading(false);
        if (error.status === 0) {
          this.uiService.setError('Backend sunucusu çalışmıyor. Lütfen backend\'i başlatın.');
        } else {
          this.uiService.setError('İlanlar yüklenirken hata oluştu: ' + error.message);
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

  debugUserInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('Current user:', this.user);
    console.log('User ID:', this.user?.id);
    console.log('Is logged in:', this.authService.isLoggedIn());
    console.log('Pets count:', this.pets.length);
          console.log('Pets details:', this.pets.map(pet => ({
        id: pet.id,
        name: pet.name,
        photo: pet.photo,
        hasPhoto: !!pet.photo
      })));
    console.log('Listings count:', this.listings.length);
    console.log('Is loading:', this.isLoading);
    console.log('Error message:', this.errorMessage);
    console.log('==================');
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
    if (!imageUrls) return [];
    try {
      return JSON.parse(imageUrls);
    } catch (error) {
      console.error('Error parsing imageUrls:', error);
      return [];
    }
  }
} 