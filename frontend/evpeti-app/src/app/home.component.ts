import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./app.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  showProfileDropdown: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

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
    
    // SSR sırasında document mevcut değil, sadece browser'da çalıştır
    if (typeof document !== 'undefined') {
      this.setupDropdowns();
      this.setupSearch();
      this.setupDropdownCloseListener();
    }
  }

  setupDropdownCloseListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const profileBtnContainer = document.querySelector('.profile-btn-container');
        
        if (profileBtnContainer && !profileBtnContainer.contains(target)) {
          this.showProfileDropdown = false;
        }
      });
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  logout() {
    console.log('Logout called from home component');
    this.authService.logout();
    this.showProfileDropdown = false;
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

  goToProfile() {
    this.showProfileDropdown = false;
    this.router.navigate(['/profile']);
  }

  goToMyBookings() {
    this.showProfileDropdown = false;
    // Şimdilik profil sayfasına yönlendir, daha sonra rezervasyon sayfası oluşturulabilir
    this.router.navigate(['/profile']);
  }

  goToMessages() {
    this.showProfileDropdown = false;
    // Şimdilik profil sayfasına yönlendir, daha sonra mesaj sayfası oluşturulabilir
    this.router.navigate(['/profile']);
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