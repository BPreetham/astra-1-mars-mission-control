using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AstraMissionControl.Api.Models
{
    [Table("colonies")]
    public class Colony
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = "Astra-1";

        [Column("population")]
        public int Population { get; set; } = 10000;

        [Column("latitude")]
        public double Latitude { get; set; } = -4.5895;

        [Column("longitude")]
        public double Longitude { get; set; } = 137.4417;

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "CRITICAL";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("robots")]
    public class Robot
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("robot_code")]
        public string RobotCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "ONLINE"; // ONLINE, SEARCHING, OFFLINE, RETURNING, DEPLOYED

        [Column("battery")]
        public int Battery { get; set; } = 100;

        [Column("latitude")]
        public double Latitude { get; set; }

        [Column("longitude")]
        public double Longitude { get; set; }

        [MaxLength(50)]
        [Column("signal_strength")]
        public string SignalStrength { get; set; } = "STRONG";

        [MaxLength(100)]
        [Column("current_mission")]
        public string CurrentMission { get; set; } = "PATROL";

        [MaxLength(50)]
        [Column("communication_status")]
        public string CommunicationStatus { get; set; } = "CONNECTED";

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public List<RobotTelemetry> TelemetryRecords { get; set; } = new();
    }

    [Table("robot_telemetry")]
    public class RobotTelemetry
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("robot_id")]
        public int RobotId { get; set; }
        public Robot? Robot { get; set; }

        [Column("battery")]
        public int Battery { get; set; }

        [Column("latitude")]
        public double Latitude { get; set; }

        [Column("longitude")]
        public double Longitude { get; set; }

        [Column("temperature")]
        public double Temperature { get; set; } = -42.5;

        [MaxLength(50)]
        [Column("signal_strength")]
        public string SignalStrength { get; set; } = "STRONG";

        [MaxLength(100)]
        [Column("mission")]
        public string Mission { get; set; } = string.Empty;

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    [Table("astra_signals")]
    public class AstraSignal
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Column("latitude")]
        public double Latitude { get; set; }

        [Column("longitude")]
        public double Longitude { get; set; }

        [Column("signal_strength")]
        public double SignalStrength { get; set; }

        [Column("confidence")]
        public double Confidence { get; set; }

        [MaxLength(100)]
        [Column("source")]
        public string Source { get; set; } = "Sub-surface Beacon";

        [Column("notes")]
        public string Notes { get; set; } = string.Empty;
    }

    [Table("energy_signals")]
    public class EnergySignal
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Column("latitude")]
        public double Latitude { get; set; }

        [Column("longitude")]
        public double Longitude { get; set; }

        [Column("frequency")]
        public double Frequency { get; set; } = 433.92;

        [Column("strength")]
        public double Strength { get; set; }

        [MaxLength(100)]
        [Column("source_type")]
        public string SourceType { get; set; } = "Ionospheric Anomaly";
    }

    [Table("underground_structures")]
    public class UndergroundStructure
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = "Unidentified Anomaly Alpha";

        [Column("latitude")]
        public double Latitude { get; set; } = -4.712;

        [Column("longitude")]
        public double Longitude { get; set; } = 137.620;

        [Column("depth")]
        public double Depth { get; set; } = 340.0;

        [Column("energy_signature")]
        public double EnergySignature { get; set; } = 91.0;

        [Column("frequency")]
        public double Frequency { get; set; } = 432.85;

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "UNDER INVESTIGATION";

        [Column("detected_at")]
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("emergencies")]
    public class Emergency
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("type")]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("severity")]
        public string Severity { get; set; } = "CRITICAL";

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("latitude")]
        public double Latitude { get; set; }

        [Column("longitude")]
        public double Longitude { get; set; }

        [MaxLength(50)]
        [Column("location_name")]
        public string LocationName { get; set; } = "Sector B-17";

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "ACTIVE";

        [Column("assigned_robot_id")]
        public int? AssignedRobotId { get; set; }
        public Robot? AssignedRobot { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("communication_nodes")]
    public class CommunicationNode
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "ONLINE";

        [Column("signal_strength")]
        public double SignalStrength { get; set; } = 85.0;

        [Column("latency")]
        public int Latency { get; set; } = 180;

        [Column("latitude")]
        public double Latitude { get; set; }

        [Column("longitude")]
        public double Longitude { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("communication_routes")]
    public class CommunicationRoute
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "AVAILABLE";

        [Column("source_node_id")]
        public int SourceNodeId { get; set; }
        public CommunicationNode? SourceNode { get; set; }

        [Column("destination_node_id")]
        public int DestinationNodeId { get; set; }
        public CommunicationNode? DestinationNode { get; set; }

        [Column("signal_strength")]
        public double SignalStrength { get; set; } = 75.0;

        [Column("latency")]
        public int Latency { get; set; } = 210;

        [MaxLength(200)]
        [Column("hops_path")]
        public string HopsPath { get; set; } = "Colony -> Relay B -> Relay C -> R-04";

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("resources")]
    public class ResourceItem
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("resource_type")]
        public string ResourceType { get; set; } = string.Empty;

        [Column("quantity")]
        public double Quantity { get; set; }

        [Column("consumption_rate")]
        public double ConsumptionRate { get; set; }

        [Column("production_rate")]
        public double ProductionRate { get; set; }

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "NOMINAL";

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("oxygen_status")]
    public class OxygenStatus
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("production_rate")]
        public double ProductionRate { get; set; } = 71.6;

        [Column("consumption_rate")]
        public double ConsumptionRate { get; set; } = 80.0;

        [Column("reserve")]
        public double Reserve { get; set; } = 78.0;

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "DEGRADED";

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    [Table("recommendations")]
    public class Recommendation
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [MaxLength(50)]
        [Column("type")]
        public string Type { get; set; } = "RESCUE_DEPLOY";

        [MaxLength(50)]
        [Column("priority")]
        public string Priority { get; set; } = "CRITICAL";

        [Column("confidence")]
        public int Confidence { get; set; } = 82;

        [Required]
        [MaxLength(150)]
        [Column("recommended_action")]
        public string RecommendedAction { get; set; } = "DEPLOY R-04 TO SECTOR B-17";

        [MaxLength(50)]
        [Column("target")]
        public string Target { get; set; } = "R-04";

        [Column("reason")]
        public string Reason { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "PENDING";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public List<RecommendationFactor> Factors { get; set; } = new();
    }

    [Table("recommendation_factors")]
    public class RecommendationFactor
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("recommendation_id")]
        public int RecommendationId { get; set; }
        public Recommendation? Recommendation { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("factor_name")]
        public string FactorName { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("factor_value")]
        public string FactorValue { get; set; } = string.Empty;

        [Column("weight")]
        public int Weight { get; set; }

        [Column("contribution")]
        public int Contribution { get; set; }

        [Column("description")]
        public string Description { get; set; } = string.Empty;
    }

    [Table("operator_actions")]
    public class OperatorAction
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [MaxLength(100)]
        [Column("operator_name")]
        public string OperatorName { get; set; } = "COMMANDER";

        [Required]
        [MaxLength(50)]
        [Column("action_type")]
        public string ActionType { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("target_type")]
        public string TargetType { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("target_id")]
        public string TargetId { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("result")]
        public string Result { get; set; } = "SUCCESS";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("mission_events")]
    public class MissionEvent
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [MaxLength(50)]
        [Column("event_type")]
        public string EventType { get; set; } = "STATUS_UPDATE";

        [MaxLength(50)]
        [Column("severity")]
        public string Severity { get; set; } = "INFO";

        [Required]
        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    [Table("simulation_state")]
    public class SimulationState
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [MaxLength(100)]
        [Column("scenario")]
        public string Scenario { get; set; } = "CRISIS_ASTRA_ENERGY_STORM";

        [Column("current_stage")]
        public int CurrentStage { get; set; } = 1;

        [MaxLength(100)]
        [Column("stage_title")]
        public string StageTitle { get; set; } = "ENERGY STORM DETECTED";

        [Column("is_running")]
        public bool IsRunning { get; set; } = false;

        [Column("recovery_seconds_remaining")]
        public int RecoverySecondsRemaining { get; set; } = 20538;

        [Column("started_at")]
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
