using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AstraMissionControl.Api.Data;
using AstraMissionControl.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Database Context
var connectionString = builder.Configuration.GetConnectionString("PostgresConnection") 
    ?? "Host=localhost;Port=5432;Database=astra_mission_db;Username=postgres;";

builder.Services.AddDbContext<MissionDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register Application Services
builder.Services.AddScoped<IMissionEventService, MissionEventService>();
builder.Services.AddScoped<IRobotService, RobotService>();
builder.Services.AddScoped<IAstraService, AstraService>();
builder.Services.AddScoped<ISignalAnalysisService, SignalAnalysisService>();
builder.Services.AddScoped<IEmergencyService, EmergencyService>();
builder.Services.AddScoped<ICommunicationService, CommunicationService>();
builder.Services.AddScoped<IResourceService, ResourceService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<ISimulationService, SimulationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// CORS for Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-migrate and seed database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MissionDbContext>();
    DbSeeder.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run("http://localhost:5000");
