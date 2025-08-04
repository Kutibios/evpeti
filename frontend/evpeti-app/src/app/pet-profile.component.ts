import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pet-profile.component.html',
  styleUrls: ['./pet-profile.component.css']
})
export class PetProfileComponent {
  pet = {
    name: '',
    species: '',
    breed: '',
    age: 0,
    gender: '',
    weight: 0,
    healthNotes: '',
    photo: '',
    userId: 0
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

    // Pet verilerini hazırla - sadece backend'de beklenen alanları gönder
    const petData = {
      name: this.pet.name,
      species: this.pet.species,
      breed: this.pet.breed,
      age: this.pet.age,
      gender: this.pet.gender,
      weight: this.pet.weight,
      healthNotes: this.pet.healthNotes,
      photo: this.pet.photo,
      userId: user.id
    };

    console.log('Sending pet data:', petData);
    console.log('API URL: http://localhost:5083/api/pets');

    // Timeout ekle (10 saniye)
    const timeout = setTimeout(() => {
      this.isLoading = false;
      this.errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      console.error('Request timeout');
    }, 10000);

    // API çağrısı yap
    this.http.post('http://localhost:5083/api/pets', petData)
      .subscribe({
        next: (response: any) => {
          clearTimeout(timeout);
          console.log('API response:', response);
          this.isLoading = false;
          alert('Pet profili başarıyla oluşturuldu!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          clearTimeout(timeout);
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
            this.errorMessage = 'Pet profili oluşturulurken hata oluştu: ' + (error.error || error.message || 'Bilinmeyen hata');
          }
          
          console.error('Pet oluşturma hatası:', error);
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