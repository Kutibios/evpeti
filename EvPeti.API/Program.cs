using EvPeti.API.Data;
using EvPeti.API.Services;
using EvPeti.API.Services.DL;
using EvPeti.API.Services.Managers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS ekle
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// DbContext'i ekle
builder.Services.AddDbContext<EvPetiDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// DL Services
builder.Services.AddScoped<IPetDLService, PetDLService>();
builder.Services.AddScoped<IListingDLService, ListingDLService>();

// Business Services
builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Managers
builder.Services.AddScoped<IDLServiceManager, DLServiceManager>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS'u en başta etkinleştir
app.UseCors("AllowAll");

// Static files middleware - wwwroot klasöründen dosya servis et
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
