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
  const [statusLabel,setStatusLabel]=useState("idle")
  const inputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setVisualizerData((prev) => prev.map(() => Math.random() * 48 + 2));
      }, 100);
    }
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }

    return () => clearInterval(interval);
  }, [isRecording, convertedText]);

  const startRecording = async () => {
    setConnecting(true);
    
    try {
      if (isRecording) {
        setStatusLabel("disconnecting")
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        if (connection) {
          connection.requestClose();
        }
        setIsRecording(false);
        setConnecting(false)
        setStatusLabel("disconnected")
        return;
      }
      if(statusLabel=='disconnected' ){
        setStatusLabel("reconnecting")
      }else{
        setStatusLabel("connecting")
      }

      const context = new window.AudioContext();
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const inputSource = context.createMediaStreamSource(newStream);

      const ApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

      const deepgram = createClient(ApiKey);
      const newConnection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
      });

      newConnection.on(LiveTranscriptionEvents.Open, () => {
        setConnecting(false);
        setIsRecording(true);
        setStatusLabel("connected")

        newConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const transcript = data.channel.alternatives[0]?.transcript;
          if (transcript) {
            setConvertedText((prev) => [...prev, transcript]);
          }
        });

        newConnection.on(LiveTranscriptionEvents.Error, (err) => {
          console.error("Deepgram Error:", err);
        });

        newConnection.on(LiveTranscriptionEvents.Close, () => {
          console.log("Deepgram WebSocket closed.");
        });

        const recorder = new MediaRecorder(newStream);
        recorder.ondataavailable = (event) => {
          newConnection.send(event.data);
        };
        recorder.start(100);
      });

      setStream(newStream);
      setConnection(newConnection);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const handleDelete = () => {
    setConvertedText("");
    setVisualizerData(Array(15).fill(2));
  };

  const handleSave = () => {
    const newText = convertedText.toString();
    setPreConvertedTextArray((prev) => [...prev, newText]);
    setConvertedText("");
    setVisualizerData(Array(15).fill(2));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedText);
  };

  const handleRecordDelete = (index) => {
    const newArray = PreConvertedTextArray.filter((e, i) => i !== index);
    setPreConvertedTextArray(newArray);
  };

  return (
    <div className="w-full mx-auto p-6 rounded-lg shadow-xl flex items-center flex-col my-auto min-h-[100vh] justify-center bg-gray-900">
      
      <div className="flex flex-col space-y-4 items-center">
        <div className="w-[80vw] relative group ">
          <input
            ref={inputRef}
            value={convertedText===""?"Click the Mic icon to start recording...":convertedText}
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

        <div className="flex flex-col items-center space-y-4">
        <StatusLabel status={statusLabel}/>
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
          {!isRecording && convertedText ? (
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
          ) : (
            ""
          )}
        </div>

        <PrerecordedTextCard
          preConvertedText={PreConvertedTextArray}
          handleRecordDelete={handleRecordDelete}
        />
      </div>
    </div>
  );
};

export default AudioRecorder;
