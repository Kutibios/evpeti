import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  city: string;
  phone: string;
  isSitter: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  city: string;
  isSitter: boolean;
  rating: number;
}

export interface AuthResponse {
  message: string;
  user: UserResponse;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private baseUrl = 'http://localhost:5083/api'; // Backend API URL

  constructor(private http: HttpClient) {}

  // Kullanıcı kayıt işlemi
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/register`, request);
  }

  // Kullanıcı giriş işlemi
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/login`, request);
  }

  // Tüm kullanıcıları getir
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/users`);
  }

  // ID'ye göre kullanıcı getir
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/users/${id}`);
  }
} 