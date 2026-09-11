import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Edges, RoundedBox, Sphere, Cylinder, Sparkles, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Scanline, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { XR, createXRStore, useXR } from '@react-three/xr';
import * as THREE from 'three';

export const xrStore = createXRStore();

// 3D Holographic Cybernetic Avatar Component
function HologramFace3D({
  isSpeaking, isDistracted, isAsleep, isPoked, isFeeding, isPetting, isBlinking,
  lookOffset, expression, micVolume, currentTheme, character, screenFlicker, isAffirmative
}: any) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mandibleRef = useRef<THREE.Group>(null);
  const leftEyeGroupRef = useRef<THREE.Group>(null);
  const rightEyeGroupRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftIrisRef = useRef<THREE.Mesh>(null);
  const rightIrisRef = useRef<THREE.Mesh>(null);
  const leftUpperShutterRef = useRef<THREE.Mesh>(null);
  const leftLowerShutterRef = useRef<THREE.Mesh>(null);
  const rightUpperShutterRef = useRef<THREE.Mesh>(null);
  const rightLowerShutterRef = useRef<THREE.Mesh>(null);
  const leftReticleRef = useRef<THREE.Group>(null);
  const rightReticleRef = useRef<THREE.Group>(null);
  const leftInnerReticleRef = useRef<THREE.Group>(null);
  const rightInnerReticleRef = useRef<THREE.Group>(null);
  const leftBrowRef = useRef<THREE.Group>(null);
  const rightBrowRef = useRef<THREE.Group>(null);
  const vocoderBarsRef = useRef<(THREE.Mesh | null)[]>([]);
  const leftEarBarsRef = useRef<(THREE.Mesh | null)[]>([]);
  const rightEarBarsRef = useRef<(THREE.Mesh | null)[]>([]);
  const orbitalRingRef = useRef<THREE.Mesh>(null);
  const lidarSweepRef = useRef<THREE.Mesh>(null);
  const cortexCoreRef = useRef<THREE.Mesh>(null);
  const haloGroupRef = useRef<THREE.Group>(null);
  const haloInnerRingRef = useRef<THREE.Group>(null);
  const spineVertebraeRefs = useRef<(THREE.Group | null)[]>([]);
  const leftDamperRef = useRef<THREE.Mesh>(null);
  const rightDamperRef = useRef<THREE.Mesh>(null);
  const microSaccadeRef = useRef({ x: 0, y: 0, nextTime: 0 });

  const color = useMemo(() => new THREE.Color(currentTheme), [currentTheme]);
  const edgeColor = useMemo(() => {
    const c = new THREE.Color(currentTheme);
    c.multiplyScalar(2.2);
    return c;
  }, [currentTheme]);
  const isPresenting = useXR((state) => state.session) != null;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // 1. Natural Micro-Saccade Dynamics (Humanoid/Android Eye Twitch)
    if (time > microSaccadeRef.current.nextTime && !isAsleep) {
      microSaccadeRef.current.x = (Math.random() - 0.5) * 0.0035;
      microSaccadeRef.current.y = (Math.random() - 0.5) * 0.0025;
      microSaccadeRef.current.nextTime = time + 1.2 + Math.random() * 2.2;
    }

    // 2. Smooth Head Look & Orientation
    if (groupRef.current) {
      const targetRotX = (lookOffset.y * 0.012);
      const targetRotY = (lookOffset.x * 0.012);
      const targetRotZ = (lookOffset.x * -0.003);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 9 * delta);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 9 * delta);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 9 * delta);

      // Articulate Biomechanical Spine Vertebrae proportionally with head tilt
      for (let i = 0; i < 4; i++) {
        const vert = spineVertebraeRefs.current[i];
        if (vert) {
          const factor = (i + 1) * 0.18;
          vert.rotation.x = THREE.MathUtils.lerp(vert.rotation.x, targetRotX * factor, 8 * delta);
          vert.rotation.y = THREE.MathUtils.lerp(vert.rotation.y, targetRotY * factor, 8 * delta);
        }
      }
    }

    // 3. Optical Pupil Tracking & Micro-Saccades
    const targetPupilX = (lookOffset.x * 0.002) + (isAsleep ? 0 : microSaccadeRef.current.x);
    const targetPupilY = (-lookOffset.y * 0.002) + (isAsleep ? 0 : microSaccadeRef.current.y);

    // 4. Expression-Coupled Ocular Aperture & Shutters
    const rawLeftOpen = expression?.leftEyeOpen ?? 1.0;
    const rawRightOpen = expression?.rightEyeOpen ?? 1.0;

    // Couple eyebrow raise into eye aperture widening (surprise / expressiveness)
    const leftBrowRaise = expression?.leftBrowRaise ?? 0;
    const rightBrowRaise = expression?.rightBrowRaise ?? 0;
    const leftBrowBoost = Math.max(0, leftBrowRaise) * 0.25;
    const rightBrowBoost = Math.max(0, rightBrowRaise) * 0.25;
    const leftFrownNarrow = Math.min(0, leftBrowRaise) * 0.15;
    const rightFrownNarrow = Math.min(0, rightBrowRaise) * 0.15;

    const effectiveLeftOpen = (isBlinking || isAsleep) ? 0.0 : Math.max(0, Math.min(1.4, rawLeftOpen + leftBrowBoost + leftFrownNarrow));
    const effectiveRightOpen = (isBlinking || isAsleep) ? 0.0 : Math.max(0, Math.min(1.4, rawRightOpen + rightBrowBoost + rightFrownNarrow));

    // Dynamic pupil scaling based on facial openness, voice volume, and sleep
    const basePupil = isAsleep ? 0.2 : (1 + micVolume * 0.5);
    const targetLeftPupilScaleX = isAsleep ? 0.2 : basePupil * (effectiveLeftOpen > 1.0 ? 1.25 : Math.max(0.15, Math.min(1.0, 0.35 + effectiveLeftOpen * 0.65)));
    const targetLeftPupilScaleY = isAsleep ? 0.05 : basePupil * (effectiveLeftOpen > 1.0 ? 1.3 : Math.max(0.04, effectiveLeftOpen));

    const targetRightPupilScaleX = isAsleep ? 0.2 : basePupil * (effectiveRightOpen > 1.0 ? 1.25 : Math.max(0.15, Math.min(1.0, 0.35 + effectiveRightOpen * 0.65)));
    const targetRightPupilScaleY = isAsleep ? 0.05 : basePupil * (effectiveRightOpen > 1.0 ? 1.3 : Math.max(0.04, effectiveRightOpen));

    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, targetPupilX, 15 * delta);
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, targetPupilY, 15 * delta);
      leftPupilRef.current.scale.x = THREE.MathUtils.lerp(leftPupilRef.current.scale.x, targetLeftPupilScaleX, 16 * delta);
      leftPupilRef.current.scale.y = THREE.MathUtils.lerp(leftPupilRef.current.scale.y, targetLeftPupilScaleY, 16 * delta);
      leftPupilRef.current.scale.z = THREE.MathUtils.lerp(leftPupilRef.current.scale.z, targetLeftPupilScaleX, 16 * delta);
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, targetPupilX, 15 * delta);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, targetPupilY, 15 * delta);
      rightPupilRef.current.scale.x = THREE.MathUtils.lerp(rightPupilRef.current.scale.x, targetRightPupilScaleX, 16 * delta);
      rightPupilRef.current.scale.y = THREE.MathUtils.lerp(rightPupilRef.current.scale.y, targetRightPupilScaleY, 16 * delta);
      rightPupilRef.current.scale.z = THREE.MathUtils.lerp(rightPupilRef.current.scale.z, targetRightPupilScaleX, 16 * delta);
    }

    // Dynamic Iris Aperture Scale
    if (leftIrisRef.current) {
      const targetIris = isAsleep ? 0.65 : (effectiveLeftOpen > 1.0 ? 1.15 : Math.max(0.55, 0.55 + effectiveLeftOpen * 0.45));
      leftIrisRef.current.scale.setScalar(THREE.MathUtils.lerp(leftIrisRef.current.scale.x, targetIris, 15 * delta));
    }
    if (rightIrisRef.current) {
      const targetIris = isAsleep ? 0.65 : (effectiveRightOpen > 1.0 ? 1.15 : Math.max(0.55, 0.55 + effectiveRightOpen * 0.45));
      rightIrisRef.current.scale.setScalar(THREE.MathUtils.lerp(rightIrisRef.current.scale.x, targetIris, 15 * delta));
    }

    // Shutter target positions for mechanical eyelids
    const computeShutters = (openness: number) => {
      if (openness <= 0.05) {
        return { upper: 0.01, lower: -0.01 }; // fully sealed shut (e.g. winking or sleeping)
      }
      if (openness <= 1.0) {
        return {
          upper: THREE.MathUtils.lerp(0.01, 0.38, openness),
          lower: THREE.MathUtils.lerp(-0.01, -0.34, openness),
        };
      }
      const wideT = Math.min(1.0, (openness - 1.0) / 0.4);
      return {
        upper: THREE.MathUtils.lerp(0.38, 0.48, wideT),
        lower: THREE.MathUtils.lerp(-0.34, -0.42, wideT),
      };
    };

    let targetLeftUpperY: number;
    let targetLeftLowerY: number;
    let targetRightUpperY: number;
    let targetRightLowerY: number;

    if (isBlinking || isAsleep) {
      targetLeftUpperY = 0.01;
      targetLeftLowerY = -0.01;
      targetRightUpperY = 0.01;
      targetRightLowerY = -0.01;
    } else if (isPetting || isAffirmative) {
      targetLeftUpperY = 0.16;
      targetLeftLowerY = -0.14;
      targetRightUpperY = 0.16;
      targetRightLowerY = -0.14;
    } else if (isPoked) {
      targetLeftUpperY = 0.48;
      targetLeftLowerY = -0.42;
      targetRightUpperY = 0.48;
      targetRightLowerY = -0.42;
    } else {
      const leftS = computeShutters(effectiveLeftOpen);
      const rightS = computeShutters(effectiveRightOpen);
      targetLeftUpperY = leftS.upper;
      targetLeftLowerY = leftS.lower;
      targetRightUpperY = rightS.upper;
      targetRightLowerY = rightS.lower;
    }

    if (character === 'furious' && !isAsleep) {
      targetLeftUpperY = Math.min(targetLeftUpperY, 0.22);
      targetLeftLowerY = Math.max(targetLeftLowerY, -0.20);
      targetRightUpperY = Math.min(targetRightUpperY, 0.22);
      targetRightLowerY = Math.max(targetRightLowerY, -0.20);
    }

    if (leftUpperShutterRef.current) {
      leftUpperShutterRef.current.position.y = THREE.MathUtils.lerp(leftUpperShutterRef.current.position.y, targetLeftUpperY, 22 * delta);
    }
    if (leftLowerShutterRef.current) {
      leftLowerShutterRef.current.position.y = THREE.MathUtils.lerp(leftLowerShutterRef.current.position.y, targetLeftLowerY, 22 * delta);
    }
    if (rightUpperShutterRef.current) {
      rightUpperShutterRef.current.position.y = THREE.MathUtils.lerp(rightUpperShutterRef.current.position.y, targetRightUpperY, 22 * delta);
    }
    if (rightLowerShutterRef.current) {
      rightLowerShutterRef.current.position.y = THREE.MathUtils.lerp(rightLowerShutterRef.current.position.y, targetRightLowerY, 22 * delta);
    }

    // Articulate Ocular Sockets (subtle vertical compression with squint)
    if (leftEyeGroupRef.current) {
      const leftSquint = (isPetting || isAffirmative) ? 0.90 : THREE.MathUtils.lerp(0.88, 1.05, Math.min(1.4, effectiveLeftOpen) / 1.4);
      leftEyeGroupRef.current.scale.y = THREE.MathUtils.lerp(leftEyeGroupRef.current.scale.y, leftSquint, 16 * delta);
    }
    if (rightEyeGroupRef.current) {
      const rightSquint = (isPetting || isAffirmative) ? 0.90 : THREE.MathUtils.lerp(0.88, 1.05, Math.min(1.4, effectiveRightOpen) / 1.4);
      rightEyeGroupRef.current.scale.y = THREE.MathUtils.lerp(rightEyeGroupRef.current.scale.y, rightSquint, 16 * delta);
    }

    // 5. Dual Tactical HUD Reticle Counter-Rotation
    if (leftReticleRef.current) leftReticleRef.current.rotation.z = time * 0.35;
    if (leftInnerReticleRef.current) leftInnerReticleRef.current.rotation.z = -time * 0.6;
    if (rightReticleRef.current) rightReticleRef.current.rotation.z = -time * 0.35;
    if (rightInnerReticleRef.current) rightInnerReticleRef.current.rotation.z = time * 0.6;

    // 6. Articulated Eyebrow Kinematics
    let targetLeftBrowY = isAsleep ? 0 : isFeeding ? -0.15 : isPetting ? 0.08 : isPoked ? 0.22 : (expression?.leftBrowRaise ?? 0) * 0.25;
    let targetLeftBrowRot = isAsleep ? 0 : isFeeding ? -0.1 : isPetting ? -0.15 : isPoked ? -0.2 : (expression?.leftBrowRaise ?? 0) * 0.25;

    let targetRightBrowY = isAsleep ? 0 : isFeeding ? -0.15 : isPetting ? 0.08 : isPoked ? 0.22 : (expression?.rightBrowRaise ?? 0) * 0.25;
    let targetRightBrowRot = isAsleep ? 0 : isFeeding ? 0.1 : isPetting ? 0.15 : isPoked ? 0.2 : -(expression?.rightBrowRaise ?? 0) * 0.25;

    if (character === 'pensive') {
      targetLeftBrowY += 0.12; targetLeftBrowRot -= 0.1;
      targetRightBrowY -= 0.08; targetRightBrowRot -= 0.2;
    }
    if (character === 'furious' && !isAsleep) {
      targetLeftBrowY -= 0.25; targetLeftBrowRot += 0.35;
      targetRightBrowY -= 0.25; targetRightBrowRot -= 0.35;
    }

    if (leftBrowRef.current) {
      leftBrowRef.current.position.y = THREE.MathUtils.lerp(leftBrowRef.current.position.y, 1.05 + targetLeftBrowY, 14 * delta);
      leftBrowRef.current.rotation.z = THREE.MathUtils.lerp(leftBrowRef.current.rotation.z, targetLeftBrowRot, 14 * delta);
    }
    if (rightBrowRef.current) {
      rightBrowRef.current.position.y = THREE.MathUtils.lerp(rightBrowRef.current.position.y, 1.05 + targetRightBrowY, 14 * delta);
      rightBrowRef.current.rotation.z = THREE.MathUtils.lerp(rightBrowRef.current.rotation.z, targetRightBrowRot, 14 * delta);
    }

    // 7. Articulated Mandible (Jaw Speech & Reactivity)
    const jawDrop = isSpeaking
      ? 0.06 + Math.abs(Math.sin(time * 18)) * 0.08 + micVolume * 0.22
      : isPoked ? 0.12 : 0;

    if (mandibleRef.current) {
      mandibleRef.current.position.y = THREE.MathUtils.lerp(mandibleRef.current.position.y, -1.05 - jawDrop, 18 * delta);
      mandibleRef.current.rotation.x = THREE.MathUtils.lerp(mandibleRef.current.rotation.x, jawDrop * 0.6, 18 * delta);
    }

    // Mandible Hydraulic Dampers Articulation
    if (leftDamperRef.current) {
      leftDamperRef.current.scale.y = THREE.MathUtils.lerp(leftDamperRef.current.scale.y, 1 + jawDrop * 2.5, 18 * delta);
    }
    if (rightDamperRef.current) {
      rightDamperRef.current.scale.y = THREE.MathUtils.lerp(rightDamperRef.current.scale.y, 1 + jawDrop * 2.5, 18 * delta);
    }

    // 8. Acoustic Vocoder Equalizer Bars (Speech Synthesis Matrix)
    const numBars = 7;
    for (let i = 0; i < numBars; i++) {
      const bar = vocoderBarsRef.current[i];
      if (!bar) continue;

      const normX = (i - 3) / 3;
      let targetHeight = 0.08;
      let targetY = 0;

      if (isAsleep) {
        targetHeight = 0.04;
        targetY = 0;
      } else if (isPetting || isAffirmative) {
        targetY = Math.pow(Math.abs(normX), 1.8) * 0.14;
        targetHeight = 0.12 + (1 - Math.abs(normX)) * 0.1;
      } else if (isSpeaking) {
        const wave = Math.sin(time * 24 + i * 1.3);
        const intensity = (0.2 + Math.abs(wave) * 0.5) * (1 + micVolume * 2.8);
        targetHeight = Math.max(0.08, Math.min(0.65, intensity));
        targetY = 0;
      } else {
        const idleWave = Math.sin(time * 3.5 + Math.abs(normX) * 2.5) * 0.03;
        targetHeight = 0.08 + (expression?.mouthOpen ?? 0) * 0.35 + micVolume * 1.5 + idleWave;
        targetY = 0;
      }

      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetHeight * 8, 22 * delta);
      bar.position.y = THREE.MathUtils.lerp(bar.position.y, targetY, 22 * delta);
    }

    // 9. Temple Audio Nodes Level Meters
    const volLevel = Math.min(3, Math.floor(micVolume * 8));
    for (let i = 0; i < 3; i++) {
      const leftBar = leftEarBarsRef.current[i];
      const rightBar = rightEarBarsRef.current[i];
      const active = i <= volLevel || isSpeaking;
      const targetScale = active ? 1.0 : 0.2;
      if (leftBar) leftBar.scale.y = THREE.MathUtils.lerp(leftBar.scale.y, targetScale, 20 * delta);
      if (rightBar) rightBar.scale.y = THREE.MathUtils.lerp(rightBar.scale.y, targetScale, 20 * delta);
    }

    // 10. LiDAR Optical Sweep Beam
    if (lidarSweepRef.current) {
      lidarSweepRef.current.position.x = Math.sin(time * 4) * 0.18;
    }

    // 11. Cortex Neural Processor Activity Pulse
    if (cortexCoreRef.current) {
      const pulseSpeed = isSpeaking ? 12 : 3;
      const pulse = 1 + Math.sin(time * pulseSpeed) * (isSpeaking ? 0.15 : 0.05);
      cortexCoreRef.current.scale.set(pulse, pulse, 1);
    }

    // 12. Floating Holographic Halos
    if (haloGroupRef.current) {
      haloGroupRef.current.rotation.z = time * 0.18;
      haloGroupRef.current.rotation.x = Math.sin(time * 0.8) * 0.04;
    }
    if (haloInnerRingRef.current) {
      haloInnerRingRef.current.rotation.z = -time * 0.32;
    }

    // 13. Floating Hologram Base Datum Ring
    if (orbitalRingRef.current) {
      orbitalRingRef.current.rotation.z = -time * 0.25;
    }
  });

  // Modern cybernetic materials
  const armorMatProps = {
    color: '#050c12',
    roughness: 0.25,
    metalness: 0.85,
    transparent: true,
    opacity: screenFlicker ? 0.65 : 0.8,
  };

  const glowCoreMatProps = {
    color: currentTheme,
    toneMapped: false,
  };

  return (
    <group ref={groupRef} position={isPresenting ? [0, 1.5, -0.8] : [0, 0.45, 0]} scale={isPresenting ? [0.3, 0.3, 0.3] : [1, 1, 1]}>
      {/* ─── HOLOGRAPHIC EMITTER PEDESTAL ─── */}
      <group position={[0, -2.5, 0]}>
        {/* Main Base Chassis */}
        <Cylinder args={[2.1, 2.35, 0.25, 48]} position={[0, -0.15, 0]}>
          <meshStandardMaterial color="#080e14" roughness={0.4} metalness={0.9} />
          <Edges threshold={15} color={edgeColor} />
        </Cylinder>

        {/* Concentric Emitter Channel Ring */}
        <Cylinder args={[1.75, 1.75, 0.05, 48]} position={[0, 0.02, 0]}>
          <meshBasicMaterial color={currentTheme} transparent opacity={0.3} />
          <Edges threshold={15} color={edgeColor} />
        </Cylinder>

        {/* Core Emitter Projector Lens */}
        <Cylinder args={[1.2, 1.2, 0.08, 36]} position={[0, 0.05, 0]}>
          <meshBasicMaterial color="#020508" />
          <Edges threshold={15} color={edgeColor} />
        </Cylinder>

        {/* 4 Cardinal Hologram Beacons */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <group key={i} position={[Math.cos(angle) * 1.5, 0.06, Math.sin(angle) * 1.5]}>
            <Cylinder args={[0.08, 0.08, 0.12, 16]}>
              <meshBasicMaterial color={edgeColor} />
            </Cylinder>
          </group>
        ))}

        {/* Floating Holographic Datum Ring */}
        <mesh ref={orbitalRingRef} position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.45, 1.5, 48]} />
          <meshBasicMaterial color={edgeColor} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Cyber Grid Floor */}
      <Grid position={[0, -2.48, 0]} args={[12, 12]} cellColor={edgeColor} sectionColor={edgeColor} sectionSize={1} cellSize={0.25} fadeDistance={4.5} cellThickness={0.4} sectionThickness={0.8} />

      {/* Holographic Ambient Particle Field */}
      <Sparkles count={55} scale={4.5} size={1.8} speed={0.25} opacity={0.45} color={edgeColor} />

      {/* Floating Articulated Cyber Avatar */}
      <Float speed={isAsleep ? 1 : 3.5} rotationIntensity={0.08} floatIntensity={isAsleep ? 0.15 : 0.6}>
        <group ref={headRef}>
          {/* ─── 0. TACTICAL HOLOGRAPHIC HALO (Crown HUD Telemetry) ─── */}
          <group position={[0, 2.45, -0.2]}>
            <group ref={haloGroupRef}>
              {/* Outer Segmented Ring */}
              <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
                <ringGeometry args={[1.5, 1.54, 48]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
              {/* 8 Cardinal Nav Ticks */}
              {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4].map((ang, i) => (
                <mesh key={i} position={[Math.cos(ang) * 1.52, Math.sin(ang) * 0.35, Math.sin(ang) * 0.7]}>
                  <boxGeometry args={[0.04, 0.04, 0.04]} />
                  <meshBasicMaterial color={edgeColor} />
                </mesh>
              ))}
            </group>

            {/* Counter-Rotating Inner Dotted Frequency Ring */}
            <group ref={haloInnerRingRef}>
              <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
                <ringGeometry args={[1.2, 1.23, 36]} />
                <meshBasicMaterial color={currentTheme} transparent opacity={0.35} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>

          {/* ─── 1. CRANIUM & TEMPORAL ARCHITECTURE ─── */}
          {/* Upper Forehead Brow Armor Plate */}
          <RoundedBox args={[2.5, 0.75, 0.6]} radius={0.1} smoothness={2} position={[0, 1.45, 0.1]} rotation={[-0.14, 0, 0]}>
            <meshStandardMaterial {...armorMatProps} />
            <Edges threshold={15} color={edgeColor} />
          </RoundedBox>

          {/* Cranial Top Dome Shell */}
          <RoundedBox args={[2.7, 1.3, 1.7]} radius={0.3} smoothness={3} position={[0, 1.6, -0.4]} rotation={[-0.08, 0, 0]}>
            <meshStandardMaterial {...armorMatProps} />
            <Edges threshold={15} color={edgeColor} />
          </RoundedBox>

          {/* Forehead Neural Cortex Processor Core */}
          <group position={[0, 1.75, 0.38]} rotation={[-0.14, 0, 0]}>
            <RoundedBox ref={cortexCoreRef} args={[0.65, 0.22, 0.08]} radius={0.03} smoothness={2}>
              <meshBasicMaterial {...glowCoreMatProps} />
            </RoundedBox>
            {/* 3 Cortex Status Diodes (TX, RX, SYS) */}
            {[-0.2, 0, 0.2].map((xOff, i) => (
              <mesh key={i} position={[xOff, 0, 0.05]}>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}
          </group>

          {/* Left Temporal Armor Plate */}
          <RoundedBox args={[0.45, 1.1, 0.9]} radius={0.1} smoothness={2} position={[-1.5, 0.8, -0.1]} rotation={[0, 0.22, 0.08]}>
            <meshStandardMaterial {...armorMatProps} />
            <Edges threshold={15} color={edgeColor} />
          </RoundedBox>

          {/* Left Cooling Vents (3 Stepped Heat Fins) */}
          <group position={[-1.68, 0.9, -0.1]} rotation={[0, 0.22, 0.08]}>
            {[-0.14, 0, 0.14].map((yOff, i) => (
              <mesh key={i} position={[0, yOff, 0]}>
                <boxGeometry args={[0.05, 0.06, 0.45]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.65} />
              </mesh>
            ))}
          </group>

          {/* Right Temporal Armor Plate */}
          <RoundedBox args={[0.45, 1.1, 0.9]} radius={0.1} smoothness={2} position={[1.5, 0.8, -0.1]} rotation={[0, -0.22, -0.08]}>
            <meshStandardMaterial {...armorMatProps} />
            <Edges threshold={15} color={edgeColor} />
          </RoundedBox>

          {/* Right Cooling Vents (3 Stepped Heat Fins) */}
          <group position={[1.68, 0.9, -0.1]} rotation={[0, -0.22, -0.08]}>
            {[-0.14, 0, 0.14].map((yOff, i) => (
              <mesh key={i} position={[0, yOff, 0]}>
                <boxGeometry args={[0.05, 0.06, 0.45]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.65} />
              </mesh>
            ))}
          </group>

          {/* Left Cheekbone Facet Plate */}
          <RoundedBox args={[0.7, 0.95, 0.45]} radius={0.08} smoothness={2} position={[-1.15, -0.15, 0.25]} rotation={[0.12, 0.22, -0.16]}>
            <meshStandardMaterial {...armorMatProps} />
            <Edges threshold={15} color={edgeColor} />
          </RoundedBox>

          {/* Right Cheekbone Facet Plate */}
          <RoundedBox args={[0.7, 0.95, 0.45]} radius={0.08} smoothness={2} position={[1.15, -0.15, 0.25]} rotation={[0.12, -0.22, 0.16]}>
            <meshStandardMaterial {...armorMatProps} />
            <Edges threshold={15} color={edgeColor} />
          </RoundedBox>

          {/* ─── 2. LATERAL AUDIO SENSOR NODES (Ear Pods & EQ Meters) ─── */}
          {/* Left Ear Node */}
          <group position={[-1.68, 0.35, -0.15]} rotation={[0, 0, Math.PI / 2]}>
            <Cylinder args={[0.38, 0.38, 0.25, 24]}>
              <meshStandardMaterial color="#0a1218" roughness={0.3} metalness={0.9} />
              <Edges threshold={15} color={edgeColor} />
            </Cylinder>
            {/* 3-Step Dynamic Audio Level Bars */}
            {[-0.14, 0, 0.14].map((yOff, i) => (
              <mesh 
                key={i} 
                ref={(el) => (leftEarBarsRef.current[i] = el)} 
                position={[yOff, 0.14, 0]}
              >
                <boxGeometry args={[0.06, 0.22, 0.06]} />
                <meshBasicMaterial color={edgeColor} />
              </mesh>
            ))}
          </group>

          {/* Right Ear Node */}
          <group position={[1.68, 0.35, -0.15]} rotation={[0, 0, -Math.PI / 2]}>
            <Cylinder args={[0.38, 0.38, 0.25, 24]}>
              <meshStandardMaterial color="#0a1218" roughness={0.3} metalness={0.9} />
              <Edges threshold={15} color={edgeColor} />
            </Cylinder>
            {[-0.14, 0, 0.14].map((yOff, i) => (
              <mesh 
                key={i} 
                ref={(el) => (rightEarBarsRef.current[i] = el)} 
                position={[yOff, 0.14, 0]}
              >
                <boxGeometry args={[0.06, 0.22, 0.06]} />
                <meshBasicMaterial color={edgeColor} />
              </mesh>
            ))}
          </group>

          {/* ─── 3. ARTICULATED CYBERNETIC EYEBROWS ─── */}
          {/* Left Eyebrow Assembly */}
          <group ref={leftBrowRef} position={[-0.88, 1.05, 0.42]}>
            <RoundedBox args={[1.05, 0.15, 0.2]} radius={0.04} smoothness={2} rotation={[0, 0.08, -0.05]}>
              <meshStandardMaterial {...armorMatProps} />
              <Edges threshold={15} color={edgeColor} />
            </RoundedBox>
            <mesh position={[0, -0.06, 0.04]} rotation={[0, 0.08, -0.05]}>
              <boxGeometry args={[0.85, 0.03, 0.08]} />
              <meshBasicMaterial color={edgeColor} />
            </mesh>
          </group>

          {/* Right Eyebrow Assembly */}
          <group ref={rightBrowRef} position={[0.88, 1.05, 0.42]}>
            <RoundedBox args={[1.05, 0.15, 0.2]} radius={0.04} smoothness={2} rotation={[0, -0.08, 0.05]}>
              <meshStandardMaterial {...armorMatProps} />
              <Edges threshold={15} color={edgeColor} />
            </RoundedBox>
            <mesh position={[0, -0.06, 0.04]} rotation={[0, -0.08, 0.05]}>
              <boxGeometry args={[0.85, 0.03, 0.08]} />
              <meshBasicMaterial color={edgeColor} />
            </mesh>
          </group>

          {/* ─── 4. HIGH-TECH OCULAR VISION SYSTEMS (Left & Right Eyes) ─── */}
          {/* LEFT OCULAR ASSEMBLY */}
          <group ref={leftEyeGroupRef} position={[-0.88, 0.48, 0.35]}>
            {/* Recessed Dark Ocular Socket */}
            <mesh position={[0, 0, -0.08]}>
              <cylinderGeometry args={[0.54, 0.48, 0.25, 32]} />
              <meshStandardMaterial color="#020609" roughness={0.6} metalness={0.9} />
              <Edges threshold={15} color={edgeColor} />
            </mesh>

            {/* Rotating Outer Tactical HUD Reticle */}
            <group ref={leftReticleRef}>
              <mesh position={[0, 0, 0.08]}>
                <ringGeometry args={[0.48, 0.52, 32]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.65} side={THREE.DoubleSide} />
              </mesh>
              {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
                <mesh key={i} position={[Math.cos(ang) * 0.55, Math.sin(ang) * 0.55, 0.08]}>
                  <boxGeometry args={[0.04, 0.08, 0.01]} />
                  <meshBasicMaterial color={edgeColor} />
                </mesh>
              ))}
            </group>

            {/* Counter-Rotating Inner Vernier Dial */}
            <group ref={leftInnerReticleRef}>
              <mesh position={[0, 0, 0.06]}>
                <ringGeometry args={[0.36, 0.38, 24]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.4} side={THREE.DoubleSide} />
              </mesh>
            </group>

            {/* Concentric Aperture Iris Ring */}
            <mesh ref={leftIrisRef} position={[0, 0, 0.04]}>
              <ringGeometry args={[0.26, 0.42, 24]} />
              <meshBasicMaterial color={currentTheme} transparent opacity={0.35} side={THREE.DoubleSide} />
              <Edges threshold={10} color={edgeColor} />
            </mesh>

            {/* Tracking Optic Pupil Core */}
            <mesh ref={leftPupilRef} position={[0, 0, 0.05]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshBasicMaterial {...glowCoreMatProps} />
              {/* Pupil Specular Glint Lens */}
              <mesh position={[0.05, 0.05, 0.14]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </mesh>

            {/* Upper Robotic Shutter Blade */}
            <mesh ref={leftUpperShutterRef} position={[0, 0.36, 0.1]}>
              <boxGeometry args={[0.9, 0.36, 0.08]} />
              <meshStandardMaterial {...armorMatProps} />
              <Edges threshold={15} color={edgeColor} />
            </mesh>

            {/* Lower Robotic Shutter Blade */}
            <mesh ref={leftLowerShutterRef} position={[0, -0.32, 0.1]}>
              <boxGeometry args={[0.9, 0.28, 0.08]} />
              <meshStandardMaterial {...armorMatProps} />
              <Edges threshold={15} color={edgeColor} />
            </mesh>

            {/* Sub-Ocular Telemetry Micro-Indicator */}
            <group position={[0, -0.54, 0.08]}>
              <mesh>
                <planeGeometry args={[0.42, 0.04]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.45} />
              </mesh>
            </group>
          </group>

          {/* RIGHT OCULAR ASSEMBLY */}
          <group ref={rightEyeGroupRef} position={[0.88, 0.48, 0.35]}>
            <mesh position={[0, 0, -0.08]}>
              <cylinderGeometry args={[0.54, 0.48, 0.25, 32]} />
              <meshStandardMaterial color="#020609" roughness={0.6} metalness={0.9} />
              <Edges threshold={15} color={edgeColor} />
            </mesh>

            <group ref={rightReticleRef}>
              <mesh position={[0, 0, 0.08]}>
                <ringGeometry args={[0.48, 0.52, 32]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.65} side={THREE.DoubleSide} />
              </mesh>
              {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
                <mesh key={i} position={[Math.cos(ang) * 0.55, Math.sin(ang) * 0.55, 0.08]}>
                  <boxGeometry args={[0.04, 0.08, 0.01]} />
                  <meshBasicMaterial color={edgeColor} />
                </mesh>
              ))}
            </group>

            <group ref={rightInnerReticleRef}>
              <mesh position={[0, 0, 0.06]}>
                <ringGeometry args={[0.36, 0.38, 24]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.4} side={THREE.DoubleSide} />
              </mesh>
            </group>

            <mesh ref={rightIrisRef} position={[0, 0, 0.04]}>
              <ringGeometry args={[0.26, 0.42, 24]} />
              <meshBasicMaterial color={currentTheme} transparent opacity={0.35} side={THREE.DoubleSide} />
              <Edges threshold={10} color={edgeColor} />
            </mesh>

            <mesh ref={rightPupilRef} position={[0, 0, 0.05]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshBasicMaterial {...glowCoreMatProps} />
              <mesh position={[0.05, 0.05, 0.14]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </mesh>

            <mesh ref={rightUpperShutterRef} position={[0, 0.36, 0.1]}>
              <boxGeometry args={[0.9, 0.36, 0.08]} />
              <meshStandardMaterial {...armorMatProps} />
              <Edges threshold={15} color={edgeColor} />
            </mesh>

            <mesh ref={rightLowerShutterRef} position={[0, -0.32, 0.1]}>
              <boxGeometry args={[0.9, 0.28, 0.08]} />
              <meshStandardMaterial {...armorMatProps} />
              <Edges threshold={15} color={edgeColor} />
            </mesh>

            <group position={[0, -0.54, 0.08]}>
              <mesh>
                <planeGeometry args={[0.42, 0.04]} />
                <meshBasicMaterial color={edgeColor} transparent opacity={0.45} />
              </mesh>
            </group>
          </group>

          {/* ─── 4.5 CENTRAL NASAL SENSOR RIDGE & OPTICAL LIDAR ─── */}
          <group position={[0, 0.05, 0.42]}>
            {/* Chamfered Nose Bridge Chassis */}
            <RoundedBox args={[0.42, 0.58, 0.28]} radius={0.06} smoothness={2} rotation={[0.15, 0, 0]}>
              <meshStandardMaterial {...armorMatProps} />
              <Edges threshold={15} color={edgeColor} />
            </RoundedBox>

            {/* Recessed LiDAR Horizontal Scanner Trench */}
            <mesh position={[0, 0.06, 0.15]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.36, 0.045, 0.02]} />
              <meshBasicMaterial color="#020406" />
            </mesh>

            {/* Dynamic Sweeping LiDAR Laser Point */}
            <mesh ref={lidarSweepRef} position={[0, 0.06, 0.16]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.08, 0.05, 0.02]} />
              <meshBasicMaterial color={edgeColor} />
            </mesh>

            {/* Dual Micro Atmospheric Intake Ports */}
            {[-0.09, 0.09].map((xOff, i) => (
              <mesh key={i} position={[xOff, -0.22, 0.12]} rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.05, 12]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
            ))}
          </group>

          {/* ─── 5. ACOUSTIC VOCODER GRILLE (Detailed AI Voice Matrix) ─── */}
          <group position={[0, -0.65, 0.4]}>
            {/* Vocoder Aperture Bezel Housing */}
            <RoundedBox args={[1.35, 0.65, 0.18]} radius={0.05} smoothness={2} position={[0, 0, 0]}>
              <meshStandardMaterial color="#03080c" roughness={0.4} metalness={0.9} />
              <Edges threshold={15} color={edgeColor} />
            </RoundedBox>

            {/* Recessed Acoustic Mesh Grille Backdrop */}
            <mesh position={[0, 0, 0.04]}>
              <planeGeometry args={[1.15, 0.45]} />
              <meshBasicMaterial color="#010406" />
            </mesh>

            {/* 7 Vertical Equalizer Frequency Bars */}
            {[-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45].map((xOff, i) => (
              <mesh
                key={i}
                ref={(el) => (vocoderBarsRef.current[i] = el)}
                position={[xOff, 0, 0.08]}
              >
                <boxGeometry args={[0.07, 0.08, 0.04]} />
                <meshBasicMaterial {...glowCoreMatProps} />
              </mesh>
            ))}
          </group>

          {/* ─── 6. ARTICULATED MANDIBLE (Jaw & Chin Chassis) ─── */}
          <group ref={mandibleRef} position={[0, -1.05, 0.1]}>
            {/* Lower Mandible Armor Plate */}
            <RoundedBox args={[1.3, 0.55, 0.65]} radius={0.12} smoothness={2} position={[0, -0.28, 0.18]} rotation={[0.2, 0, 0]}>
              <meshStandardMaterial {...armorMatProps} />
              <Edges threshold={15} color={edgeColor} />
            </RoundedBox>

            {/* Central Power Conduit Crystal / Status Notch */}
            <mesh position={[0, -0.38, 0.52]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.28, 0.08, 0.06]} />
              <meshBasicMaterial {...glowCoreMatProps} />
            </mesh>

            {/* Lateral Mandible Struts to Neck */}
            <mesh position={[-0.65, -0.15, 0.05]} rotation={[0.2, 0.2, -0.2]}>
              <boxGeometry args={[0.15, 0.35, 0.3]} />
              <meshStandardMaterial {...armorMatProps} />
            </mesh>
            <mesh position={[0.65, -0.15, 0.05]} rotation={[0.2, -0.2, 0.2]}>
              <boxGeometry args={[0.15, 0.35, 0.3]} />
              <meshStandardMaterial {...armorMatProps} />
            </mesh>

            {/* Left Cheek-to-Mandible Hydraulic Damper */}
            <mesh ref={leftDamperRef} position={[-0.72, 0.08, 0.2]} rotation={[0.1, 0, -0.15]}>
              <cylinderGeometry args={[0.035, 0.035, 0.35, 12]} />
              <meshStandardMaterial color="#0e171f" roughness={0.2} metalness={0.95} />
              <Edges threshold={15} color={edgeColor} />
            </mesh>

            {/* Right Cheek-to-Mandible Hydraulic Damper */}
            <mesh ref={rightDamperRef} position={[0.72, 0.08, 0.2]} rotation={[0.1, 0, 0.15]}>
              <cylinderGeometry args={[0.035, 0.035, 0.35, 12]} />
              <meshStandardMaterial color="#0e171f" roughness={0.2} metalness={0.95} />
              <Edges threshold={15} color={edgeColor} />
            </mesh>
          </group>

          {/* ─── 7. GIMBAL NECK & BIOMECHANICAL CERVICAL SPINE ─── */}
          <group position={[0, -1.65, -0.1]}>
            {/* Central Spherical Gimbal Joint */}
            <Sphere args={[0.42, 20, 20]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#060e14" roughness={0.3} metalness={0.9} />
              <Edges threshold={15} color={edgeColor} />
            </Sphere>

            {/* Segmented Biomechanical Cervical Spine Column (C1 to C4) */}
            <group position={[0, 0.2, -0.28]}>
              {[0, 1, 2, 3].map((idx) => (
                <group
                  key={idx}
                  ref={(el) => (spineVertebraeRefs.current[idx] = el)}
                  position={[0, -idx * 0.16, 0]}
                >
                  <RoundedBox args={[0.55 - idx * 0.04, 0.09, 0.28]} radius={0.02} smoothness={2}>
                    <meshStandardMaterial color="#081018" roughness={0.3} metalness={0.9} />
                    <Edges threshold={15} color={edgeColor} />
                  </RoundedBox>
                  {/* Central Spine Spinal Cord Luminescence */}
                  <mesh position={[0, 0, 0.14]}>
                    <boxGeometry args={[0.08, 0.06, 0.02]} />
                    <meshBasicMaterial color={edgeColor} />
                  </mesh>
                </group>
              ))}
            </group>

            {/* Twin High-Tensile Conduit Cables (Left & Right of Spine) */}
            <mesh position={[-0.32, -0.05, -0.22]} rotation={[0, 0, 0.12]}>
              <cylinderGeometry args={[0.03, 0.03, 0.65, 10]} />
              <meshStandardMaterial color="#03080e" roughness={0.5} metalness={0.8} />
            </mesh>
            <mesh position={[0.32, -0.05, -0.22]} rotation={[0, 0, -0.12]}>
              <cylinderGeometry args={[0.03, 0.03, 0.65, 10]} />
              <meshStandardMaterial color="#03080e" roughness={0.5} metalness={0.8} />
            </mesh>

            {/* Left Hydraulic Cylinder Actuator */}
            <Cylinder args={[0.07, 0.07, 0.85, 12]} position={[-0.75, 0.05, 0.05]} rotation={[0, 0, 0.22]}>
              <meshStandardMaterial color="#0a1218" roughness={0.2} metalness={0.9} />
              <Edges threshold={15} color={edgeColor} />
            </Cylinder>

            {/* Right Hydraulic Cylinder Actuator */}
            <Cylinder args={[0.07, 0.07, 0.85, 12]} position={[0.75, 0.05, 0.05]} rotation={[0, 0, -0.22]}>
              <meshStandardMaterial color="#0a1218" roughness={0.2} metalness={0.9} />
              <Edges threshold={15} color={edgeColor} />
            </Cylinder>

            {/* Base Collar Ring */}
            <Cylinder args={[1.35, 1.5, 0.16, 32]} position={[0, -0.4, 0]}>
              <meshStandardMaterial color="#050b10" roughness={0.4} metalness={0.85} />
              <Edges threshold={15} color={edgeColor} />
            </Cylinder>
          </group>
        </group>
      </Float>
    </group>
  );
}

interface PetFaceProps {
  isSpeaking: boolean;
  isDistracted: boolean;
  lookOffset?: { x: number; y: number };
  expression?: {
    leftEyeOpen: number;   // 0 (closed) to 1 (fully open)
    rightEyeOpen: number;  // 0 to 1
    leftBrowRaise: number; // -1 (frown) to 1 (raised)
    rightBrowRaise: number;// -1 to 1
    mouthOpen: number;     // 0 to 1
  };
  micVolume?: number;
  micPitch?: number;
  isCalibrating?: boolean;
  isAsleep?: boolean;
  onWake?: () => void;
  // OLED Realistic Customizations
  oledTheme?: 'split' | 'cyan' | 'amber' | 'green' | 'white' | 'dynamic';
  character?: 'classic' | 'cyber' | 'kawaii' | 'pensive' | 'furious' | 'chaotic';
  pixelGrid?: boolean;
  glassShine?: boolean;
  showPCB?: boolean;
  brightness?: number;
  screenFlicker?: boolean;
  isNightTime?: boolean;
  isAffirmative?: boolean;
}

export function PetFace({ 
  isSpeaking, 
  isDistracted, 
  lookOffset = { x: 0, y: 0 }, 
  expression, 
  micVolume = 0, 
  micPitch = 0,
  isCalibrating = false, 
  isAsleep = false, 
  onWake,
  oledTheme = 'split',
  character = 'classic',
  pixelGrid = true,
  glassShine = true,
  showPCB = true,
  brightness = 100,
  screenFlicker = true,
  isNightTime = false,
  isAffirmative = false
}: PetFaceProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [isNudging, setIsNudging] = useState(false);
  const [pixelShift, setPixelShift] = useState({ x: 0, y: 0 });
  const [idleOffset, setIdleOffset] = useState({ x: 0, y: 0 });

  const swipeRef = useRef({ x: 0, y: 0, dist: 0 });
  const petTimeoutRef = useRef<any>(null);
  const idleIntervalRef = useRef<any>(null);
  const interactionTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // OLED Burn-in protection: slightly shift the face every 10 seconds
    const shiftInterval = setInterval(() => {
      setPixelShift({
        x: Math.floor(Math.random() * 6) - 3, // -3px to +3px
        y: Math.floor(Math.random() * 6) - 3,
      });
    }, 10000);
    return () => clearInterval(shiftInterval);
  }, []);

  useEffect(() => {
    // Random blinking overlay to feel alive
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.4 && !isPoked && !isAsleep && !isFeeding && !isPetting) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
      }
    }, 2500);
    return () => clearInterval(blinkInterval);
  }, [isPoked, isAsleep, isFeeding, isPetting]);

  useEffect(() => {
    if (isDistracted && !isAsleep) {
      idleIntervalRef.current = setInterval(() => {
        setIdleOffset({
          x: (Math.random() - 0.5) * 40,
          y: (Math.random() - 0.5) * 20,
        });
      }, 2000);
    } else {
      setIdleOffset({ x: 0, y: 0 });
      if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
    }
    return () => clearInterval(idleIntervalRef.current);
  }, [isDistracted, isAsleep]);

  // Gentle tactile haptic feedback on mobile devices using standard Vibration API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (isBlinking) {
        navigator.vibrate(10); // Super subtle 10ms crisp tap when the pet blinks
      }
    }
  }, [isBlinking]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (isPoked) {
        navigator.vibrate([35, 40, 35]); // Sensation of physical touch/poke collision
      } else if (isPetting) {
        navigator.vibrate([15, 60, 15]); // Gentle stroke/petting ripple feel
      } else if (isFeeding) {
        navigator.vibrate([25, 30, 25, 30, 25]); // Rhythmic chewing/swallowing rumble
      } else if (isNudging) {
        navigator.vibrate([20, 50]); // Dual nudge tap
      }
    }
  }, [isPoked, isPetting, isFeeding, isNudging]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (isAsleep) {
        navigator.vibrate([40, 120, 40]); // Slow smooth transition as pet drifts off
      } else {
        navigator.vibrate(40); // Standard quick wake up hum
      }
    }
  }, [isAsleep]);

  const prevCharacterRef = useRef(character);
  useEffect(() => {
    if (character !== prevCharacterRef.current) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 15, 20]); // Light double-click feel when switching expression themes
      }
      prevCharacterRef.current = character;
    }
  }, [character]);

  useEffect(() => {
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    if (!isSpeaking && !isAsleep && !isPoked && !isPetting && !isFeeding && !isDistracted) {
      interactionTimeoutRef.current = setTimeout(() => {
        if (Math.random() > 0.4) {
          setIsNudging(true);
          setTimeout(() => setIsNudging(false), 600);
        } else {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 150);
        }
      }, 5000);
    }
    return () => clearTimeout(interactionTimeoutRef.current);
  }, [isSpeaking, lookOffset.x, lookOffset.y, isAsleep, isPoked, isPetting, isFeeding, isDistracted]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (onWake) onWake();
    swipeRef.current = { x: e.clientX, y: e.clientY, dist: 0 };
    if (isPoked || isFeeding || isPetting) return;
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 600);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) {
      const dx = e.clientX - swipeRef.current.x;
      const dy = e.clientY - swipeRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        swipeRef.current.dist += dist;
        swipeRef.current.x = e.clientX;
        swipeRef.current.y = e.clientY;

        if (swipeRef.current.dist > 150) {
           setIsPetting(true);
           if (onWake) onWake();
           clearTimeout(petTimeoutRef.current);
           petTimeoutRef.current = setTimeout(() => {
             setIsPetting(false);
             swipeRef.current.dist = 0;
           }, 1500);
        }
      }
    }
  };

  const handleFeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWake) onWake();
    if (isFeeding) return;
    setIsFeeding(true);
    setTimeout(() => setIsFeeding(false), 3000);
  };

  // Interpolate eyebrow transformations
  let leftBrowY = isAsleep ? 4 : isFeeding ? -15 : isPetting ? -8 : isPoked ? 0 : isDistracted ? -4 : -8 - (expression?.leftBrowRaise ?? 0) * 8;
  let leftBrowRotate = isAsleep ? 0 : isFeeding ? -15 : isPetting ? -25 : isPoked ? -20 : isDistracted ? -15 : (expression?.leftBrowRaise ?? 0) * 15;

  let rightBrowY = isAsleep ? 4 : isFeeding ? -15 : isPetting ? -8 : isPoked ? 0 : isDistracted ? -4 : -8 - (expression?.rightBrowRaise ?? 0) * 8;
  let rightBrowRotate = isAsleep ? 0 : isFeeding ? 15 : isPetting ? 25 : isPoked ? 20 : isDistracted ? 15 : -(expression?.rightBrowRaise ?? 0) * 15;

  if (character === 'pensive' && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    leftBrowY = -24;
    leftBrowRotate = -5;
    rightBrowY = -4;
    rightBrowRotate = -25;
  } else if (character === 'furious' && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    leftBrowY = -4;
    leftBrowRotate = 25;
    rightBrowY = -4;
    rightBrowRotate = -25;
  } else if (character === 'chaotic' && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    leftBrowY = -20;
    leftBrowRotate = -30;
    rightBrowY = -16;
    rightBrowRotate = 30;
  }

  // Determine eye scales and border radii based on tracking, random blinking, and micVolume
  const baseLeftOpen = expression ? expression.leftEyeOpen : 1.0;
  const baseRightOpen = expression ? expression.rightEyeOpen : 1.0;
  const leftBrowRaise = expression?.leftBrowRaise ?? 0;
  const rightBrowRaise = expression?.rightBrowRaise ?? 0;
  const leftBrowBoost = Math.max(0, leftBrowRaise) * 0.25;
  const rightBrowBoost = Math.max(0, rightBrowRaise) * 0.25;

  let leftEyeScaleY = isBlinking ? 0.04 : (baseLeftOpen <= 0.08 ? 0.04 : Math.min(1.4, baseLeftOpen + leftBrowBoost));
  let rightEyeScaleY = isBlinking ? 0.04 : (baseRightOpen <= 0.08 ? 0.04 : Math.min(1.4, baseRightOpen + rightBrowBoost));
  let eyeBorderRadius = "4px";
  let browBorderRadius = "9999px";

  if (isAsleep) {
    leftEyeScaleY = 0.02;
    rightEyeScaleY = 0.02;
    eyeBorderRadius = "2px";
  } else if (isPetting) {
    // Happy squint
    leftEyeScaleY = 0.25;
    rightEyeScaleY = 0.25;
    eyeBorderRadius = "16px 16px 4px 4px";
  } else if (isPoked) {
    // Surprised wide eyes
    leftEyeScaleY = 1.1;
    rightEyeScaleY = 1.1;
    eyeBorderRadius = "50%";
  } else if (isFeeding) {
    // Content squint
    leftEyeScaleY = 0.2;
    rightEyeScaleY = 0.2;
    eyeBorderRadius = "8px";
  } else if (isDistracted) {
    // Droopy sad eyes
    leftEyeScaleY = 0.6;
    rightEyeScaleY = 0.6;
    eyeBorderRadius = "16px 16px 40% 40%";
  } else if (!isSpeaking && !isDistracted) {
    // Pitch-Reactive Expressions
    if (micPitch > 1000) {
      // High pitch: surprise, wide eyes
      leftEyeScaleY = 1.3;
      rightEyeScaleY = 1.3;
      eyeBorderRadius = "50%";
      leftBrowY = -24;
      rightBrowY = -24;
    } else if (micPitch > 50 && micPitch < 400 && micVolume > 0.1) {
      // Low pitch: squint / pensive
      leftEyeScaleY = 0.5;
      rightEyeScaleY = 0.5;
      eyeBorderRadius = "20%";
      leftBrowY = -4;
      leftBrowRotate = -10;
      rightBrowY = -4;
      rightBrowRotate = 10;
    } else {
      // Widen eyes slightly when user speaks normally (listening), but not if eye is closed/winking
      if (leftEyeScaleY > 0.15) {
        leftEyeScaleY = Math.min(1.5, leftEyeScaleY + micVolume * 0.3);
      }
      if (rightEyeScaleY > 0.15) {
        rightEyeScaleY = Math.min(1.5, rightEyeScaleY + micVolume * 0.3);
      }
      if (micVolume > 0.1) eyeBorderRadius = "8px 8px 12px 12px";
    }
  }

  // Character Overrides
  let eyeWidth = 56;
  if (character === 'kawaii') {
    eyeWidth = 64;
    // kawaii eyes are super round unless sleeping/squinting
    if (!isAsleep && !isBlinking && !isPetting && !isFeeding) {
      eyeBorderRadius = "50%";
    }
  } else if (character === 'cyber') {
    eyeWidth = 40;
    eyeBorderRadius = "0px";
    browBorderRadius = "0px";
  } else if (character === 'furious' && !isAsleep && !isBlinking && !isPetting && !isFeeding) {
    leftEyeScaleY = 0.4;
    rightEyeScaleY = 0.4;
    eyeBorderRadius = "0px";
  } else if (character === 'chaotic' && !isAsleep && !isBlinking && !isPetting && !isFeeding) {
    leftEyeScaleY = 1.1;
    rightEyeScaleY = 0.7;
    eyeBorderRadius = "50%";
  } else if (character === 'pensive' && !isAsleep && !isBlinking && !isPetting && !isFeeding) {
    leftEyeScaleY = 0.9;
    rightEyeScaleY = 0.6;
    eyeBorderRadius = "40%";
  }

  // Combine speaker state and mouth tracker
  let mouthAnimate: any = isAsleep
    ? { height: "8px", width: "12px", borderRadius: "4px" }
    : isPetting
      ? { height: ["12px", "20px", "12px"], width: ["28px", "36px", "28px"], borderRadius: "4px 4px 24px 24px" } // Happy smile
      : isFeeding
        ? { height: ["12px", "28px", "12px"], width: ["20px", "16px", "20px"], borderRadius: "50%" } // Chewing
        : isPoked
          ? { height: "28px", width: "24px", borderRadius: "50%" } // O-shape surprise
          : isSpeaking
            ? {
                height: ["12px", "32px", "16px", "24px"],
                width: ["24px", "40px", "32px", "36px"],
                borderRadius: ["8px", "16px", "12px", "20px"],
              }
            : isDistracted
              ? { height: "12px", width: "20px", borderRadius: "12px 12px 4px 4px" } // Sad / disconnected frown
              : {
                  height: `${8 + (expression?.mouthOpen ?? 0) * 36 + micVolume * 16}px`,
                  width: `${24 + (expression?.mouthOpen ?? 0) * 24 + micVolume * 12}px`,
                  borderRadius: (expression?.mouthOpen ?? 0) > 0.4 || micVolume > 0.2 ? "16px" : "8px",
                };

  if (character === 'kawaii') {
    if (typeof mouthAnimate.borderRadius === 'string' && !isSpeaking && !isFeeding && !isPoked && !isAsleep) {
      mouthAnimate.borderRadius = "50% 50% 16px 16px";
    }
  } else if (character === 'cyber') {
    mouthAnimate.borderRadius = "0px";
  } else if (character === 'furious' && !isSpeaking && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    mouthAnimate.height = "4px";
    mouthAnimate.width = "40px";
    mouthAnimate.borderRadius = "50% 50% 0 0";
    mouthAnimate.rotate = 0;
  } else if (character === 'chaotic' && !isSpeaking && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    mouthAnimate.height = ["8px", "12px", "4px", "8px"];
    mouthAnimate.width = ["20px", "28px", "24px", "20px"];
    mouthAnimate.rotate = [-5, 5, -5];
    mouthAnimate.borderRadius = "2px";
  } else if (character === 'pensive' && !isSpeaking && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    mouthAnimate.height = "6px";
    mouthAnimate.width = "12px";
    mouthAnimate.rotate = -15;
    mouthAnimate.x = 8;
  }

  let mouthTransition: any = isPoked 
    ? { duration: 0.4 }
    : (isSpeaking || isFeeding || isPetting) ? {
    repeat: Infinity,
    duration: isFeeding ? 0.4 : isPetting ? 2 : 0.3,
    ease: "easeInOut",
  } : {
    type: "spring",
    stiffness: 600,
    damping: 30
  };

  if (character === 'chaotic' && !isSpeaking && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    mouthTransition = { repeat: Infinity, duration: 0.15, ease: "linear" };
  }

  // Face container animations
  let faceAnimate: any = isPoked
    ? { x: [-15, 15, -10, 10, 0], y: 5 }
    : isNudging
      ? { x: [lookOffset.x, lookOffset.x + 12, lookOffset.x - 6, lookOffset.x], y: [lookOffset.y, lookOffset.y - 8, lookOffset.y + 4, lookOffset.y], rotate: [0, 8, -4, 0] }
    : isPetting
      ? { x: [-5, 5, -5, 5, 0], y: [-2, 2, -2] }
      : isCalibrating
        ? { x: [-20, 20, 10, -10, -20], y: [-5, 5, -5, 5, -5] }
        : isDistracted
          ? { x: idleOffset.x, y: idleOffset.y }
          : { x: lookOffset.x, y: lookOffset.y };

  if (character === 'chaotic' && !isAsleep) {
    faceAnimate = {
      x: [lookOffset.x - 2, lookOffset.x + 2, lookOffset.x - 1, lookOffset.x + 1, lookOffset.x],
      y: [lookOffset.y - 1, lookOffset.y + 1, lookOffset.y - 2, lookOffset.y + 2, lookOffset.y]
    };
  } else if (character === 'furious' && !isAsleep) {
    faceAnimate = {
      ...faceAnimate,
      scale: [1, 1.03, 1]
    };
  } else if (character === 'pensive' && !isAsleep) {
    faceAnimate = {
      ...faceAnimate,
      y: [lookOffset.y - 4, lookOffset.y + 4, lookOffset.y - 4],
      filter: ["blur(0.5px)", "blur(1.5px)", "blur(0.5px)"]
    };
  }

  let faceTransition: any = isPoked
    ? { duration: 0.4 }
    : isNudging
      ? { duration: 0.6, ease: "easeInOut" }
    : isPetting
      ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
      : isCalibrating
        ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        : isDistracted
          ? { type: "tween", duration: 1.5, ease: "easeInOut" }
          : { type: "spring", stiffness: 400, damping: 30 };

  if (character === 'chaotic' && !isAsleep) {
    faceTransition = { repeat: Infinity, duration: 0.15, ease: "linear" };
  } else if (character === 'furious' && !isAsleep) {
    faceTransition = { repeat: Infinity, duration: 0.3, ease: "easeInOut" };
  } else if (character === 'pensive' && !isAsleep) {
    faceTransition = { repeat: Infinity, duration: 4, ease: "easeInOut" };
  }

  const breathingAnimate = isAsleep
    ? { x: pixelShift.x, y: [pixelShift.y, 8 + pixelShift.y, pixelShift.y], scale: [1, 1.02, 1] }
    : isFeeding
      ? { x: pixelShift.x, y: [-2 + pixelShift.y, 2 + pixelShift.y, -2 + pixelShift.y], scale: [1, 1.05, 1] }
      : { x: pixelShift.x, y: [pixelShift.y, 2 + pixelShift.y, pixelShift.y] };

  const breathingTransition = isAsleep
    ? { repeat: Infinity, duration: 4, ease: "easeInOut" }
    : isFeeding
      ? { repeat: Infinity, duration: 0.3, ease: "easeInOut" }
      : { repeat: Infinity, duration: 2, ease: "easeInOut" };

  // Determine color theme palette
  let baseColor = "#00ffcc"; // Cyan (default / split bottom)
  if (oledTheme === 'cyan') baseColor = "#00ffcc";
  else if (oledTheme === 'amber') baseColor = "#ffb000";
  else if (oledTheme === 'green') baseColor = "#33ff33";
  else if (oledTheme === 'white') baseColor = "#f8fafc";
  else if (oledTheme === 'split') baseColor = "#00ffcc"; // Split uses cyan for face, yellow for header
  else if (oledTheme === 'dynamic') baseColor = isNightTime ? "#6366f1" : "#33ff33"; // Default dynamic active is green (indigo in night mode)

  // For high authenticity, monochromatic themes remain purely monochromatic!
  // Split yellow/blue theme supports colorful states.
  let currentTheme = baseColor;
  if (oledTheme === 'split') {
    if (isPetting) currentTheme = "#ff66b2"; // Pink
    else if (isAsleep) currentTheme = "#4488ff"; // Indigo/Blue
    else if (isFeeding) currentTheme = "#66ff66"; // Green
    else if (isPoked) currentTheme = "#ff3333"; // Red
    else if (isSpeaking) currentTheme = "#cc66ff"; // Purple
  } else if (oledTheme === 'dynamic') {
    if (isAsleep) currentTheme = "#4488ff"; // Blue when asleep
    else if (isSpeaking) currentTheme = "#00ffcc"; // Cool cyan when processing/speaking
    else if (micVolume > 0.05) currentTheme = "#ffb000"; // Warm amber when listening
    else if (isPetting) currentTheme = "#ff66b2"; // Pink
    else if (isPoked) currentTheme = "#ff3333"; // Red
    else if (isFeeding) currentTheme = "#66ff66"; // Green
    else currentTheme = isNightTime ? "#6366f1" : "#33ff33"; // Soothing Indigo/blue in night mode, green when active during the day
  } else {
    // Monochromatic state shifts (slight intensity/brightness change or sleeping tint)
    if (isAsleep) {
      currentTheme = oledTheme === 'amber' ? "#cc6600" : oledTheme === 'green' ? "#11aa22" : oledTheme === 'cyan' ? "#0099aa" : "#94a3b8";
    }
  }

  let baseGlow = isAsleep ? 5 : 15 + (micVolume * 25);
  if (character === 'furious') baseGlow += 10;
  if (character === 'pensive') baseGlow -= 5;
  
  let glowShadow = `0 0 ${baseGlow}px ${currentTheme}`;
  if (character === 'chaotic' && !isAsleep) {
    glowShadow = `-4px 0 0 rgba(255,0,0,0.8), 4px 0 0 rgba(0,255,255,0.8), 0 0 ${baseGlow}px ${currentTheme}`;
  }

  // Helper render to avoid code duplication
  const renderOledScreen = () => {
    return (
      <div 
        className={`relative bg-[#010908] w-full h-full overflow-hidden flex flex-col justify-between border border-neutral-900 rounded-sm select-none ${screenFlicker ? 'animate-oled-flicker' : ''}`}
        style={{ 
          filter: `brightness(${brightness}%)`,
          boxShadow: "inset 0 4px 20px rgba(0,0,0,0.95)"
        }}
      >
        {/* Custom Dot-Matrix subpixel grid overlay */}
        {pixelGrid && (
          <div 
            className="absolute inset-0 pointer-events-none z-30 opacity-[0.35] mix-blend-multiply" 
            style={{
              backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.8) 10%, transparent 10%, transparent 90%, rgba(0,0,0,0.8) 90%), linear-gradient(0deg, rgba(0,0,0,0.8) 10%, transparent 10%, transparent 90%, rgba(0,0,0,0.8) 90%)',
              backgroundSize: '2.5px 2.5px'
            }} 
          />
        )}

        {/* Glossy glass reflection glare */}
        {glassShine && (
          <>
            {/* Corner curved glare */}
            <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_65%)]" />
            {/* Diagonal sheen glare */}
            <div className="absolute inset-0 pointer-events-none z-40 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.07]" />
          </>
        )}

        {/* OLED Top split-screen section (If split theme selected) */}
        {oledTheme === 'split' ? (
          <div 
            className="w-full flex items-center justify-between border-b border-amber-500/15 bg-amber-500/5 px-4 py-1.5 text-[8px] font-mono tracking-wider select-none shrink-0" 
            style={{ color: '#ffcc00', textShadow: '0 0 5px #ffcc00' }}
          >
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] animate-pulse shadow-[0_0_4px_#ffcc00]" />
              <span className="font-bold">I2C: 0x3C</span>
            </div>
            <div className="flex items-center space-x-3 text-[7px] opacity-90">
              <span>FPS: {(56.8 + Math.sin(Date.now() / 1000) * 1.5).toFixed(1)}</span>
              <span>VOL: {(micVolume * 100).toFixed(0)}%</span>
              <span className="font-bold border border-yellow-500/30 px-1 rounded-sm uppercase tracking-tighter scale-95 origin-right">{isSpeaking ? 'TALK' : 'IDLE'}</span>
            </div>
          </div>
        ) : (
          /* Simple status bar at the top for monochromatic themes */
          <div 
            className="w-full flex items-center justify-between px-4 py-1.5 text-[7px] font-mono select-none shrink-0" 
            style={{ color: currentTheme, textShadow: glowShadow, opacity: 0.6 }}
          >
            <span className="font-semibold uppercase">MONO_OLED_0.96</span>
            <span className="text-[6px] tracking-widest">{isAsleep ? 'SLEEP_OK' : 'ACTIVE_OK'}</span>
          </div>
        )}

        {/* Active Display Surface */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black/40">
          <Canvas camera={{ position: [0, 0, 5], fov: 48 }} className="w-full h-full pointer-events-none mix-blend-screen" style={{ filter: `drop-shadow(0px 0px 6px ${currentTheme}88)` }}>
            <XR store={xrStore}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[0, 4, 4]} intensity={1.2} />
              <pointLight position={[0, -2.2, 1.2]} color={currentTheme} intensity={3.0} distance={7} />
              <pointLight position={[-2, 1, 1]} color={currentTheme} intensity={1.2} distance={5} />
              <pointLight position={[2, 1, 1]} color={currentTheme} intensity={1.2} distance={5} />
              <HologramFace3D 
                isSpeaking={isSpeaking}
                isDistracted={isDistracted}
                isAsleep={isAsleep}
                isPoked={isPoked}
                isFeeding={isFeeding}
                isPetting={isPetting}
                isBlinking={isBlinking}
                lookOffset={lookOffset}
                expression={expression}
                micVolume={micVolume}
                currentTheme={currentTheme}
                character={character}
                screenFlicker={screenFlicker}
                isAffirmative={isAffirmative}
              />
              <EffectComposer>
                <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.8} intensity={1.3} mipmapBlur />
                {screenFlicker && <Noise opacity={0.03} />}
                <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0012, 0.0012)} />
                {screenFlicker && <Scanline density={1.5} opacity={0.03} />}
              </EffectComposer>
            </XR>
          </Canvas>
          {isAsleep && (
            <motion.div 
              className="absolute top-4 right-8 font-bold tracking-widest text-xl opacity-0 z-10"
              animate={{ y: [-10, -35], x: [0, 15], opacity: [0, 0.7, 0], scale: [0.8, 1.2], color: currentTheme }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
              style={{ textShadow: glowShadow }}
            >
              Zzz
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
       className="flex flex-col items-center justify-center w-full h-full bg-[#030303] cursor-pointer select-none touch-none p-4 md:p-8"
       onPointerDown={handlePointerDown}
       onPointerMove={handlePointerMove}
       onDoubleClick={handleFeed}
    >
      <style>{`
        @keyframes oledFlicker {
          0% { opacity: 0.985; }
          25% { opacity: 1; }
          50% { opacity: 0.98; }
          75% { opacity: 0.995; }
          100% { opacity: 1; }
        }
        .animate-oled-flicker {
          animation: oledFlicker 0.12s infinite;
        }
      `}</style>

      {showPCB ? (
        /* Real physical SSD1306 PCB Module Wrapper */
        <div className="relative p-6 pb-8 rounded-xl bg-gradient-to-b from-[#111625] via-[#0b101d] to-[#0a0d18] border-2 border-[#1e293b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.05)] max-w-xl w-full aspect-[1.4/1] flex flex-col items-center justify-between border-t-[#334155] border-l-[#334155] select-none transition-all">
          
          {/* PCB Texture / Traces overlay */}
          <div className="absolute inset-0 overflow-hidden rounded-xl opacity-30 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="pcb-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* Grid of vias and thin traces */}
                <path d="M 15 0 L 15 15 L 30 30 L 30 60 M 45 0 L 45 15 L 60 30 L 60 60" fill="none" stroke="#2c3e50" strokeWidth="1" opacity="0.6"/>
                <circle cx="15" cy="15" r="1.5" fill="#2c3e50" />
                <circle cx="45" cy="15" r="1.5" fill="#2c3e50" />
                <path d="M 0 45 L 15 45 L 30 30 L 60 30" fill="none" stroke="#2c3e50" strokeWidth="1" opacity="0.6" />
                <circle cx="15" cy="45" r="2" fill="none" stroke="#2c3e50" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pcb-pattern)" />
              {/* Main thick power and ground traces routing to pins */}
              <path d="M 230 40 L 230 80 L 120 120 M 270 40 L 270 90 L 400 120 M 310 40 L 310 70 L 360 100" fill="none" stroke="#3b4d61" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 120 120 L 120 180 L 80 220" fill="none" stroke="#3b4d61" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 400 120 L 400 200 L 450 250" fill="none" stroke="#3b4d61" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Physical Surface Mount Components */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Main Processor Chip (ESP32 style) */}
            <div className="absolute bottom-16 left-12 w-14 h-14 bg-zinc-950 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-zinc-800 flex items-center justify-center">
               <div className="w-8 h-8 rounded-full border border-zinc-800/50" />
               <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-800/80" /> {/* Pin 1 dot */}
               <span className="absolute bottom-2 right-2 text-[4px] text-zinc-600 font-mono font-bold rotate-90">ESP32-WROOM</span>
               {/* Chip pins */}
               <div className="absolute -left-1 top-1 bottom-1 w-1 flex flex-col justify-between py-1">
                 {Array.from({length: 8}).map((_, i) => <div key={`l-${i}`} className="h-[2px] w-full bg-zinc-400" />)}
               </div>
               <div className="absolute -right-1 top-1 bottom-1 w-1 flex flex-col justify-between py-1">
                 {Array.from({length: 8}).map((_, i) => <div key={`r-${i}`} className="h-[2px] w-full bg-zinc-400" />)}
               </div>
               <div className="absolute -top-1 left-1 right-1 h-1 flex justify-between px-1">
                 {Array.from({length: 8}).map((_, i) => <div key={`t-${i}`} className="w-[2px] h-full bg-zinc-400" />)}
               </div>
               <div className="absolute -bottom-1 left-1 right-1 h-1 flex justify-between px-1">
                 {Array.from({length: 8}).map((_, i) => <div key={`b-${i}`} className="w-[2px] h-full bg-zinc-400" />)}
               </div>
            </div>

            {/* Wifi Antenna Zig-zag Trace */}
            <div className="absolute bottom-32 left-10 w-8 h-12">
               <svg width="100%" height="100%" viewBox="0 0 20 40" xmlns="http://www.w3.org/2000/svg">
                 <path d="M 2 38 L 2 2 L 18 2 L 18 10 L 6 10 L 6 18 L 18 18 L 18 26 L 6 26 L 6 34 L 18 34 L 18 40" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinejoin="miter" opacity="0.6"/>
               </svg>
            </div>

            {/* SMD Capacitors and Resistors near power */}
            <div className="absolute top-16 left-1/2 -translate-x-12 flex space-x-2">
               <div className="w-1.5 h-3 bg-zinc-200 rounded-[1px] shadow-sm relative"><div className="absolute inset-y-0 left-0 right-0 m-auto h-[70%] bg-amber-700" /></div>
               <div className="w-1.5 h-3 bg-zinc-200 rounded-[1px] shadow-sm relative"><div className="absolute inset-y-0 left-0 right-0 m-auto h-[70%] bg-amber-700" /></div>
               <div className="w-1.5 h-3 bg-zinc-200 rounded-[1px] shadow-sm relative"><div className="absolute inset-y-0 left-0 right-0 m-auto h-[70%] bg-zinc-900"><span className="text-[2px] text-zinc-400 absolute inset-0 flex items-center justify-center rotate-90">103</span></div></div>
            </div>

            {/* Tactile Reset Button */}
            <div className="absolute bottom-12 right-12 w-6 h-6 bg-zinc-300 rounded-[2px] shadow-[0_2px_5px_rgba(0,0,0,0.6)] border-b-2 border-zinc-400 flex items-center justify-center">
               <div className="w-4 h-4 bg-zinc-900 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-black/50" />
               <div className="absolute -left-1 top-1 w-1 h-1 bg-zinc-400" />
               <div className="absolute -left-1 bottom-1 w-1 h-1 bg-zinc-400" />
               <div className="absolute -right-1 top-1 w-1 h-1 bg-zinc-400" />
               <div className="absolute -right-1 bottom-1 w-1 h-1 bg-zinc-400" />
               <span className="absolute -bottom-4 text-[5px] text-zinc-500 font-bold tracking-widest uppercase">EN / RST</span>
            </div>
          </div>

          {/* Circular brass mounting screw holes at the corners */}
          <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 via-amber-700 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-400/30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            {/* Solder mask clearing ring */}
            <div className="absolute inset-[-2px] rounded-full border border-amber-500/20 pointer-events-none" />
          </div>
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 via-amber-700 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-400/30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-[-2px] rounded-full border border-amber-500/20 pointer-events-none" />
          </div>
          <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 via-amber-700 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-400/30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-[-2px] rounded-full border border-amber-500/20 pointer-events-none" />
          </div>
          <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 via-amber-700 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-400/30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-[-2px] rounded-full border border-amber-500/20 pointer-events-none" />
          </div>

          {/* Golden Pin markings & header socket header at the top */}
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 flex space-x-6 bg-zinc-950 px-6 py-2.5 rounded-b-lg border-x border-b border-zinc-800 shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10">
            {['GND', 'VCC', 'SCL', 'SDA'].map((pin) => (
              <div key={pin} className="flex flex-col items-center relative">
                {/* Solder pad */}
                <div className="absolute -bottom-1 w-3 h-1.5 bg-amber-600/30 rounded-[100%] blur-[1px]" />
                {/* Silver metallic header pin */}
                <div className="w-2 h-3.5 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.8)] border border-zinc-500/50" />
                <span className="text-[7px] font-bold text-amber-500 mt-2 tracking-widest leading-none" style={{textShadow: "0 1px 2px rgba(0,0,0,0.8)"}}>{pin}</span>
              </div>
            ))}
          </div>

          {/* Tactile hardware status LEDs (glowing power & blinking active) */}
          <div className="absolute top-12 left-10 flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-[2px] opacity-60" />
              <div className="relative w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444,inset_0_1px_2px_rgba(255,255,255,0.4)] border border-red-700" />
            </div>
            <span className="text-[7px] font-bold text-zinc-400 tracking-widest font-mono">PWR</span>
          </div>
          <div className="absolute top-12 right-10 flex items-center space-x-2">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-[2px] transition-opacity duration-75 ${micVolume > 0.05 || isSpeaking ? 'bg-green-400 opacity-60' : 'opacity-0'}`} />
              <div className={`relative w-2.5 h-2.5 rounded-full transition-all duration-75 border ${micVolume > 0.05 || isSpeaking ? 'bg-green-400 shadow-[0_0_8px_#4ade80,inset_0_1px_2px_rgba(255,255,255,0.4)] border-green-600' : 'bg-green-950 border-green-900'}`} />
            </div>
            <span className="text-[7px] font-bold text-zinc-400 tracking-widest font-mono">ACT</span>
          </div>

          {/* Substrate printed circuit marks */}
          <div className="absolute bottom-4 right-10 flex flex-col items-end">
            <span className="text-[7px] font-mono text-zinc-500 uppercase select-none font-bold tracking-widest">
              REV_1.4_ESP32
            </span>
            <div className="flex space-x-1 mt-1">
              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
            </div>
          </div>

          {/* OLED Screen Bezel/Well inside PCB */}
          <div className="w-[88%] aspect-[128/64] mt-10 bg-[#050505] border-[3px] border-[#111] rounded-sm p-1 relative overflow-hidden shadow-[inset_0_5px_15px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between z-10">
            {/* Screen bezel inner edge highlight */}
            <div className="absolute inset-0 pointer-events-none rounded-sm border border-zinc-800/30 z-50" />
            {renderOledScreen()}
          </div>

          {/* Silkscreen text on PCB board bottom */}
          <div className="absolute bottom-4 left-10 text-[9px] tracking-[0.2em] font-mono text-zinc-400 select-none uppercase font-bold">
            0.96" I2C OLED
          </div>
        </div>
      ) : (
        /* Full Frame / Bezel-less direct glass panel display mode */
        <div className="w-full h-full max-w-4xl max-h-[500px] aspect-[128/64] border-2 border-zinc-800 rounded-lg relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
          {renderOledScreen()}
        </div>
      )}
    </div>
  );
}
