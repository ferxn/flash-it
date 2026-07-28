// App Initialization
const network = new StudioProtocol();
let currentRole = 'main';

// DOM Elements
const logBox = document.getElementById('log-box');
const flashOverlay = document.getElementById('flash-overlay');

function sysLog(msg) {
  const logLine = `[${HighResClock.getTimestamp()}] ${msg}<br>`;
  logBox.innerHTML += logLine;
  logBox.scrollTop = logBox.scrollHeight;
}

// 1. Role Switching
document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    e.target.classList.add('active');
    currentRole = e.target.dataset.role;
    document.getElementById(`panel-${currentRole}`).classList.add('active');

    sysLog(`Switched Role -> ${currentRole.toUpperCase()}`);
  });
});

// 2. Slider Value Updates
document.getElementById('cam-offset').addEventListener('input', (e) => {
  document.getElementById('cam-val').textContent = e.target.value;
});

document.getElementById('flash-offset').addEventListener('input', (e) => {
  document.getElementById('flash-val').textContent = e.target.value;
});

// 3. Main Fire Handler
document.getElementById('btn-fire').addEventListener('click', () => {
  if (currentRole !== 'main') return;

  const count = document.getElementById('burst-count').value;
  const interval = document.getElementById('burst-interval').value;

  const cmd = network.broadcastBurstCommand(count, interval, 300);
  sysLog(`[MAIN] Broadcast Burst: $N=${cmd.count}$, Interval=${cmd.interval}ms`);
});

// 4. Node Receiver Dispatcher
network.onMessage((data) => {
  if (data.type !== 'BURST_COMMAND') return;

  sysLog(`[${currentRole.toUpperCase()}] Command Received ($N=${data.count}$)`);

  const offset = currentRole === 'camera' 
    ? parseInt(document.getElementById('cam-offset').value)
    : parseInt(document.getElementById('flash-offset').value);

  // Batch Execution Schedule
  for (let i = 0; i < data.count; i++) {
    const targetTime = data.startTime + (i * data.interval);

    HighResClock.scheduleExact(targetTime, offset, () => {
      triggerHardwareAction(i + 1, targetTime);
    });
  }
});

// 5. Hardware Actions
function triggerHardwareAction(round, targetTime) {
  if (currentRole === 'camera') {
    sysLog(`📸 [CAM] Shutter Tripped #${round} (Target: ${targetTime.toFixed(0)}ms)`);
  } 
  else if (currentRole === 'flash') {
    sysLog(`⚡ [FLASH] Strobe Fired #${round} (Target: ${targetTime.toFixed(0)}ms)`);
    
    // Visual Screen Flash
    flashOverlay.style.opacity = '1';
    setTimeout(() => { flashOverlay.style.opacity = '0'; }, 120);
  }
}

// Default Log
sysLog('Studio Sync Rig Initialized Engine.');