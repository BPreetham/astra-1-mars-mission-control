using Microsoft.EntityFrameworkCore;
using AstraMissionControl.Api.Models;

namespace AstraMissionControl.Api.Data
{
    public class MissionDbContext : DbContext
    {
        public MissionDbContext(DbContextOptions<MissionDbContext> options) : base(options) { }

        public DbSet<Colony> Colonies => Set<Colony>();
        public DbSet<Robot> Robots => Set<Robot>();
        public DbSet<RobotTelemetry> RobotTelemetries => Set<RobotTelemetry>();
        public DbSet<AstraSignal> AstraSignals => Set<AstraSignal>();
        public DbSet<EnergySignal> EnergySignals => Set<EnergySignal>();
        public DbSet<UndergroundStructure> UndergroundStructures => Set<UndergroundStructure>();
        public DbSet<Emergency> Emergencies => Set<Emergency>();
        public DbSet<CommunicationNode> CommunicationNodes => Set<CommunicationNode>();
        public DbSet<CommunicationRoute> CommunicationRoutes => Set<CommunicationRoute>();
        public DbSet<ResourceItem> Resources => Set<ResourceItem>();
        public DbSet<OxygenStatus> OxygenStatuses => Set<OxygenStatus>();
        public DbSet<Recommendation> Recommendations => Set<Recommendation>();
        public DbSet<RecommendationFactor> RecommendationFactors => Set<RecommendationFactor>();
        public DbSet<OperatorAction> OperatorActions => Set<OperatorAction>();
        public DbSet<MissionEvent> MissionEvents => Set<MissionEvent>();
        public DbSet<SimulationState> SimulationStates => Set<SimulationState>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Robot>()
                .HasIndex(r => r.RobotCode)
                .IsUnique();

            modelBuilder.Entity<RobotTelemetry>()
                .HasOne(t => t.Robot)
                .WithMany(r => r.TelemetryRecords)
                .HasForeignKey(t => t.RobotId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Emergency>()
                .HasOne(e => e.AssignedRobot)
                .WithMany()
                .HasForeignKey(e => e.AssignedRobotId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<CommunicationRoute>()
                .HasOne(cr => cr.SourceNode)
                .WithMany()
                .HasForeignKey(cr => cr.SourceNodeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CommunicationRoute>()
                .HasOne(cr => cr.DestinationNode)
                .WithMany()
                .HasForeignKey(cr => cr.DestinationNodeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RecommendationFactor>()
                .HasOne(rf => rf.Recommendation)
                .WithMany(r => r.Factors)
                .HasForeignKey(rf => rf.RecommendationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
