import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header.component';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <!-- Header Component -->
    <app-header [isLoggedIn]="isUserLoggedIn()" [currentUser]="getCurrentUser()"></app-header>

    <div class="contact-container">
      <div class="contact-content">
        <div class="contact-header">
          <h1>📞 İletişim</h1>
          <p>Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız!</p>
        </div>

        <div class="contact-sections">
          <!-- İletişim Formu -->
          <div class="contact-form-section">
            <h2>✉️ Mesaj Gönder</h2>
            <form class="contact-form" (ngSubmit)="submitForm()">
              <div class="form-group">
                <label for="name">Ad Soyad *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  [(ngModel)]="contactForm.name" 
                  required
                  placeholder="Adınız ve soyadınız">
              </div>

              <div class="form-group">
                <label for="email">E-posta *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  [(ngModel)]="contactForm.email" 
                  required
                  placeholder="E-posta adresiniz">
              </div>

              <div class="form-group">
                <label for="subject">Konu *</label>
                <select 
                  id="subject" 
                  name="subject" 
                  [(ngModel)]="contactForm.subject" 
                  required>
                  <option value="">Konu seçin</option>
                  <option value="genel">Genel Bilgi</option>
                  <option value="teknik">Teknik Destek</option>
                  <option value="oneri">Öneri/Şikayet</option>
                  <option value="isbirligi">İş Birliği</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div class="form-group">
                <label for="message">Mesaj *</label>
                <textarea 
                  id="message" 
                  name="message" 
                  [(ngModel)]="contactForm.message" 
                  required
                  rows="5"
                  placeholder="Mesajınızı buraya yazın..."></textarea>
              </div>

              <button type="submit" class="submit-btn" [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting">📤 Mesaj Gönder</span>
                <span *ngIf="isSubmitting">⏳ Gönderiliyor...</span>
              </button>
            </form>
          </div>

          <!-- İletişim Bilgileri -->
          <div class="contact-info-section">
            <h2>📍 İletişim Bilgileri</h2>
            
            <div class="contact-info-item">
              <div class="icon">🏢</div>
              <div class="info">
                <h3>Adres</h3>
                <p>Dumlupınar, Kutman Sk. No:6, 16285 Ni̇lüfer/Bursa</p>
              </div>
            </div>

            <div class="contact-info-item">
              <div class="icon">📧</div>
              <div class="info">
                <h3>E-posta</h3>
                <p>leventkutaysezer2001@hotmail.com</p>
              </div>
            </div>

            <div class="contact-info-item">
              <div class="icon">📱</div>
              <div class="info">
                <h3>Telefon</h3>
                <p>+90 530 941 67 32</p>
              </div>
            </div>

            <div class="contact-info-item">
              <div class="icon">🌐</div>
              <div class="info">
                <h3>Website</h3>
                <p>Bilgi eklenecek</p>
              </div>
            </div>

            <div class="contact-info-item">
              <div class="icon">⏰</div>
              <div class="info">
                <h3>Çalışma Saatleri</h3>
                <p>7/24 Hizmetinizdeyiz</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Harita Bölümü -->
        <div class="map-section">
          <h2>🗺️ Konum</h2>
          <div class="map-container">
                         <iframe 
               src="https://www.openstreetmap.org/export/embed.html?bbox=28.8300,40.2200,28.8500,40.2400&layer=mapnik&marker=40.226458,28.841764"
               width="100%" 
               height="400" 
               frameborder="0" 
               scrolling="no" 
               marginheight="0" 
               marginwidth="0"
               title="EvPeti Konum Haritası">
             </iframe>
             <div class="map-info">
               <p><strong>📍 Adres:</strong> Dumlupınar, Kutman Sk. No:6, 16285 Nilüfer/Bursa</p>
               <p><strong>🌍 Koordinatlar:</strong> 40.226458°N, 28.841764°E</p>
               <a href="https://www.openstreetmap.org/?mlat=40.226458&mlon=28.841764&zoom=15" target="_blank" class="map-link">
                 🗺️ Büyük Haritada Görüntüle
               </a>
             </div>
          </div>
        </div>

        <!-- SSS Bölümü -->
        <div class="faq-section">
          <h2>❓ Sık Sorulan Sorular</h2>
          <div class="faq-item" *ngFor="let faq of faqs; let i = index">
            <div class="faq-question" (click)="toggleFaq(i)">
              <h3>{{ faq.question }}</h3>
              <span class="toggle-icon">{{ faq.isOpen ? '−' : '+' }}</span>
            </div>
            <div class="faq-answer" [class.open]="faq.isOpen">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  isSubmitting = false;
  
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  faqs = [
    {
      question: 'EvPeti nasıl çalışır?',
      answer: 'EvPeti, evcil hayvan sahipleri ile güvenilir bakıcıları buluşturan bir platformdur. Pet sahipleri ihtiyaç duydukları bakım hizmetlerini arayabilir, bakıcılar ise hizmetlerini ilan edebilir.',
      isOpen: false
    },
    {
      question: 'Bakıcı seçerken nelere dikkat etmeliyim?',
      answer: 'Bakıcı seçerken deneyim, referanslar, değerlendirmeler ve güvenlik önlemlerini göz önünde bulundurmanız önemlidir. Ayrıca önceden tanışma ve ev ziyareti yapmanızı öneririz.',
      isOpen: false
    },
    {
      question: 'Hizmet ücretleri nasıl belirlenir?',
      answer: 'Hizmet ücretleri bakıcının deneyimi, hizmet türü, süre ve konuma göre değişiklik gösterir. Her bakıcı kendi ücretini belirler ve platform üzerinden görüşebilirsiniz.',
      isOpen: false
    },
    {
      question: 'Güvenlik nasıl sağlanır?',
      answer: 'Platform üzerindeki tüm kullanıcılar kimlik doğrulamasından geçer. Ayrıca değerlendirme sistemi ve referans sistemi ile güvenlik artırılır.',
      isOpen: false
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Component başlatıldı
  }

  // Header component için public method'lar
  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getCurrentUser(): any {
    return this.authService.getCurrentUser();
  }

  submitForm() {
    if (this.contactForm.name && this.contactForm.email && this.contactForm.subject && this.contactForm.message) {
      this.isSubmitting = true;
      
      // E-posta gönderimi için mailto link oluştur
      const mailtoLink = this.createMailtoLink();
      
      // Yeni sekmede e-posta uygulamasını aç
      window.open(mailtoLink, '_blank');
      
      // Başarı mesajı göster
      setTimeout(() => {
        alert('E-posta uygulamanız açıldı! Mesajınızı gönderdikten sonra bu sayfaya geri dönebilirsiniz.');
        
        // Formu temizle
        this.contactForm = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
        
        this.isSubmitting = false;
      }, 1000);
    } else {
      alert('Lütfen tüm alanları doldurun!');
    }
  }

  createMailtoLink(): string {
    const subject = encodeURIComponent(`EvPeti İletişim: ${this.contactForm.subject}`);
    const body = encodeURIComponent(
      `Merhaba,\n\n${this.contactForm.message}\n\nSaygılarımla,\n${this.contactForm.name}\nE-posta: ${this.contactForm.email}`
    );
    
    // Levent'e gidecek e-posta adresi
    const toEmail = 'leventkutaysezer2001@hotmail.com';
    
    return `mailto:${toEmail}?subject=${subject}&body=${body}`;
  }

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
