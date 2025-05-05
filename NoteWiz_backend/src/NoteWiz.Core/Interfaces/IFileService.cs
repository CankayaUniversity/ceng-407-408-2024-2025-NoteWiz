using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.IO;
using System;

namespace NoteWiz.Core.Interfaces
{
    public interface IFileService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<string> UploadDocumentAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string imageUrl);
        Task<bool> DeleteDocumentAsync(string filePath);
    }

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

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty");
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(_uploadDirectory, "images", fileName);

            Directory.CreateDirectory(Path.GetDirectoryName(filePath));
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return fileName;
        }

        public async Task<string> UploadDocumentAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty");
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(_uploadDirectory, "documents", fileName);

            Directory.CreateDirectory(Path.GetDirectoryName(filePath));
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return fileName;
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
            {
                return false;
            }

            var filePath = Path.Combine(_uploadDirectory, "images", Path.GetFileName(imageUrl));
            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteDocumentAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
            {
                return false;
            }

            var fullPath = Path.Combine(_uploadDirectory, "documents", Path.GetFileName(filePath));
            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
                return true;
            }
            return false;
        }
    }
} 