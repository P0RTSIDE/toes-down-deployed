"use client";

import React, { useState, useEffect, useRef } from "react";
// import { getPackNames, getPackItems } from "../utils/game";

interface PackSelectionProps {
  onStartGame: (selectedItems: string[]) => void;
}

// Add this type to help identify custom decks
interface DeckInfo {
  name: string;
  isCustom: boolean;
}

export default function PackSelection({ onStartGame }: PackSelectionProps) {
  const [packs, setPacks] = useState<DeckInfo[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomDeckModal, setShowCustomDeckModal] = useState(false);
  const [customWords, setCustomWords] = useState("");
  const [deckName, setDeckName] = useState("");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadPacks() {
      try {
        const response = await fetch("/api/packs");
        const packData = await response.json();
        // Convert pack names to DeckInfo objects
        const decksWithInfo: DeckInfo[] = packData.map((name: string) => ({
          name,
          // Consider a deck custom if it's not one of the default packs
          isCustom: !name.startsWith('default_')  // Adjust this condition based on your naming convention
        }));
        setPacks(decksWithInfo);
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

  const resetCustomDeckForm = () => {
    setDeckName("");
    setCustomWords("");
    setError("");
  };

  const handleCustomDeckSubmit = async () => {
    if (!deckName.trim()) {
      setError("Please enter a deck name");
      return;
    }

    const formData = new FormData();
    formData.append('words', customWords);
    formData.append('deckName', deckName);

    try {
      const response = await fetch("/api/custom-deck", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to create deck');
        return;
      }

      setPacks((prev) => [...prev, { name: data.deckName, isCustom: true }]);
      setSelectedPacks((prev) => [...prev, data.deckName]);
      setShowCustomDeckModal(false);
      resetCustomDeckForm();
    } catch (error) {
      console.error("Failed to create custom deck:", error);
      setError("Failed to create custom deck");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show the modal to get the deck name
    setShowCustomDeckModal(true);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomWords(e.target?.result as string || "");
    };
    reader.readAsText(file);
  };

  const handleDeleteDeck = async (deckName: string) => {
    try {
      const response = await fetch("/api/custom-deck/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deckName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete deck');
      }

      // Remove the deck from packs and selected packs
      setPacks(prev => prev.filter(pack => pack.name !== deckName));
      setSelectedPacks(prev => prev.filter(pack => pack !== deckName));
    } catch (error) {
      console.error("Failed to delete deck:", error);
    } finally {
      setShowDeleteConfirm(null);
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
          {packs.map(({ name, isCustom }) => (
            <div key={name} className="flex items-center justify-between group">
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  id={name}
                  checked={selectedPacks.includes(name)}
                  onChange={() => togglePack(name)}
                  className="checkbox"
                />
                <label htmlFor={name} className="cursor-pointer flex-1">
                  {name.replace(/_/g, ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </label>
              </div>
              {isCustom && (
                <button
                  onClick={() => setShowDeleteConfirm(name)}
                  className="text-[rgb(var(--error-color))] opacity-0 group-hover:opacity-100 transition-opacity px-2"
                  title="Delete deck"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-6">
          <button
            onClick={() => {
              setShowCustomDeckModal(true);
              resetCustomDeckForm();
            }}
            className="button w-full mb-2"
          >
            Add Custom Deck
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="button w-full"
          >
            Upload Deck File
          </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Deck</h3>
            <p className="mb-6">
              Are you sure you want to delete &quot;
              {showDeleteConfirm.replace(/_/g, ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              &quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="button"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDeck(showDeleteConfirm)}
                className="button bg-[rgb(var(--error-color))] hover:bg-[rgb(var(--error-color-hover))]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Deck Modal */}
      {showCustomDeckModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create Custom Deck</h3>
            
            {/* Deck Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Deck Name
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Enter deck name"
                className="w-full p-2 bg-[rgb(45,46,40)] border border-[rgb(58,59,53)] rounded"
              />
            </div>

            {/* Word List Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Words (one per line)
              </label>
              <textarea
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                placeholder="Enter words, one per line"
                className="w-full h-48 p-2 bg-[rgb(45,46,40)] border border-[rgb(58,59,53)] rounded"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-[rgb(var(--error-color))] mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCustomDeckModal(false);
                  resetCustomDeckForm();
                }}
                className="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDeckSubmit}
                className="button button-primary"
                disabled={!deckName.trim() || !customWords.trim()}
              >
                Create Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

