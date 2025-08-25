import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  city?: string;
  isSitter?: boolean;
  rating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    }
  }

  login(user: User) {
    console.log('Login called with user:', user);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', 'dummy-token');
    }
    this.currentUserSubject.next(user);
    console.log('Current user updated:', this.currentUserSubject.value);
  }

  logout() {
    console.log('Logout called');
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    console.log('Current user cleared');
  }

  isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    const hasToken = typeof window !== 'undefined' && window.localStorage && localStorage.getItem('token') !== null;
    console.log('isLoggedIn check:', { user, hasToken });
    return user !== null && hasToken;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserRating(userId: number, newRating: number) {
    // Tüm kullanıcıların rating'ini güncelle
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      // Eğer güncel kullanıcı değerlendirilen kullanıcıysa rating'ini güncelle
      if (currentUser.id === userId) {
        currentUser.rating = newRating;
        this.currentUserSubject.next(currentUser);
        
        // LocalStorage'ı da güncelle
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
      
      // Diğer kullanıcıların rating'ini de güncellemek için
      // DataService'ten güncel user bilgisini al
      console.log(`Updating rating for user ${userId} to ${newRating}`);
    }
  }
} 