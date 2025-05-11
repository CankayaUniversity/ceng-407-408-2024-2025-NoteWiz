1. Task Reminder Eklendi
Reminder butonu ve tarih/saat seçici TaskDetailScreen’e tekrar eklendi.
Reminder ile ilgili state’ler (hasReminder, reminderDate, showReminderPicker) ve UI kodu geri getirildi.
Kullanıcı reminder’ı açıp tarih/saat seçebiliyor.
2. Kayıt (Task Ekleme/Güncelleme) Hataları
Kayıt sırasında reminder ile ilgili tanımsız değişken hatası giderildi.
Reminder bilgisi artık task kaydederken backend’e gönderiliyor.
Kayıt sonrası NotificationService ile hatırlatıcı kuruluyor veya iptal ediliyor.
3. Tip ve API Uyumları
TasksContext’teki addTask ve updateTask fonksiyonları, reminder bilgisini de backend’e gönderiyor.
addTask artık yeni task objesini döndürüyor.
NotificationService’e reminder, priority, completed ve id alanları doğru şekilde iletiliyor.
id tip uyuşmazlığı ve eksik alanlar (priority, completed) hataları düzeltildi.
