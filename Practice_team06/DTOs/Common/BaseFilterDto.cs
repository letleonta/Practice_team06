using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Common;

public abstract class BaseFilterDto 
{
    [Range(1, int.MaxValue, ErrorMessage = "Номер сторінки має бути не менше 1")]
    public int? Page { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Розмір сторінки має бути від 1 до 100")]
    public int? PageSize { get; set; } = 10;
}