"use client";

import React, { useState, useEffect } from "react";
// import { getPackNames, getPackItems } from "../utils/game";

interface PackSelectionProps {
  onStartGame: (selectedItems: string[]) => void;
}

export default function PackSelection({ onStartGame }: PackSelectionProps) {
  const [packs, setPacks] = useState<string[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPacks() {
      try {
        // On the client side, we need to fetch the packs
        const response = await fetch("/api/packs");
        const packData = await response.json();
        setPacks(packData);
      } catch (error) {
        console.error("Failed to load packs:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPacks();
  }, []);

  const togglePack = (packName: string) => {
    setSelectedPacks((prev) =>
      prev.includes(packName)
        ? prev.filter((p) => p !== packName)
        : [...prev, packName]
    );
  };

  const handleStartGame = async () => {
    if (selectedPacks.length === 0) return;

    try {
      // Fetch all items from selected packs
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packs: selectedPacks }),
      });

      const items = await response.json();
      onStartGame(items);
    } catch (error) {
      console.error("Failed to load game items:", error);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-lg">Loading packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="title-bar">
        <h1 className="text-xl font-bold">Toes Down</h1>
      </div>

      <div className="card my-4">
        <h2 className="text-lg font-semibold mb-4 text-[color:rgb(var(--info-color))]">
          Select Packs
        </h2>

        <div className="space-y-2 mb-6">
          {packs.map((pack) => (
            <div key={pack} className="flex items-center">
              <input
                type="checkbox"
                id={pack}
                checked={selectedPacks.includes(pack)}
                onChange={() => togglePack(pack)}
                className="checkbox"
              />
              <label htmlFor={pack} className="cursor-pointer">
                {pack.charAt(0).toUpperCase() + pack.slice(1)}
              </label>
            </div>
          ))}
        </div>

        <button
          onClick={handleStartGame}
          disabled={selectedPacks.length === 0}
          className={`button ${
            selectedPacks.length > 0 ? "button-primary" : "opacity-50"
          } w-full`}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
