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

  constructor(private http: HttpClient) {}

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

  // Clear state (logout için)
  clearState(): void {
    this.petsSubject.next([]);
    this.listingsSubject.next([]);
  }
}
