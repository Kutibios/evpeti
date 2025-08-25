import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  gender?: string;
  color?: string;
  weight: number;
  healthNotes: string;
  description?: string;
  userId: number;
  photo?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  rating?: number;
  createdAt?: Date;
}

export interface Listing {
  id: number;
  title?: string;
  type: string;
  price: number;
  location: string;
  startDate: Date;
  endDate: Date;
  isAvailable: boolean;
  description?: string;
  status: string;
  experience: number;
  services?: string;
  imageUrls?: string | null; // Backend'de string olarak saklanıyor
  isActive: boolean;
  userId: number;
  createdAt: Date;
  
  // User bilgileri
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userRating?: number;
}

export interface Booking {
  id?: number;
  userId: number;
  listingId: number;
  startDate: string;
  endDate: string;
  petName: string;
  petId?: number;
  petType?: string;
  petAge?: number;
  notes?: string;
  totalPrice: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  userPhone?: string;
  userEmail?: string;
  
  // İlişkili veriler
  listing?: Listing;
  user?: User;
}

export interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  bookingId: number;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  
  // İlişkili veriler
  sender?: User;
  receiver?: User;
  booking?: Booking;
}

export interface Notification {
  id?: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  relatedId?: number;
  relatedType?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  extraData?: string;
}

export interface Review {
  id?: number;
  bookingId: number;
  reviewerId: number;
  reviewedUserId: number;
  rating: number;
  comment: string;
  createdAt?: Date;
  
  // İlişkili veriler
  reviewer?: User;
  reviewedUser?: User;
  booking?: Booking;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = 'http://localhost:5083/api';
  
  // BehaviorSubject'lar ile state management
  private petsSubject = new BehaviorSubject<Pet[]>([]);
  private listingsSubject = new BehaviorSubject<Listing[]>([]);
  
  // Observable'lar
  public pets$ = this.petsSubject.asObservable();
  public listings$ = this.listingsSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  // HTTP Headers
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // PETS OPERATIONS
  getUserPets(userId: number): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.baseUrl}/pets/user/${userId}`, { headers: this.getHeaders() })
      .pipe(
        tap(pets => {
          console.log('Pets loaded from API:', pets);
          this.petsSubject.next(pets || []);
        })
      );
  }

  createPet(pet: Omit<Pet, 'id' | 'createdAt'>): Observable<Pet> {
    console.log('Sending pet data to API:', pet);
    console.log('API URL:', `${this.baseUrl}/pets`);
    
    return this.http.post<Pet>(`${this.baseUrl}/pets`, pet, { headers: this.getHeaders() })
      .pipe(
        tap(newPet => {
          console.log('Pet created successfully:', newPet);
          const currentPets = this.petsSubject.value;
          this.petsSubject.next([...currentPets, newPet]);
        })
      );
  }

  updatePet(petId: number, pet: Partial<Pet>): Observable<Pet> {
    return this.http.put<Pet>(`${this.baseUrl}/pets/${petId}`, pet, { headers: this.getHeaders() })
      .pipe(
        tap(updatedPet => {
          const currentPets = this.petsSubject.value;
          const updatedPets = currentPets.map(p => p.id === petId ? updatedPet : p);
          this.petsSubject.next(updatedPets);
        })
      );
  }

  deletePet(petId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pets/${petId}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          const currentPets = this.petsSubject.value;
          const filteredPets = currentPets.filter(p => p.id !== petId);
          this.petsSubject.next(filteredPets);
        })
      );
  }

  // LISTINGS OPERATIONS
  getListingById(id: number): Observable<Listing> {
    console.log(`DataService: getListingById çağrıldı - ID: ${id}`);
    const url = `${this.baseUrl}/listings/${id}`;
    console.log(`API URL: ${url}`);

    return this.http.get<Listing>(url, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          console.log('DataService: Tek ilan API yanıtı alındı:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', Object.keys(response || {}));
          console.log('Response stringified:', JSON.stringify(response, null, 2));
        })
      );
  }

  getAllListings(page: number = 1, pageSize: number = 10): Observable<any> {
    console.log(`DataService: getAllListings çağrıldı - Sayfa: ${page}, Boyut: ${pageSize}`);
    
    // Pagination parametrelerini query string olarak gönder
    const url = page > 1 
      ? `${this.baseUrl}/listings?page=${page}&pageSize=${pageSize}`
      : `${this.baseUrl}/listings`;
    
    console.log(`API URL: ${url}`);
    
    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          console.log('DataService: API yanıtı alındı:', response);
          
          // Response'u listings subject'e kaydet - sadece ilk sayfa için
          if (page === 1) {
            if (response && response.Listings) {
              this.listingsSubject.next(response.Listings);
            } else if (Array.isArray(response)) {
              this.listingsSubject.next(response);
            }
          }
        })
      );
  }

  getUserListings(userId: number): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.baseUrl}/listings/user/${userId}`, { headers: this.getHeaders() })
      .pipe(
        tap(listings => {
          console.log('Listings loaded from API:', listings);
          this.listingsSubject.next(listings || []);
        })
      );
  }

  createListing(listing: Omit<Listing, 'id' | 'createdAt'>): Observable<Listing> {
    console.log('DataService: createListing çağrıldı');
    console.log('DataService: Gönderilen data:', listing);
    console.log('DataService: API URL:', `${this.baseUrl}/listings`);
    
    return this.http.post<Listing>(`${this.baseUrl}/listings`, listing, { headers: this.getHeaders() })
      .pipe(
        tap({
          next: (newListing) => {
            console.log('DataService: Listing başarıyla oluşturuldu:', newListing);
            const currentListings = this.listingsSubject.value;
            this.listingsSubject.next([...currentListings, newListing]);
          },
          error: (error) => {
            console.error('DataService: Listing oluşturma hatası:', error);
          }
        })
      );
  }

  updateListing(listingId: number, listing: Partial<Listing>): Observable<Listing> {
    return this.http.put<Listing>(`${this.baseUrl}/listings/${listingId}`, listing, { headers: this.getHeaders() })
      .pipe(
        tap(updatedListing => {
          const currentListings = this.listingsSubject.value;
          const updatedListings = currentListings.map(l => l.id === listingId ? updatedListing : l);
          this.listingsSubject.next(updatedListings);
        })
      );
  }

  deleteListing(listingId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/listings/${listingId}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          const currentListings = this.listingsSubject.value;
          const filteredListings = currentListings.filter(l => l.id !== listingId);
          this.listingsSubject.next(filteredListings);
        })
      );
  }

  // State getters
  getCurrentPets(): Pet[] {
    return this.petsSubject.value;
  }

  getCurrentListings(): Listing[] {
    return this.listingsSubject.value;
  }

  // BOOKING OPERATIONS
  createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Observable<Booking> {
    console.log('DataService: createBooking çağrıldı');
    console.log('DataService: Gönderilen booking data:', booking);
    
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, booking, { headers: this.getHeaders() })
      .pipe(
        tap(newBooking => {
          console.log('DataService: Booking başarıyla oluşturuldu:', newBooking);
        })
      );
  }

  // NOTIFICATION OPERATIONS
  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/notifications/user/${userId}`, { headers: this.getHeaders() });
  }

  getUnreadNotificationCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/notifications/user/${userId}/unread-count`, { headers: this.getHeaders() });
  }

  markNotificationAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.baseUrl}/notifications/${notificationId}/mark-read`, {}, { headers: this.getHeaders() });
  }

  markAllNotificationsAsRead(userId: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/notifications/user/${userId}/mark-all-read`, {}, { headers: this.getHeaders() });
  }

  getUserBookings(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/user/${userId}`, { headers: this.getHeaders() });
  }

  getListingBookings(listingId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/listing/${listingId}`, { headers: this.getHeaders() });
  }

  // Ev sahibinin tüm ilanları için rezervasyon taleplerini getir
  getOwnerBookings(ownerId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/owner/${ownerId}`, { headers: this.getHeaders() });
  }

  updateBookingStatus(bookingId: number, status: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/bookings/${bookingId}/status`, { status }, { headers: this.getHeaders() });
  }

  // MESSAGE OPERATIONS
  sendMessage(message: Omit<Message, 'id' | 'createdAt'>): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/messages`, message, { headers: this.getHeaders() });
  }

  getChatMessages(bookingId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages/chat/${bookingId}`, { headers: this.getHeaders() });
  }

  getUserConversations(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/messages/conversations/${userId}`, { headers: this.getHeaders() });
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/messages/${messageId}/read`, {}, { headers: this.getHeaders() });
  }

  markChatAsRead(bookingId: number, userId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/messages/chat/${bookingId}/read`, { userId }, { headers: this.getHeaders() });
  }

  // USER OPERATIONS
  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/User/${userId}`, { headers: this.getHeaders() });
  }

  // BOOKING OPERATIONS - Eksik metodlar
  getBooking(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/bookings/${bookingId}`, { headers: this.getHeaders() });
  }

  // LISTING OPERATIONS - Eksik metodlar
  getListing(listingId: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.baseUrl}/listings/${listingId}`, { headers: this.getHeaders() });
  }

  // REVIEW OPERATIONS
  createReview(review: Omit<Review, 'id' | 'createdAt'>): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/reviews`, review, { headers: this.getHeaders() });
  }

  getUserReviews(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/user/${userId}`, { headers: this.getHeaders() });
  }

  getBookingReviews(bookingId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/booking/${bookingId}`, { headers: this.getHeaders() });
  }


  // Clear state (logout için)
  clearState(): void {
    this.petsSubject.next([]);
    this.listingsSubject.next([]);
  }
}
