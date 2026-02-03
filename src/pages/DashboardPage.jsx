import { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue } from "firebase/database";
import SkeletonLoader from '../components/SkeletonLoader';
import SensorCard from '../components/SensorCard';
import GaugeChart from '../components/GaugeChart';
import AnimatedValue from '../components/AnimatedValue';
import ParticlesBackground from '../components/ParticlesBackground';
import { useToast } from '../components/ToastContainer';
import { Flame, Cloud, Shield, Cpu } from 'lucide-react';

function DashboardPage() {
  // State for all sensor categories
  const [sensorData, setSensorData] = useState({
    gas_smoke: {
      gas_value: null,
      smoke_detected: false,
      status: 'normal'
    },
    environment: {
      light_intensity: null,
      is_raining: false,
      is_dark: false
    },
    security: {
      sensors: {
        front_door: { detected: false, label: 'Front Door' },
        back_door: { detected: false, label: 'Back Door' },
        garage: { detected: false, label: 'Garage' }
      }
    },
    system: {
      voltage: null,
      esp32_uptime_sec: null,
      is_connected: false,
      last_update: null
    }
  });

  const [isESP32Connected, setIsESP32Connected] = useState(false);
  const lastUpdateTimeRef = useRef(null);
  const lastUpdateCheckRef = useRef(Date.now());

  const [loading, setLoading] = useState(true);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { showError, showWarning } = useToast();
  
  // Track previous values for alert detection
  const prevDataRef = useRef(null);

  // Mock logs data
  const mockLogs = [
    { id: 1, date: '2026-02-03', powerUsage: 45.2, units: 12.5, events: ['Security Alert: Front Door'] },
    { id: 2, date: '2026-02-02', powerUsage: 38.7, units: 10.8, events: [] },
    { id: 3, date: '2026-02-01', powerUsage: 42.1, units: 11.7, events: ['Gas Alert: High Level Detected'] },
    { id: 4, date: '2026-01-31', powerUsage: 36.5, units: 10.1, events: [] },
    { id: 5, date: '2026-01-30', powerUsage: 41.8, units: 11.6, events: ['Security Alert: Back Door', 'Low Voltage Warning'] },
    { id: 6, date: '2026-01-29', powerUsage: 39.2, units: 10.9, events: [] },
    { id: 7, date: '2026-01-28', powerUsage: 44.6, units: 12.4, events: [] },
    { id: 8, date: '2026-01-27', powerUsage: 37.9, units: 10.5, events: ['Gas Alert: Warning Level'] },
    { id: 9, date: '2026-01-26', powerUsage: 40.3, units: 11.2, events: [] },
    { id: 10, date: '2026-01-25', powerUsage: 43.7, units: 12.1, events: ['Security Alert: Garage'] },
  ];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(mockLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = mockLogs.slice(startIndex, endIndex);

  useEffect(() => {
    // Subscribe to all sensor paths using onValue for real-time updates
    const sensorsRef = ref(db, 'smart_home/sensors');
    
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newData = {
          gas_smoke: data.gas_smoke || prevDataRef.current?.gas_smoke || sensorData.gas_smoke,
          environment: data.environment || prevDataRef.current?.environment || sensorData.environment,
          security: data.security || prevDataRef.current?.security || sensorData.security,
          system: data.system || prevDataRef.current?.system || sensorData.system
        };
        
        // ตรวจสอบการเชื่อมต่อ ESP32
        // ใช้วิธีเช็คว่า last_update เปลี่ยนแปลงหรือไม่
        const lastUpdate = newData.system.last_update || 0;
        
        // ถ้า last_update เปลี่ยน = ESP32 ยังส่งข้อมูลอยู่
        if (lastUpdate !== lastUpdateTimeRef.current && lastUpdate > 0) {
          lastUpdateTimeRef.current = lastUpdate;
          lastUpdateCheckRef.current = Date.now();
          setIsESP32Connected(true);
        }
        
        console.log('Connection Check:', {
          lastUpdate,
          lastUpdateTimeRef: lastUpdateTimeRef.current,
          is_connected: newData.system.is_connected,
          isESP32Connected
        });
        
        // ถ้า disconnect ให้รีเซ็ต uptime
        if (!isESP32Connected && newData.system.esp32_uptime_sec !== null && newData.system.esp32_uptime_sec > 0) {
          newData.system.esp32_uptime_sec = 0;
        }
        
        // Trigger pulse animation on data update
        setDataUpdated(true);
        setTimeout(() => setDataUpdated(false), 1000);
        
        // Check for alerts (only if we have previous data to compare)
        if (prevDataRef.current) {
          // Gas danger alert
          if (newData.gas_smoke.status === 'danger' && prevDataRef.current.gas_smoke.status !== 'danger') {
            showError('⚠️ Dangerous gas levels detected!');
          }
          
          // Voltage alert
          if (newData.system.voltage !== null && newData.system.voltage < 3.0 && 
              (prevDataRef.current.system.voltage === null || prevDataRef.current.system.voltage >= 3.0)) {
            showWarning('⚡ Low voltage detected!');
          }
          
          // Smoke detection alert
          if (newData.gas_smoke.smoke_detected && !prevDataRef.current.gas_smoke.smoke_detected) {
            showError('🔥 Smoke detected!');
          }
          
          // Security sensor alerts
          Object.entries(newData.security.sensors).forEach(([key, sensor]) => {
            const prevSensor = prevDataRef.current.security.sensors[key];
            if (sensor.detected && prevSensor && !prevSensor.detected) {
              showWarning(`🚨 ${sensor.label} - Intrusion detected!`);
            }
          });
          
          // ESP32 Disconnection alert
          if (!isESP32Connected && prevDataRef.current.system.is_connected) {
            showWarning('⚠️ ESP32 disconnected!');
          }
        }
        
        setSensorData(newData);
        prevDataRef.current = newData;
      }
      setLoading(false);
    }, (error) => {
      console.error('Error reading sensor data:', error);
      setLoading(false);
    });

    // ตรวจสอบว่า ESP32 หยุดส่งข้อมูลหรือไม่ (ทุก 3 วินาที)
    const connectionCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateCheckRef.current;
      
      // ถ้าไม่มีการอัพเดทมานานกว่า 10 วินาที
      if (isESP32Connected && timeSinceLastUpdate > 10000) {
        console.log('ESP32 Disconnected - No updates for', timeSinceLastUpdate, 'ms');
        setIsESP32Connected(false);
        showWarning('⚠️ ESP32 disconnected!');
        
        // รีเซ็ต uptime
        setSensorData(prev => ({
          ...prev,
          system: {
            ...prev.system,
            esp32_uptime_sec: 0
          }
        }));
      }
    }, 3000);

    // Cleanup function
    return () => {
      unsubscribe();
      clearInterval(connectionCheckInterval);
    };
  }, [showError, showWarning, isESP32Connected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-cyan-400">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <SkeletonLoader variant="card" count={4} />
        </div>
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-slate-400">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Particles Background */}
      <ParticlesBackground density="low" color="#06b6d4" opacity={0.3} />
      
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-cyan-400">Dashboard</h1>
        
        {/* Main Gauges Row - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Gas Gauge - Large */}
          <SensorCard 
            title="Gas Detection" 
            icon={<Flame size={28} />}
            alert={sensorData.gas_smoke.smoke_detected || sensorData.gas_smoke.status === 'danger'}
            className="lg:min-h-[400px]"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 py-4">
              {/* Large Gas Gauge */}
              <GaugeChart
                value={sensorData.gas_smoke.gas_value || 0}
                min={0}
                max={1000}
                unit="PPM"
                label="Gas Level"
                warningThreshold={300}
                dangerThreshold={500}
                size="xl"
                animated={true}
              />

              {/* Status Info */}
              <div className="text-center space-y-3">
                <div>
                  <p className="text-slate-500 text-xs sm:text-sm mb-2">Smoke Detection</p>
                  <div className={`text-xl sm:text-2xl font-bold ${sensorData.gas_smoke.smoke_detected ? 'text-red-500' : 'text-green-400'}`}>
                    {sensorData.gas_smoke.smoke_detected ? '⚠️ Detected' : '✓ Normal'}
                  </div>
                </div>

                <div className={`inline-block px-4 py-2 rounded-full text-sm sm:text-base font-semibold ${
                  sensorData.gas_smoke.status === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                  sensorData.gas_smoke.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                  'bg-green-500/20 text-green-400 border border-green-500/50'
                }`}>
                  {sensorData.gas_smoke.status === 'danger' ? 'Danger' :
                   sensorData.gas_smoke.status === 'warning' ? 'Warning' : 'Normal'}
                </div>
              </div>
            </div>
          </SensorCard>

          {/* Home Power Gauge - Large */}
          <SensorCard 
            title="Home Power Consumption" 
            icon={<Cpu size={28} />}
            alert={sensorData.system.voltage !== null && sensorData.system.voltage < 3.0}
            className="lg:min-h-[400px]"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 py-4">
              {/* Large Voltage Gauge */}
              <GaugeChart
                value={sensorData.system.voltage || 0}
                min={0}
                max={5}
                unit="V"
                label="Voltage"
                warningThreshold={3.3}
                dangerThreshold={3.0}
                size="xl"
                animated={true}
              />

              {/* Power Calculation Info */}
              <div className="text-center space-y-3">
                <div>
                  <p className="text-slate-500 text-xs sm:text-sm mb-2">Estimated Power</p>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">
                    {sensorData.system.voltage !== null ? (
                      <>
                        <AnimatedValue value={sensorData.system.voltage * 10} decimals={1} />
                        <span className="text-lg sm:text-xl ml-2 text-slate-500">W</span>
                      </>
                    ) : '--'}
                  </div>
                </div>

                <div className={`inline-block px-4 py-2 rounded-full text-sm sm:text-base font-semibold ${
                  sensorData.system.voltage !== null && sensorData.system.voltage < 3.0 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                    : 'bg-green-500/20 text-green-400 border border-green-500/50'
                }`}>
                  {sensorData.system.voltage !== null && sensorData.system.voltage < 3.0 ? 'Low Voltage' : 'Normal'}
                </div>
              </div>
            </div>
          </SensorCard>

        </div>

        {/* Secondary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Environment Monitoring Section */}
          <SensorCard 
            title="Environment" 
            icon={<Cloud size={24} />}
          >
            <div className="space-y-3 sm:space-y-4">
              {/* Light Intensity */}
              <div>
                <p className="text-slate-500 text-xs mb-1">Light Intensity</p>
                <div className="flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-yellow-400">
                    {sensorData.environment.light_intensity !== null ? (
                      <AnimatedValue value={sensorData.environment.light_intensity} decimals={0} />
                    ) : '--'}
                  </span>
                  <span className="ml-2 text-slate-500 text-base sm:text-lg">lux</span>
                </div>
              </div>

              {/* Weather */}
              <div>
                <p className="text-slate-500 text-xs mb-1">Weather</p>
                <div className="text-xl sm:text-2xl font-bold">
                  {sensorData.environment.is_raining ? (
                    <span className="text-blue-400">🌧️ Raining</span>
                  ) : (
                    <span className="text-yellow-400">☀️ Clear</span>
                  )}
                </div>
              </div>

              {/* Darkness */}
              <div>
                <p className="text-slate-500 text-xs mb-1">Darkness</p>
                <div className={`text-xl sm:text-2xl font-bold ${sensorData.environment.is_dark ? 'text-indigo-400' : 'text-yellow-400'}`}>
                  {sensorData.environment.is_dark ? '🌙 Dark' : '☀️ Bright'}
                </div>
              </div>
            </div>
          </SensorCard>

          {/* Security Status Section */}
          <SensorCard 
            title="Security System" 
            icon={<Shield size={24} />}
            alert={Object.values(sensorData.security.sensors).some(s => s.detected)}
          >
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(sensorData.security.sensors).map(([key, sensor]) => (
                <div key={key} className="flex items-center justify-between p-2 sm:p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300 text-sm sm:text-base">{sensor.label}</span>
                  <span className={`font-semibold text-xs sm:text-sm ${sensor.detected ? 'text-red-400' : 'text-green-400'}`}>
                    {sensor.detected ? '⚠️ Detected' : '✓ Normal'}
                  </span>
                </div>
              ))}
            </div>
          </SensorCard>

          {/* System Status Section */}
          <SensorCard 
            title="System Status" 
            icon={<Cpu size={24} />}
          >
            <div className="space-y-3 sm:space-y-4">
              {/* ESP32 Uptime */}
              <div>
                <p className="text-slate-500 text-xs mb-1">ESP32 Uptime</p>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">
                  {sensorData.system.esp32_uptime_sec !== null && isESP32Connected ? (
                    <>
                      <AnimatedValue value={Math.floor(sensorData.system.esp32_uptime_sec / 3600)} decimals={0} />h{' '}
                      <AnimatedValue value={Math.floor((sensorData.system.esp32_uptime_sec % 3600) / 60)} decimals={0} />m
                    </>
                  ) : (
                    <span className="text-slate-500">--</span>
                  )}
                </div>
              </div>

              {/* Connection Status */}
              <div>
                <p className="text-slate-500 text-xs mb-1">Connection</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isESP32Connected 
                      ? (dataUpdated ? 'bg-green-400 pulse-fast' : 'bg-green-400 animate-pulse')
                      : 'bg-red-500'
                  }`}></div>
                  <span className={`font-semibold ${isESP32Connected ? 'text-green-400' : 'text-red-500'}`}>
                    {isESP32Connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* System Health */}
              <div>
                <p className="text-slate-500 text-xs mb-1">System Health</p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                  isESP32Connected 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {isESP32Connected ? 'Healthy' : 'Offline'}
                </div>
              </div>
            </div>
          </SensorCard>

        </div>

        {/* Daily Logs Table */}
        <div className="mt-6 sm:mt-8">
          <SensorCard 
            title="Daily Activity Logs" 
            icon={<Shield size={24} />}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-3 pr-4 text-xs sm:text-sm font-semibold text-slate-400">Date</th>
                    <th className="pb-3 px-4 text-xs sm:text-sm font-semibold text-slate-400 text-right">Power (W)</th>
                    <th className="pb-3 px-4 text-xs sm:text-sm font-semibold text-slate-400 text-right">Units (kWh)</th>
                    <th className="pb-3 pl-4 text-xs sm:text-sm font-semibold text-slate-400">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 pr-4 text-xs sm:text-sm text-slate-300">{log.date}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-cyan-400 font-mono text-right">{log.powerUsage.toFixed(1)}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-yellow-400 font-mono text-right">{log.units.toFixed(1)}</td>
                      <td className="py-3 pl-4 text-xs sm:text-sm">
                        {log.events.length > 0 ? (
                          <div className="space-y-1">
                            {log.events.map((event, idx) => (
                              <div 
                                key={idx} 
                                className={`inline-block px-2 py-1 rounded text-xs mr-1 mb-1 ${
                                  event.includes('Security') ? 'bg-red-500/20 text-red-400' :
                                  event.includes('Gas') ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                {event}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-400 text-xs">✓ No incidents</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
                <div className="text-xs sm:text-sm text-slate-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, mockLogs.length)} of {mockLogs.length} logs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-all ${
                      currentPage === 1
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded text-xs sm:text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-all ${
                      currentPage === totalPages
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </SensorCard>
        </div>

        {/* Real-time indicator */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <div className={`w-2 h-2 bg-green-400 rounded-full ${dataUpdated ? 'pulse-fast' : 'animate-pulse'}`}></div>
            <span>Real-time Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
