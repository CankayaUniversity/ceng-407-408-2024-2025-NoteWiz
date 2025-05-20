using AutoMapper;
using NoteWiz.Core.Entities;
using NoteWiz.Core.DTOs;
using NoteUpdateDTO = NoteWiz.API.DTOs.NoteUpdateDTO;

namespace NoteWiz.API.Mapping
{
    public class NoteProfile : Profile
    {
        public NoteProfile()
        {
            // Note -> NoteResponseDTO mapping
            CreateMap<Note, NoteResponseDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.IsPrivate, opt => opt.MapFrom(src => src.IsPrivate))
                .ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
                .ForMember(dest => dest.CoverImage, opt => opt.MapFrom(src => src.CoverImageUrl))
                .ForMember(dest => dest.IsPinned, opt => opt.MapFrom(src => src.IsPinned))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.Tags))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.IsSynced, opt => opt.MapFrom(src => src.IsSynced))
                .ForMember(dest => dest.LastSyncedAt, opt => opt.MapFrom(src => src.LastSyncedAt))
                .ForMember(dest => dest.IsOffline, opt => opt.MapFrom(src => src.IsOffline))
                .ForMember(dest => dest.SyncStatus, opt => opt.MapFrom(src => src.SyncStatus))
                .ForMember(dest => dest.LastModifiedAt, opt => opt.MapFrom(src => src.LastModifiedAt))
                .ForMember(dest => dest.DocumentId, opt => opt.MapFrom(src => src.DocumentId));

            // NoteUpdateDTO -> Note mapping
            CreateMap<NoteUpdateDTO, Note>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.IsPrivate, opt => opt.MapFrom(src => src.IsPrivate))
                .ForMember(dest => dest.CoverImageUrl, opt => opt.MapFrom(src => src.CoverImage))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.LastModifiedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
} 