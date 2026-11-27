using SignalAnalysisService service) => _service = service;

        [HttpGet("energy")]
        public async Task<IActionResult> GetEnergySignals() => Ok(await _service.GetEnergySignalsAsync());

        }

        [HttpPost("{id:int}/prioritize")]
        public async Task<IActionResult> Prioritize(int id, [FromBody] PrioritizeEmergencyRequest req)
        {
            var res = await _service.PrioritizeEmergencyAsync(id, req);
            return res.Success ? Ok(res) : BadRequest(res);
        }DER")
        {
            var res = await _service.ActivateRouteAsync(id, op ?? "COMMANDER");
            return res.Success ? Ok(res) : BadRequest(res);
        }
    }
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
        p
}
