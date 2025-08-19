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
    formData.append('file', file);

    return this.http.post<{ success: boolean; url: string }>(`${this.baseUrl}/FileUpload/upload`, formData)
      .pipe(
        map(response => response.url)
      );
  }

  // Çoklu fotoğraf yükleme (Ev ilanları için)
  uploadMultipleImages(files: File[]): Observable<string[]> {
    const uploads = files.map(file => this.uploadSingleImage(file));
    
    return new Observable(observer => {
      const results: string[] = [];
      let completed = 0;
      
      uploads.forEach(upload => {
        upload.subscribe({
          next: (url) => {
            results.push(url);
            completed++;
            if (completed === files.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      });
    });
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
