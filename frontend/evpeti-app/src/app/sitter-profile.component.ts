import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { DataService, Listing } from './services/data.service';
import { UIService } from './services/ui.service';
import { FileUploadService } from './services/file-upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sitter-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sitter-profile.component.html',
  styleUrls: ['./sitter-profile.component.css']
})
export class SitterProfileComponent implements OnInit, OnDestroy {
  listingForm = {
    title: '',
    type: '',
    description: '',
    price: 0,
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    isAvailable: true,
    status: 'active',
    experience: 0,
    services: '',
    imageUrls: [] as string[],
    isActive: true
  };

  isEditMode = false;
  editListingId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Fotoğraf yükleme
  selectedFiles: File[] = [];
  selectedImages: string[] = [];
  uploadProgress = 0;

  private uiSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dataService: DataService,
    private uiService: UIService,
    private fileUploadService: FileUploadService
  ) {
    // UI state'i dinle
    this.uiSubscription = this.uiService.uiState$.subscribe(state => {
      this.isLoading = state.isLoading;
      this.errorMessage = state.errorMessage;
      this.successMessage = state.successMessage;
    });
  }

  ngOnInit() {
    // Query parameter'dan edit mode'u kontrol et
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;
        this.editListingId = +params['edit'];
        this.loadListingForEdit(this.editListingId);
      }
    });
  }

  loadListingForEdit(listingId: number) {
    this.uiService.setLoading(true);
    
    // Mevcut listing'leri yükle ve düzenlenecek olanı bul
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.dataService.getUserListings(user.id).subscribe({
        next: (listings) => {
          const listingToEdit = listings.find(l => l.id === listingId);
          if (listingToEdit) {
            this.listingForm = {
              title: listingToEdit.title || '',
              type: listingToEdit.type || '',
              description: listingToEdit.description || '',
              price: listingToEdit.price,
              location: listingToEdit.location || '',
              startDate: new Date(listingToEdit.startDate),
              endDate: new Date(listingToEdit.endDate),
              isAvailable: listingToEdit.isAvailable,
              status: listingToEdit.status || 'active',
              experience: listingToEdit.experience || 0,
              services: listingToEdit.services || '',
              imageUrls: listingToEdit.imageUrls ? JSON.parse(listingToEdit.imageUrls) : [],
              isActive: listingToEdit.isActive !== undefined ? listingToEdit.isActive : true
            };
          }
          this.uiService.setLoading(false);
        },
        error: (error) => {
          console.error('Error loading listing for edit:', error);
          this.uiService.setError('İlan bilgileri yüklenirken hata oluştu');
          this.uiService.setLoading(false);
        }
      });
    }
  }

  async onSubmit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Form validation
    if (!this.listingForm.title || !this.listingForm.type || !this.listingForm.location || this.listingForm.price <= 0) {
      this.uiService.setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    this.uiService.setLoading(true);

    try {
      const user = this.authService.getCurrentUser();
      if (!user || !user.id) {
        this.uiService.setError('Kullanıcı bilgileri bulunamadı');
        this.uiService.setLoading(false);
        return;
      }

      const listingData = {
        ...this.listingForm,
        userId: user.id,
        // Backend'de ImageUrls string olarak saklanıyor, JSON string'e çevir
        imageUrls: this.listingForm.imageUrls.length > 0 ? JSON.stringify(this.listingForm.imageUrls) : null
      };

          if (this.isEditMode && this.editListingId) {
        // Update existing listing
        this.dataService.updateListing(this.editListingId, listingData).subscribe({
          next: (updatedListing) => {
            console.log('Listing updated successfully:', updatedListing);
            this.uiService.setSuccess('İlan başarıyla güncellendi!');
            this.uiService.setLoading(false);
            setTimeout(() => {
              this.router.navigate(['/profile']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error updating listing:', error);
            this.handleApiError(error);
          }
        });
      } else {
        // Create new listing
        this.dataService.createListing(listingData).subscribe({
          next: (newListing) => {
            console.log('Listing created successfully:', newListing);
            this.uiService.setSuccess('İlan başarıyla oluşturuldu!');
            this.uiService.setLoading(false);
            setTimeout(() => {
              this.router.navigate(['/profile']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error creating listing:', error);
            this.handleApiError(error);
          }
        });
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      this.uiService.setError('Fotoğraflar yüklenirken hata oluştu');
      this.uiService.setLoading(false);
    }
  }

  private handleApiError(error: any) {
    this.uiService.setLoading(false);
    
    if (error.status === 0) {
      this.uiService.setError('Backend sunucusuna bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
    } else if (error.status === 400) {
      this.uiService.setError('Geçersiz veri: ' + (error.error || 'Bilinmeyen hata'));
    } else if (error.status === 500) {
      this.uiService.setError('Sunucu hatası: ' + (error.error || 'Bilinmeyen hata'));
    } else {
      this.uiService.setError('İlan işlemi sırasında hata oluştu: ' + (error.error || error.message || 'Bilinmeyen hata'));
    }
  }

  // Fotoğraf yükleme metodları
  onImagesSelected(event: any) {
    const files = Array.from(event.target.files);
    
    if (files.length + this.selectedFiles.length > 5) {
      this.uiService.setError('En fazla 5 fotoğraf seçebilirsiniz');
      return;
    }

    files.forEach((file: unknown) => {
      const fileObj = file as File;
      // Dosya boyutu kontrolü (5MB)
      if (fileObj.size > 5 * 1024 * 1024) {
        this.uiService.setError(`${fileObj.name} dosyası 5MB'dan küçük olmalıdır`);
        return;
      }

      // Dosya tipi kontrolü
      if (!fileObj.type.startsWith('image/')) {
        this.uiService.setError(`${fileObj.name} geçerli bir resim dosyası değil`);
        return;
      }

      this.selectedFiles.push(fileObj);
      
      // Preview için FileReader kullan
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImages.push(e.target.result);
      };
      reader.readAsDataURL(fileObj);
    });
  }

  removeSelectedImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  removeExistingImage(index: number) {
    if (this.listingForm.imageUrls && this.listingForm.imageUrls.length > index) {
      this.listingForm.imageUrls.splice(index, 1);
    }
  }

  private uploadImages(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (this.selectedFiles.length === 0) {
        resolve([]);
        return;
      }

      // Geçici olarak fotoğraf yükleme devre dışı
      // Backend'de upload endpoint'leri henüz hazır değil
      reject(new Error('Fotoğraf yükleme özelliği henüz aktif değil. Şu an için manuel URL girişi yapabilirsiniz.'));
    });
  }

  onCancel() {
    this.router.navigate(['/profile']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.uiSubscription) {
      this.uiSubscription.unsubscribe();
    }
  }
} 