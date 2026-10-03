using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AstraMissionControl.Api.Data;
using AstraMissionControl.Api.DTOs;
using AstraMissionControl.Api.Models;

namespace AstraMissionControl.Api.Services
{
    public interface IAstraService
    {
        Task<AstraStatusDto> GetStatusAsync();
        Task<List<AstraSignalDto>> GetSignalsAsync();
        Task<object> GetLocationAsync();
    }

    public class AstraService : IAstraService
    {
        private readonly MissionDbContext _context;

        public AstraService(MissionDbContext context)
        {
            _context = context;
        }

        public async Task<AstraStatusDto> GetStatusAsync()
        {
            var simState = await _context.SimulationStates.FirstOrDefaultAsync();
            var latestSignal = await _context.AstraSignals
                .OrderByDescending(s => s.Timestamp)
                .FirstOrDefaultAsync();

            int secondsRemaining = simState?.RecoverySecondsRemaining ?? 20538;
            var ts = TimeSpan.FromSeconds(Math.Max(0, secondsRemaining));
            string formattedCountdown = $"{ts.Hours:D2}:{ts.Minutes:D2}:{ts.Seconds:D2}";

            return new AstraStatusDto
            {
                Status = "CRITICAL",
                LastKnownLocation = "Sector B-17",
                Latitude = latestSignal?.Latitude ?? -4.685,
                Longitude = latestSignal?.Longitude ?? 137.575,
                LastSignalTimestamp = latestSignal?.Timestamp ?? DateTime.UtcNow.AddMinutes(-8),
                SignalStrength = latestSignal?.SignalStrength ?? 88.0,
                Confidence = latestSignal?.Confidence ?? 82.0,
                DistanceFromColonyKm = 4.8,
                RecoverySecondsRemaining = secondsRemaining,
                RecoveryCountdown = formattedCountdown,
                SearchStatus = secondsRemaining > 0 ? "TARGET LOCK PENDING DEPLOYMENT" : "RECOVERY WINDOW EXPIRED"
            };
        }

        public async Task<List<AstraSignalDto>> GetSignalsAsync()
        {
            return await _context.AstraSignals
                .OrderBy(s => s.Timestamp)
                .Select(s => new AstraSignalDto
                {
                    Id = s.Id,
                    Timestamp = s.Timestamp,
                    Latitude = s.Latitude,
                    Longitude = s.Longitude,
                    SignalStrength = s.SignalStrength,
                    Confidence = s.Confidence,
                    Source = s.Source,
                    Notes = s.Notes
                })
                .ToListAsync();
        }

        public async Task<object> GetLocationAsync()
        {
            var status = await GetStatusAsync();
            return new
            {
                status.LastKnownLocation,
                status.Latitude,
                status.Longitude,
                status.DistanceFromColonyKm,
                Coordinates = $"{status.Latitude:F4}° S, {status.Longitude:F4}° E",
                Sector = "B-17 (Hellas Planitia Rim)",
                LastUpdated = status.LastSignalTimestamp
            };
        }
    }
}
