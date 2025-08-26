using System;

namespace EvPeti.API.Models
{
    public class DataResult<T>
    {
        public T Data { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }

        public DataResult()
        {
        }

        public DataResult(T data, bool success, string message)
        {
            Data = data;
            Success = success;
            Message = message;
        }
    }

    public class SuccessDataResult<T> : DataResult<T>
    {
        public SuccessDataResult(T data) : base(data, true, "İşlem başarılı")
        {
        }

        public SuccessDataResult(T data, string message) : base(data, true, message)
        {
        }
    }

    public class ErrorDataResult<T> : DataResult<T>
    {
        public ErrorDataResult(T data, string message) : base(data, false, message)
        {
        }
    }
}
