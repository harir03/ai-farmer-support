import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  LiveKitRoom,
  useTracks,
  AudioSession,
  TrackReferenceOrPlaceholder,
  isTrackReference,
  VideoTrack,  // though for audio you may not need video
} from '@livekit/react-native';

import { Track } from 'livekit-client';

// Replace with your token endpoint
const TOKEN_API = "https://gpptch45-5000.inc1.devtunnels.ms/api/livekit/token";
const WS_URL = "wss://your-livekit-server-url";  // Or maybe same as token API host

// A simple audio visualizer stub
function AudioVisualizer({ trackRef, level }) {
  // in a real app, you might sample audio amplitude or use trackRef to inspect
  return (
    <View style={styles.visualizerContainer}>
      <Text style={{ color: 'white' }}>🎤 Audio Level: {level.toFixed(2)}</Text>
    </View>
  );
}

function AgentInterface({ onDisconnect }) {
  const tracks = useTracks([Track.Source.Microphone]);
  // This gives you track placeholders or references
  // For now we assume only one mic track
  const micTrackRef = tracks[0];
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);

  // Dummy logic: when we detect trackRef (i.e. we publish), we toggle states
  useEffect(() => {
    if (isTrackReference(micTrackRef)) {
      setListening(true);
      // In real implementation, you'd get amplitude data from trackRef
      // Here, simulate
      const interval = setInterval(() => {
        setLevel(Math.random());
      }, 200);
      return () => {
        clearInterval(interval);
      };
    } else {
      setListening(false);
    }
  }, [micTrackRef]);

  return (
    <View style={styles.agentContainer}>
      <Text style={styles.title}>AI Voice Assistant</Text>
      <Text style={styles.subtitle}>
        {listening ? "Listening..." : "Ready"}
      </Text>

      {isTrackReference(micTrackRef) && (
        <AudioVisualizer trackRef={micTrackRef} level={level} />
      )}

      <View style={{ marginVertical: 20 }}>
        <Button title="Disconnect" onPress={onDisconnect} color="#f55" />
      </View>
    </View>
  );
}

export default function App() {
  const [connectionDetails, setConnectionDetails] = useState<{
    token: string;
    serverUrl: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      const resp = await fetch(TOKEN_API);
      if (!resp.ok) throw new Error("Token fetch failed");
      const j = await resp.json();
      return { token: j.token, serverUrl: j.serverUrl || WS_URL };
    } catch (e) {
      console.error("fetchToken error", e);
      throw e;
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const cd = await fetchToken();
      setConnectionDetails(cd);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnectionDetails(null);
  };

  // Start audio session when connectionDetails changes
  useEffect(() => {
    if (connectionDetails) {
      AudioSession.startAudioSession().catch((e) => {
        console.warn("AudioSession start failed", e);
      });
      return () => {
        AudioSession.stopAudioSession();
      };
    }
  }, [connectionDetails]);

  if (!connectionDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Voice Assistant</Text>
        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        {isConnecting ? (
          <ActivityIndicator size="large" color="#0af" />
        ) : (
          <Button title="Connect & Start" onPress={handleConnect} />
        )}
      </View>
    );
  }

  // Once connected, show Room + AgentInterface
  return (
    <LiveKitRoom
      token={connectionDetails.token}
      serverUrl={connectionDetails.serverUrl}
      connect={true}
      audio={true}
      video={false}
    >
      <AgentInterface onDisconnect={handleDisconnect} />
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  header: {
    fontSize: 24,
    color: "white",
    marginBottom: 20,
  },
  error: {
    color: "salmon",
    marginBottom: 10,
  },
  agentContainer: {
    flex: 1,
    backgroundColor: "#333",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 8,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 20,
  },
  visualizerContainer: {
    width: "80%",
    height: 100,
    backgroundColor: "#444",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
});