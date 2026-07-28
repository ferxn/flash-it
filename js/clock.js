// High-Precision Clock Utility
const HighResClock = {
  now() {
    return performance.now();
  },

  // แปลงเวลากลับเป็นจุด Time String ที่อ่านง่าย
  getTimestamp() {
    return new Date().toISOString().split('T')[1].slice(0, -1);
  },

  // สั่ง Trigger งานแม่นยำระดับ Microsecond ล่วงหน้า
  scheduleExact(targetTimeMs, offsetMs, callback) {
    const actualTime = targetTimeMs - offsetMs;
    const delay = actualTime - this.now();

    if (delay <= 0) {
      console.warn(`[CLOCK JITTER] Execution passed target by ${Math.abs(delay).toFixed(2)}ms`);
      return false;
    }

    setTimeout(() => {
      callback();
    }, delay);

    return true;
  }
};