import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { DataService, Pet } from './services/data.service';
import { UIService } from './services/ui.service';
import { FileUploadService } from './services/file-upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pet-profile.component.html',
  styleUrls: ['./pet-profile.component.css']
})
export class PetProfileComponent implements OnInit, OnDestroy {
  petForm = {
    name: '',
    type: '',
    breed: '',
    age: 0,
    gender: '',
    color: '',
    weight: 0,
    healthNotes: '',
    description: '',
    photo: ''
  };

  isEditMode = false;
  editPetId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Fotoğraf yükleme
  selectedImage: string | null = null;
  selectedFile: File | null = null;
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
        this.editPetId = +params['edit'];
        this.loadPetForEdit(this.editPetId);
      }
    });
  }

  loadPetForEdit(petId: number) {
    this.uiService.setLoading(true);
    
    // Mevcut pet'leri yükle ve düzenlenecek olanı bul
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.dataService.getUserPets(user.id).subscribe({
        next: (pets) => {
          const petToEdit = pets.find(p => p.id === petId);
          if (petToEdit) {
            this.petForm = {
              name: petToEdit.name,
              type: petToEdit.type,
              breed: petToEdit.breed,
              age: petToEdit.age,
              gender: petToEdit.gender || '',
              color: petToEdit.color || '',
              weight: petToEdit.weight || 0,
              healthNotes: petToEdit.healthNotes || '',
              description: petToEdit.description || '',
              photo: petToEdit.photo || ''
            };
          }
          this.uiService.setLoading(false);
        },
        error: (error) => {
          console.error('Error loading pet for edit:', error);
          this.uiService.setError('Pet bilgileri yüklenirken hata oluştu');
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
    if (!this.petForm.name || !this.petForm.type || !this.petForm.breed || this.petForm.age <= 0) {
      this.uiService.setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    this.uiService.setLoading(true);

    try {
      const user = this.authService.getCurrentUser();
      if (!user || !user.id) {
        this.uiService.setError('Kullanıcı bilgileri bulunılamadı');
        this.uiService.setLoading(false);
        return;
      }

      const petData = {
        ...this.petForm,
        userId: user.id
      };
      
      console.log('Pet data to be saved:', petData);
      console.log('Photo URL:', this.petForm.photo);

          if (this.isEditMode && this.editPetId) {
        // Update existing pet
        this.dataService.updatePet(this.editPetId, petData).subscribe({
          next: (updatedPet) => {
            console.log('Pet updated successfully:', updatedPet);
            this.uiService.setSuccess('Pet profili başarıyla güncellendi!');
            this.uiService.setLoading(false);
            setTimeout(() => {
              this.router.navigate(['/profile']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error updating pet:', error);
            this.handleApiError(error);
          }
        });
      } else {
        // Create new pet
        this.dataService.createPet(petData).subscribe({
          next: (newPet) => {
            console.log('Pet created successfully:', newPet);
            this.uiService.setSuccess('Pet profili başarıyla oluşturuldu!');
            this.uiService.setLoading(false);
            setTimeout(() => {
              this.router.navigate(['/profile']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error creating pet:', error);
            this.handleApiError(error);
          }
        });
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      this.uiService.setError('Fotoğraf yüklenirken hata oluştu');
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
      this.uiService.setError('Pet profili işlemi sırasında hata oluştu: ' + (error.error || error.message || 'Bilinmeyen hata'));
    }
  }

  // Fotoğraf yükleme metodları
  // Geçici olarak devre dışı - backend upload endpoint'i hazır olmadığı için
  // onImageSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     // Dosya boyutu kontrolü (5MB)
  //     if (file.size > 5 * 1024 * 1024) {
  //       this.uiService.setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
  //       return;
  //     }

  //     // Dosya tipi kontrolü
  //     if (!file.type.startsWith('image/')) {
  //       this.uiService.setError('Lütfen geçerli bir resim dosyası seçin');
  //       return;
  //     }

  //     this.selectedFile = file;
      
  //     // Preview için FileReader kullan
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.selectedImage = e.target.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  // removeImage() {
  //   this.selectedImage = null;
  //   this.selectedFile = null;
  //   this.petForm.imageUrl = '';
  //   this.uploadProgress = 0;
  // }

  // uploadImage metodu kaldırıldı - artık kullanılmıyor

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