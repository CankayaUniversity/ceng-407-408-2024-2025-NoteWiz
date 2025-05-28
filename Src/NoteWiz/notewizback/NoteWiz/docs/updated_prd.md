# 📦 NoteWiz - Backend Entity & Database Design (ASP.NET Core)

This document outlines the **backend entity relationships** and **project scope** for the NoteWiz AI-powered note-taking application using **ASP.NET Core** and **Entity Framework Core**.

---

## 🧠 Project Scope
NoteWiz is an AI-powered note-taking platform focused on enhancing productivity. Key features include:

- AI-generated summarization and Q&A (via OpenAI API)
- OCR text extraction (via Tesseract)
- Real-time collaboration and note sharing
- Task scheduling and tracking
- Cross-device synchronization
- Secure authentication and role-based access (Login/Register functionality)
- Drawing, handwriting, and image embedding within notes
- Friend system with request/acceptance mechanics
- Private/public note sharing among friends

---

## 🗂️ Core Entities & Relationships

### 👤 User
Represents app users (standard or admin).
```csharp
User
- Id (int)
- Username (string)
- FullName (string)
- Email (string)
- PasswordHash (string)
- IsAdmin (bool)
- CreatedAt (DateTime)

Relationships:
- Notes (1-to-many)
- Tasks (1-to-many)
- Friends (many-to-many via Friendship)
- FriendshipsInitiated (1-to-many)
- FriendshipsReceived (1-to-many)
- FriendshipRequests (1-to-many)
- UploadedDocuments (1-to-many)
- AuthTokens (1-to-many)
- SharedWithMe (1-to-many via NoteShare)
```

---

### 🖍️ Note
Stores notes created by users.
```csharp
Note
- Id (int)
- Title (string)
- Content (string)
- CoverImageUrl (string?)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)
- UserId (FK)
- IsSynced (bool) // For mobile sync status
- LastSyncedAt (DateTime?)
- Tags (List<string>)
- Color (string) // Default "#FFFFFF"
- IsPinned (bool)
- IsPrivate (bool) // Controls note visibility to friends

Relationships:
- User (many-to-1)
- SharedWith (many-to-many via NoteShare)
- NoteDrawings (1-to-many)
- NoteImages (1-to-many)
- NoteTexts (1-to-many)
- NotePdfPages (1-to-many)
```

---

### 🎨 NoteDrawing
Stores user-drawn strokes or handwriting on notes.
```csharp
NoteDrawing
- Id (int)
- NoteId (FK)
- DrawingData (string) // JSON containing stroke data
- CreatedAt (DateTime)

Relationships:
- Note (many-to-1)
```

---

### 📝 NoteText
Stores text elements on notes.
```csharp
NoteText
- Id (int)
- NoteId (FK)
- Content (string)
- Position (int)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)

Relationships:
- Note (many-to-1)
```

---

### 📤 NoteShare
Tracks shared notes and permissions.
```csharp
NoteShare
- Id (int)
- NoteId (FK)
- SharedWithUserId (FK)
- CanEdit (bool)
- SharedAt (DateTime)

Relationships:
- Note (many-to-1)
- SharedWithUser (many-to-1)
```

---

### ✅ TaskItem
Tasks associated with user productivity.
```csharp
TaskItem
- Id (int)
- Description (string)
- IsCompleted (bool)
- DueDate (DateTime)
- UserId (FK)
- CreatedAt (DateTime)
- CompletedAt (DateTime?)
- Priority (int) // Task priority level

Relationships:
- User (many-to-1)
```

---

### 🤝 Friendship
Handles user-to-user friend relationships.
```csharp
Friendship
- Id (int)
- UserId (FK)
- FriendId (FK)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)

Relationships:
- User (many-to-1)
- Friend (many-to-1)
```

---

### 👋 FriendshipRequest
Manages friendship requests between users.
```csharp
FriendshipRequest
- Id (int)
- SenderId (FK)
- ReceiverId (FK)
- Status (FriendshipRequestStatus) // Pending, Accepted, Rejected
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)

Relationships:
- Sender (many-to-1)
- Receiver (many-to-1)
```

---

### 📄 DocumentUpload
Holds OCR-uploaded document data.
```csharp
DocumentUpload
- Id (int)
- FilePath (string)
- ExtractedText (string)
- UploadedAt (DateTime)
- UserId (FK)

Relationships:
- User (many-to-1)
```

---

### 🔐 AuthToken (for Login/Session Management)
```csharp
AuthToken
- Id (int)
- Token (string)
- ExpiresAt (DateTime)
- CreatedAt (DateTime)
- UserId (FK)
- DeviceInfo (string) // Stores device information for React Native clients
- IsRevoked (bool)
- UpdatedAt (DateTime?)

Relationships:
- User (many-to-1)
```

---

### 📱 UserDevice
Tracks user device information for mobile app.
```csharp
UserDevice
- Id (int)
- UserId (FK)
- DeviceId (string)
- DeviceType (string) // iOS/Android
- PushNotificationToken (string)
- LastActiveAt (DateTime)
- AppVersion (string)

Relationships:
- User (many-to-1)
```

---

### 🔔 Notification
Manages push notifications for mobile clients.
```csharp
Notification
- Id (int)
- UserId (FK)
- Title (string)
- Message (string)
- IsRead (bool)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)
- Type (string) // Notification type (e.g., "NoteShare", "TaskReminder")
- RelatedEntityId (int?) // Optional reference to related entity
- RelatedEntityType (string) // Entity type name

Relationships:
- User (many-to-1)
```

---

### 📄 NotePdfPage
Stores PDF pages that can be annotated.
```csharp
NotePdfPage
- Id (int)
- NoteId (FK)
- PageNumber (int)
- PdfUrl (string)
- ThumbnailUrl (string)
- CreatedAt (DateTime)
- Annotations (string) // JSON containing annotations data

Relationships:
- Note (many-to-1)
```

---

### 🖼️ NoteImage
Stores images embedded into notes.
```csharp
NoteImage
- Id (int)
- NoteId (FK)
- ImageUrl (string)
- PositionX (int)
- PositionY (int)
- Width (int)
- Height (int)
- Rotation (float)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)
- LayerIndex (int)

Relationships:
- Note (many-to-1)
```

---

### 🎯 NoteTemplate
Stores predefined note templates.
```csharp
NoteTemplate
- Id (int)
- Name (string)
- Description (string)
- PreviewImageUrl (string)
- TemplateData (string) // JSON containing template configuration
- IsPublic (bool)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)

Relationships:
- None
```

---

### 🤖 NoteAISelection
Stores AI analysis requests and results for selected areas.
```csharp
NoteAISelection
- Id (int)
- NoteId (FK)
- SelectionX (int) // X coordinate of selection box
- SelectionY (int) // Y coordinate of selection box
- SelectionWidth (int) // Width of selection box
- SelectionHeight (int) // Height of selection box
- ScreenshotUrl (string) // URL of the captured screenshot
- UserPrompt (string) // User's input prompt
- AIResponse (string) // AI's response
- ResponseType (string) // Type of response (text, popup, etc.)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)
- Status (string) // Status of AI processing (pending, completed, failed)
- ErrorMessage (string?) // Error message if processing failed

Relationships:
- Note (many-to-1)
```

---

### 💬 NoteAIPopup
Stores AI-generated popup content.
```csharp
NoteAIPopup
- Id (int)
- NoteId (FK)
- Content (string)
- PositionX (int)
- PositionY (int)
- Width (int)
- Height (int)
- IsPinned (bool)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)
- Style (string) // JSON containing popup styling
- Visibility (string) // Visibility state (visible, hidden, minimized)

Relationships:
- Note (many-to-1)
```

---

### 🧠 AIInteractionLog
Tracks AI interactions and responses.
```csharp
AIInteractionLog
- Id (int)
- UserId (FK)
- NoteId (FK)
- InteractionType (string) // Type of AI interaction
- InputPrompt (string)
- AIResponse (string)
- ModelUsed (string) // AI model identifier
- TokensUsed (int) // Number of tokens used
- ProcessingTime (int) // Time taken in milliseconds
- CreatedAt (DateTime)
- Cost (decimal) // Cost of the AI request

Relationships:
- User (many-to-1)
- Note (many-to-1)
```

---

## 🔌 API Endpoints Structure

The API follows RESTful principles with the following endpoint structure:

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/logout

### Users
- GET /api/users/profile
- PUT /api/users/profile

### Friendship
- GET /api/friendship
- GET /api/friendship/requests
- POST /api/friendship/requests
- PUT /api/friendship/requests/{id}
- DELETE /api/friendship/{friendId}

### Notes
- GET /api/notes
- GET /api/notes/{id}
- POST /api/notes
- PUT /api/notes/{id}
- DELETE /api/notes/{id}
- POST /api/notes/{id}/share
- GET /api/notes/shared-with-me
- GET /api/notes/pdf-pages
- POST /api/notes/pdf-pages
- GET /api/notes/pdf-pages/{id}
- PUT /api/notes/pdf-pages/{id}
- DELETE /api/notes/pdf-pages/{id}
- GET /api/notes/images
- POST /api/notes/images
- GET /api/notes/images/{id}
- PUT /api/notes/images/{id}
- DELETE /api/notes/images/{id}
- GET /api/notes/templates
- POST /api/notes/templates
- GET /api/notes/templates/{id}
- PUT /api/notes/templates/{id}
- DELETE /api/notes/templates/{id}
- GET /api/notes/ai-selections
- POST /api/notes/ai-selections
- GET /api/notes/ai-selections/{id}
- PUT /api/notes/ai-selections/{id}
- DELETE /api/notes/ai-selections/{id}
- GET /api/notes/ai-popups
- POST /api/notes/ai-popups
- GET /api/notes/ai-popups/{id}
- PUT /api/notes/ai-popups/{id}
- DELETE /api/notes/ai-popups/{id}
- GET /api/notes/ai-interaction-logs
- POST /api/notes/ai-interaction-logs

### Tasks
- GET /api/tasks
- GET /api/tasks/{id}
- POST /api/tasks
- PUT /api/tasks/{id}
- DELETE /api/tasks/{id}
- PUT /api/tasks/{id}/complete

### Documents
- POST /api/documents/upload
- GET /api/documents
- GET /api/documents/{id}
- DELETE /api/documents/{id}

### Notifications (Mobile-specific)
- GET /api/notifications
- PUT /api/notifications/{id}/read
- POST /api/devices/register

---

## 🔄 Real-time Communication

SignalR will be used for real-time features:

```csharp
// SignalR Hubs
- NoteHub (Real-time note collaboration)
  - Methods:
    - JoinNoteSession(noteId)
    - LeaveNoteSession(noteId)
    - UpdateNote(noteId, content)
    - AddDrawing(noteId, drawingData)
    - UserIsTyping(noteId, userName)
    - UpdateNoteShare(noteId, shareData)
    - RemoveNoteShare(noteId, userId)
    - UpdateDrawing(noteId, drawingId, drawingData)
    - DeleteDrawing(noteId, drawingId)
    - AddImage(noteId, imageData)
    - UpdateImage(noteId, imageId, imageData)
    - DeleteImage(noteId, imageId)
    - UpdateText(noteId, textId, textData)
    - DeleteText(noteId, textId)
    - UpdateCanvas(noteId, canvasData)
    - UpdateNotePermissions(noteId, permissions)

- NotificationHub (Real-time notifications)
  - Methods:
    - SendNotification(userId, notification)
    - MarkAsRead(notificationId)
    - UpdateNotificationSettings(userId, settings)
    - SendTaskReminder(userId, taskId)
    - SendNoteShareNotification(userId, noteId)
    - SendFriendRequest(userId, friendId)
    - AcceptFriendRequest(userId, friendId)
    - RejectFriendRequest(userId, friendId)

- AIHub (AI-specific interactions)
  - Methods:
    - StartAIProcessing(noteId, selectionData)
    - UpdateAIProcessingStatus(noteId, status)
    - SendAIResponse(noteId, responseData)
    - CancelAIProcessing(noteId)
    - UpdateAISettings(userId, settings)
```

---

## 💾 Data Storage Strategy

- **Primary Database**: SQL Server for structured relational data (via Entity Framework Core)
- **Database Contexts**: 
  - ApplicationDbContext - Primary context for entity tables
  - NoteWizDbContext - Secondary context used in some repositories
- **Blob Storage**: Azure Blob Storage for document uploads and image storage
- **Offline Storage Strategy**: 
  - Mobile client will maintain SQLite database for offline mode
  - Implement sync mechanism to reconcile changes when connection is restored

---

## 🧰 Additional Components
- `AuditLog` - Track user actions (login, create, edit, delete)
- **JWT Authentication** - Implement token-based auth with refresh tokens
- **Background Services** - Implement for processing OCR and AI tasks asynchronously
- **Dependency Injection** - Comprehensive DI setup for services, repositories, and DbContexts

---

## ✅ Project Progress Tracking

### 🔄 Completed
- [x] Initial project scope definition
- [x] Entity relationship modeling
- [x] Basic architecture planning
- [x] Database schema implementation
- [x] Core entity models creation
- [x] Basic API controller structure
- [x] JWT authentication implementation
- [x] API documentation with Swagger
- [x] User registration functionality
- [x] User login functionality
- [x] DTOs for cleaner API request/response models
- [x] Note sharing functionality
- [x] Clean Architecture implementation
- [x] Core layer with entities and interfaces
- [x] Application layer with services
- [x] Infrastructure layer with DbContext and repositories
- [x] Web layer with controllers
- [x] JWT middleware implementation
- [x] Repository pattern implementation
- [x] Dependency injection setup
- [x] Note CRUD operations
- [x] Task CRUD operations
- [x] User profile management
- [x] Error handling middleware
- [x] Application logging
- [x] Authorization rules
- [x] User repository
- [x] Task repository
- [x] Note repository
- [x] Friendship repository
- [x] FriendshipRequest repository
- [x] Notification repository
- [x] User device repository
- [x] Auth token repository
- [x] Task service
- [x] Note service
- [x] User service
- [x] Friendship service
- [x] Notification service
- [x] User device service
- [x] Auth controller
- [x] User controller
- [x] Task controller
- [x] Note controller
- [x] Friendship controller
- [x] Notification controller
- [x] User device controller
- [x] Migration setup for Entity Framework Core
- [x] Database Context Classes implementation
- [x] IsPrivate property for Notes
- [x] FriendshipRequest system implementation
- [x] Multiple DbContext handling
- [x] Private/public note visibility for friends
- [x] Unit of Work pattern implementation
- [x] Generic repository base classes
- [x] Friend request status management (accept/reject)
- [x] Database schema migration process
- [x] SQL script generation for missing tables

### 🚧 In Progress
- [ ] SignalR real-time hub setup
- [ ] File upload and OCR integration
- [ ] Mobile device API endpoints
- [ ] Notification system
- [ ] OpenAI integration for AI features
- [ ] Note drawing and annotation system
- [ ] PDF viewer and annotation
- [ ] Text element management
- [ ] Image embedding and manipulation
- [ ] Note templates system
- [ ] AI selection and analysis system
- [ ] Screenshot capture and processing
- [ ] AI response visualization
- [ ] Popup management system

### 📋 Upcoming
- [ ] Advanced features (AI, OCR, real-time collaboration)
- [ ] Testing and optimization
- [ ] Deployment and monitoring
- [ ] Mobile-specific features
- [ ] Drawing tools and effects
- [ ] PDF text extraction
- [ ] Template marketplace
- [ ] AI model fine-tuning
- [ ] Custom AI prompt templates
- [ ] AI response history
- [ ] AI usage analytics

---

## 🚀 Kurulum Talimatları

### Gereksinimler
- .NET 8.0 SDK
- SQL Server
- Visual Studio 2022 veya Visual Studio Code
- Git

### Kurulum Adımları
1. Projeyi klonlayın:
   ```bash
   git clone [repo-url]
   cd NoteWiz
   ```

2. Veritabanını oluşturun:
   - SQL Server'da yeni bir veritabanı oluşturun
   - `appsettings.json` dosyasındaki connection string'i güncelleyin:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=SUNUCU_ADINIZ\\INSTANCE_ADINIZ;Database=NoteWiz;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;Connection Timeout=60",
       "SqlAuthentication": "Server=SUNUCU_ADINIZ\\INSTANCE_ADINIZ;Database=NoteWiz;User Id=KULLANICI_ADINIZ;Password=SIFRENIZ;TrustServerCertificate=True;MultipleActiveResultSets=true;Connection Timeout=60"
     }
     ```

3. Migration'ları uygulayın:
   ```bash
   cd src
   dotnet ef database update -p NoteWiz.Infrastructure -s NoteWiz.API --context ApplicationDbContext
   ```

4. `FriendshipRequests` tablosunu oluşturun:
   - Migration ile otomatik oluşturulmayan bu tablo için SQL oluşturun:
   ```sql
   CREATE TABLE [FriendshipRequests] (
       [Id] int NOT NULL IDENTITY,
       [SenderId] int NOT NULL,
       [ReceiverId] int NOT NULL,
       [Status] int NOT NULL,
       [CreatedAt] datetime2 NOT NULL,
       [UpdatedAt] datetime2 NULL,
       CONSTRAINT [PK_FriendshipRequests] PRIMARY KEY ([Id]),
       CONSTRAINT [FK_FriendshipRequests_Users_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
       CONSTRAINT [FK_FriendshipRequests_Users_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
   );

   CREATE INDEX [IX_FriendshipRequests_SenderId] ON [FriendshipRequests] ([SenderId]);
   CREATE INDEX [IX_FriendshipRequests_ReceiverId] ON [FriendshipRequests] ([ReceiverId]);
   ```

5. Projeyi derleyin ve çalıştırın:
   ```bash
   cd NoteWiz.API
   dotnet build
   dotnet run
   ```

6. Swagger UI'a erişin:
   - Tarayıcınızda `https://localhost:7226/swagger` adresine gidin

### VS Code ile Projeyi Çalıştırma
1. VS Code'u açın ve projeyi yükleyin
2. C# eklentisini yükleyin
3. Terminal üzerinden:
   ```bash
   cd NoteWiz/src/NoteWiz.API
   dotnet run
   ```

### Önemli Notlar
- İlk çalıştırmada veritabanı otomatik olarak oluşturulacak
- JWT token'lar için `appsettings.json`'da secret key ayarlanmalı
- CORS ayarları production ortamında güncellenmeli
- Log dosyaları `Logs` klasöründe oluşturulacak
- Uygulamada iki ayrı DbContext bulunduğu için veritabanı işlemlerinde dikkatli olunmalı
- Tüm servisler ve repository'ler Program.cs dosyasında kaydedilmeli

---

## 🔍 Troubleshooting

### Genel Sorunlar ve Çözümleri

#### 1. Migration Sorunları
**Sorun**: "Unable to create an object of type 'ApplicationDbContext'" 
**Çözüm**: Design-time factory eklenmeli:
```csharp
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // ...
    }
}
```

#### 2. Tablo Bulunamadı Hataları
**Sorun**: "Invalid object name 'FriendshipRequests'"  
**Çözüm**: FriendshipRequests tablosunun SQL ile oluşturulması gerekli

#### 3. Bağımlılık Enjeksiyonu Hataları
**Sorun**: "Unable to resolve service for type 'IUnitOfWork'"  
**Çözüm**: Program.cs'de ilgili servis kaydedilmeli:
```csharp
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
```

#### 4. Token Doğrulama Sorunları
**Sorun**: Token validasyon hataları  
**Çözüm**: appsettings.json'da JWT ayarlarının doğru yapılandırılması:
```json
"Jwt": {
  "Key": "SizinGüvenliAnahtarınız...",
  "Issuer": "https://notewiz.com",
  "Audience": "https://notewiz.com",
  "DurationInMinutes": 60
}
```

---

## 📱 Mobile-specific Considerations

### React Native Integration
- Implement efficient data synchronization between server and mobile clients
- Optimize API responses for mobile data consumption
- Support background syncing for offline changes
- Implement push notification services (Firebase for Android, APNs for iOS)
- Handle device-specific storage and caching strategies
- Provide responsive image handling and compression

---

## 📅 Development Progress

### 4 Mayıs 2024 - Arkadaşlık Sistemi ve Veritabanı İyileştirmeleri

#### 🔄 Yeni Özellikler
- Arkadaşlık isteme/kabul etme/reddetme sistemi eklendi
- Not paylaşımında özel/genel not ayarı eklendi
- İsPrivate özelliği notlara eklendi
- FriendshipRequests tablosu oluşturuldu
- Veri erişim katmanı iyileştirildi (UnitOfWork pattern)

#### 🛠️ API Geliştirmeleri
- GET /api/friendship - Kullanıcının arkadaşlarını getirme
- GET /api/friendship/requests - Arkadaşlık isteklerini getirme
- POST /api/friendship/requests - Arkadaşlık isteği gönderme
- PUT /api/friendship/requests/{id} - Arkadaşlık isteğini kabul etme/reddetme
- DELETE /api/friendship/{friendId} - Arkadaşlıktan çıkarma

#### 🔒 Veri Güvenliği İyileştirmeleri
- JWT token işleme süreci güçlendirildi
- AuthToken yapısı iyileştirildi (IsRevoked özelliği eklendi)
- Veritabanı migration stratejisi geliştirildi

#### 📊 Veritabanı İyileştirmeleri
- Eksik tablolar için SQL script oluşturma desteği
- İki DbContext kullanımı için çözüm stratejileri
- Yeni alanlara varsayılan değerler atandı

---

Use this document as a guide for your ongoing NoteWiz development. Keep it updated as new features are added and development progresses. 