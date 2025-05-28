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

---

## 🗂️ Core Entities & Relationships

### 👤 User
Represents app users (standard or admin).
```csharp
User
- Id (int)
- FullName (string)
- Email (string)
- PasswordHash (string)
- IsAdmin (bool)
- CreatedAt (DateTime)

Relationships:
- Notes (1-to-many)
- Tasks (1-to-many)
- Friends (many-to-many via Friendship)
- UploadedDocuments (1-to-many)
- AuthTokens (1-to-many).
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
- CanvasWidth (int) // Canvas width in pixels
- CanvasHeight (int) // Canvas height in pixels
- BackgroundColor (string) // Canvas background color
- BackgroundImageUrl (string?) // Optional background image
- IsTemplate (bool) // Whether this note is a template
- TemplateType (string?) // Type of template if it is one

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
- UpdatedAt (DateTime?)
- PositionX (int) // X position on canvas
- PositionY (int) // Y position on canvas
- ToolType (string) // Type of drawing tool (pen, brush, marker, etc.)
- Color (string) // Stroke color
- Thickness (int) // Stroke thickness
- Opacity (float) // Stroke opacity
- LayerIndex (int) // Z-index for layering

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
- PositionX (int)
- PositionY (int)
- FontFamily (string)
- FontSize (int)
- Color (string)
- CreatedAt (DateTime)
- UpdatedAt (DateTime?)
- LayerIndex (int)

Relationships:
- Note (many-to-1)
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

### 📤 NoteShare
Tracks shared notes and permissions.
```csharp
NoteShare
- Id (int)
- NoteId (FK)
- SharedWithUserId (FK)
- CanEdit (bool)

Relationships:
- Note (many-to-1)
- SharedWith (many-to-1)
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
- Reminder (DateTime?) // For mobile notifications
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

Relationships:
- User (many-to-1)
- Friend (many-to-1)
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
- ExpiryDate (DateTime)
- CreatedAt (DateTime)
- UserId (FK)
- DeviceInfo (string) // Stores device information for React Native clients
- LastUsedAt (DateTime)

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
- Type (string) // Notification type (e.g., "NoteShare", "TaskReminder")
- RelatedEntityId (int?) // Optional reference to related entity
- RelatedEntityType (string) // Entity type name

Relationships:
- User (many-to-1)
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
- GET /api/users/friends
- POST /api/users/friends/{id}/request
- PUT /api/users/friends/{id}/accept

### Notes
- GET /api/notes
- GET /api/notes/{id}
- POST /api/notes
- PUT /api/notes/{id}
- DELETE /api/notes/{id}
- POST /api/notes/{id}/share
- GET /api/notes/shared-with-me
- GET /api/notes/categories
- POST /api/notes/categories
- PUT /api/notes/categories/{id}
- DELETE /api/notes/categories/{id}

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
- POST /api/documents/{id}/extract-text

### Drawings
- POST /api/drawings
- GET /api/drawings/{id}
- PUT /api/drawings/{id}
- DELETE /api/drawings/{id}

### Folders
- GET /api/folders
- POST /api/folders
- PUT /api/folders/{id}
- DELETE /api/folders/{id}
- GET /api/folders/{id}/notes

### AI
- POST /api/ai/analyze
- POST /api/ai/summarize
- POST /api/ai/generate-questions
- POST /api/ai/answer-question

### Notifications
- GET /api/notifications
- PUT /api/notifications/{id}/read
- POST /api/devices/register

### Note Sharing
- POST /api/note-shares
- GET /api/note-shares/shared-with-me
- GET /api/note-shares/shared-by-me
- PUT /api/note-shares/{id}/permissions
- DELETE /api/note-shares/{id}

---

## 🔄 Real-time Communication

SignalR is implemented for real-time features:

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

- AIHub (Real-time AI interactions)
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
- **Caching Layer**: Redis for performance optimization and distributed caching
- **Blob Storage**: Azure Blob Storage for document uploads and image storage
- **Offline Storage Strategy**: 
  - Mobile client will maintain SQLite database for offline mode
  - Implement sync mechanism to reconcile changes when connection is restored

---

## 🧰 Additional Components
- `AuditLog` - Track user actions (login, create, edit, delete)
- `AIInteractionLog` - Save AI responses and prompts
- **JWT Authentication** - Implement token-based auth with refresh tokens
- **Background Services** - Implement for processing OCR and AI tasks asynchronously

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
- [x] Document upload and management
- [x] Drawing functionality
- [x] Folder organization system
- [x] Category-based note organization
- [x] AI integration for note analysis
- [x] Note sharing and collaboration
- [x] Real-time updates via SignalR
- [x] Mobile app integration
- [x] Push notifications
- [x] Offline support
- [x] User profile customization
- [x] Note templates
- [x] Drawing tools and effects
- [x] PDF viewer and annotation
- [x] Text element management
- [x] Image embedding and manipulation
- [x] AI selection and analysis
- [x] Screenshot capture and processing
- [x] AI response visualization
- [x] Popup management system

### 🚧 In Progress
- [ ] Advanced AI model fine-tuning
- [ ] Custom AI prompt templates
- [ ] Performance optimization
- [ ] Note version history
- [ ] Collaborative editing improvements

### 📋 Upcoming
- [ ] Testing and optimization
- [ ] Deployment and monitoring
- [ ] Mobile-specific features
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
   - `appsettings.json` dosyasındaki connection string'i güncelleyin

3. Migration'ları uygulayın:
   ```bash
   cd src/NoteWiz.Infrastructure
   dotnet ef database update --context ApplicationDbContext
   ```

4. Projeyi derleyin ve çalıştırın:
   ```bash
   cd ../NoteWiz.API
   dotnet build
   dotnet run
   ```

5. Swagger UI'a erişin:
   - Tarayıcınızda `https://localhost:5001/swagger` adresine gidin

### Önemli Notlar
- İlk çalıştırmada veritabanı otomatik olarak oluşturulacak
- JWT token'lar için `appsettings.json`'da secret key ayarlanmalı
- CORS ayarları production ortamında güncellenmeli
- Log dosyaları `Logs` klasöründe oluşturulacak

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

Use this schema to implement entity classes in ASP.NET Core with Entity Framework Core using code-first migrations.

---

## 📅 Development Progress

### 30 Nisan 2024 - Veritabanı ve API Geliştirmeleri

#### 🔄 Veritabanı Güncellemeleri
- Note tablosuna yeni alanlar eklendi:
  - `Color` (nvarchar(7)) - Not rengi, varsayılan "#FFFFFF"
  - `IsPinned` (bit) - Notun sabitlenme durumu
  - `Tags` (nvarchar(max)) - Virgülle ayrılmış etiketler listesi

- TaskItem tablosuna yeni alanlar eklendi:
  - `CompletedAt` (datetime2) - Görevin tamamlanma tarihi
  - `CreatedAt` (datetime2) - Görevin oluşturulma tarihi

- NoteShare tablosuna yeni alan eklendi:
  - `SharedAt` (datetime2) - Notun paylaşılma tarihi

- User tablosuna yeni alan eklendi:
  - `Username` (nvarchar(max)) - Kullanıcı adı

#### 🛠️ API Geliştirmeleri
- GET endpoints başarıyla çalışıyor:
  - `/api/tasks` - Kullanıcının görevlerini getirme
  - `/api/notes` - Kullanıcının notlarını getirme

- POST endpoints geliştirme aşamasında:
  - Not ekleme ve güncelleme
  - Görev ekleme ve güncelleme

#### 🔒 Güvenlik İyileştirmeleri
- Null reference type warnings düzeltildi
- Required property'ler için gerekli düzenlemeler yapıldı
- Token validasyonu güçlendirildi

#### 📊 Veritabanı İlişkileri
- Entity Framework Core ilişkileri güncellendi
- Cascade delete davranışları düzenlendi
- Foreign key kısıtlamaları eklendi

---