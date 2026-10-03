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
    public interface ISignalAnalysisService
    {
        Task<List<EnergySignal>> GetEnergySignalsAsync();
        Task<UndergroundStructureDto?> GetUndergroundStructureAsync();
    }

    public class SignalAnalysisService : ISignalAnalysisService
    {
        private readonly MissionDbContext _context;

        public SignalAnalysisService(MissionDbContext context)
        {
            _context = context;
        }

        public async Task<List<EnergySignal>> GetEnergySignalsAsync()
        {
            return await _context.EnergySignals
                .OrderByDescending(s => s.Timestamp)
                .Take(25)
                .ToListAsync();
        }

        public async Task<UndergroundStructureDto?> GetUndergroundStructureAsync()
        {
            var st = await _context.UndergroundStructures.FirstOrDefaultAsync();
            if (st == null) return null;

            var astraLatest = await _context.AstraSignals
                .OrderByDescending(s => s.Timestamp)
                .FirstOrDefaultAsync();

            return new UndergroundStructureDto
            {
                Id = st.Id,
                Name = st.Name,
                Latitude = st.Latitude,
                Longitude = st.Longitude,
                Depth = st.Depth,
                EnergySignature = st.EnergySignature,
                Frequency = st.Frequency,
                Status = st.Status,
                DetectedAt = st.DetectedAt,
                AstraSignalComparison = astraLatest?.SignalStrength ?? 88.0,
                DistanceFromAstraKm = 1.4
            };
        }
    }
}
