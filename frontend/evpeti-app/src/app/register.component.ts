import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';
import { AuthApiService, RegisterRequest } from './auth-api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    phone: '',
    isSitter: false,
    agreeToTerms: false
  };

  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errors = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    phone: '',
    agreeToTerms: ''
  };

  cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
    'Mersin', 'Diyarbakır', 'Samsun', 'Denizli', 'Eskişehir', 'Trabzon', 'Erzurum',
    'Van', 'Batman', 'Elazığ', 'Kayseri', 'Malatya', 'Şanlıurfa', 'Manisa', 'Sivas',
    'Balıkesir', 'Kahramanmaraş', 'Aydın', 'Tekirdağ', 'Sakarya', 'Muğla', 'Afyonkarahisar'
  ];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private authApiService: AuthApiService
  ) {}

  ngOnInit() {
    // Component yüklendiğinde çalışacak kodlar
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validateForm(): boolean {
    let isValid = true;
    this.clearErrors();

    // İsim validasyonu
    if (!this.formData.name.trim()) {
      this.errors.name = 'Ad soyad gerekli';
      isValid = false;
    } else if (this.formData.name.trim().length < 2) {
      this.errors.name = 'Ad soyad en az 2 karakter olmalı';
      isValid = false;
    }

    // Email validasyonu
    if (!this.formData.email) {
      this.errors.email = 'E-posta adresi gerekli';
      isValid = false;
    } else if (!this.isValidEmail(this.formData.email)) {
      this.errors.email = 'Geçerli bir e-posta adresi girin';
      isValid = false;
    }

    // Şifre validasyonu
    if (!this.formData.password) {
      this.errors.password = 'Şifre gerekli';
      isValid = false;
    } else if (this.formData.password.length < 6) {
      this.errors.password = 'Şifre en az 6 karakter olmalı';
      isValid = false;
    }

    // Şifre tekrar validasyonu
    if (!this.formData.confirmPassword) {
      this.errors.confirmPassword = 'Şifre tekrarı gerekli';
      isValid = false;
    } else if (this.formData.password !== this.formData.confirmPassword) {
      this.errors.confirmPassword = 'Şifreler eşleşmiyor';
      isValid = false;
    }

    // Şehir validasyonu
    if (!this.formData.city) {
      this.errors.city = 'Şehir seçimi gerekli';
      isValid = false;
    }

    // Telefon validasyonu
    if (!this.formData.phone) {
      this.errors.phone = 'Telefon numarası gerekli';
      isValid = false;
    } else if (!this.isValidPhone(this.formData.phone)) {
      this.errors.phone = 'Geçerli bir telefon numarası girin';
      isValid = false;
    }

    // Şartlar kabul validasyonu
    if (!this.formData.agreeToTerms) {
      this.errors.agreeToTerms = 'Kullanım şartlarını kabul etmelisiniz';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  clearErrors() {
    this.errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      city: '',
      phone: '',
      agreeToTerms: ''
    };
  }

  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    try {
      await this.registerUser();
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async registerUser() {
    try {
      // Backend API'ye kayıt isteği gönder
      const registerRequest: RegisterRequest = {
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password,
        city: this.formData.city,
        phone: this.formData.phone,
        isSitter: this.formData.isSitter
      };

      const response = await this.authApiService.register(registerRequest).toPromise();
      
      if (response) {
        this.showSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        
        // Login sayfasına yönlendir
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }

    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.error?.message) {
        this.showError(error.error.message);
      } else {
        this.showError('Kayıt işlemi sırasında hata oluştu');
      }
      
      // Backend bağlantısı yoksa localStorage'a kaydet (fallback)
      this.simulateRegister();
    }
  }

  simulateRegister() {
    setTimeout(() => {
      // Test kayıt simülasyonu (backend bağlantısı yoksa)
      this.showSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      
      // Test kullanıcı bilgilerini localStorage'a kaydet
      const testUser: User = {
        id: Date.now(), // Unique ID için timestamp kullan
        username: this.formData.name,
        email: this.formData.email,
        city: this.formData.city,
        isSitter: this.formData.isSitter,
        rating: 0
      };
      
      // Kullanıcıları localStorage'da sakla (gerçek uygulamada backend'de olacak)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push(testUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      
      this.isLoading = false;
    }, 1500);
  }

  showSuccess(message: string) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1000;
      font-weight: 600;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  showError(message: string) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1000;
      font-weight: 600;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
} 