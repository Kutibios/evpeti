import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UIState {
  isLoading: boolean;
  errorMessage: string;
  successMessage: string;
  showConfirmDialog: boolean;
  confirmDialogData: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private uiStateSubject = new BehaviorSubject<UIState>({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    showConfirmDialog: false,
    confirmDialogData: null
  });

  public uiState$ = this.uiStateSubject.asObservable();

  constructor() {}

  // Loading state
  setLoading(loading: boolean): void {
    const currentState = this.uiStateSubject.value;
    this.uiStateSubject.next({
      ...currentState,
      isLoading: loading
    });
  }

  // Error handling
  setError(message: string): void {
    const currentState = this.uiStateSubject.value;
    this.uiStateSubject.next({
      ...currentState,
      errorMessage: message,
      isLoading: false
    });

    // Auto-clear error after 5 seconds
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  clearError(): void {
    const currentState = this.uiStateSubject.value;
    this.uiStateSubject.next({
      ...currentState,
      errorMessage: ''
    });
  }

  // Success messages
  setSuccess(message: string): void {
    const currentState = this.uiStateSubject.value;
    this.uiStateSubject.next({
      ...currentState,
      successMessage: message
    });

    // Auto-clear success after 3 seconds
    setTimeout(() => {
      this.clearSuccess();
    }, 3000);
  }

  clearSuccess(): void {
    const currentState = this.uiStateSubject.value;
    this.uiStateSubject.next({
      ...currentState,
      successMessage: ''
    });
  }

  // Confirm dialog
  showConfirmDialog(
    title: string,
    message: string,
    confirmText: string = 'Evet',
    cancelText: string = 'Hayır',
    onConfirm: () => void
  ): void {
    const currentState = this.uiStateSubject.value;
    this.uiStateSubject.next({
      ...currentState,
      showConfirmDialog: true,
      confirmDialogData: {
        title,
        message,
        confirmText,
        cancelText,
        onConfirm
      }
    });
  }

  hideConfirmDialog(): void {
    const currentState = this.uiStateSubject.value;
    this.uiStateSubject.next({
      ...currentState,
      showConfirmDialog: false,
      confirmDialogData: null
    });
  }

  // Utility methods
  getCurrentState(): UIState {
    return this.uiStateSubject.value;
  }

  resetState(): void {
    this.uiStateSubject.next({
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      showConfirmDialog: false,
      confirmDialogData: null
    });
  }
}
