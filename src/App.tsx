import React, { useEffect, useRef, useState } from 'react';
import { PetFace, xrStore } from './components/PetFace';
import { PaperTemplate } from './components/PaperTemplate';
import { pcmToBase64, base64ToPcm } from './lib/audio';

declare const FaceMesh: any;

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDistracted, setIsDistracted] = useState(false);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [appState, setAppState] = useState<'idle' | 'calibrating' | 'running'>('idle');
  const [showTemplate, setShowTemplate] = useState(false);
  const [trackerMode, setTrackerMode] = useState<'mediapipe' | 'fallback'>('mediapipe');
  const [showMonitor, setShowMonitor] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  const [micPitch, setMicPitch] = useState(0);
  const [isAsleep, setIsAsleep] = useState(false);
  const lastActiveRef = useRef<number>(Date.now());
  const isAsleepRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // OLED Screen Config States
  const [oledTheme, setOledTheme] = useState<'split' | 'cyan' | 'amber' | 'green' | 'white' | 'dynamic'>('split');
  const [character, setCharacter] = useState<'classic' | 'cyber' | 'kawaii' | 'pensive' | 'furious' | 'chaotic'>('classic');
  const [pixelGrid, setPixelGrid] = useState(true);
  const [glassShine, setGlassShine] = useState(true);
  const [showPCB, setShowPCB] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [screenFlicker, setScreenFlicker] = useState(true);
  const [autoAmbient, setAutoAmbient] = useState(true);
  const [ambientLight, setAmbientLight] = useState<number | null>(null);
  const [isNightTime, setIsNightTime] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const wakeWordEnabledRef = useRef(true);
  const [isAffirmative, setIsAffirmative] = useState(false);
  const lastNodTimeRef = useRef<number>(0);
  const nodHistoryRef = useRef<{ y: number; t: number }[]>([]);

  // Web Serial API
  const [serialPort, setSerialPort] = useState<any>(null);
  const [serialWriter, setSerialWriter] = useState<any>(null);

  const connectSerial = async () => {
    try {
      const nav = navigator as any;
      if (!nav.serial) {
        addLog("Web Serial API is not supported in this browser.", "error");
        return;
      }
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 115200 });
      const writer = port.writable.getWriter();
      setSerialPort(port);
      setSerialWriter(writer);
      addLog("Hardware connected via Web Serial!", "success");
    } catch (err: any) {
      addLog(`Failed to connect to Serial: ${err.message}`, "error");
    }
  };

  useEffect(() => {
    if (!serialWriter) return;

    // Map lookOffset (roughly -50 to +50) to standard 180-degree servo angles
    // Assuming 90 is center for both pan and tilt servos
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
    
    // Sway logic: map X to pan and Y to tilt. Multiply by a sensitivity factor (e.g., 1.5)
    const panAngle = Math.round(clamp(90 + (lookOffset.x * 1.5), 0, 180));
    const tiltAngle = Math.round(clamp(90 + (lookOffset.y * 1.5), 0, 180));

    const msg = JSON.stringify({
      x: Math.round(lookOffset.x),
      y: Math.round(lookOffset.y),
      pan: panAngle,
      tilt: tiltAngle,
      speaking: isSpeaking,
      asleep: isAsleep,
      theme: oledTheme
    }) + "\n";
    
    try {
      const encoder = new TextEncoder();
      serialWriter.write(encoder.encode(msg));
    } catch (err) {
      console.error("Serial write failed", err);
    }
  }, [lookOffset, isSpeaking, isAsleep, oledTheme, serialWriter]);

  const [expression, setExpression] = useState({
    leftEyeOpen: 1.0,
    rightEyeOpen: 1.0,
    leftBrowRaise: 0.0,
    rightBrowRaise: 0.0,
    mouthOpen: 0.0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastFaceUpdateRef = useRef<number>(0);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const earBaselineRef = useRef<{ left: number; right: number }>({ left: 0.23, right: 0.23 });

  const [uiLookOffset, setUiLookOffset] = useState<{x: number, y: number} | null>(null);
  const uiLookTimerRef = useRef<any>(null);

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setUiLookOffset({ x: 0, y: 30 }); 
        if (uiLookTimerRef.current) clearTimeout(uiLookTimerRef.current);
      }
    };

    const handleBlur = () => {
      if (uiLookTimerRef.current) clearTimeout(uiLookTimerRef.current);
      uiLookTimerRef.current = setTimeout(() => {
        setUiLookOffset(null);
      }, 1000);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        
        const offsetX = ((buttonCenterX - centerX) / centerX) * 40;
        const offsetY = ((buttonCenterY - centerY) / centerY) * 20;

        setUiLookOffset({ x: offsetX, y: offsetY });
        if (uiLookTimerRef.current) clearTimeout(uiLookTimerRef.current);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        if (uiLookTimerRef.current) clearTimeout(uiLookTimerRef.current);
        uiLookTimerRef.current = setTimeout(() => {
          setUiLookOffset(null);
        }, 500);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  // Ambient light & Night-time auto brightness controller
  useEffect(() => {
    if (appState !== 'running') return;

    let logCounter = 0;
    const interval = setInterval(() => {
      // 1. Check local clock for night time
      const hour = new Date().getHours();
      const timeIsNight = hour >= 20 || hour < 6;
      setIsNightTime(timeIsNight);

      // 2. Measure average light level from camera frame
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 16;
        tempCanvas.height = 16;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(video, 0, 0, 16, 16);
          try {
            const imgData = tempCtx.getImageData(0, 0, 16, 16);
            const data = imgData.data;
            let totalLuminance = 0;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // Relative luminance formula (Photometric formula)
              totalLuminance += (0.2126 * r + 0.7152 * g + 0.0722 * b);
            }
            const avgLuminance = Math.round(totalLuminance / (data.length / 4));
            setAmbientLight(avgLuminance);

            if (autoAmbient) {
              let targetBrightness = 100;
              let modeName = "Normal";
              if (avgLuminance < 45) {
                targetBrightness = 40; // Eye-safe dimming for dark environment
                modeName = "Low Light (Eye-Safe Dark Mode)";
              } else if (avgLuminance < 90) {
                targetBrightness = 70; // Soft dimming
                modeName = "Dimly Lit";
              } else if (avgLuminance > 175) {
                targetBrightness = 130; // Boost brightness for readable grid
                modeName = "Bright Light (High Contrast)";
              } else {
                targetBrightness = 100;
                modeName = "Standard Room Light";
              }

              setBrightness(targetBrightness);

              // Periodic logging so user knows it's working
              logCounter++;
              if (logCounter >= 10) {
                addLog(`Light Sensor: ${avgLuminance} lx (${modeName}). Adjusting Screen Glow to ${targetBrightness}%`, "info");
                logCounter = 0;
              }
            }
          } catch (err) {
            // Silence cross-origin canvas reading errors if security rules block it
          }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [appState, autoAmbient]);

  // Sync wake word ref with state
  useEffect(() => {
    wakeWordEnabledRef.current = wakeWordEnabled;
  }, [wakeWordEnabled]);

  // Web Speech API for 'Hey Antonio' keyword spotting
  useEffect(() => {
    if (appState !== 'running') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("Local Speech Recognition API not supported in this browser. Falling back to default audio/volume activation.", "warn");
      return;
    }

    let recognition: any = null;
    let isStoppedManually = false;

    const startRecognition = () => {
      if (isStoppedManually) return;
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          addLog("Keyword Spotter active: waiting for wake-phrase 'Hey Antonio'...", "success");
        };

        recognition.onresult = (event: any) => {
          if (!wakeWordEnabledRef.current) return;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (transcript.includes('antonio')) {
              // Only wake up if the pet is actually asleep
              if (isAsleepRef.current) {
                lastActiveRef.current = Date.now();
                setIsAsleep(false);
                isAsleepRef.current = false;
                addLog(`Wake word recognized: "${transcript.trim()}"! Antonio is awake.`, "success");
                
                // Play gentle mobile vibrate on wake
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate([40, 30, 40]);
                }
              } else {
                // If already awake, reset inactivity timeout so it stays awake
                lastActiveRef.current = Date.now();
              }
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
            console.warn("Speech Recognition Error:", event.error);
          }
        };

        recognition.onend = () => {
          if (!isStoppedManually && appState === 'running') {
            // Keep listening
            setTimeout(() => {
              if (!isStoppedManually) {
                try {
                  recognition.start();
                } catch (e) {}
              }
            }, 300);
          }
        };

        recognition.start();
      } catch (err) {
        console.error("Speech Recognition setup error:", err);
      }
    };

    startRecognition();

    return () => {
      isStoppedManually = true;
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {}
      }
    };
  }, [appState]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message, type }, ...prev.slice(0, 49)]);
  };

  // Function to start the app (requires user gesture for AudioContext)
  const startApp = async () => {
    try {
      setAppState('calibrating');
      setError(null);
      addLog("Awakening the Paper Pet...", "info");
      addLog("Entering calibration phase (3s). Please place device in stand...", "warn");

      // 2. Setup Audio Contexts
      addLog("Initializing audio systems (16kHz PCM duplex)...", "info");
      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputAudioCtx;
      outputAudioCtxRef.current = outputAudioCtx;

      // 3. Get Media Stream (Audio + Video)
      addLog("Requesting front-facing camera & microphone access...", "info");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode: "user" } 
      });
      addLog("Media stream acquired successfully.", "success");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
           videoRef.current?.play();
           addLog("Camera playback active.", "success");
           
           // Initialize FaceMesh or Fallback
           initTracker();
        };
      }

      // Mic Volume tracking
      const analyzer = inputAudioCtx.createAnalyser();
      analyzer.fftSize = 256;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkVolume = () => {
         if (inputAudioCtxRef.current && inputAudioCtxRef.current.state === 'running') {
            analyzer.getByteFrequencyData(dataArray);
            let sum = 0;
            let maxVal = -1;
            let maxIndex = -1;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
              if (dataArray[i] > maxVal) {
                maxVal = dataArray[i];
                maxIndex = i;
              }
            }
            const avg = sum / bufferLength;
            // Normalize volume roughly between 0.0 and 1.0
            const vol = Math.min(1, avg / 48); 
            setMicVolume(vol);

            if (vol > 0.05) {
               const nyquist = inputAudioCtxRef.current.sampleRate / 2;
               const pitchFreq = (maxIndex / bufferLength) * nyquist;
               setMicPitch(pitchFreq);
            } else {
               setMicPitch(0);
            }

            if (vol > 0.15 || isSpeakingRef.current) {
              const wasAsleep = isAsleepRef.current;
              if (wasAsleep && wakeWordEnabledRef.current && !isSpeakingRef.current) {
                // If wake-word trigger is enabled, general noise shouldn't wake it up
              } else {
                lastActiveRef.current = Date.now();
                if (isAsleepRef.current) {
                  setIsAsleep(false);
                  isAsleepRef.current = false;
                }
              }
            }

            // Check for inactivity (15 seconds)
            if (Date.now() - lastActiveRef.current > 15000 && !isAsleepRef.current && !isSpeakingRef.current) {
              setIsAsleep(true);
              isAsleepRef.current = true;
            }
         }
         requestAnimationFrame(checkVolume);
      };
      checkVolume();

      // Setup audio processing
      const source = inputAudioCtx.createMediaStreamSource(stream);
      source.connect(analyzer); // Connect source to analyzer

      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      let videoInterval: any;

      // Delay connecting WebSocket for 3 seconds (Calibration Phase)
      setTimeout(() => {
          setAppState('running');

          // 1. Connect WebSocket
          addLog("Connecting to Gemini Live API via custom gateway...", "info");
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}/live`;
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          // 5. Setup WebSocket Handlers
          ws.onopen = () => {
            setIsConnected(true);
            addLog("Connected to Gemini Live Agent soul.", "success");
          };

          ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.connected) {
               addLog("OLED Interface synced with Gemini.", "success");
            }
            if (msg.audio) {
              setIsSpeaking(true);
              isSpeakingRef.current = true;
              lastActiveRef.current = Date.now();
              if (isAsleepRef.current) {
                setIsAsleep(false);
                isAsleepRef.current = false;
              }
              playAudioChunk(outputAudioCtx, msg.audio);
            }
            if (msg.interrupted) {
              nextStartTimeRef.current = 0; // Reset queue
              setIsSpeaking(false);
              isSpeakingRef.current = false;
              addLog("User interrupted. Clearing speaking buffer.", "warn");
            }
          };

          ws.onclose = () => {
            setIsConnected(false);
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            addLog("WebSocket disconnected. Retrying in background...", "error");
          };

          // 6. Setup Video Framing (1 FPS for Gemini Vision)
          videoInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // lower quality to save bandwidth
                  const base64Data = dataUrl.split(',')[1];
                  ws.send(JSON.stringify({ video: base64Data }));
                }
              }
            }
          }, 1000);

      }, 3000);

      return () => {
        clearInterval(videoInterval);
        processor.disconnect();
        source.disconnect();
        if (wsRef.current) wsRef.current.close();
      };

    } catch (err: any) {
      addLog(`Start failed: ${err.message}`, "error");
      setError(err.message || "Failed to start camera/mic or connect to server.");
      setAppState('idle');
    }
  };

  const initTracker = () => {
    let hasLoadedMediaPipe = false;
    try {
      if (typeof FaceMesh !== 'undefined') {
        addLog("Initializing MediaPipe FaceMesh engine...", "info");
        const faceMeshInstance = new FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        faceMeshInstance.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMeshInstance.onResults((results: any) => {
          const now = performance.now();
          if (now - lastFaceUpdateRef.current < 80) return; // limit to ~12fps
          lastFaceUpdateRef.current = now;

          if (results && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              const face = results.multiFaceLandmarks[0];
              const nose = face[4]; // nose tip
              
              // invert X because front camera is mirrored
              const offsetX = (nose.x - 0.5) * 60; 
              const offsetY = (nose.y - 0.5) * 30;
              setLookOffset({ x: -offsetX, y: offsetY }); 
              setIsDistracted(false);

              // Head Nod Gesture Listener (rapid change in y-axis)
              const nowMs = performance.now();
              nodHistoryRef.current.push({ y: nose.y, t: nowMs });
              
              // Only keep last 600ms of history
              nodHistoryRef.current = nodHistoryRef.current.filter(item => nowMs - item.t < 600);
              
              if (nodHistoryRef.current.length >= 4 && nowMs - lastNodTimeRef.current > 2500 && !isAsleepRef.current) {
                const ys = nodHistoryRef.current.map(item => item.y);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                const rangeY = maxY - minY;
                
                // standard FaceMesh coordinates: y-axis is normalized between 0.0 and 1.0. 
                // A rapid rangeY > 0.035 indicates strong vertical movement.
                if (rangeY > 0.035) {
                  // Verify distinct direction change (both going down and going up)
                  let directions = [];
                  for (let i = 1; i < nodHistoryRef.current.length; i++) {
                    directions.push(nodHistoryRef.current[i].y - nodHistoryRef.current[i - 1].y);
                  }
                  const hasDown = directions.some(d => d > 0.003);
                  const hasUp = directions.some(d => d < -0.003);
                  
                  if (hasDown && hasUp) {
                    lastNodTimeRef.current = nowMs;
                    setIsAffirmative(true);
                    addLog("Head Nod gesture detected! Triggering affirmative smile.", "success");
                    
                    // Trigger gentle mobile vibrate on nod detection
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate([20, 30, 20]);
                    }
                    
                    // Reset to normal after 1.5s
                    setTimeout(() => {
                      setIsAffirmative(false);
                    }, 1500);
                  }
                }
              }

              // 6-Point Multi-Point Eye Aspect Ratio (EAR) tracking
              // Screen-Left Eye (user's right eye in mirrored video, corners 33 & 133):
              const lv1 = Math.hypot(face[159].x - face[145].x, face[159].y - face[145].y);
              const lv2 = Math.hypot(face[160].x - face[144].x, face[160].y - face[144].y);
              const lv3 = Math.hypot(face[158].x - face[153].x, face[158].y - face[153].y);
              const lw = Math.hypot(face[33].x - face[133].x, face[33].y - face[133].y);
              const leftEAR = lw > 0.001 ? (lv1 + lv2 + lv3) / (3.0 * lw) : 0.23;

              // Screen-Right Eye (user's left eye in mirrored video, corners 263 & 362):
              const rv1 = Math.hypot(face[386].x - face[374].x, face[386].y - face[374].y);
              const rv2 = Math.hypot(face[385].x - face[380].x, face[385].y - face[380].y);
              const rv3 = Math.hypot(face[387].x - face[373].x, face[387].y - face[373].y);
              const rw = Math.hypot(face[263].x - face[362].x, face[263].y - face[362].y);
              const rightEAR = rw > 0.001 ? (rv1 + rv2 + rv3) / (3.0 * rw) : 0.23;

              // Adaptive baseline calibration: gently learn user's relaxed eye geometry
              if (leftEAR > 0.16 && rightEAR > 0.16 && Math.abs(leftEAR - rightEAR) < 0.05) {
                earBaselineRef.current.left = earBaselineRef.current.left * 0.96 + leftEAR * 0.04;
                earBaselineRef.current.right = earBaselineRef.current.right * 0.96 + rightEAR * 0.04;
              }

              const baseL = Math.max(0.18, Math.min(0.28, earBaselineRef.current.left));
              const baseR = Math.max(0.18, Math.min(0.28, earBaselineRef.current.right));
              const closedCutoff = 0.125;

              const earToNormalized = (ear: number, base: number) => {
                if (ear <= closedCutoff) return 0.0;
                if (ear <= base) {
                  // Smooth ergonomic curve between closed (0.0) and normal open (1.0)
                  return Math.pow((ear - closedCutoff) / (base - closedCutoff), 1.15);
                }
                // Above baseline: wide surprise opening (up to 1.35)
                const wideExtra = (ear - base) / 0.10;
                return Math.min(1.35, 1.0 + wideExtra * 0.35);
              };

              const normLeft = Math.max(0, Math.min(1.35, earToNormalized(leftEAR, baseL)));
              const normRight = Math.max(0, Math.min(1.35, earToNormalized(rightEAR, baseR)));

              // Brows Raise tracking (centered above the eye pupils vertically)
              const leftBrowDist = face[159].y - face[105].y;
              const leftBrowRatio = lw > 0 ? (leftBrowDist / lw) : 0.85;

              const rightBrowDist = face[386].y - face[334].y;
              const rightBrowRatio = rw > 0 ? (rightBrowDist / rw) : 0.85;

              // Normalize: ~0.5 (frown) -> -1.0, 0.85 (neutral) -> 0.0, 1.2+ (fully raised) -> 1.0
              const normLeftBrow = Math.max(-1, Math.min(1, (leftBrowRatio - 0.85) / 0.35));
              const normRightBrow = Math.max(-1, Math.min(1, (rightBrowRatio - 0.85) / 0.35));

              // Mouth open tracking
              const mouthWidth = Math.sqrt(Math.pow(face[61].x - face[291].x, 2) + Math.pow(face[61].y - face[291].y, 2));
              const mouthDist = Math.sqrt(Math.pow(face[13].x - face[14].x, 2) + Math.pow(face[13].y - face[14].y, 2));
              const mouthRatio = mouthWidth > 0 ? (mouthDist / mouthWidth) : 0.0;

              // Normalize: < 0.08 is closed (0.0), > 0.45 is wide open (1.0)
              const normMouth = Math.max(0, Math.min(1, (mouthRatio - 0.08) / 0.37));

              setExpression({
                leftEyeOpen: normLeft,
                rightEyeOpen: normRight,
                leftBrowRaise: normLeftBrow,
                rightBrowRaise: normRightBrow,
                mouthOpen: normMouth,
              });
          } else {
              setLookOffset({ x: 0, y: 0 });
              setIsDistracted(true);
              setExpression({
                leftEyeOpen: 1.0,
                rightEyeOpen: 1.0,
                leftBrowRaise: 0.0,
                rightBrowRaise: 0.0,
                mouthOpen: 0.0,
              });
          }
        });

        let isRunning = true;
        const processFrame = async () => {
          if (!isRunning) return;
          if (trackerMode === 'mediapipe' && videoRef.current && videoRef.current.readyState >= 2) {
            try {
              await faceMeshInstance.send({ image: videoRef.current });
            } catch (err) {
              // Ignore frame-send warnings during transitions
            }
          }
          requestAnimationFrame(processFrame);
        };
        
        processFrame();
        hasLoadedMediaPipe = true;
        addLog("MediaPipe FaceMesh engine active and tracking.", "success");
      }
    } catch (e) {
      console.warn("Failed to load MediaPipe FaceMesh, falling back to pixel tracker", e);
    }

    if (!hasLoadedMediaPipe) {
      setTrackerMode('fallback');
      addLog("MediaPipe unavailable in this environment. Launching Retro Motion Tracker fallback.", "warn");
      startFallbackTracker();
    }
  };

  const startFallbackTracker = () => {
    let isRunning = true;
    const runFallback = () => {
      if (!isRunning || trackerMode !== 'fallback') return;

      if (videoRef.current && fallbackCanvasRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = fallbackCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = 40;
          const h = 30;
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(video, 0, 0, w, h);
          const frame = ctx.getImageData(0, 0, w, h);
          const data = frame.data;

          if (prevFrameDataRef.current) {
            const prev = prevFrameDataRef.current;
            let totalDiff = 0;
            let motionXSum = 0;
            let motionYSum = 0;
            let motionPixelsCount = 0;

            for (let i = 0; i < data.length; i += 4) {
              const rDiff = Math.abs(data[i] - prev[i]);
              const gDiff = Math.abs(data[i+1] - prev[i+1]);
              const bDiff = Math.abs(data[i+2] - prev[i+2]);
              const diff = (rDiff + gDiff + bDiff) / 3;

              if (diff > 25) { // Significant motion threshold
                const pixelIndex = i / 4;
                const px = pixelIndex % w;
                const py = Math.floor(pixelIndex / w);
                motionXSum += px;
                motionYSum += py;
                motionPixelsCount++;
                totalDiff += diff;
              }
            }

            const averageDiff = totalDiff / (w * h);
            if (motionPixelsCount > 10) {
              // Calculate centroid of motion
              const avgX = motionXSum / motionPixelsCount;
              const avgY = motionYSum / motionPixelsCount;

              // Convert to offset
              const targetX = ((avgX / w) - 0.5) * 60;
              const targetY = ((avgY / h) - 0.5) * 30;

              setLookOffset({ x: -targetX, y: targetY });
              setIsDistracted(false);
            } else if (averageDiff < 1) {
              // Sleep if absolutely no movement for a while
              setIsDistracted(true);
            }
          }
          prevFrameDataRef.current = data;
        }
      }
      setTimeout(runFallback, 100); // 10 fps is perfect for motion tracking
    };
    runFallback();
  };

  const playAudioChunk = (audioCtx: AudioContext, base64: string) => {
    try {
      const audioData = base64ToPcm(base64);
      const buffer = audioCtx.createBuffer(1, audioData.length, audioCtx.sampleRate);
      buffer.getChannelData(0).set(audioData);
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      
      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime + 0.05; 
      }
      
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;

      source.onended = () => {
        if (audioCtx.currentTime >= nextStartTimeRef.current - 0.1) {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
        }
      };
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  return (
    <div className="w-screen h-screen bg-black text-[#00ffcc] font-mono overflow-hidden relative flex flex-col md:flex-row">
      {showTemplate && <PaperTemplate onClose={() => setShowTemplate(false)} />}
      
      {/* Hidden elements for capturing */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={fallbackCanvasRef} className="hidden" />

      {appState === 'idle' ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-4">
           <h1 className="text-4xl tracking-wider uppercase font-bold text-center glow-text text-shadow">Antonio's Paper Pet</h1>
           <p className="text-center max-w-md opacity-80 text-sm leading-relaxed">
              An intelligent, multi-platform spatial companion. It uses your device camera to track your posture, and Gemini to awaken its soul.
           </p>
           <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8 w-full max-w-md">
             <button 
               onClick={startApp}
               className="flex-1 px-8 py-4 bg-[#00ffcc] text-black uppercase font-bold tracking-widest hover:bg-opacity-90 transition-all rounded-sm shadow-[0_0_20px_#00ffcc]"
             >
               Awaken Pet
             </button>
             <button 
               onClick={() => setShowTemplate(true)}
               className="flex-1 px-8 py-4 border-2 border-[#00ffcc] text-[#00ffcc] uppercase font-bold tracking-widest hover:bg-[#00ffcc] hover:text-black hover:shadow-[0_0_20px_#00ffcc] transition-all rounded-sm"
             >
               Paper Model
             </button>
           </div>
           {error && <p className="text-red-500 text-sm mt-4 text-center max-w-md">{error}</p>}
        </div>
      ) : (
        <>
          {/* Main Pet Screen */}
          <div className="flex-1 relative flex flex-col h-full bg-black">
             {/* Connection Status Indicator */}
             <div className="absolute top-6 left-6 flex items-center space-x-3 opacity-80 z-10">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]' : appState === 'calibrating' ? 'bg-yellow-500 shadow-[0_0_10px_yellow]' : 'bg-red-500 shadow-[0_0_10px_red]'}`} />
                <span className="text-xs tracking-widest uppercase font-bold">{isConnected ? 'System Online' : appState === 'calibrating' ? 'Calibrating...' : 'Connecting Soul...'}</span>
             </div>

             {/* Dynamic Mode Switcher */}
             <div className="absolute top-6 right-6 flex items-center space-x-2 z-10">
                <button 
                  onClick={connectSerial}
                  className={`px-3 py-1 text-[10px] uppercase border transition-all rounded-sm ${serialPort ? 'border-green-500 text-green-500 hover:bg-green-500/10' : 'border-[#00ffcc]/30 hover:border-[#00ffcc] hover:bg-[#00ffcc]/10 text-[#00ffcc]'}`}
                >
                  {serialPort ? '[ Hardware Linked ]' : '[ Connect Hardware ]'}
                </button>
                <button 
                  onClick={() => {
                    xrStore.enterAR().catch((err: any) => {
                      addLog(`AR not supported: ${err.message}`, "error");
                    });
                  }}
                  className="px-3 py-1 text-[10px] uppercase border border-[#00ffcc]/30 hover:border-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all rounded-sm text-[#00ffcc]"
                >
                  [ AR Hologram Mode ]
                </button>
                <button 
                  onClick={() => {
                    const nextMode = trackerMode === 'mediapipe' ? 'fallback' : 'mediapipe';
                    setTrackerMode(nextMode);
                    addLog(`Manually switched to ${nextMode === 'mediapipe' ? 'MediaPipe AI' : 'Retro Motion'} tracker.`, 'info');
                    if (nextMode === 'fallback') startFallbackTracker();
                  }}
                  className="px-3 py-1 text-[10px] uppercase border border-[#00ffcc]/30 hover:border-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all rounded-sm text-[#00ffcc]"
                >
                  Sensor: {trackerMode === 'mediapipe' ? 'MediaPipe' : 'Motion'}
                </button>
             </div>

             {/* The Pet Face */}
             <div className="flex-1 flex items-center justify-center relative">
                {appState === 'calibrating' && (
                  <div className="absolute top-1/3 text-[#00ffcc] font-bold tracking-widest uppercase animate-pulse opacity-50 z-10">
                    Calibration Phase... Place in Stand
                  </div>
                )}
                <PetFace 
                  isSpeaking={isSpeaking} 
                  isDistracted={uiLookOffset ? false : isDistracted} 
                  lookOffset={uiLookOffset || lookOffset} 
                  expression={expression} 
                  micVolume={micVolume}
                  micPitch={micPitch}
                  isCalibrating={appState === 'calibrating'}
                  isAsleep={isAsleep}
                  onWake={() => {
                    lastActiveRef.current = Date.now();
                    if (isAsleepRef.current) {
                      setIsAsleep(false);
                      isAsleepRef.current = false;
                    }
                  }}
                  oledTheme={oledTheme}
                  character={character}
                  pixelGrid={pixelGrid}
                  glassShine={glassShine}
                  showPCB={showPCB}
                  brightness={brightness}
                  screenFlicker={screenFlicker}
                  isNightTime={isNightTime}
                  isAffirmative={isAffirmative}
                />
             </div>
             
             {/* Dynamic Status bar */}
             <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-75 text-xs uppercase tracking-widest">
                <span>[X: {lookOffset.x.toFixed(0)} | Y: {lookOffset.y.toFixed(0)}]</span>
                <span>{isSpeaking ? '● Pet Speaking' : isDistracted ? '💤 Resting (No face)' : '⚡ Active watching'}</span>
             </div>
          </div>

          {/* Right-side Control and Debug Deck */}
          <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-[#00ffcc]/20 p-6 flex flex-col h-1/3 md:h-full justify-between overflow-y-auto transition-all duration-700 ${isNightTime || (ambientLight !== null && ambientLight < 45) ? 'bg-black text-slate-400' : 'bg-zinc-950'}`}>
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold tracking-widest uppercase text-[#00ffcc]">Control Deck</h3>
                  <button 
                    onClick={() => setShowMonitor(!showMonitor)}
                    className="text-[10px] uppercase underline text-gray-400 hover:text-[#00ffcc]"
                  >
                    {showMonitor ? 'Hide Feed' : 'Show Feed'}
                  </button>
                </div>

                {/* Simulated OLED viewport / Camera Monitor */}
                {showMonitor && (
                   <div className="relative aspect-video w-full bg-black border border-[#00ffcc]/20 rounded-sm overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#00ffcc]/5 pointer-events-none z-10 scanline-effect" />
                      <video 
                        ref={(el) => {
                          if (el && videoRef.current && el.srcObject !== videoRef.current.srcObject) {
                            el.srcObject = videoRef.current.srcObject;
                            el.play().catch(() => {});
                          }
                        }}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover opacity-50 grayscale contrast-150 scale-x-[-1]" 
                      />
                      <div className="absolute bottom-2 left-2 text-[10px] font-mono tracking-wider text-[#00ffcc] bg-black/80 px-2 py-0.5 rounded-sm">
                         CAM FEED
                      </div>
                      
                      {/* Laser scanning marker */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00ffcc]/60 shadow-[0_0_8px_#00ffcc] animate-bounce" />
                   </div>
                )}

                {/* Telemetry data */}
                <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-b border-[#00ffcc]/10 py-4">
                   <div>
                     <span className="block opacity-50">SOUl LINK:</span>
                     <span className="font-bold text-white">{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                   </div>
                   <div>
                     <span className="block opacity-50">EYE SYNC:</span>
                     <span className="font-bold text-white">{(lookOffset.x !== 0 || lookOffset.y !== 0) ? 'ACTIVE' : 'IDLE'}</span>
                   </div>
                   <div>
                     <span className="block opacity-50">ENGINE:</span>
                     <span className="font-bold text-white uppercase">{trackerMode}</span>
                   </div>
                   <div>
                     <span className="block opacity-50">SLEEP MODE:</span>
                     <span className="font-bold text-white">{isDistracted ? 'ON' : 'OFF'}</span>
                   </div>
                   <div className="col-span-2 pt-1 border-t border-[#00ffcc]/10 flex justify-between font-mono text-[9px]">
                     <div>
                       <span className="opacity-50 mr-1">EYE APERTURE:</span>
                       <span className="text-[#00ffcc] font-bold">L:{(expression.leftEyeOpen * 100).toFixed(0)}% R:{(expression.rightEyeOpen * 100).toFixed(0)}%</span>
                     </div>
                     <div>
                       <span className="opacity-50 mr-1">BROWS:</span>
                       <span className="text-[#00ffcc] font-bold">L:{expression.leftBrowRaise > 0 ? `+${expression.leftBrowRaise.toFixed(1)}` : expression.leftBrowRaise.toFixed(1)} R:{expression.rightBrowRaise > 0 ? `+${expression.rightBrowRaise.toFixed(1)}` : expression.rightBrowRaise.toFixed(1)}</span>
                     </div>
                   </div>
                </div>

                {/* OLED Hardware Customizer */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#00ffcc]/80">OLED Screen Config</h4>
                  
                  {/* Character Preset Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] text-gray-400 uppercase tracking-wider block">Personality Type</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'classic', label: 'Classic' },
                        { id: 'cyber', label: 'Cyber' },
                        { id: 'kawaii', label: 'Kawaii' },
                        { id: 'pensive', label: 'Pensive' },
                        { id: 'furious', label: 'Furious' },
                        { id: 'chaotic', label: 'Chaotic' },
                      ].map((char) => (
                        <button
                          key={char.id}
                          onClick={() => setCharacter(char.id as any)}
                          className={`px-1.5 py-1 text-[8px] uppercase tracking-wider rounded-sm border transition-all text-center
                            ${character === char.id 
                              ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]' 
                              : 'bg-transparent border-[#00ffcc]/20 text-gray-400 hover:border-[#00ffcc]/50 hover:text-[#00ffcc]'
                            }
                          `}
                        >
                          {char.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Preset Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] text-gray-400 uppercase tracking-wider block">Color Spectrum</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'dynamic', label: 'Dynamic Mood' },
                        { id: 'split', label: 'Split Y/B' },
                        { id: 'cyan', label: 'Cyan' },
                        { id: 'amber', label: 'Amber' },
                        { id: 'green', label: 'Green' },
                        { id: 'white', label: 'White' },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setOledTheme(theme.id as any)}
                          className={`px-1.5 py-1 text-[8px] uppercase tracking-wider rounded-sm border transition-all text-center
                            ${oledTheme === theme.id 
                              ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]' 
                              : 'bg-transparent border-[#00ffcc]/20 text-gray-400 hover:border-[#00ffcc]/50 hover:text-[#00ffcc]'
                            }
                          `}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brightness Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-gray-400 uppercase tracking-wider">
                      <span>Glow Brightness</span>
                      <span className="font-bold text-[#00ffcc]">{brightness}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="35" 
                      max="150" 
                      value={brightness} 
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-[#00ffcc] bg-zinc-800 h-1 rounded-sm appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Hardware Toggles */}
                  <div className="space-y-2 pt-1 text-[8px] text-gray-300">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={showPCB} 
                        onChange={(e) => setShowPCB(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] focus:ring-0 cursor-pointer accent-[#00ffcc]"
                      />
                      <span className="group-hover:text-white uppercase tracking-wider">Physical PCB Base</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={pixelGrid} 
                        onChange={(e) => setPixelGrid(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] focus:ring-0 cursor-pointer accent-[#00ffcc]"
                      />
                      <span className="group-hover:text-white uppercase tracking-wider">Subpixel Dot-Matrix</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={glassShine} 
                        onChange={(e) => setGlassShine(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] focus:ring-0 cursor-pointer accent-[#00ffcc]"
                      />
                      <span className="group-hover:text-white uppercase tracking-wider">Gloss Glass Glare</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={screenFlicker} 
                        onChange={(e) => setScreenFlicker(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] focus:ring-0 cursor-pointer accent-[#00ffcc]"
                      />
                      <span className="group-hover:text-white uppercase tracking-wider">Camera Refresh Flicker</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={autoAmbient} 
                        onChange={(e) => {
                          setAutoAmbient(e.target.checked);
                          if (e.target.checked) {
                            addLog("Auto-Ambient Light Sensor enabled.", "info");
                          } else {
                            addLog("Auto-Ambient Light Sensor disabled.", "info");
                          }
                        }}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] focus:ring-0 cursor-pointer accent-[#00ffcc]"
                      />
                      <span className="group-hover:text-white uppercase tracking-wider">Auto-Ambient Adjustment</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={wakeWordEnabled} 
                        onChange={(e) => {
                          setWakeWordEnabled(e.target.checked);
                          if (e.target.checked) {
                            addLog("Voice Wake-Word Trigger ('Hey Antonio') enabled.", "info");
                          } else {
                            addLog("Voice Wake-Word Trigger disabled. Loud noises will activate.", "info");
                          }
                        }}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] focus:ring-0 cursor-pointer accent-[#00ffcc]"
                      />
                      <span className="group-hover:text-white uppercase tracking-wider">Hey Antonio Wake Word</span>
                    </label>

                    {ambientLight !== null && (
                      <div className="flex items-center justify-between text-[7px] text-gray-500 uppercase tracking-widest pt-1.5 border-t border-zinc-800/50">
                        <span>Light Sensor Reading</span>
                        <span className="font-bold text-yellow-400">{ambientLight} lx ({ambientLight < 45 ? 'Night / Dark' : ambientLight < 90 ? 'Dim' : ambientLight > 175 ? 'Bright' : 'Normal'})</span>
                      </div>
                    )}
                  </div>
                </div>
             </div>

             {/* Real-time Logger Console */}
             <div className="flex-1 flex flex-col mt-6 min-h-[120px]">
                <span className="text-[10px] tracking-widest uppercase opacity-50 mb-2">Live Console Logs</span>
                <div className="flex-1 bg-black border border-[#00ffcc]/10 p-3 rounded-sm font-mono text-[9px] overflow-y-auto space-y-1.5 h-32 scrollbar-thin">
                   {logs.length === 0 ? (
                      <span className="text-gray-600 italic">Waiting for events...</span>
                   ) : (
                      logs.map((log, i) => (
                        <div key={i} className="leading-relaxed">
                          <span className="text-gray-500 mr-1.5">[{log.time}]</span>
                          <span className={
                            log.type === 'success' ? 'text-green-400' :
                            log.type === 'warn' ? 'text-yellow-400' :
                            log.type === 'error' ? 'text-red-400' : 'text-[#00ffcc]'
                          }>
                            {log.message}
                          </span>
                        </div>
                      ))
                   )}
                </div>
             </div>

             <div className="mt-6">
                <button 
                  onClick={() => setShowTemplate(true)}
                  className="w-full py-2 bg-transparent hover:bg-[#00ffcc]/10 border border-[#00ffcc] text-[#00ffcc] uppercase text-xs font-bold tracking-widest rounded-sm transition-all"
                >
                  Open Blueprint
                </button>
             </div>
          </div>
        </>
      )}
    </div>
  );
}


