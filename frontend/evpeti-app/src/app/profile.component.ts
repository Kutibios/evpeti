import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  pets: any[] = [];
  listings: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log('ProfileComponent ngOnInit started');
    
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.authService.getCurrentUser();
    console.log('Current user loaded:', this.user);
    
    if (!this.user || !this.user.id) {
      console.error('User or user ID is missing:', this.user);
      this.errorMessage = 'Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın.';
      this.isLoading = false;
      return;
    }
    
    console.log('User ID:', this.user.id);
    // Doğrudan verileri yükle
    this.loadUserData();
  }

  loadUserData() {
    console.log('Loading user data - Starting to load user data');
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Loading user data for user ID:', this.user.id);

    // HTTP headers ekle
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Timeout ile API çağrısı
    const timeout = 10000; // 10 saniye

    // Her iki API çağrısını da tamamladığımızda loading'i false yap
    let petsLoaded = false;
    let listingsLoaded = false;

    const checkAllLoaded = () => {
      if (petsLoaded && listingsLoaded) {
        this.isLoading = false;
        console.log('All data loaded successfully');
      }
    };

    // Kullanıcının pet'lerini yükle
    console.log('Making API call to:', `http://localhost:5083/api/pets/user/${this.user.id}`);
    this.http.get(`http://localhost:5083/api/pets/user/${this.user.id}`, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('User pets from API:', response);
          this.pets = response || [];
          console.log('User pets loaded:', this.pets);
          petsLoaded = true;
          checkAllLoaded();
        },
        error: (error) => {
          console.error('Error loading pets:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          if (error.status === 0) {
            this.errorMessage = 'Backend sunucusu çalışmıyor. Lütfen backend\'i başlatın.';
          } else {
            this.errorMessage = 'Pet profilleri yüklenirken hata oluştu: ' + error.message;
          }
          this.pets = [];
          petsLoaded = true;
          checkAllLoaded();
        },
        complete: () => {
          console.log('Pets loading completed');
        }
      });

    // Kullanıcının listing'lerini yükle
    console.log('Making API call to:', `http://localhost:5083/api/listings/user/${this.user.id}`);
    this.http.get(`http://localhost:5083/api/listings/user/${this.user.id}`, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('User listings from API:', response);
          this.listings = response || [];
          console.log('User listings loaded:', this.listings);
          listingsLoaded = true;
          checkAllLoaded();
        },
        error: (error) => {
          console.error('Error loading listings:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          if (error.status === 0) {
            this.errorMessage = 'Backend sunucusu çalışmıyor. Lütfen backend\'i başlatın.';
          } else {
            this.errorMessage = 'İlanlar yüklenirken hata oluştu: ' + error.message;
          }
          this.listings = [];
          listingsLoaded = true;
          checkAllLoaded();
        },
        complete: () => {
          console.log('Listings loading completed');
        }
      });

    // Timeout kontrolü
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.errorMessage = 'Veriler yüklenirken zaman aşımı oluştu. Lütfen tekrar deneyin.';
        console.log('Timeout occurred');
      }
    }, timeout);
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
    this.authService.logout();
    this.router.navigate(['/']);
  }

  debugUserInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('Current user:', this.user);
    console.log('User ID:', this.user?.id);
    console.log('Is logged in:', this.authService.isLoggedIn());
    console.log('Pets count:', this.pets.length);
    console.log('Listings count:', this.listings.length);
    console.log('Is loading:', this.isLoading);
    console.log('Error message:', this.errorMessage);
    console.log('==================');
    
    // API endpoint'lerini test et
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    console.log('Testing pets API...');
    this.http.get(`http://localhost:5083/api/pets/user/${this.user.id}`, { headers })
      .subscribe({
        next: (response) => console.log('Pets API response:', response),
        error: (error) => console.error('Pets API error:', error)
      });
      
    console.log('Testing listings API...');
    this.http.get(`http://localhost:5083/api/listings/user/${this.user.id}`, { headers })
      .subscribe({
        next: (response) => console.log('Listings API response:', response),
        error: (error) => console.error('Listings API error:', error)
      });
  }

  editPet(pet: any) {
    console.log('Edit pet:', pet);
    // Pet düzenleme sayfasına yönlendir
    this.router.navigate(['/pet-profile'], { queryParams: { edit: pet.id } });
  }

  deletePet(petId: number) {
    if (confirm('Bu pet profilini silmek istediğinizden emin misiniz?')) {
      console.log('Delete pet:', petId);
      // API'den silme işlemi
      this.http.delete(`http://localhost:5083/api/pets/${petId}`)
        .subscribe({
          next: () => {
            this.pets = this.pets.filter(pet => pet.id !== petId);
            console.log('Pet deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting pet:', error);
            // Test verilerinden sil
            this.pets = this.pets.filter(pet => pet.id !== petId);
          }
        });
    }
  }

  editListing(listing: any) {
    console.log('Edit listing:', listing);
    // Listing düzenleme sayfasına yönlendir
    this.router.navigate(['/sitter-profile'], { queryParams: { edit: listing.id } });
  }

  deleteListing(listingId: number) {
    if (confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      console.log('Delete listing:', listingId);
      // API'den silme işlemi
      this.http.delete(`http://localhost:5083/api/listings/${listingId}`)
        .subscribe({
          next: () => {
            this.listings = this.listings.filter(listing => listing.id !== listingId);
            console.log('Listing deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting listing:', error);
            // Test verilerinden sil
            this.listings = this.listings.filter(listing => listing.id !== listingId);
          }
        });
    }
  }
} 