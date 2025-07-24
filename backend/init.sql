CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),  --kullanıcı idsi
    name NVARCHAR(100) NOT NULL, --ismi
    email NVARCHAR(100) NOT NULL UNIQUE, 
    password_hash NVARCHAR(255) NOT NULL,
    city NVARCHAR(50),
    is_sitter BIT DEFAULT 0, -- 1=true bakıcı 0=false hayvansahibi
    profile_photo NVARCHAR(255),
    bio NVARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.0, --puanlaması
    created_at DATETIME2 DEFAULT GETDATE() --kayıt tarihi
);

CREATE TABLE Pets (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- benzersiz kimlik
    user_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), --userdan alınan hayvansahibi id
    name NVARCHAR(100) NOT NULL,
    species NVARCHAR(50) NOT NULL, --türü
    breed NVARCHAR(100),  --cinsi
    age INT,
    gender NVARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    weight DECIMAL(5,2),
    health_notes NVARCHAR(1000), --sağlık raporu işte
    photo NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE() --otomatik
);

CREATE TABLE Listings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- Benzersiz ilan ID'si
    user_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), -- İlan sahibi kullanıcı
    type NVARCHAR(10) NOT NULL CHECK (type IN ('offer', 'request')), -- İlan türü (offer=bakıcı ilanı, request=sahip ilanı)
    pet_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Pets(id), -- İlgili pet (request tipindeyse)
    location NVARCHAR(100) NOT NULL, -- Konum bilgisi (İl/ilçe)
    available_from DATETIME2 NOT NULL, -- Bakım başlangıç tarihi
    available_to DATETIME2 NOT NULL, -- Bakım bitiş tarihi
    price_per_day DECIMAL(10,2) NOT NULL, -- Günlük ücret
    description NVARCHAR(1000), -- Detaylı açıklama
    status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'booked', 'closed', 'cancelled')), -- İlan durumu
    created_at DATETIME2 DEFAULT GETDATE() -- Oluşturulma tarihi
);

CREATE TABLE Bookings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- Rezervasyon ID'si
    listing_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Listings(id), -- İlgili ilan
    owner_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), -- Hayvan sahibi
    sitter_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), -- Bakıcı
    pet_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Pets(id), -- Bakılacak pet
    start_date DATETIME2 NOT NULL, -- Bakım başlangıç
    end_date DATETIME2 NOT NULL, -- Bakım bitiş
    total_price DECIMAL(10,2) NOT NULL, -- Toplam ücret
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')), -- Rezervasyon durumu
    created_at DATETIME2 DEFAULT GETDATE() -- Oluşturulma tarihi
);

CREATE TABLE Duties (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- Görev ID'si
    booking_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Bookings(id), -- İlgili rezervasyon
    title NVARCHAR(100) NOT NULL, -- Görev başlığı (Örn: "Sabah Yürüyüşü")
    description NVARCHAR(500), -- Detaylı açıklama
    date DATETIME2 NOT NULL, -- Görev tarihi
    photo_url NVARCHAR(255), -- Kanıt fotoğrafı URL'si
    is_done BIT DEFAULT 0, -- Tamamlanma durumu (0: yapılmadı, 1: yapıldı)
    created_at DATETIME2 DEFAULT GETDATE() -- Oluşturulma tarihi
);

CREATE TABLE Reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- Değerlendirme ID'si
    from_user UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), -- Değerlendiren kullanıcı
    to_user UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), -- Değerlendirilen kullanıcı
    booking_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Bookings(id), -- İlgili rezervasyon
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), -- 1-5 arası puan
    comment NVARCHAR(1000), -- Yorum metni
    created_at DATETIME2 DEFAULT GETDATE() -- Oluşturulma tarihi
);

CREATE TABLE Messages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- Mesaj ID'si
    sender_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), -- Gönderen
    receiver_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), -- Alıcı
    booking_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Bookings(id), -- İlgili rezervasyon (varsa)
    content NVARCHAR(2000) NOT NULL, -- Mesaj içeriği
    is_read BIT DEFAULT 0, -- Okunma durumu (0: okunmadı, 1: okundu)
    created_at DATETIME2 DEFAULT GETDATE() -- Oluşturulma tarihi
);

CREATE TABLE Notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- Bildirim ID'si
    user_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(id), -- Hedef kullanıcı
    type NVARCHAR(50) NOT NULL, -- Bildirim türü (booking_request, message, review vb.)
    content NVARCHAR(500) NOT NULL, -- Bildirim içeriği
    is_read BIT DEFAULT 0, -- Okunma durumu
    related_id UNIQUEIDENTIFIER, -- İlgili kayıt ID'si
    created_at DATETIME2 DEFAULT GETDATE() -- Oluşturulma tarihi
);