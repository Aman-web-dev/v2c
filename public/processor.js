class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs) {
      const input = inputs[0]; // Get the input audio
      if (input) {
        const channelData = input[0]; // Get the first channel
        this.port.postMessage(channelData); // Send data to the main thread
      }
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);