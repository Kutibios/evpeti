import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './auth.service';
import { DataService, Listing } from './services/data.service';
import { HeaderComponent } from './header.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./app.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  listings: Listing[] = [];
  isLoading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalCount: number = 0;
  hasMoreListings: boolean = true;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router, 
    private authService: AuthService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  goToHome() {
    this.router.navigate(['/']);
  }

  goToListingDetail(listingId: number) {
    console.log('İlan detayına gidiliyor:', listingId);
    this.router.navigate(['/listing', listingId]);
  }

  ngOnInit() {
    console.log('HomeComponent ngOnInit başladı');
    
    // SSR sırasında document mevcut değil, sadece browser'da çalıştır
    if (typeof document !== 'undefined') {
      console.log('Document mevcut (Browser), tüm işlemler yapılıyor...');
      
      // Auth state'i dinle
      const authSub = this.authService.currentUser$.subscribe((user: User | null) => {
        console.log('User state changed:', user);
        this.isLoggedIn = user !== null;
        this.currentUser = user;
        console.log('Updated state:', { isLoggedIn: this.isLoggedIn, currentUser: this.currentUser });
      });
      this.subscriptions.push(authSub);
      
      // DataService'ten listings'i dinle
      const listingsSub = this.dataService.listings$.subscribe((listings: Listing[]) => {
        console.log('DataService\'ten listings güncellendi:', listings);
        if (listings && listings.length > 0) {
          this.listings = listings;
          console.log('Component listings güncellendi:', this.listings);
          // Change detection'ı tetikle
          this.cdr.detectChanges();
        }
      });
      this.subscriptions.push(listingsSub);
      
      // İlanları yükle - sadece browser'da
      console.log('İlanlar yüklenmeye başlanıyor...');
      setTimeout(() => {
        this.loadListings();
      }, 100);
      
      // Dropdown ve search setup
      this.setupDropdowns();
      this.setupSearch();
      
    } else {
      console.log('Document mevcut değil (SSR), sadece temel işlemler yapılıyor...');
      
      // SSR sırasında sadece auth state'i dinle (HTTP isteği yapmadan)
      const authSub = this.authService.currentUser$.subscribe((user: User | null) => {
        this.isLoggedIn = user !== null;
        this.currentUser = user;
      });
      this.subscriptions.push(authSub);
    }
    
    console.log('HomeComponent ngOnInit tamamlandı');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  logout() {
    console.log('Logout called from home component');
    this.authService.logout();
    // Sayfayı yenilemek yerine router ile yönlendir
    this.router.navigate(['/']);
  }

  createPetProfile() {
    console.log('Create pet profile clicked');
    // Pet profili oluşturma sayfasına yönlendir
    this.router.navigate(['/pet-profile']);
  }

  createSitterProfile() {
    console.log('Create sitter profile clicked');
    // Bakıcı profili oluşturma sayfasına yönlendir
    this.router.navigate(['/sitter-profile']);
  }

  showLoginRequired(type: 'pet' | 'sitter') {
    const message = type === 'pet' 
      ? 'Pet profili oluşturmak için önce giriş yapmalısınız!'
      : 'Bakıcı profili oluşturmak için önce giriş yapmalısınız!';
    
    alert(message);
    this.router.navigate(['/login']);
  }



  setupDropdowns() {
    this.setupLocationDropdown();
    this.setupPetTypeDropdown();
  }

  setupSearch() {
    this.setupSearchButton();
  }

  setupLocationDropdown() {
    if (typeof document === 'undefined') return;
    
    const locationInput = document.getElementById('location') as HTMLInputElement;
    const locationDropdown = document.getElementById('location-dropdown') as HTMLDivElement;
    
    if (!locationInput || !locationDropdown) return;

    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Diyarbakır'];
    
    locationInput.addEventListener('focus', () => {
      this.displayDropdown(locationDropdown, cities, locationInput);
    });

    locationInput.addEventListener('input', () => {
      const value = locationInput.value.toLowerCase();
      const filteredCities = cities.filter(city => 
        city.toLowerCase().includes(value)
      );
      this.displayDropdown(locationDropdown, filteredCities, locationInput);
    });
  }

  setupPetTypeDropdown() {
    if (typeof document === 'undefined') return;
    
    const petTypeInput = document.getElementById('pet-type') as HTMLInputElement;
    const petTypeDropdown = document.getElementById('pet-type-dropdown') as HTMLDivElement;
    
    if (!petTypeInput || !petTypeDropdown) return;

    const petTypes = ['Köpek', 'Kedi', 'Kuş', 'Balık', 'Hamster', 'Tavşan', 'Diğer'];
    
    petTypeInput.addEventListener('focus', () => {
      this.displayDropdown(petTypeDropdown, petTypes, petTypeInput);
    });

    petTypeInput.addEventListener('input', () => {
      const value = petTypeInput.value.toLowerCase();
      const filteredTypes = petTypes.filter(type => 
        type.toLowerCase().includes(value)
      );
      this.displayDropdown(petTypeDropdown, filteredTypes, petTypeInput);
    });
  }

  displayDropdown(dropdown: HTMLDivElement, items: string[], input: HTMLInputElement) {
    if (typeof document === 'undefined') return;
    
    dropdown.innerHTML = '';
    dropdown.style.display = 'block';
    
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'dropdown-item';
      div.textContent = item;
      div.addEventListener('click', () => {
        input.value = item;
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(div);
    });
  }

  setupSearchButton() {
    if (typeof document === 'undefined') return;
    
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        this.performSearch();
      });
    }
  }

  loadListings(page: number = 1, append: boolean = false) {
    // SSR sırasında HTTP isteği yapma
    if (typeof document === 'undefined') {
      console.log('SSR sırasında HTTP isteği yapılmadı');
      return;
    }
    
    // Eğer zaten yükleniyorsa, yeni istek yapma
    if (this.isLoading) {
      console.log('Zaten yükleniyor, yeni istek yapılmadı');
      return;
    }

    console.log(`İlanlar yükleniyor - Sayfa: ${page}, Append: ${append}`);
    this.isLoading = true;
    
    this.dataService.getAllListings(page, this.pageSize).subscribe({
      next: (response) => {
        console.log('API yanıtı alındı:', response);
        console.log('Response type:', typeof response);
        console.log('Response is array:', Array.isArray(response));
        
        let listings: Listing[] = [];
        let totalCount = 0;
        let totalPages = 1;
        
        // Check if response is array (no pagination) or object (with pagination)
        if (Array.isArray(response)) {
          // No pagination - response is direct array
          listings = response;
          totalCount = listings.length;
          totalPages = 1;
          
        } else if (response && typeof response === 'object') {
          // With pagination - response is object
          console.log('Response keys:', Object.keys(response));
          console.log('Response.Listings:', response.Listings);
          console.log('Response.listings:', response.listings);
          
          // Try different property names
          listings = response.Listings || response.listings || [];
          totalCount = response.TotalCount || response.totalCount || 0;
          totalPages = response.TotalPages || response.totalPages || 1;
          
        } else {
          // Empty or invalid response
          listings = [];
          totalCount = 0;
          totalPages = 1;
        }
        
        // Update listings array
        if (append && page > 1) {
          // Append mode - add to existing listings
          this.listings = [...this.listings, ...listings];
          console.log(`İlanlar eklendi. Toplam: ${this.listings.length}`);
        } else {
          // Replace mode - replace all listings
          this.listings = listings;
          console.log(`İlanlar değiştirildi. Toplam: ${this.listings.length}`);
        }
        
        // Update pagination info - DÜZELTME: totalPages hesaplaması
        this.currentPage = page;
        this.totalPages = totalPages;
        this.totalCount = totalCount;
        
        // DÜZELTME: hasMoreListings hesaplaması - mevcut listings sayısına göre
        const currentTotal = this.listings.length;
        this.hasMoreListings = currentTotal < totalCount;
        
        console.log('İlanlar yüklendi:', this.listings);
        console.log('Pagination bilgisi:', { 
          currentPage: this.currentPage, 
          totalPages: this.totalPages, 
          totalCount: this.totalCount,
          currentTotal: currentTotal,
          hasMore: this.hasMoreListings 
        });
        
        // Change detection'ı manuel olarak tetikle
        this.cdr.detectChanges();
        console.log('Change detection tetiklendi');
        
        this.isLoading = false;
        // Loading false olduktan sonra da change detection tetikle
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('İlanlar yüklenirken hata:', error);
        this.isLoading = false;
        // Hata durumunda boş array göster
        this.listings = [];
        // Change detection'ı tetikle
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrls(imageUrls: string | null): string[] {
    if (!imageUrls) return [];
    try {
      return JSON.parse(imageUrls);
    } catch (error) {
      console.error('Error parsing imageUrls:', error);
      return [];
    }
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

  loadMoreListings() {
    console.log('Daha fazla ilan yükleniyor...');
    console.log('Mevcut durum:', { 
      hasMore: this.hasMoreListings, 
      isLoading: this.isLoading, 
      currentPage: this.currentPage, 
      totalPages: this.totalPages,
      currentListingsCount: this.listings.length,
      totalCount: this.totalCount
    });
    
    if (this.hasMoreListings && !this.isLoading) {
      const nextPage = this.currentPage + 1;
      console.log(`Sonraki sayfa yükleniyor: ${nextPage}`);
      console.log(`Mevcut ilan sayısı: ${this.listings.length}, Toplam beklenen: ${this.totalCount}`);
      this.loadListings(nextPage, true);
    } else {
      console.log('Daha fazla yükleme yapılamıyor:', { 
        hasMore: this.hasMoreListings, 
        isLoading: this.isLoading,
        reason: !this.hasMoreListings ? 'Tüm ilanlar yüklendi' : 'Zaten yükleniyor'
      });
    }
  }

  performSearch() {
    if (typeof document === 'undefined') return;
    
    const location = (document.getElementById('location') as HTMLInputElement)?.value;
    const startDate = (document.getElementById('start-date') as HTMLInputElement)?.value;
    const endDate = (document.getElementById('end-date') as HTMLInputElement)?.value;
    const petType = (document.getElementById('pet-type') as HTMLInputElement)?.value;
    
    console.log('Search performed with:', { location, startDate, endDate, petType });
    
    // Burada arama sonuçlarını gösterebiliriz
    alert(`Arama yapılıyor...\nYer: ${location}\nBaşlangıç: ${startDate}\nBitiş: ${endDate}\nHayvan Türü: ${petType}`);
  }
} 