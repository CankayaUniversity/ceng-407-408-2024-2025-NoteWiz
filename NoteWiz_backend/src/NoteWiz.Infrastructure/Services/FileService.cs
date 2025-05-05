using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly string _uploadDirectory;

        public FileService(IConfiguration configuration)
        {
            _uploadDirectory = configuration.GetValue<string>("FileStorage:UploadDirectory") 
                ?? Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            
            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }
        }

        public async Task<string> UploadFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty");
            }

            // Güvenli dosya adı oluştur
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(_uploadDirectory, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Dosyanın URL'ini döndür
            return fileName;
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
            {
                return;
            }

            var filePath = Path.Combine(_uploadDirectory, Path.GetFileName(fileUrl));
            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
            }
        }

        public async Task<byte[]> GetFileAsync(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
            {
                throw new ArgumentException("File URL is empty");
            }

            var filePath = Path.Combine(_uploadDirectory, Path.GetFileName(fileUrl));
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException("File not found", filePath);
            }

            return await File.ReadAllBytesAsync(filePath);
        }
    }
} 