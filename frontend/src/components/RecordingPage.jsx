import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from '../apiConfig';

const RecordingPage = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const manuallyStoppedRef = useRef(false);
  const fullTranscriptRef = useRef("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setTranscript("Uploading and analyzing audio file... This may take a minute.");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-audio`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${sessionStorage.getItem('token')}`
        },
      });
      console.log("Audio uploaded and processed:", response.data);
      setTranscript(response.data.text);
      navigate("/transcription");
    } catch (error) {
      console.error("Error uploading audio:", error);
      setTranscript("Error: Failed to process audio file.");
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setRecording(true);
      if (fullTranscriptRef.current === "") {
        setTranscript("Listening...");
      }
      manuallyStoppedRef.current = false;
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let newFinalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newFinalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (newFinalTranscript) {
        fullTranscriptRef.current += newFinalTranscript;
      }

      setTranscript(fullTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return;
      console.error("Speech recognition error:", event.error);
      setTranscript(fullTranscriptRef.current + "\n(Error: " + event.error + ")");
      if (event.error !== 'not-allowed') {
      } else {
        stopRecording();
      }
    };

    recognition.onend = () => {
      if (!manuallyStoppedRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Could not restart recognition immediately");
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      manuallyStoppedRef.current = true;
      recognitionRef.current.stop();
    }
    setRecording(false);
    setIsProcessing(true);

    await sendTranscriptToServer(fullTranscriptRef.current);

    fullTranscriptRef.current = "";
    setIsProcessing(false);
  };

  const sendTranscriptToServer = async (finalText) => {
    if (!finalText || !finalText.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/save-transcript`, 
        { text: finalText },
        { headers: { "Authorization": `Bearer ${sessionStorage.getItem('token')}` } }
      );
      console.log("Transcript saved:", response.data);
      navigate("/transcription");
    } catch (error) {
      console.error("Error saving transcript:", error);
      setTranscript("Error: Failed to process transcription.");
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const navigate = useNavigate();

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      paddingTop: "120px",
      paddingBottom: "60px",
    },
    title: {
      fontSize: "36px",
      fontWeight: "800",
      marginBottom: "30px",
      color: "var(--text-primary)",
      textAlign: "center",
    },
    transcriptBox: {
      width: "90%",
      maxWidth: "700px",
      minHeight: "200px",
      padding: "30px",
      color: "var(--text-primary)",
      fontSize: "18px",
      lineHeight: "1.6",
      textAlign: "left",
      transition: "all 0.3s ease",
      marginBottom: "30px",
    },
    buttonContainer: {
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      justifyContent: "center",
      marginBottom: "60px",
    },
    featureSection: {
      width: "90%",
      maxWidth: "800px",
      padding: "40px",
    },
    featureTitle: {
      fontSize: "26px",
      fontWeight: "700",
      marginBottom: "20px",
      color: "var(--text-primary)",
      textAlign: "center",
    },
    featureList: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      listStyleType: "none",
      padding: 0,
    },
    featureItem: {
      padding: "20px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.05)",
      color: "var(--text-secondary)",
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Start Recording</h1>

      <div
        className={`glass-card ${recording ? 'recording-active' : ''}`}
        style={styles.transcriptBox}
      >
        {transcript || <span style={{ color: 'var(--text-secondary)' }}>Waiting for audio... Speak into your microphone or upload a file.</span>}
      </div>

      <div style={styles.buttonContainer}>
        {recording ? (
          <button
            onClick={stopRecording}
            className="premium-btn premium-btn-danger"
            disabled={isUploading || isProcessing}
          >
            Stop Recording
          </button>
        ) : isProcessing ? (
          <button
            className="premium-btn premium-btn-outline"
            disabled={true}
          >
            Processing AI Summary...
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="premium-btn premium-btn-primary"
            disabled={isUploading}
          >
            Start Recording
          </button>
        )}

        <div>
          <input
            type="file"
            accept="audio/*,video/*"
            id="audio-upload"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <label
            htmlFor="audio-upload"
            className="premium-btn premium-btn-success"
            style={{
              cursor: (isUploading || isProcessing) ? "not-allowed" : "pointer",
              opacity: (isUploading || isProcessing) ? 0.7 : 1
            }}
          >
            {isUploading ? "Processing..." : "Upload Audio"}
          </label>
        </div>

        <button
          onClick={() => navigate("/transcription")}
          className="premium-btn premium-btn-outline"
          disabled={isUploading || isProcessing}
        >
          View History
        </button>
      </div>

      {/* Feature Section */}
      <div className="glass-card" style={styles.featureSection}>
        <h2 style={styles.featureTitle}>Capabilities</h2>
        <ul style={styles.featureList}>
          <li style={styles.featureItem}><strong>Voice Processing:</strong> High-accuracy transcription.</li>
          <li style={styles.featureItem}><strong>Multi-accent:</strong> Supports various English accents.</li>
          <li style={styles.featureItem}><strong>Action Items:</strong> Automatically detects tasks.</li>
          <li style={styles.featureItem}><strong>Keywords:</strong> Extracts main topics discussed.</li>
          <li style={styles.featureItem}><strong>Summaries:</strong> Generates concise meeting notes.</li>
          <li style={styles.featureItem}><strong>Exporting:</strong> Share via Email or download as PDF.</li>
        </ul>
      </div>
    </div>
  );
};

export default RecordingPage;
