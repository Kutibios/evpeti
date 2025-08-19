import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:5083/api';

  constructor(private http: HttpClient) {}

  // Tek fotoğraf yükleme (Pet profilleri için)
  uploadSingleImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/upload/single`, formData)
      .pipe(
        map(response => response.imageUrl)
      );
  }

  // Çoklu fotoğraf yükleme (Ev ilanları için)
  uploadMultipleImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    return this.http.post<{ imageUrls: string[] }>(`${this.baseUrl}/upload/multiple`, formData)
      .pipe(
        map(response => response.imageUrls)
      );
  }

  // Fotoğraf silme
  deleteImage(imageUrl: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/upload/delete`, { 
      body: { imageUrl } 
    });
  }

  // Yükleme progress'i takip etme
  uploadWithProgress(file: File): Observable<UploadProgress | string> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/upload/single`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event as HttpProgressEvent;
          return {
            progress: Math.round(100 * progress.loaded / (progress.total || 0)),
            loaded: progress.loaded,
            total: progress.total || 0
          };
        } else if (event.type === HttpEventType.Response) {
          return event.body.imageUrl;
        }
        return { progress: 0, loaded: 0, total: 0 };
      })
    );
  }
}
