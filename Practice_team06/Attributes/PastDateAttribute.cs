using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Attributes;

public class PastDateAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is DateTime date && date > DateTime.Now)
        {
            return new ValidationResult(ErrorMessage ?? "Дата не може бути у майбутньому");
        }
        return ValidationResult.Success;
    }
}