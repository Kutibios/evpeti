import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sitter-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sitter-profile.component.html',
  styleUrls: ['./sitter-profile.component.css']
})
export class SitterProfileComponent {
  listing = {
    type: '',
    price: 0,
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Active'
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  onSubmit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Kullanıcı ID'sini al
    const user = this.authService.getCurrentUser();
    console.log('Current user:', user);

    if (!user || !user.id) {
      this.errorMessage = 'Kullanıcı bilgileri bulunamadı';
      this.isLoading = false;
      return;
    }

    // Listing verilerini hazırla
    const listingData = {
      type: this.listing.type,
      price: this.listing.price,
      location: this.listing.location,
      startDate: this.listing.startDate,
      endDate: this.listing.endDate,
      description: this.listing.description,
      status: this.listing.status,
      userId: user.id
    };

    console.log('Sending listing data:', listingData);
    console.log('API URL: http://localhost:5083/api/listings');

    // API çağrısı yap
    this.http.post('http://localhost:5083/api/listings', listingData)
      .subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          this.isLoading = false;
          alert('Bakıcı profili başarıyla oluşturuldu!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('API error details:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error error:', error.error);

          this.isLoading = false;

          if (error.status === 0) {
            this.errorMessage = 'Backend sunucusuna bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.';
          } else if (error.status === 400) {
            this.errorMessage = 'Geçersiz veri: ' + (error.error || 'Bilinmeyen hata');
          } else if (error.status === 500) {
            this.errorMessage = 'Sunucu hatası: ' + (error.error || 'Bilinmeyen hata');
          } else {
            this.errorMessage = 'Bakıcı profili oluşturulurken hata oluştu: ' + (error.error || error.message || 'Bilinmeyen hata');
          }

          console.error('Listing oluşturma hatası:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
} 