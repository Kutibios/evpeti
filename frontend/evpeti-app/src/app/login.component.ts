import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';
import { AuthApiService, LoginRequest } from './auth-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  formData = {
    email: '',
    password: '',
    rememberMe: false
  };

  showPassword = false;
  isLoading = false;
  emailError = '';
  passwordError = '';

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

  validateForm(): boolean {
    let isValid = true;
    this.emailError = '';
    this.passwordError = '';

    // Email validasyonu
    if (!this.formData.email) {
      this.emailError = 'E-posta adresi gerekli';
      isValid = false;
    } else if (!this.isValidEmail(this.formData.email)) {
      this.emailError = 'Geçerli bir e-posta adresi girin';
      isValid = false;
    }

    // Şifre validasyonu
    if (!this.formData.password) {
      this.passwordError = 'Şifre gerekli';
      isValid = false;
    } else if (this.formData.password.length < 6) {
      this.passwordError = 'Şifre en az 6 karakter olmalı';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    try {
      await this.loginUser();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loginUser() {
    try {
      // Backend API'ye giriş isteği gönder
      const loginRequest: LoginRequest = {
        email: this.formData.email,
        password: this.formData.password
      };

      const response = await this.authApiService.login(loginRequest).toPromise();
      
      if (response) {
        // AuthService ile giriş yap
        const user: User = {
          id: Number(response.user.id),
          name: response.user.name,
          email: response.user.email,
          city: response.user.city,
          isSitter: response.user.isSitter,
          rating: response.user.rating
        };

        console.log('Login successful, user:', user);
        this.authService.login(user);

        // Başarılı giriş
        this.showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      }

    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.error?.message) {
        this.showError(error.error.message);
      } else {
        this.showError('Giriş işlemi sırasında hata oluştu');
      }
      
      // Backend bağlantısı yoksa localStorage'dan kontrol et (fallback)
      this.simulateLogin();
    }
  }

  simulateLogin() {
    setTimeout(() => {
      // Test kullanıcısı kontrolü
      if (this.formData.email === 'test@evpeti.com' && this.formData.password === '123456') {
        this.showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Test kullanıcı bilgilerini AuthService ile kaydet
        const testUser: User = {
          id: 1,
          name: 'Test Kullanıcı',
          email: this.formData.email,
          city: 'İstanbul',
          isSitter: true,
          rating: 4.8
        };
        
        console.log('Simulated login successful, user:', testUser);
        this.authService.login(testUser);
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      } else {
        // Kayıt olan kullanıcıları kontrol et
        const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const user = registeredUsers.find((u: any) => 
          u.email === this.formData.email && u.password === this.formData.password
        );

        if (user) {
          this.showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
          
          // Kullanıcı bilgilerini AuthService ile kaydet
          const loginUser: User = {
            id: Number(user.id),
            name: user.name,
            email: user.email,
            city: user.city,
            isSitter: user.isSitter,
            rating: user.rating || 0
          };
          
          console.log('Local storage login successful, user:', loginUser);
          this.authService.login(loginUser);
          
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        } else {
          this.showError('E-posta veya şifre hatalı');
        }
      }
      
      this.isLoading = false;
    }, 1000);
  }

  showSuccess(message: string) {
    // Başarı mesajı için geçici bir div oluştur
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
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  showError(message: string) {
    // Hata mesajı için geçici bir div oluştur
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
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  socialLogin(provider: string) {
    alert(`${provider} ile giriş özelliği yakında eklenecek!`);
  }

  goToRegister(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    alert('Şifre sıfırlama özelliği yakında eklenecek!');
  }
} 