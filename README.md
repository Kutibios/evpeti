<img src="frontend/evpeti-app/src/assets/logo.png" alt="EvPeti Logo" width="200" height="auto" style="display: block; margin: 0 auto;">

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![Status](https://img.shields.io/badge/status-Core%20Ready-brightgreen)
![Docker + K8s](https://img.shields.io/badge/Docker%20%2B%20K8s-In%20Progress-orange)

## ✨ Proje Hakkında
Evcil hayvan bakım platformu - ev sahipleri ile evcil hayvan sahiplerini buluşturan, rezervasyon yönetimi ve canlı mesajlaşma özelliklerine sahip modern web uygulaması. Platform, evcil hayvan sahiplerinin güvenilir bakım hizmeti bulmasını, ev sahiplerinin ise ek gelir elde etmesini sağlıyor. Rezervasyon sistemi, kullanıcı profilleri, mesajlaşma ve admin paneli gibi kapsamlı özellikler sunuyor.


## ✨ Özellikler

### 🔑 Kullanıcı Yönetimi
- **Kayıt Sistemi:** Email ve şifre ile güvenli hesap oluşturma
- **Giriş Sistemi:** JWT token tabanlı kimlik doğrulama
- **Profil Yönetimi:** Kişisel bilgileri düzenleme ve güncelleme
- **Şifre Sıfırlama:** Güvenli şifre yenileme sistemi

### 🏠 Evcil Hayvan Profilleri
- **Profil Oluşturma:** Hayvan türü, yaş, cins, özel ihtiyaçlar
- **Fotoğraf Yükleme:** Çoklu fotoğraf desteği
- **Sağlık Bilgileri:** Aşı durumu, ilaç bilgileri, veteriner notları
- **Davranış Notları:** Özel karakteristik özellikler ve alışkanlıklar

### 📅 Rezervasyon Sistemi
- **Rezervasyon Oluşturma:** Tarih, saat ve hizmet türü seçimi
- **Durum Takibi:** Onay, iptal, tamamlanma durumları
- **Otomatik Bildirimler:** Email ve SMS ile güncellemeler

### 💭 Canlı Mesajlaşma
- **Gerçek Zamanlı İletişim:** WebSocket tabanlı anlık mesajlaşma
- **Dosya Paylaşımı:** Fotoğraf ve belge gönderimi
- **Mesaj Geçmişi:** Tüm konuşmaların arşivlenmesi
- **Okundu Bilgisi:** Mesaj durumu takibi

### 📱 Responsive Tasarım
- **Mobil Uyumluluk:** Tüm cihazlarda optimal görünüm
- **Modern UI/UX:** Kullanıcı dostu arayüz tasarımı
- **Hızlı Yükleme:** Optimize edilmiş performans


## ⚙️ Teknolojiler

### Frontend
- **Framework:** Angular 15+
- **Language:** TypeScript
- **Styling:** CSS3, Bootstrap

### Backend
- **Framework:** .NET Core 6.0 Web API
- **Language:** C#
- **Architecture:** RESTful API
- **Documentation:** Swagger/OpenAPI

### Database
- **RDBMS:** SQL Server
- **Management:** SQL Server Management Studio (SSMS)
- **Containerization:** SQL Server Docker Container

### DevOps
- **Containerization:** Docker (Devam ediyor)
- **Orchestration:** Kubernetes (Devam ediyor)
- **Database Container:** SQL Server Docker Image

## ⚡ Kurulum

### Gereksinimler
- .NET Core 6.0 SDK
- Node.js 16+
- Docker Desktop
- Git

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/Kutibios/evpeti.git
cd evpeti
```

### 2. Database Kurulumu
**SQL Server Kurulumu (Gerekli)**

**Docker ile SQL Server:**
```bash
# SQL Server container'ını başlat
# SA_PASSWORD kısmına KENDİ belirlediğiniz şifreyi yazın
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=KENDI_SIFRENIZ" -p 1433:1433 --name evpeti-sql -d mcr.microsoft.com/mssql/server:2019-latest

# Örnek: Şifreniz "MyPassword123!" ise
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=MyPassword123!" -p 1433:1433 --name evpeti-sql -d mcr.microsoft.com/mssql/server:2019-latest

# Container'ın çalıştığını kontrol et
docker ps
```

### 3. Backend Kurulumu
```bash
cd EvPeti.API
dotnet restore
dotnet build
dotnet run
```

### 4. Frontend Kurulumu
```bash
cd frontend/evpeti-app
npm install
npm start
# Eğer npm start çalışmazsa:
ng serve
# Eğer ng serve çalışmazsa:
npm run build
ng serve --prod
```

### 5. Veritabanı Migration
```bash
cd EvPeti.API
dotnet ef database update
```

## Kullanım


1. **Hesap Oluşturma**
   - Ana sayfada "Kayıt Ol" butonuna tıklayın
   - Email adresinizi ve güçlü bir şifre girin
   - Email doğrulamasını tamamlayın
     
     <img width="318" height="575" alt="image" src="https://github.com/user-attachments/assets/0f092266-7dbd-4460-962e-86eaef637ed1" />

2. **Ev İlanı Açma (Ev Sahipleri İçin)**
   - "İlan Aç" butonuna tıklayın
   - Ev bilgilerinizi girin (adres, oda sayısı, evcil hayvan uyumluluğu)
   - Hizmet türünü seçin (günlük bakım, gece bakımı, uzun süreli)
   - Fiyat belirleyin
   - Ev fotoğraflarını ekleyin
   - İlanı yayınlayın
     
     <img width="473" height="814" alt="image" src="https://github.com/user-attachments/assets/fd598b33-1fc0-4649-b781-91de2a964c21" />


### 🏠 Evcil Hayvan Profili
   **Yeni Profil Oluşturma**
   - "Evcil Hayvan Ekle" butonuna tıklayın
   - Hayvan türünü seçin (köpek, kedi, kuş, vb.)
   - Yaş, cins ve ağırlık bilgilerini girin
   - Özel ihtiyaçları belirtin (ilaç, diyet, davranış)
     
     <img width="406" height="791" alt="image" src="https://github.com/user-attachments/assets/dc1eca1d-95ec-4564-8c56-80b02f55ec09" />


### 📅 Rezervasyon Sistemi
1. **Hizmet Arama**
   - "Hizmet Ara" bölümünde konumunuzu girin
   - Tarih aralığını seçin
   - Hizmet türünü belirleyin (günlük bakım, gece bakımı)
     
     <img width="1396" height="640" alt="image" src="https://github.com/user-attachments/assets/7a8307ec-1262-4f74-bed8-fbdd5a014c38" />


2. **Rezervasyon Yapma**
   - Uygun ev sahibini seçin
   - Detayları inceleyin ve onaylayın
   - Ödeme bilgilerinizi girin
   - Rezervasyon onayını bekleyin
     
     <img width="674" height="688" alt="image" src="https://github.com/user-attachments/assets/8bb68521-13b1-408c-9fb1-c5f4cd555cde" />

3. **Rezervasyon Takibi**
   - "Rezervasyonlarım" bölümünden durumu izleyin
   - Gerekirse iptal veya değişiklik yapın
   - Hizmet sonrası değerlendirme yapın
     
     <img width="738" height="610" alt="image" src="https://github.com/user-attachments/assets/18f9eeed-1953-4780-8942-eef66af08d20" />


### 💬 Mesajlaşma
1. **İletişim Başlatma**
   - Ev sahibi ile rezervasyon öncesi mesajlaşın
   - Özel istekleri belirtin
   - Hizmet detaylarını netleştirin
     
     <img width="1901" height="268" alt="image" src="https://github.com/user-attachments/assets/376bc251-82b1-4024-a660-fa5429ddc4af" />


2. **Hizmet Sırasında**
   - Güncellemeler alın
   - Fotoğraf paylaşın
   - Acil durumlarda hızlı iletişim kurun
     
     <img width="370" height="702" alt="image" src="https://github.com/user-attachments/assets/8cc6fc9d-83f1-4460-b6c6-6da0bedd1e8b" />


### 📱 Mobil Kullanım
- Tüm özellikler mobil cihazlarda da çalışır
- Responsive tasarım sayesinde optimal deneyim
- Push bildirimler ile güncellemeler alın

## API Dokümantasyonu

- Swagger UI: `https://localhost:5001/swagger`
- Endpoint'ler ve kullanım örneklerine buradan ulaşabilirsiniz.

## Katkı

Bu projeye katkıda bulunmak istiyorsanız:

1. Fork yapın
2. Feature branch oluşturun
3. Commit yapın
4. Push yapın
5. Pull Request açın

### İletişim

- GitHub: [![GitHub](https://img.shields.io/badge/GitHub-Profile-black?style=for-the-badge&logo=github)](https://github.com/Kutibios)
- Email: [![Email](https://img.shields.io/badge/Email-Contact-red?style=for-the-badge&logo=gmail)](mailto:leventkutaysezer@gmail.com)
- LinkedIn: [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/levent-kutay-sezer/)

Pull request'ler ve önerilerinizi bekliyorum!
