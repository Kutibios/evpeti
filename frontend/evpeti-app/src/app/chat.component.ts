import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './services/data.service';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

// DataService'deki Message interface'ini kullan
import { Message as DataMessage } from './services/data.service';
type Message = DataMessage;

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <!-- Sohbet Başlığı -->
      <div class="chat-header">
        <button class="back-btn" (click)="goBack()">
          ← Geri
        </button>
        <div class="chat-info">
          <h3>{{ otherUser?.username || 'Kullanıcı' }}</h3>
          <p>{{ listing?.title || 'Rezervasyon' }} için sohbet</p>
        </div>
      </div>

      <!-- Mesaj Alanı -->
      <div class="messages-container" #messagesContainer>
        <!-- Loading göstergesi -->
        <div *ngIf="isLoading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <p>Mesajlar yükleniyor...</p>
        </div>
        
        <!-- Mesajlar -->
        <div *ngIf="!isLoading && messages.length > 0" 
             class="messages-wrapper">
          <div *ngFor="let message of messages; trackBy: trackByMessageId" 
               class="message" 
               [ngClass]="{'sent': message.senderId === currentUserId, 'received': message.senderId !== currentUserId}">
            <div class="message-content">
              <p>{{ message.content }}</p>
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Boş mesaj durumu -->
        <div *ngIf="!isLoading && messages.length === 0" class="empty-messages">
          <p>Henüz mesaj yok. İlk mesajı siz gönderin!</p>
        </div>
      </div>

      <!-- Mesaj Gönderme Alanı -->
      <div class="message-input-container">
        <div class="input-group">
          <input type="text" 
                 [(ngModel)]="newMessage" 
                 (keyup.enter)="sendMessage()"
                 placeholder="Mesajınızı yazın..."
                 class="message-input">
          <button (click)="sendMessage()" 
                  [disabled]="!newMessage.trim()"
                  class="send-btn">
            Gönder
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
    }

    .chat-header {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: white;
      border-bottom: 1px solid #e9ecef;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .back-btn {
      background: none;
      border: none;
      font-size: 1rem;
      color: #007bff;
      cursor: pointer;
      padding: 0.5rem;
      margin-right: 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .back-btn:hover {
      background-color: #f8f9fa;
    }

    .chat-info h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #333;
    }

    .chat-info p {
      margin: 0.25rem 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #666;
      font-size: 1.1rem;
    }

    .loading-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .messages-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .message {
      display: flex;
      max-width: 70%;
    }

    .message.sent {
      align-self: flex-end;
    }

    .message.received {
      align-self: flex-start;
    }

    .message-content {
      background: white;
      padding: 0.75rem 1rem;
      border-radius: 18px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .message.sent .message-content {
      background: #007bff;
      color: white;
    }

    .message.received .message-content {
      background: white;
      color: #333;
    }

    .message-content p {
      margin: 0 0 0.5rem 0;
      word-wrap: break-word;
    }

    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
      display: block;
    }

    .empty-messages {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-size: 1.1rem;
    }

    .message-input-container {
      padding: 1rem;
      background: white;
      border-top: 1px solid #e9ecef;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
    }

    .message-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 25px;
      font-size: 1rem;
      outline: none;
    }

    .send-btn {
      background: #007bff;
      color: white;
      border: none;
      border-radius: 25px;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      font-size: 1rem;
    }

    .send-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  bookingId!: number;
  messages: Message[] = [];
  newMessage: string = '';
  currentUserId: number = 0;
  currentUser: any = null;
  otherUser: any = null;
  listing: any = null;
  private refreshInterval: any;
  private lastMessageCount: number = 0; // Son mesaj sayısını takip et
  private fastRefreshInterval: any; // Hızlı yenileme için
  private slowRefreshInterval: any; // Yavaş yenileme için
  isLoading: boolean = false; // Yükleme durumu

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Önce mevcut kullanıcıyı al
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      console.error('Kullanıcı giriş yapmamış');
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUserId = this.currentUser.id;
    console.log('Mevcut kullanıcı:', this.currentUser);
    
    this.route.params.subscribe(params => {
      this.bookingId = +params['id'];
      console.log('Chat component yüklendi, booking ID:', this.bookingId);
      
      if (this.bookingId && !isNaN(this.bookingId)) {
        // Booking bilgilerini yükle
        this.loadBookingInfo();
        
        // İlk mesaj yüklemesi
        this.loadInitialMessages();
        
        // Polling sistemi başlat
        this.startSmartPolling();
      } else {
        console.error('Geçersiz booking ID:', this.bookingId);
        alert('Geçersiz rezervasyon ID. Lütfen geri dönün.');
        this.goBack();
      }
    });
  }

  async loadInitialMessages() {
    try {
      console.log('İlk mesaj yüklemesi başlıyor...');
      this.isLoading = true;
      
      // İlk yüklemede tüm mesajları al
      const response = await firstValueFrom(this.dataService.getChatMessages(this.bookingId));
      
      if (response && response.length > 0) {
        console.log('İlk yüklemede gelen mesajlar:', response.length);
        this.messages = response; // İlk yüklemede tüm mesajları set et
        console.log('Toplam mesaj sayısı:', this.messages.length);
        
        // Scroll'u en alta taşı
        setTimeout(() => this.scrollToBottom(), 100);
      } else {
        console.log('İlk yüklemede mesaj bulunamadı');
        this.messages = [];
      }
    } catch (error) {
      console.error('İlk mesaj yüklemesinde hata:', error);
      this.messages = [];
    } finally {
      this.isLoading = false;
    }
  }

  startSmartPolling() {
    // Sadece yeni mesajları kontrol et, mevcut mesajları yeniden yükleme
    this.refreshInterval = setInterval(() => {
      this.checkForNewMessages();
    }, 5000); // 5 saniyede bir yeni mesaj kontrolü
  }

  async checkForNewMessages() {
    try {
      // Sadece yeni mesajları kontrol et
      const response = await firstValueFrom(this.dataService.getChatMessages(this.bookingId));
      
      if (response && response.length > 0) {
        // Mevcut mesaj sayısından fazla mesaj varsa, yeni mesajlar var
        if (response.length > this.messages.length) {
          console.log('Yeni mesajlar bulundu, yükleniyor...');
          // Sadece yeni mesajları ekle, mevcut olanları koru
          await this.addNewMessagesOnly(response);
        }
      }
    } catch (error) {
      console.error('Yeni mesaj kontrolünde hata:', error);
    }
  }

  async addNewMessagesOnly(apiResponse: Message[]) {
    try {
      // Mevcut mesajları koru, sadece yeni olanları ekle
      const existingMessageIds = new Set(this.messages.map(m => m.id));
      const newMessages = apiResponse.filter(m => !existingMessageIds.has(m.id));
      
      if (newMessages.length > 0) {
        console.log('Yeni mesajlar ekleniyor:', newMessages.length);
        this.messages = [...this.messages, ...newMessages];
        console.log('Toplam mesaj sayısı:', this.messages.length);
        
        // Scroll'u en alta taşı
        setTimeout(() => this.scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Yeni mesaj ekleme hatası:', error);
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  async loadBookingInfo() {
    try {
      // Booking bilgilerini al
      const booking = await firstValueFrom(this.dataService.getBooking(this.bookingId));
      if (booking) {
        console.log('Booking bilgileri yüklendi:', booking);
        console.log('Mevcut kullanıcı ID:', this.currentUserId);
        console.log('Booking user ID:', booking.userId);
        
        // Listing bilgilerini al
        const listing = await firstValueFrom(this.dataService.getListing(booking.listingId));
        if (listing) {
          this.listing = listing;
          console.log('Listing bilgileri yüklendi:', listing);
          console.log('Listing user ID:', listing.userId);
        }
        
        // Diğer kullanıcıyı belirle
        if (booking.userId === this.currentUserId) {
          // Mevcut kullanıcı hayvan sahibi, diğer kullanıcı ev sahibi
          this.otherUser = { id: listing?.userId, username: 'Ev Sahibi', email: 'evsahibi@example.com' };
          console.log('Mevcut kullanıcı: Hayvan Sahibi, Diğer kullanıcı: Ev Sahibi');
        } else {
          // Mevcut kullanıcı ev sahibi, diğer kullanıcı hayvan sahibi
          this.otherUser = { id: booking.userId, username: 'Hayvan Sahibi', email: 'hayvansahibi@example.com' };
          console.log('Mevcut kullanıcı: Ev Sahibi, Diğer kullanıcı: Hayvan Sahibi');
        }
        
        console.log('Diğer kullanıcı:', this.otherUser);
      }
    } catch (error) {
      console.error('Booking bilgileri yüklenirken hata:', error);
    }
  }

  // Bu metod sadece ilk yükleme için kullanılmalı, normal polling'de çağırılmamalı
  async loadMessages() {
    try {
      // Eğer zaten yükleniyorsa, çık
      if (this.isLoading) {
        console.log('Zaten yükleniyor, çıkılıyor...');
        return;
      }
      
      console.log('loadMessages çağrıldı, booking ID:', this.bookingId);
      console.log('Mevcut mesaj sayısı:', this.messages.length);
      
      // Loading durumunu göster
      this.isLoading = true;
      
      // Gerçek API çağrısı
      const response = await firstValueFrom(this.dataService.getChatMessages(this.bookingId));
      console.log('API response:', response);
      
      if (response && response.length > 0) {
        console.log('API\'den gelen mesajlar:', response);
        console.log('API\'den gelen mesaj sayısı:', response.length);
        
        // Mevcut mesajları koru, sadece yeni olanları ekle
        const existingMessageIds = new Set(this.messages.map(m => m.id));
        console.log('Mevcut mesaj ID\'leri:', Array.from(existingMessageIds));
        
        const newMessages = response.filter(m => !existingMessageIds.has(m.id));
        console.log('Yeni mesajlar:', newMessages);
        console.log('Yeni mesaj sayısı:', newMessages.length);
        
        if (newMessages.length > 0) {
          // Mevcut mesajları koru, sadece yeni olanları ekle
          this.messages = [...this.messages, ...newMessages];
          console.log('Yeni mesajlar eklendi:', newMessages.length);
          console.log('Toplam mesaj sayısı:', this.messages.length);
          
          // Scroll'u en alta taşı
          setTimeout(() => this.scrollToBottom(), 100);
        }
      } else {
        console.log('API\'den mesaj gelmedi veya boş array');
        // API'den mesaj gelmediyse mevcut mesajları koru, sıfırlama
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      // Hata durumunda mevcut mesajları koru, sıfırlama
    } finally {
      // Loading durumunu kapat
      this.isLoading = false;
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.otherUser) return;

    const messageToSend = this.newMessage.trim();
    console.log('Mesaj gönderiliyor - Mevcut kullanıcı ID:', this.currentUserId);
    console.log('Mesaj gönderiliyor - Diğer kullanıcı ID:', this.otherUser.id);

    try {
      // Yeni mesaj oluştur
      const newMsg: Message = {
        id: Date.now(), // Geçici ID
        senderId: this.currentUserId,
        receiverId: this.otherUser.id,
        bookingId: this.bookingId,
        content: messageToSend,
        isRead: false,
        createdAt: new Date()
      };

      console.log('Yeni mesaj oluşturuldu:', newMsg);

      // Mesajı hemen ekle (optimistic update)
      this.messages.push(newMsg);
      console.log('Mesaj chat\'e eklendi. Toplam mesaj sayısı:', this.messages.length);
      this.newMessage = '';
      
      // Scroll'u en alta taşı
      setTimeout(() => this.scrollToBottom(), 100);
      
      // Gerçek API çağrısı
      const messageData = {
        senderId: this.currentUserId,
        receiverId: this.otherUser.id,
        bookingId: this.bookingId,
        content: messageToSend,
        isRead: false
      };
      
      console.log('Mesaj gönderiliyor:', messageData);
      const sentMessage = await firstValueFrom(this.dataService.sendMessage(messageData));
      console.log('Mesaj başarıyla gönderildi:', sentMessage);
      
      // API'den dönen gerçek mesaj ID'si ile güncelle
      if (sentMessage && sentMessage.id) {
        const index = this.messages.findIndex(m => m.id === newMsg.id);
        if (index !== -1) {
          this.messages[index] = sentMessage;
          console.log('Mesaj ID güncellendi:', sentMessage.id);
        }
      }
      
      // loadMessages çağırma, mesajlar sıfırlanmasın
      console.log('Mesaj başarıyla gönderildi ve chat\'e eklendi');
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      
      // Hata durumunda mesajı geri al
      this.messages.pop();
      this.newMessage = messageToSend;
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }

  goBack() {
    console.log('Geri dönülüyor...');
    this.router.navigate(['/bookings']);
  }

  scrollToBottom() {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  trackByMessageId(index: number, message: Message) {
    return message.id;
  }
}
