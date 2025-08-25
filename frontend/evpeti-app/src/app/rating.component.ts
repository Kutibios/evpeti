import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './services/data.service';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rating-container">
      <div class="rating-header">
        <button class="back-btn" (click)="goBack()">← Geri</button>
        <h3>{{ otherUser?.username || 'Kullanıcı' }} için Değerlendirme</h3>
        <p>Bu rezervasyon için {{ otherUser?.username || 'kullanıcı' }}yı değerlendirin</p>
      </div>

      <div class="rating-stars">
        <span *ngFor="let star of [1,2,3,4,5]; let i = index" 
              class="star" 
              [class.filled]="i < rating"
              (click)="setRating(i + 1)"
              (mouseenter)="hoverRating = i + 1"
              (mouseleave)="hoverRating = 0">
          ★
        </span>
      </div>

      <div class="rating-text">
        <p>{{ getRatingText() }}</p>
      </div>

      <div class="comment-section">
        <label for="comment">Yorum (opsiyonel):</label>
        <textarea 
          id="comment"
          [(ngModel)]="comment" 
          placeholder="Deneyiminiz hakkında yorum yazın..."
          rows="3"
          class="comment-input">
        </textarea>
      </div>

      <div class="rating-actions">
        <button (click)="submitRating()" 
                [disabled]="rating === 0 || isSubmitting"
                class="submit-btn">
          {{ isSubmitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder' }}
        </button>
        <button (click)="cancel()" class="cancel-btn">
          İptal
        </button>
      </div>
    </div>
  `,
  styles: [`
    .rating-container {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      max-width: 500px;
      margin: 2rem auto;
    }

    .back-btn {
      background: none;
      border: none;
      font-size: 1rem;
      color: #007bff;
      cursor: pointer;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .back-btn:hover {
      background-color: #f8f9fa;
    }

    .rating-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .rating-header h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.5rem;
    }

    .rating-header p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .rating-stars {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .star {
      font-size: 2.5rem;
      color: #ddd;
      cursor: pointer;
      transition: color 0.2s;
      user-select: none;
    }

    .star:hover,
    .star.filled {
      color: #ffd700;
    }

    .rating-text {
      text-align: center;
      margin-bottom: 2rem;
    }

    .rating-text p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
      font-style: italic;
    }

    .comment-section {
      margin-bottom: 2rem;
    }

    .comment-section label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    .comment-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      resize: vertical;
      font-family: inherit;
    }

    .comment-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .rating-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .submit-btn, .cancel-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .submit-btn {
      background: #007bff;
      color: white;
    }

    .submit-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .cancel-btn {
      background: #6c757d;
      color: white;
    }

    .cancel-btn:hover {
      background: #545b62;
    }
  `]
})
export class RatingComponent implements OnInit {
  @Input() bookingId!: number;
  @Output() ratingSubmitted = new EventEmitter<void>();
  @Output() ratingCancelled = new EventEmitter<void>();

  rating: number = 0;
  hoverRating: number = 0;
  comment: string = '';
  isSubmitting: boolean = false;
  otherUser: any = null;
  booking: any = null;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.bookingId = +params['bookingId'];
      if (this.bookingId) {
        this.loadBookingInfo();
      }
    });
  }

  async loadBookingInfo() {
    try {
      // Booking bilgilerini al
      const booking = await firstValueFrom(this.dataService.getBooking(this.bookingId));
      if (booking) {
        this.booking = booking;
        
        // Listing bilgilerini al
        const listing = await firstValueFrom(this.dataService.getListing(booking.listingId));
        if (listing) {
          // Diğer kullanıcıyı belirle
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            if (booking.userId === currentUser.id) {
              // Mevcut kullanıcı hayvan sahibi, diğer kullanıcı ev sahibi
              this.otherUser = { id: listing.userId, username: 'Ev Sahibi' };
            } else {
              // Mevcut kullanıcı ev sahibi, diğer kullanıcı hayvan sahibi
              this.otherUser = { id: booking.userId, username: 'Hayvan Sahibi' };
            }
          }
        }
      }
    } catch (error) {
      console.error('Booking bilgileri yüklenirken hata:', error);
    }
  }

  setRating(value: number) {
    this.rating = value;
  }

  getRatingText(): string {
    const texts = [
      '',
      'Çok Kötü',
      'Kötü',
      'Orta',
      'İyi',
      'Mükemmel'
    ];
    return this.rating > 0 ? texts[this.rating] : 'Puan seçin';
  }

  async submitRating() {
    if (this.rating === 0) return;

    try {
      this.isSubmitting = true;
      const currentUser = this.authService.getCurrentUser();
      
      console.log('Rating gönderiliyor...');
      console.log('Current User:', currentUser);
      console.log('Other User:', this.otherUser);
      console.log('Rating:', this.rating);
      console.log('Comment:', this.comment);
      
      if (!currentUser) {
        alert('Kullanıcı giriş yapmamış');
        return;
      }

      const reviewData = {
        bookingId: this.bookingId,
        reviewerId: currentUser.id,
        reviewedUserId: this.otherUser.id,
        rating: this.rating,
        comment: this.comment.trim()
      };

      console.log('Review Data:', reviewData);
      console.log('API çağrısı yapılıyor...');

      const response = await firstValueFrom(this.dataService.createReview(reviewData));
      console.log('API Response:', response);
      
      // Kullanıcı rating'ini güncelle
      if (response.reviewedUser && response.reviewedUser.rating) {
        this.authService.updateUserRating(response.reviewedUser.id, response.reviewedUser.rating);
        console.log(`Rating updated for user ${response.reviewedUser.id} to ${response.reviewedUser.rating}`);
        
        // Header'ı güncellemek için event emit et
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ratingUpdated', {
            detail: { userId: response.reviewedUser.id, rating: response.reviewedUser.rating }
          }));
        }
      }
      
      alert('Değerlendirmeniz başarıyla gönderildi!');
      this.ratingSubmitted.emit();
      
      // Header'daki rating'i güncellemek için sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      this.goBack();
      
    } catch (error: any) {
      console.error('Değerlendirme gönderilirken hata:', error);
      console.error('Hata detayı:', JSON.stringify(error, null, 2));
      
      if (error.error) {
        console.error('Error response:', error.error);
        alert(`Değerlendirme gönderilemedi: ${error.error.message || error.error}`);
      } else {
        alert('Değerlendirme gönderilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel() {
    this.ratingCancelled.emit();
    this.goBack();
  }

  goBack() {
    this.router.navigate(['/bookings']);
  }
}
