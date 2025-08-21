import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  name: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'evpeti-theme';
  private readonly themes: Theme[] = [
    {
      name: 'default',
      displayName: 'Varsayılan',
      primaryColor: '#4a90e2',
      secondaryColor: '#f5f5f5',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#ff6b6b',
      borderColor: '#e0e0e0'
    },
    {
      name: 'dark',
      displayName: 'Koyu Tema',
      primaryColor: '#2c3e50',
      secondaryColor: '#34495e',
      backgroundColor: '#1a1a1a',
      textColor: '#ecf0f1',
      accentColor: '#e74c3c',
      borderColor: '#34495e'
    },
    {
      name: 'nature',
      displayName: 'Doğa',
      primaryColor: '#27ae60',
      secondaryColor: '#d5f4e6',
      backgroundColor: '#f8f9fa',
      textColor: '#2c3e50',
      accentColor: '#f39c12',
      borderColor: '#bdc3c7'
    },
    {
      name: 'sunset',
      displayName: 'Gün Batımı',
      primaryColor: '#e67e22',
      secondaryColor: '#fdf2e9',
      backgroundColor: '#fff5f0',
      textColor: '#2c3e50',
      accentColor: '#e74c3c',
      borderColor: '#fad7a0'
    },
    {
      name: 'ocean',
      displayName: 'Okyanus',
      primaryColor: '#3498db',
      secondaryColor: '#ebf3fd',
      backgroundColor: '#f0f8ff',
      textColor: '#2c3e50',
      accentColor: '#1abc9c',
      borderColor: '#b3d9ff'
    }
  ];

  private currentThemeSubject = new BehaviorSubject<Theme>(this.themes[0]);
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Sadece tarayıcıda localStorage'a eriş
    if (isPlatformBrowser(this.platformId)) {
      this.loadSavedTheme();
    }
  }

  private loadSavedTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      const savedThemeName = localStorage.getItem(this.THEME_KEY);
      if (savedThemeName) {
        const savedTheme = this.themes.find(t => t.name === savedThemeName);
        if (savedTheme) {
          this.applyTheme(savedTheme);
          return;
        }
      }
    } catch (error) {
      console.warn('localStorage erişim hatası:', error);
    }
    
    this.applyTheme(this.themes[0]);
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(themeName: string): void {
    const theme = this.themes.find(t => t.name === themeName);
    if (theme) {
      // Sadece tarayıcıda localStorage'a kaydet
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem(this.THEME_KEY, themeName);
        } catch (error) {
          console.warn('localStorage kaydetme hatası:', error);
        }
      }
      this.applyTheme(theme);
    }
  }

  private applyTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    
    // Sadece tarayıcıda DOM'a uygula
    if (isPlatformBrowser(this.platformId)) {
      try {
        // CSS custom properties'i güncelle
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--secondary-color', theme.secondaryColor);
        root.style.setProperty('--background-color', theme.backgroundColor);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--accent-color', theme.accentColor);
        root.style.setProperty('--border-color', theme.borderColor);
        
        // Body class'ını güncelle
        document.body.className = `theme-${theme.name}`;
      } catch (error) {
        console.warn('DOM güncelleme hatası:', error);
      }
    }
  }

  getNextTheme(): Theme {
    const currentIndex = this.themes.findIndex(t => t.name === this.currentThemeSubject.value.name);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    return this.themes[nextIndex];
  }

  cycleTheme(): void {
    const nextTheme = this.getNextTheme();
    this.setTheme(nextTheme.name);
  }
}
