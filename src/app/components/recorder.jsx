"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [visualizerData, setVisualizerData] = useState(Array(15).fill(2));
  const [convertedText, setConvertedText] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const deepgramConnectionRef = useRef(null);

  // Visualization effect
  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setVisualizerData((prev) => prev.map(() => Math.random() * 48 + 2));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const startRecording = async () => {
   
  };


  const stopRecording = () => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    // Close Deepgram connection
    if (deepgramConnectionRef.current) {
      deepgramConnectionRef.current.close();
    }

    setIsRecording(false);
    setIsPaused(false);
    setVisualizerData(Array(15).fill(2));
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    // Pause/resume audio processing if needed
  };

  const deleteRecording = () => {
    stopRecording();
    setConvertedText("");
  };

  return (
    <div className="w-full mx-auto p-6 rounded-lg shadow-xl flex items-center flex-col my-auto h-screen justify-center bg-gray-900">
      <div className="flex flex-col space-y-4 items-center">
        {/* Transcription Text Interface */}
        <div className="max-w-3xl w-full">
          <h1 className="text-white text-4xl md:text-6xl lg:text-8xl text-center min-h-[200px] flex items-center justify-center">
            {convertedText || "Waiting to transcribe..."}
          </h1>
        </div>

        {/* Visualizer */}
        <div className="flex-1 h-20 max-w-3xl bg-gray-800 rounded-lg p-4 flex items-center justify-center">
          <div className="flex items-center space-x-1 h-full">
            {visualizerData.map((height, index) => (
              <div
                key={index}
                className="w-2 bg-blue-400 rounded-full transition-all duration-100"
                style={{
                  height: `${height}px`,
                  opacity: isPaused ? 0.5 : 1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Recording Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={isRecording ? togglePause : startRecording}
            className={`p-4 rounded-full transition-all ${
              isRecording
                ? "bg-red-500/20 hover:bg-red-500/30"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <Mic
              size={24}
              className={isRecording ? "text-red-500" : "text-gray-300"}
            />
          </button>
          <span className="text-xs text-gray-400 mt-2">
            {isRecording
              ? isPaused
                ? "Paused"
                : "Recording"
              : "Click to record"}
          </span>
        </div>

        {/* Controls */}
        {isRecording && (
          <div className="flex justify-center space-x-4 mt-2">
            <button
              onClick={togglePause}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
            <button
              onClick={stopRecording}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              <Square size={20} />
            </button>
            <button
              onClick={deleteRecording}
              className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-500"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
