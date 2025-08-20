import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './auth.service';
import { DataService, Listing } from './services/data.service';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./app.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  listings: Listing[] = [];
  isLoading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalCount: number = 0;
  hasMoreListings: boolean = true;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private dataService: DataService
  ) {}

  goToHome() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    console.log('HomeComponent ngOnInit');
    this.authService.currentUser$.subscribe((user: User | null) => {
      console.log('User state changed:', user);
      this.isLoggedIn = user !== null;
      this.currentUser = user;
      console.log('Updated state:', { isLoggedIn: this.isLoggedIn, currentUser: this.currentUser });
    });
    
    // İlanları yükle
    this.loadListings();
    
    // SSR sırasında document mevcut değil, sadece browser'da çalıştır
    if (typeof document !== 'undefined') {
      this.setupDropdowns();
      this.setupSearch();
    }
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
    this.isLoading = true;
    this.dataService.getAllListings(page, this.pageSize).subscribe({
      next: (response) => {
        console.log('Raw API response:', response);
        console.log('Response type:', typeof response);
        console.log('Response is array:', Array.isArray(response));
        
        // Check if response is array (no pagination) or object (with pagination)
        if (Array.isArray(response)) {
          // No pagination - response is direct array
          const listings = response;
          
          if (append) {
            this.listings = [...this.listings, ...listings];
          } else {
            this.listings = listings;
          }
          
          // Set pagination info for array response
          this.currentPage = 1;
          this.totalPages = 1;
          this.totalCount = listings.length;
          this.hasMoreListings = false; // No more pages for array response
          
        } else if (response && typeof response === 'object') {
          // With pagination - response is object
          console.log('Response keys:', Object.keys(response));
          console.log('Response.Listings:', response.Listings);
          console.log('Response.listings:', response.listings);
          
          // Try different property names
          const listings = response.Listings || response.listings || response.Listings || [];
          
          if (append) {
            this.listings = [...this.listings, ...listings];
          } else {
            this.listings = listings;
          }
          
          this.currentPage = response.Page || response.page || 1;
          this.totalPages = response.TotalPages || response.totalPages || 1;
          this.totalCount = response.TotalCount || response.totalCount || 0;
          this.hasMoreListings = this.currentPage < this.totalPages;
        } else {
          // Empty or invalid response
          this.listings = [];
          this.currentPage = 1;
          this.totalPages = 1;
          this.totalCount = 0;
          this.hasMoreListings = false;
        }
        
        console.log('Listings loaded:', this.listings);
        console.log('Pagination info:', { currentPage: this.currentPage, totalPages: this.totalPages, hasMore: this.hasMoreListings });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading listings:', error);
        this.isLoading = false;
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
    if (this.hasMoreListings && !this.isLoading) {
      this.loadListings(this.currentPage + 1, true);
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