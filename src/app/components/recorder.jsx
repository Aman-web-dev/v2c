"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Trash2, Play, Pause, Save, Copy } from "lucide-react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import PrerecordedTextCard from "./preRecordedTextCard";
import { MoonLoader } from "react-spinners";
import StatusLabel from "./StatusLable";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [visualizerData, setVisualizerData] = useState(Array(15).fill(2));
  const [convertedText, setConvertedText] = useState("");
  const [connection, setConnection] = useState(null);
  const [PreConvertedTextArray, setPreConvertedTextArray] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [statusLabel, setStatusLabel] = useState("idle");
  const inputRef = useRef(null);

  useEffect(() => {
    let interval;

    if (isRecording) {
      // If recording is in progress, update the visualizer data at regular intervals
      interval = setInterval(() => {
        // Generate random visualizer data for each update
        setVisualizerData((prev) => prev.map(() => Math.random() * 48 + 2));
      }, 100); // Update every 100ms
    }

    if (inputRef.current) {
      // Ensure the text input scrolls to the end as new transcription is added
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }

    // Cleanup: Clear the interval when recording stops or component unmounts
    return () => clearInterval(interval);
  }, [isRecording, convertedText]);

  // Function to start and stop recording
  const startRecording = async () => {
    setConnecting(true); // Show connecting state

    try {
      if (isRecording) {
        // If already recording, stop the current stream and connection
        setStatusLabel("disconnecting");
        if (stream) {
          stream.getTracks().forEach((track) => track.stop()); // Stop all tracks
        }
        if (connection) {
          connection.requestClose(); // Close the Deepgram connection
        }
        setIsRecording(false);
        setConnecting(false);
        setStatusLabel("disconnected");
        return;
      }

      // Update status label based on current state
      if (statusLabel === "disconnected") {
        setStatusLabel("reconnecting");
      } else {
        setStatusLabel("connecting");
      }

      // Initialize audio context and stream
      const context = new window.AudioContext();
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const inputSource = context.createMediaStreamSource(newStream);

      // Create Deepgram client and establish live connection
      const ApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      const deepgram = createClient(ApiKey);
      const newConnection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
      });

      // Event: Connection opened
      newConnection.on(LiveTranscriptionEvents.Open, () => {
        setConnecting(false); // Hide connecting state
        setIsRecording(true); // Update recording state
        setStatusLabel("connected"); // Update status label

        // Handle incoming transcription data
        newConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const transcript = data.channel.alternatives[0]?.transcript;
          if (transcript) {
            setConvertedText((prev) => [...prev, transcript]); // Append new transcript
          }
        });

        // Handle Deepgram errors
        newConnection.on(LiveTranscriptionEvents.Error, (err) => {
          console.error("Deepgram Error:", err);
        });

        // Handle connection closure
        newConnection.on(LiveTranscriptionEvents.Close, () => {
          console.log("Deepgram WebSocket closed.");
        });

        // Record audio and send data to Deepgram
        const recorder = new MediaRecorder(newStream);
        recorder.ondataavailable = (event) => {
          newConnection.send(event.data); // Stream audio data to Deepgram
        };
        recorder.start(100); // Send data every 100ms
      });

      setStream(newStream); // Save the new stream
      setConnection(newConnection); // Save the new connection
    } catch (error) {
      console.error("Error starting recording:", error); // Handle errors
    }
  };

  // Clear current transcription and reset visualizer
  const handleDelete = () => {
    setConvertedText(""); // Clear transcribed text
    setVisualizerData(Array(15).fill(2)); // Reset visualizer
  };

  // Save the current transcription and reset visualizer
  const handleSave = () => {
    const newText = convertedText.toString(); // Convert transcription array to string
    setPreConvertedTextArray((prev) => [...prev, newText]); // Save transcription
    setConvertedText(""); // Clear current text
    setVisualizerData(Array(15).fill(2)); // Reset visualizer
  };

  // Copy the current transcription to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(convertedText); // Write text to clipboard
  };

  // Delete a specific transcription from saved transcriptions
  const handleRecordDelete = (index) => {
    const newArray = PreConvertedTextArray.filter((e, i) => i !== index); // Remove item by index
    setPreConvertedTextArray(newArray); // Update saved transcriptions
  };

  return (
    <div className="w-full mx-auto p-6 rounded-lg shadow-xl flex items-center flex-col my-auto min-h-[100vh] justify-center bg-gray-900">
      <div className="flex flex-col space-y-4 items-center">
        <div className="w-[80vw] relative group ">
          <input
            ref={inputRef}
            value={
              convertedText === ""
                ? "Click the Mic icon to start recording..."
                : convertedText
            }
            disabled
            className="w-full bg-gray-800 text-3xl py-6 px-6 rounded-xl border-2 border-gray-700 
               text-gray-100 font-semibold tracking-wide shadow-lg
               transition-all duration-200
               focus:outline-none focus:ring-2 focus:ring-purple-500
               disabled:opacity-100 disabled:cursor-default
               overflow-x-auto whitespace-nowrap scroll-smooth"
          />
          {isRecording && (
            <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-8 bg-purple-500 animate-pulse rounded-full" />
          )}
          {convertedText && !isRecording && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                {convertedText.length} characters
              </span>
            </div>
          )}
        </div>

        {/* Visualizer to show The Audio Is Streaming */}
        <div className="flex-1 h-[40] max-w-3xl bg-gray-800 rounded-lg p-4 flex items-center justify-center">
          <div className="flex h-10 items-center space-x-1 ">
            {visualizerData.map((height, index) => (
              <div
                key={index}
                className="w-2 bg-blue-400 rounded-full transition-all duration-100"
                style={{
                  height: `${height}px`,
                  opacity: isRecording ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>

        {/* Mic Button */}
        <div className="flex flex-col items-center space-y-4">
          <StatusLabel status={statusLabel} />
          <button
            onClick={startRecording}
            className={`p-4 rounded-full transition-all hover:scale-110 active:scale-95 ${
              isRecording
                ? "bg-red-500/20 hover:bg-red-500/30"
                : "bg-gray-100 hover:bg-gray-700"
            }`}
          >
            {connecting ? (
              <MoonLoader
                color="#000000"
                cssOverride={{}}
                size={35}
                speedMultiplier={1}
              />
            ) : (
              <Mic
                size={48}
                className={isRecording ? "text-red-500" : "text-gray-900"}
              />
            )}
          </button>

          {/* Post Recording Controls */}
          {!isRecording && convertedText && (
            <div className="flex space-x-4">
              <button
                onClick={handleDelete}
                className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all
                   hover:scale-110 active:scale-95"
                title="Delete recording"
              >
                <Trash2 size={20} className="text-red-500" />
              </button>
              <button
                onClick={handleSave}
                className="p-3 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-all
                   hover:scale-110 active:scale-95"
                title="Save recording"
              >
                <Save size={20} className="text-green-500" />
              </button>
              <button
                onClick={handleCopy}
                className="p-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-all
                   hover:scale-110 active:scale-95"
                title="Copy text"
              >
                <Copy size={20} className="text-blue-500" />
              </button>
            </div>
          )}
        </div>

        {/* this will show all the prerecorded voice to text transcripts */}
        <PrerecordedTextCard
          preConvertedText={PreConvertedTextArray}
          handleRecordDelete={handleRecordDelete}
        />
      </div>
    </div>
  );
};

export default AudioRecorder;
