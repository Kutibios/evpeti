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
    this.setupDropdowns();
    this.setupSearch();
  }

  logout() {
    console.log('Logout called from home component');
    this.authService.logout();
    // Sayfayı yenilemek yerine router ile yönlendir
    this.router.navigate(['/']);
  }

  setupDropdowns() {
    this.setupLocationDropdown();
    this.setupPetTypeDropdown();
  }

  setupSearch() {
    this.setupSearchButton();
  }

  setupLocationDropdown() {
    if (typeof document !== 'undefined') {
      const locationInput = document.getElementById('location') as HTMLInputElement;
      const locationDropdown = document.getElementById('location-dropdown') as HTMLDivElement;
      
      if (locationInput && locationDropdown) {
        locationInput.addEventListener('focus', () => {
          locationDropdown.style.display = 'block';
        });

        locationInput.addEventListener('blur', () => {
          setTimeout(() => {
            locationDropdown.style.display = 'none';
          }, 200);
        });

        // Dropdown item click events
        const dropdownItems = locationDropdown.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
          item.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLocation = (e.target as HTMLElement).textContent;
            if (selectedLocation && locationInput) {
              locationInput.value = selectedLocation;
              locationDropdown.style.display = 'none';
            }
          });
        });
      }
    }
  }

  setupPetTypeDropdown() {
    if (typeof document !== 'undefined') {
      const petTypeInput = document.getElementById('pet-type') as HTMLInputElement;
      const petTypeDropdown = document.getElementById('pet-type-dropdown') as HTMLDivElement;
      
      if (petTypeInput && petTypeDropdown) {
        petTypeInput.addEventListener('focus', () => {
          petTypeDropdown.style.display = 'block';
        });

        petTypeInput.addEventListener('blur', () => {
          setTimeout(() => {
            petTypeDropdown.style.display = 'none';
          }, 200);
        });

        // Dropdown item click events
        const dropdownItems = petTypeDropdown.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
          item.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedPetType = (e.target as HTMLElement).textContent;
            if (selectedPetType && petTypeInput) {
              petTypeInput.value = selectedPetType;
              petTypeDropdown.style.display = 'none';
            }
          });
        });
      }
    }
  }

  displayDropdown(dropdown: HTMLDivElement, items: string[], input: HTMLInputElement) {
    dropdown.innerHTML = '';
    
    if (items.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    items.forEach(item => {
      const option = document.createElement('div');
      option.className = 'dropdown-option';
      option.textContent = item;
      option.addEventListener('click', () => {
        input.value = item;
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(option);
    });

    dropdown.style.display = 'block';
  }

  setupSearchButton() {
    if (typeof document !== 'undefined') {
      const searchButton = document.getElementById('search-button');
      if (searchButton) {
        searchButton.addEventListener('click', () => {
          this.performSearch();
        });
      }
    }
  }

  performSearch() {
    const searchData = {
      location: (document.getElementById('location') as HTMLInputElement)?.value || '',
      startDate: (document.getElementById('start-date') as HTMLInputElement)?.value || '',
      endDate: (document.getElementById('end-date') as HTMLInputElement)?.value || '',
      petType: (document.getElementById('pet-type') as HTMLInputElement)?.value || ''
    };
    console.log('Arama verileri:', searchData);
  }
} 