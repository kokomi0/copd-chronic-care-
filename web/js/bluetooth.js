// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 智能医疗硬件蓝牙仿真直连同步模块 (Bluetooth BLE)
// ==============================================================================
(function (global) {
  'use strict';

  class BluetoothSimulator {
    constructor() {
      this.connectedDevice = null;
      this.isStreaming = false;
      this.streamInterval = null;
      this.onDataCallback = null;
    }

    // 扫描并配对蓝牙外设
    async connect(deviceType = 'oximeter') {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.connectedDevice = {
            type: deviceType,
            name: deviceType === 'oximeter' ? 'RespiPulse-BLE-SpO2' : 'RespiFlow-BLE-Spirometer',
            mac: 'BLE:C4:7D:E4:91:2A:01',
            battery: 92
          };
          resolve(this.connectedDevice);
        }, 800);
      });
    }

    disconnect() {
      if (this.streamInterval) clearInterval(this.streamInterval);
      this.connectedDevice = null;
      this.isStreaming = false;
    }

    startTelemetry(callback) {
      this.onDataCallback = callback;
      this.isStreaming = true;

      let counter = 0;
      this.streamInterval = setInterval(() => {
        counter++;
        if (this.connectedDevice && this.connectedDevice.type === 'oximeter') {
          // 模拟微变血氧与脉搏
          const spo2 = 95 + (counter % 3 === 0 ? 1 : 0);
          const pr = 74 + Math.floor(Math.sin(counter) * 3);
          if (this.onDataCallback) {
            this.onDataCallback({
              device: this.connectedDevice.name,
              spo2: spo2,
              pulse_rate: pr,
              status: spo2 >= 93 ? '正常' : '低氧警告',
              timestamp: new Date().toLocaleTimeString()
            });
          }
        } else {
          // 肺功能仪用力呼气流速
          const fev1 = 1.48;
          const fvc = 2.75;
          const pef = 290.0;
          if (this.onDataCallback) {
            this.onDataCallback({
              device: this.connectedDevice.name,
              fev1_l: fev1,
              fvc_l: fvc,
              ratio: Math.round((fev1 / fvc) * 100),
              pef_l_min: pef,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        }
      }, 1000);
    }
  }

  global.BluetoothService = new BluetoothSimulator();
})(window);
