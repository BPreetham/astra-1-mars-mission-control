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
    public interface IResourceService
    {
        Task<List<ResourceItemDto>> GetResourcesAsync();
        Task<OxygenStatus> GetOxygenStatusAsync();
    }

    public class ResourceService : IResourceService
    {
        private readonly MissionDbContext _context;

        public ResourceService(MissionDbContext context)
        {
            _context = context;
        }

        public async Task<List<ResourceItemDto>> GetResourcesAsync()
        {
            var list = await _context.Resources.OrderBy(r => r.Id).ToListAsync();
            return list.Select(r => new ResourceItemDto
            {
                Id = r.Id,
                ResourceType = r.ResourceType,
                Quantity = r.Quantity,
                ConsumptionRate = r.ConsumptionRate,
                ProductionRate = r.ProductionRate,
                Status = r.Status,
                ReserveHours = r.ConsumptionRate > 0 ? Math.Round(r.Quantity / (r.ConsumptionRate / 24.0), 1) : 999.0
            }).ToList();
        }

        public async Task<OxygenStatus> GetOxygenStatusAsync()
        {
            var oxy = await _context.OxygenStatuses.OrderByDescending(o => o.Timestamp).FirstOrDefaultAsync();
            return oxy ?? new OxygenStatus();
        }
    }
}
