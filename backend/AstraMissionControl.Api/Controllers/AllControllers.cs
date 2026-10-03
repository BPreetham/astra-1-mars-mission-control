using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AstraMissionControl.Api.DTOs;
using AstraMissionControl.Api.Services;

namespace AstraMissionControl.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;
        public DashboardController(IDashboardService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var summary = await _service.GetDashboardSummaryAsync();
            return Ok(summary);
        }
    }

    [ApiController]
    [Route("api/robots")]
    public class RobotController : ControllerBase
    {
        private readonly IRobotService _service;
        public RobotController(IRobotService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllRobotsAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var robot = await _service.GetRobotByIdAsync(id);
            return robot != null ? Ok(robot) : NotFound(new { message = $"Robot {id} not found." });
        }

        [HttpPost("{id:int}/deploy")]
        public async Task<IActionResult> Deploy(int id, [FromBody] DeployRobotRequest req)
        {
            var res = await _service.DeployRobotAsync(id, req);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        [HttpPost("{id:int}/return")]
        public async Task<IActionResult> Return(int id, [FromQuery] string? op = "COMMANDER")
        {
            var res = await _service.ReturnRobotAsync(id, op ?? "COMMANDER");
            return res.Success ? Ok(res) : BadRequest(res);
        }

        [HttpPost("{id:int}/mission")]
        public async Task<IActionResult> ChangeMission(int id, [FromBody] ChangeMissionRequest req)
        {
            var res = await _service.ChangeMissionAsync(id, req);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        [HttpGet("{id:int}/telemetry")]
        public async Task<IActionResult> GetTelemetry(int id) => Ok(await _service.GetRobotTelemetryAsync(id));
    }

    [ApiController]
    [Route("api/astra")]
    public class AstraController : ControllerBase
    {
        private readonly IAstraService _service;
        public AstraController(IAstraService service) => _service = service;

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus() => Ok(await _service.GetStatusAsync());

        [HttpGet("signals")]
        public async Task<IActionResult> GetSignals() => Ok(await _service.GetSignalsAsync());

        [HttpGet("location")]
        public async Task<IActionResult> GetLocation() => Ok(await _service.GetLocationAsync());
    }

    [ApiController]
    [Route("api/signals")]
    public class SignalController : ControllerBase
    {
        private readonly ISignalAnalysisService _service;
        public SignalController(ISignalAnalysisService service) => _service = service;

        [HttpGet("energy")]
        public async Task<IActionResult> GetEnergySignals() => Ok(await _service.GetEnergySignalsAsync());

        [HttpGet("structure")]
        public async Task<IActionResult> GetStructure()
        {
            var s = await _service.GetUndergroundStructureAsync();
            return s != null ? Ok(s) : NotFound();
        }
    }

    [ApiController]
    [Route("api/emergencies")]
    public class EmergencyController : ControllerBase
    {
        private readonly IEmergencyService _service;
        public EmergencyController(IEmergencyService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllEmergenciesAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var em = await _service.GetEmergencyByIdAsync(id);
            return em != null ? Ok(em) : NotFound();
        }

        [HttpPost("{id:int}/prioritize")]
        public async Task<IActionResult> Prioritize(int id, [FromBody] PrioritizeEmergencyRequest req)
        {
            var res = await _service.PrioritizeEmergencyAsync(id, req);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        [HttpPost("{id:int}/assign")]
        public async Task<IActionResult> Assign(int id, [FromBody] AssignEmergencyRequest req)
        {
            var res = await _service.AssignRobotAsync(id, req);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        [HttpPost("{id:int}/resolve")]
        public async Task<IActionResult> Resolve(int id, [FromQuery] string? op = "COMMANDER")
        {
            var res = await _service.ResolveEmergencyAsync(id, op ?? "COMMANDER");
            return res.Success ? Ok(res) : BadRequest(res);
        }
    }

    [ApiController]
    [Route("api/communications")]
    public class CommunicationController : ControllerBase
    {
        private readonly ICommunicationService _service;
        public CommunicationController(ICommunicationService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetNodes() => Ok(await _service.GetNodesAsync());

        [HttpGet("routes")]
        public async Task<IActionResult> GetRoutes() => Ok(await _service.GetRoutesAsync());

        [HttpPost("routes/{id:int}/activate")]
        public async Task<IActionResult> ActivateRoute(int id, [FromQuery] string? op = "COMMANDER")
        {
            var res = await _service.ActivateRouteAsync(id, op ?? "COMMANDER");
            return res.Success ? Ok(res) : BadRequest(res);
        }
    }

    [ApiController]
    [Route("api/resources")]
    public class ResourceController : ControllerBase
    {
        private readonly IResourceService _service;
        public ResourceController(IResourceService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetResources() => Ok(await _service.GetResourcesAsync());
    }

    [ApiController]
    [Route("api/oxygen")]
    public class OxygenController : ControllerBase
    {
        private readonly IResourceService _service;
        public OxygenController(IResourceService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetOxygen() => Ok(await _service.GetOxygenStatusAsync());
    }

    [ApiController]
    [Route("api/recommendations")]
    public class RecommendationController : ControllerBase
    {
        private readonly IRecommendationService _service;
        public RecommendationController(IRecommendationService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetActive()
        {
            var rec = await _service.GetActiveRecommendationAsync();
            return rec != null ? Ok(rec) : NotFound();
        }

        [HttpPost("evaluate")]
        public async Task<IActionResult> Evaluate() => Ok(await _service.EvaluateAndGenerateRecommendationAsync());

        [HttpPost("{id:int}/accept")]
        public async Task<IActionResult> Accept(int id, [FromQuery] string? op = "COMMANDER")
        {
            var res = await _service.AcceptRecommendationAsync(id, op ?? "COMMANDER");
            return res.Success ? Ok(res) : BadRequest(res);
        }
    }

    [ApiController]
    [Route("api/simulation")]
    public class SimulationController : ControllerBase
    {
        private readonly ISimulationService _service;
        public SimulationController(ISimulationService service) => _service = service;

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus() => Ok(await _service.GetStatusAsync());

        [HttpPost("start")]
        public async Task<IActionResult> Start() => Ok(await _service.StartSimulationAsync());

        [HttpPost("step")]
        public async Task<IActionResult> Step() => Ok(await _service.StepSimulationAsync());

        [HttpPost("reset")]
        public async Task<IActionResult> Reset() => Ok(await _service.ResetSimulationAsync());
    }

    [ApiController]
    [Route("api/mission-events")]
    public class MissionEventController : ControllerBase
    {
        private readonly IMissionEventService _service;
        public MissionEventController(IMissionEventService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetEvents([FromQuery] int limit = 30) => Ok(await _service.GetRecentEventsAsync(limit));
    }
}
