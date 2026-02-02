import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';
import { db } from '../firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import ParticlesBackground from '../components/ParticlesBackground';
import SensorCard from '../components/SensorCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Lightbulb, Fan, DoorOpen, Shirt } from 'lucide-react';

function ControlPage() {
  const { currentUser, isAuthorized } = useAuth();
  const { showError, showSuccess } = useToast();
  
  // State for control data
  const [controlData, setControlData] = useState({
    lighting: {
      leds: Array(10).fill(null).map((_, index) => ({
        id: index,
        on: false,
        hex: '#FFFFFF',
        brightness: 255,
        label: index < 5 ? `Indoor ${index + 1}` : 
               index < 8 ? `Outdoor ${index - 4}` : 
               `Status ${index - 7}`
      }))
    },
    motors: {
      stepper_gate: {
        is_open: false
      },
      servo_rack: {
        is_extended: false
      },
      fan_l298n: {
        speed: 0,
        is_on: false
      }
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingControl, setSavingControl] = useState(null); // Track which control is being saved

  // Temporary local state for sliders and color pickers being adjusted
  const [tempSliderValues, setTempSliderValues] = useState({});
  const [tempColorValues, setTempColorValues] = useState({});
  
  // Track which controls are being actively adjusted (to ignore Firebase updates)
  const [activeControls, setActiveControls] = useState({});

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    const controlsRef = ref(db, 'smart_home/controls');
    
    const unsubscribe = onValue(controlsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setControlData(prevData => {
          // Merge Firebase data but preserve actively adjusted values
          const newData = {
            lighting: {
              ...prevData.lighting,
              leds: data.lighting?.leds?.map((led, index) => {
                const prevLed = prevData.lighting.leds[index];
                return {
                  ...led,
                  // Keep local values if control is active
                  brightness: activeControls[`led-${index}-brightness`] 
                    ? prevLed.brightness 
                    : led.brightness,
                  hex: activeControls[`led-${index}-color`] 
                    ? prevLed.hex 
                    : led.hex
                };
              }) || prevData.lighting.leds
            },
            motors: {
              ...prevData.motors,
              fan_l298n: {
                ...data.motors?.fan_l298n,
                // Keep local speed if fan slider is active
                speed: activeControls['fan-speed'] 
                  ? prevData.motors.fan_l298n.speed 
                  : data.motors?.fan_l298n?.speed || 0,
                is_on: data.motors?.fan_l298n?.is_on || false
              },
              stepper_gate: data.motors?.stepper_gate || prevData.motors.stepper_gate,
              servo_rack: data.motors?.servo_rack || prevData.motors.servo_rack
            }
          };
          return newData;
        });
      }
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error('Error reading control data:', error);
      
      if (error.code === 'PERMISSION_DENIED') {
        const errorMsg = 'คุณไม่มีสิทธิ์เข้าถึงการควบคุมอุปกรณ์ กรุณาติดต่อผู้ดูแลระบบ';
        setError(errorMsg);
        showError(errorMsg);
      } else {
        const errorMsg = 'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ';
        setError(errorMsg);
        showError(errorMsg);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthorized, activeControls]);

  // Update LED control
  const updateLED = async (ledIndex, updates) => {
    if (!isAuthorized) return;

    const controlId = `led-${ledIndex}`;
    setSavingControl(controlId);

    try {
      const ledRef = ref(db, `smart_home/controls/lighting/leds/${ledIndex}`);
      await update(ledRef, updates);
      
      // Update local state immediately to prevent flicker
      setControlData(prev => ({
        ...prev,
        lighting: {
          ...prev.lighting,
          leds: prev.lighting.leds.map((led, idx) => 
            idx === ledIndex ? { ...led, ...updates } : led
          )
        }
      }));
    } catch (error) {
      console.error('Error updating LED:', error);
      const errorMsg = 'ไม่สามารถบันทึกการเปลี่ยนแปลงได้ กรุณาลองใหม่อีกครั้ง';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSavingControl(null);
    }
  };

  // Update motor control
  const updateMotor = async (motorName, updates) => {
    if (!isAuthorized) return;

    const controlId = `motor-${motorName}`;
    setSavingControl(controlId);

    try {
      const motorRef = ref(db, `smart_home/controls/motors/${motorName}`);
      await update(motorRef, updates);
      
      // Update local state immediately to prevent flicker
      setControlData(prev => ({
        ...prev,
        motors: {
          ...prev.motors,
          [motorName]: {
            ...prev.motors[motorName],
            ...updates
          }
        }
      }));
    } catch (error) {
      console.error('Error updating motor:', error);
      const errorMsg = 'ไม่สามารถบันทึกการเปลี่ยนแปลงได้ กรุณาลองใหม่อีกครั้ง';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSavingControl(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-cyan-400">Control Panel</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <SkeletonLoader variant="card" count={6} />
        </div>
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-slate-400">Loading controls...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="inline-block p-4 bg-red-500/10 rounded-full mb-4">
              <svg 
                className="w-12 h-12 text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ไม่มีสิทธิ์เข้าถึง
            </h2>
            <p className="text-slate-400 mb-6">
              คุณไม่มีสิทธิ์เข้าถึงหน้าควบคุมอุปกรณ์ กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การเข้าถึง
            </p>
            {currentUser && (
              <div className="bg-slate-700/50 rounded-lg p-4 text-left">
                <p className="text-slate-500 text-xs mb-1">User ID สำหรับผู้ดูแลระบบ:</p>
                <p className="text-slate-300 text-sm font-mono break-all">{currentUser.uid}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Particles Background */}
      <ParticlesBackground density="low" color="#06b6d4" opacity={0.3} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">Control Panel</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <div className="flex items-start">
              <svg 
                className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* LED Controls Section */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">LED Lighting Control</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {controlData.lighting.leds.map((led) => (
              <SensorCard
                key={led.id}
                title={led.label}
                icon={<Lightbulb size={20} />}
                alert={led.on}
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-slate-400 text-xs sm:text-sm">Status</span>
                  <div 
                    className={`w-3 h-3 rounded-full ${led.on ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-slate-600'}`}
                  ></div>
                </div>

                {/* On/Off Toggle */}
                <div className="mb-3 sm:mb-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-400 text-xs sm:text-sm">Power</span>
                    <button
                      onClick={() => updateLED(led.id, { on: !led.on })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        led.on ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          led.on ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Color Picker */}
                <div className="mb-3 sm:mb-4">
                  <label className="block text-slate-400 text-xs sm:text-sm mb-2">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tempColorValues[`led-${led.id}-color`] ?? led.hex}
                    onMouseDown={() => {
                      // Mark as active when starting to change
                      setActiveControls(prev => ({
                        ...prev,
                        [`led-${led.id}-color`]: true
                      }));
                    }}
                    onTouchStart={() => {
                      // Mark as active for mobile
                      setActiveControls(prev => ({
                        ...prev,
                        [`led-${led.id}-color`]: true
                      }));
                    }}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      // Update local state immediately for smooth UI
                      setTempColorValues(prev => ({
                        ...prev,
                        [`led-${led.id}-color`]: newColor
                      }));
                    }}
                    onMouseUp={async (e) => {
                      // Update Firebase when released
                      const newColor = e.target.value;
                      await updateLED(led.id, { hex: newColor });
                      
                      // Clear temp and active state after update completes
                      setTempColorValues(prev => {
                        const newState = { ...prev };
                        delete newState[`led-${led.id}-color`];
                        return newState;
                      });
                      setActiveControls(prev => {
                        const newState = { ...prev };
                        delete newState[`led-${led.id}-color`];
                        return newState;
                      });
                    }}
                    onTouchEnd={async (e) => {
                      // Update Firebase when released on mobile
                      const newColor = e.target.value;
                      await updateLED(led.id, { hex: newColor });
                      
                      // Clear temp and active state after update completes
                      setTempColorValues(prev => {
                        const newState = { ...prev };
                        delete newState[`led-${led.id}-color`];
                        return newState;
                      });
                      setActiveControls(prev => {
                        const newState = { ...prev };
                        delete newState[`led-${led.id}-color`];
                        return newState;
                      });
                    }}
                      className="w-12 h-10 rounded cursor-pointer bg-slate-700 border border-slate-600"
                      disabled={!led.on}
                    />
                    <input
                      type="text"
                      value={tempColorValues[`led-${led.id}-color`] ?? led.hex}
                    onFocus={() => {
                      // Mark as active when focusing text input
                      setActiveControls(prev => ({
                        ...prev,
                        [`led-${led.id}-color`]: true
                      }));
                    }}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      // Update local state immediately
                      setTempColorValues(prev => ({
                        ...prev,
                        [`led-${led.id}-color`]: newColor
                      }));
                    }}
                    onBlur={async (e) => {
                      const newColor = e.target.value;
                      // Only update Firebase if valid hex color
                      if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                        await updateLED(led.id, { hex: newColor });
                      }
                      
                      // Clear temp and active state after update completes
                      setTempColorValues(prev => {
                        const newState = { ...prev };
                        delete newState[`led-${led.id}-color`];
                        return newState;
                      });
                      setActiveControls(prev => {
                        const newState = { ...prev };
                        delete newState[`led-${led.id}-color`];
                        return newState;
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur(); // Trigger onBlur to save
                      }
                    }}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-xs sm:text-sm font-mono"
                      disabled={!led.on}
                    />
                  </div>
                </div>

                {/* Brightness Slider */}
                <div>
                  <label className="block text-slate-400 text-xs sm:text-sm mb-2">
                    Brightness: {tempSliderValues[`led-${led.id}-brightness`] ?? led.brightness}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={tempSliderValues[`led-${led.id}-brightness`] ?? led.brightness}
                  onMouseDown={() => {
                    // Mark as active when starting to slide
                    setActiveControls(prev => ({
                      ...prev,
                      [`led-${led.id}-brightness`]: true
                    }));
                  }}
                  onTouchStart={() => {
                    // Mark as active for mobile
                    setActiveControls(prev => ({
                      ...prev,
                      [`led-${led.id}-brightness`]: true
                    }));
                  }}
                  onInput={(e) => {
                    const newBrightness = parseInt(e.target.value);
                    // Update local state immediately for smooth sliding
                    setTempSliderValues(prev => ({
                      ...prev,
                      [`led-${led.id}-brightness`]: newBrightness
                    }));
                  }}
                  onMouseUp={async (e) => {
                    // Update Firebase when released
                    const newBrightness = parseInt(e.target.value);
                    await updateLED(led.id, { brightness: newBrightness });
                    
                    // Clear temp and active state after update completes
                    setTempSliderValues(prev => {
                      const newState = { ...prev };
                      delete newState[`led-${led.id}-brightness`];
                      return newState;
                    });
                    setActiveControls(prev => {
                      const newState = { ...prev };
                      delete newState[`led-${led.id}-brightness`];
                      return newState;
                    });
                  }}
                  onTouchEnd={async (e) => {
                    // Update Firebase when released on mobile
                    const newBrightness = parseInt(e.target.value);
                    await updateLED(led.id, { brightness: newBrightness });
                    
                    // Clear temp and active state after update completes
                    setTempSliderValues(prev => {
                      const newState = { ...prev };
                      delete newState[`led-${led.id}-brightness`];
                      return newState;
                    });
                    setActiveControls(prev => {
                      const newState = { ...prev };
                      delete newState[`led-${led.id}-brightness`];
                      return newState;
                    });
                  }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    disabled={!led.on}
                  />
                </div>
              </SensorCard>
            ))}
          </div>
        </div>

        {/* Motor Controls Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Motor Control</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Gate Control */}
            <SensorCard
              title="Front Gate"
              icon={<DoorOpen size={24} />}
              alert={controlData.motors.stepper_gate.is_open}
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Status:</span>
                  <span className={`font-semibold text-sm ${controlData.motors.stepper_gate.is_open ? 'text-green-400' : 'text-slate-400'}`}>
                    {controlData.motors.stepper_gate.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <button
                  onClick={() => updateMotor('stepper_gate', { 
                    is_open: !controlData.motors.stepper_gate.is_open
                  })}
                  className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                    controlData.motors.stepper_gate.is_open
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {controlData.motors.stepper_gate.is_open ? 'Close Gate' : 'Open Gate'}
                </button>
              </div>
            </SensorCard>

            {/* Rack Control */}
            <SensorCard
              title="Clothes Rack"
              icon={<Shirt size={24} />}
              alert={controlData.motors.servo_rack.is_extended}
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Status:</span>
                  <span className={`font-semibold text-sm ${controlData.motors.servo_rack.is_extended ? 'text-green-400' : 'text-slate-400'}`}>
                    {controlData.motors.servo_rack.is_extended ? 'Extended' : 'Retracted'}
                  </span>
                </div>

                <button
                  onClick={() => updateMotor('servo_rack', { 
                    is_extended: !controlData.motors.servo_rack.is_extended
                  })}
                  className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                    controlData.motors.servo_rack.is_extended
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {controlData.motors.servo_rack.is_extended ? 'Retract' : 'Extend'}
                </button>
              </div>
            </SensorCard>

            {/* Fan Control */}
            <SensorCard
              title="Fan"
              icon={<Fan size={24} />}
              alert={controlData.motors.fan_l298n.is_on}
            >
              <div className="space-y-3 sm:space-y-4">
                {/* On/Off Toggle */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer mb-3 sm:mb-4">
                    <span className="text-slate-400 text-sm">Power</span>
                  <button
                    onClick={() => updateMotor('fan_l298n', { 
                      is_on: !controlData.motors.fan_l298n.is_on,
                      speed: !controlData.motors.fan_l298n.is_on ? 128 : 0
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      controlData.motors.fan_l298n.is_on ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        controlData.motors.fan_l298n.is_on ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

                {/* Speed Slider */}
                <div>
                  <label className="block text-slate-400 text-xs sm:text-sm mb-2">
                    Speed: {tempSliderValues['fan-speed'] ?? controlData.motors.fan_l298n.speed}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={tempSliderValues['fan-speed'] ?? controlData.motors.fan_l298n.speed}
                    onMouseDown={() => {
                      setActiveControls(prev => ({ ...prev, 'fan-speed': true }));
                    }}
                    onTouchStart={() => {
                      setActiveControls(prev => ({ ...prev, 'fan-speed': true }));
                    }}
                    onInput={(e) => {
                      const newSpeed = parseInt(e.target.value);
                      setTempSliderValues(prev => ({ ...prev, 'fan-speed': newSpeed }));
                    }}
                    onMouseUp={async (e) => {
                      const newSpeed = parseInt(e.target.value);
                      await updateMotor('fan_l298n', { speed: newSpeed, is_on: newSpeed > 0 });
                      setTempSliderValues(prev => {
                        const newState = { ...prev };
                        delete newState['fan-speed'];
                        return newState;
                      });
                      setActiveControls(prev => {
                        const newState = { ...prev };
                        delete newState['fan-speed'];
                        return newState;
                      });
                    }}
                    onTouchEnd={async (e) => {
                      const newSpeed = parseInt(e.target.value);
                      await updateMotor('fan_l298n', { speed: newSpeed, is_on: newSpeed > 0 });
                      setTempSliderValues(prev => {
                        const newState = { ...prev };
                        delete newState['fan-speed'];
                        return newState;
                      });
                      setActiveControls(prev => {
                        const newState = { ...prev };
                        delete newState['fan-speed'];
                        return newState;
                      });
                    }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    disabled={!controlData.motors.fan_l298n.is_on}
                  />
                </div>
              </div>
            </SensorCard>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPage;
