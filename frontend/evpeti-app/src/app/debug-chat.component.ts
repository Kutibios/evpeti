import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debug-chat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>🔍 Chat Debug Sayfası</h1>
      
      <div style="margin: 20px 0;">
        <h3>Test Butonları:</h3>
        <button 
          (click)="testChatRoute(1)" 
          style="background: #007bff; color: white; padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer;">
          Chat ID 1'i Test Et
        </button>
        
        <button 
          (click)="testChatRoute(123)" 
          style="background: #28a745; color: white; padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer;">
          Chat ID 123'ü Test Et
        </button>
        
        <button 
          (click)="goToBookings()" 
          style="background: #ffc107; color: black; padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer;">
          Bookings Sayfasına Git
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Mevcut Route Bilgileri:</h3>
        <p><strong>Current URL:</strong> {{ currentUrl }}</p>
        <p><strong>Chat Route Tanımı:</strong> /chat/:id</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Test Sonuçları:</h3>
        <div *ngFor="let result of testResults" style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
          <strong>{{ result.timestamp | date:'HH:mm:ss' }}:</strong> {{ result.message }}
        </div>
      </div>
    </div>
  `
})
export class DebugChatComponent {
  currentUrl: string = '';
  testResults: Array<{timestamp: Date, message: string}> = [];

  constructor(private router: Router) {
    this.currentUrl = window.location.href;
  }

  testChatRoute(chatId: number) {
    const message = `Chat ID ${chatId} için route test ediliyor...`;
    this.addTestResult(message);
    
    try {
      this.router.navigate(['/chat', chatId]).then(() => {
        this.addTestResult(`✅ Chat ID ${chatId} route'u başarılı!`);
      }).catch(error => {
        this.addTestResult(`❌ Chat ID ${chatId} route hatası: ${error}`);
      });
    } catch (error) {
      this.addTestResult(`❌ Chat ID ${chatId} navigation hatası: ${error}`);
    }
  }

  goToBookings() {
    this.addTestResult('Bookings sayfasına yönlendiriliyor...');
    this.router.navigate(['/bookings']).then(() => {
      this.addTestResult('✅ Bookings sayfasına yönlendirme başarılı!');
    }).catch(error => {
      this.addTestResult(`❌ Bookings yönlendirme hatası: ${error}`);
    });
  }

  private addTestResult(message: string) {
    this.testResults.push({
      timestamp: new Date(),
      message: message
    });
    
    // Sadece son 10 sonucu tut
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(-10);
    }
  }
}
