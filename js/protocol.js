// js/protocol.js
class StudioProtocol {
  constructor(channelName = 'studio_sync_bus') {
    this.bus = new BroadcastChannel(channelName);
  }

  broadcastBurstCommand(count, interval, leadTime = 300) {
    const startMasterTime = HighResClock.now() + leadTime;
    const payload = {
      type: 'BURST_COMMAND',
      startTime: startMasterTime,
      count: parseInt(count),
      interval: parseInt(interval)
    };
    this.bus.postMessage(payload);
    return payload;
  }

  onMessage(handler) {
    this.bus.onmessage = (event) => handler(event.data);
  }
}