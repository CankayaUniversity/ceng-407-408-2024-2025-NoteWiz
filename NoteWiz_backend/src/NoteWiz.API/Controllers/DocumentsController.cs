using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IFileService _fileService;

        public DocumentsController(IDocumentService documentService, IFileService fileService)
        {
            _documentService = documentService;
            _fileService = fileService;
        }

        /// <summary>
        /// Upload a document
        /// </summary>
        /// <param name="file">The document file to upload</param>
        /// <returns>Uploaded document details</returns>
        /// <response code="200">Returns the uploaded document details</response>
        [HttpPost("upload")]
        [ProducesResponseType(typeof(DocumentUploadDTO), 200)]
        public async Task<ActionResult<DocumentUploadDTO>> UploadDocument(IFormFile file)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            // Upload the file
            var filePath = await _fileService.UploadDocumentAsync(file);
            
            // Extract text if it's a PDF
            var extractedText = await _documentService.ExtractTextAsync(filePath);
            
            // Save document info
            var document = await _documentService.CreateDocumentAsync(new DocumentUpload
            {
                FilePath = filePath,
                ExtractedText = extractedText,
                UserId = userId,
                UploadedAt = DateTime.UtcNow
            });

            return Ok(new DocumentUploadDTO
            {
                Id = document.Id,
                FilePath = document.FilePath,
                ExtractedText = document.ExtractedText,
                UploadedAt = document.UploadedAt
            });
        }

        /// <summary>
        /// Get all documents for the current user
        /// </summary>
        /// <returns>List of documents</returns>
        /// <response code="200">Returns the list of documents</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<DocumentUploadDTO>), 200)]
        public async Task<ActionResult<IEnumerable<DocumentUploadDTO>>> GetDocuments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var documents = await _documentService.GetUserDocumentsAsync(userId);
            
            var documentDtos = documents.Select(d => new DocumentUploadDTO
            {
                Id = d.Id,
                FilePath = d.FilePath,
                ExtractedText = d.ExtractedText,
                UploadedAt = d.UploadedAt
            });

            return Ok(documentDtos);
        }

        /// <summary>
        /// Get a specific document
        /// </summary>
        /// <param name="id">Document ID</param>
        /// <returns>Document details</returns>
        /// <response code="200">Returns the document details</response>
        /// <response code="404">If the document is not found</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(DocumentUploadDTO), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<DocumentUploadDTO>> GetDocument(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var document = await _documentService.GetDocumentAsync(id, userId);
            
            if (document == null)
                return NotFound();

            return Ok(new DocumentUploadDTO
            {
                Id = document.Id,
                FilePath = document.FilePath,
                ExtractedText = document.ExtractedText,
                UploadedAt = document.UploadedAt
            });
        }

        /// <summary>
        /// Delete a document
        /// </summary>
        /// <param name="id">Document ID</param>
        /// <returns>No content</returns>
        /// <response code="204">If the document was successfully deleted</response>
        /// <response code="404">If the document is not found</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> DeleteDocument(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _documentService.DeleteDocumentAsync(id, userId);
            
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
} 