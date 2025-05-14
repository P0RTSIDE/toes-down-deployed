"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  useGameState,
  useDeviceOrientation,
  useKeyboardControls,
} from "../hooks/gameHooks";
import GameResults from "./GameResults";

// Define interface for DeviceOrientationEvent with iOS permission API
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<string>;
}

interface GameplayProps {
  gameItems: string[];
  timeLimit: number;
  onFinish: (score: { correct: number; skipped: number }) => void;
  onCancel: () => void;
}

export default function Gameplay({
  gameItems,
  timeLimit,
  onFinish,
  onCancel,
}: GameplayProps) {
  const [, setIsDeviceOrientationGranted] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCorrect, setIsCorrect] = useState(false);

