import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL, USE_MOCK_API } from "../config/env";
import { callService } from "../services/callService";

const EMPTY_DASHBOARD = {
  activeSession: null,
  recentSessions: [],
  contacts: [],
};

const RTC_CONFIGURATION = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function createWsUrl(token) {
  const apiUrl = new URL(API_BASE_URL, window.location.origin);
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";

  const normalizedPath = apiUrl.pathname.replace(/\/+$/, "");
  apiUrl.pathname = normalizedPath.endsWith("/api")
    ? `${normalizedPath.slice(0, -4) || ""}/ws`
    : `${normalizedPath || ""}/ws`;
  apiUrl.search = `token=${encodeURIComponent(token)}`;

  return apiUrl.toString();
}

function formatDurationLabel(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function useCalls(token, isAuthenticated, isCallsVisible = false) {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [liveDurationLabel, setLiveDurationLabel] = useState("");

  const isCallsVisibleRef = useRef(isCallsVisible);
  const activeSessionRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const currentSessionIdRef = useRef("");
  const offerSentForSessionRef = useRef("");
  const pendingSignalsRef = useRef([]);
  const pendingIceCandidatesRef = useRef([]);
  const ringIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const acceptedStartedAtRef = useRef({ sessionId: "", startedAtMs: 0 });

  const loadDashboard = useCallback(
    async (options = {}) => {
      const { background = false } = options;

      if (!isAuthenticated || !token) {
        setDashboard(EMPTY_DASHBOARD);
        setError("Login to access calls.");
        return null;
      }

      if (!background) {
        setLoading(true);
      }
      setError("");

      try {
        const response = await callService.getDashboard(token);
        setDashboard({
          activeSession: response?.activeSession ?? null,
          recentSessions: Array.isArray(response?.recentSessions) ? response.recentSessions : [],
          contacts: Array.isArray(response?.contacts) ? response.contacts : [],
        });
        return response;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load calls.");
        return null;
      } finally {
        if (!background) {
          setLoading(false);
        }
      }
    },
    [isAuthenticated, token],
  );

  const stopRingtone = useCallback(() => {
    if (ringIntervalRef.current) {
      window.clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  }, []);

  const playToneBurst = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    const context = audioContextRef.current;
    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    try {
      const primaryOscillator = context.createOscillator();
      const secondaryOscillator = context.createOscillator();
      const gain = context.createGain();
      primaryOscillator.type = "sine";
      secondaryOscillator.type = "triangle";
      primaryOscillator.frequency.setValueAtTime(860, context.currentTime);
      secondaryOscillator.frequency.setValueAtTime(660, context.currentTime);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
      primaryOscillator.connect(gain);
      secondaryOscillator.connect(gain);
      gain.connect(context.destination);
      primaryOscillator.start();
      secondaryOscillator.start();
      primaryOscillator.stop(context.currentTime + 0.3);
      secondaryOscillator.stop(context.currentTime + 0.3);
    } catch {
      // Ignore audio errors (browser policy or unavailable context).
    }
  }, []);

  const startRingtone = useCallback(() => {
    if (ringIntervalRef.current) {
      return;
    }
    playToneBurst();
    ringIntervalRef.current = window.setInterval(() => {
      playToneBurst();
    }, 1200);
  }, [playToneBurst]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const unlockAudio = () => {
      const context = audioContextRef.current;
      if (context && context.state === "suspended") {
        context.resume().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const teardownMedia = useCallback((options = {}) => {
    const { preserveLocal = false, preservePendingSignals = false } = options;

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        peerConnectionRef.current.close();
      } catch {
        // Ignore close errors.
      }
      peerConnectionRef.current = null;
    }

    if (!preserveLocal && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setMicMuted(false);
      setCameraOff(false);
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
      setRemoteStream(null);
    }

    if (!preservePendingSignals) {
      pendingSignalsRef.current = [];
    }
    pendingIceCandidatesRef.current = [];
    offerSentForSessionRef.current = "";
    setMediaReady(false);
  }, []);

  const ensureLocalMedia = useCallback(
    async (callType = "voice") => {
      if (USE_MOCK_API) {
        throw new Error("Voice/video media requires backend mode. Set VITE_USE_MOCK_API=false.");
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser does not support microphone/camera access.");
      }

      const needsVideo = callType === "video";
      const existing = localStreamRef.current;
      const hasAudio = Boolean(existing?.getAudioTracks()?.length);
      const hasVideo = Boolean(existing?.getVideoTracks()?.length);

      let stream = existing;
      const missingTrack = !existing || !hasAudio || (needsVideo && !hasVideo);
      if (missingTrack) {
        if (existing) {
          existing.getTracks().forEach((track) => track.stop());
        }
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: needsVideo,
          });
        } catch (mediaError) {
          const message = String(mediaError?.message || "");
          if (needsVideo && (mediaError?.name === "NotReadableError" || /video source|device in use/i.test(message))) {
            throw new Error("Camera currently busy hai. Dusra tab/app camera use kar raha hai.");
          }
          if (mediaError?.name === "NotAllowedError") {
            throw new Error("Mic/camera permission allow karein.");
          }
          throw mediaError;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
      }

      if (!needsVideo && stream?.getVideoTracks()?.length) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
        setCameraOff(true);
      } else if (needsVideo && stream?.getVideoTracks()?.length) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
        setCameraOff(false);
      }

      if (stream?.getAudioTracks()?.length) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        setMicMuted(false);
      }

      return stream;
    },
    [],
  );

  const sendSignal = useCallback(
    async ({ sessionId, toUserId, signalType, description = null, candidate = null, callType = "voice" }) => {
      if (!token) {
        return;
      }

      try {
        await callService.sendSignal(token, {
          sessionId,
          toUserId,
          signalType,
          description,
          candidate,
          callType,
        });
      } catch {
        // Keep media flow resilient; dashboard polling will recover state.
      }
    },
    [token],
  );

  const flushPendingIceCandidates = useCallback(async (connection) => {
    if (!connection?.remoteDescription) {
      return;
    }

    const queue = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];
    for (const candidate of queue) {
      try {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore stale ICE candidates.
      }
    }
  }, []);

  const ensurePeerConnection = useCallback(
    (session) => {
      const sameSession =
        peerConnectionRef.current &&
        currentSessionIdRef.current &&
        currentSessionIdRef.current === session.id;
      if (sameSession) {
        return peerConnectionRef.current;
      }

      teardownMedia({ preserveLocal: true, preservePendingSignals: true });
      currentSessionIdRef.current = session.id;
      pendingSignalsRef.current = pendingSignalsRef.current.filter((item) => item?.sessionId === session.id);

      const connection = new RTCPeerConnection(RTC_CONFIGURATION);
      connection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({
            sessionId: session.id,
            toUserId: session.peerUserId,
            signalType: "ice_candidate",
            candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
            callType: session.type,
          });
        }
      };
      connection.ontrack = (event) => {
        const [stream] = event.streams || [];
        if (stream) {
          remoteStreamRef.current = stream;
          setRemoteStream(stream);
          setMediaReady(true);
          return;
        }

        if (!event.track) {
          return;
        }

        let nextStream = remoteStreamRef.current;
        if (!nextStream) {
          nextStream = new MediaStream();
          remoteStreamRef.current = nextStream;
          setRemoteStream(nextStream);
        }

        const hasTrack = nextStream.getTracks().some((track) => track.id === event.track.id);
        if (!hasTrack) {
          nextStream.addTrack(event.track);
          setRemoteStream(nextStream);
        }
        setMediaReady(true);
      };
      connection.onconnectionstatechange = () => {
        const state = connection.connectionState;
        if (state === "connected" || state === "completed") {
          setMediaReady(true);
          return;
        }
        if (state === "disconnected" || state === "failed" || state === "closed") {
          setMediaReady(false);
        }
      };

      peerConnectionRef.current = connection;
      return connection;
    },
    [sendSignal, teardownMedia],
  );

  const attachLocalTracks = useCallback((connection, stream) => {
    if (!connection || !stream) {
      return;
    }
    const senderTrackIds = new Set(connection.getSenders().map((sender) => sender.track?.id).filter(Boolean));
    stream.getTracks().forEach((track) => {
      if (!senderTrackIds.has(track.id)) {
        connection.addTrack(track, stream);
      }
    });
  }, []);

  const processCallSignal = useCallback(
    async (session, payload) => {
      if (!session || !payload || payload.sessionId !== session.id) {
        return;
      }

      const signalType = payload.signalType;
      const connection = ensurePeerConnection(session);

      if (signalType === "offer" && payload.description) {
        const stream = await ensureLocalMedia(session.type);
        attachLocalTracks(connection, stream);
        await connection.setRemoteDescription(new RTCSessionDescription(payload.description));
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        await sendSignal({
          sessionId: session.id,
          toUserId: session.peerUserId || payload.fromUserId,
          signalType: "answer",
          description: connection.localDescription,
          callType: session.type,
        });
        await flushPendingIceCandidates(connection);
        return;
      }

      if (signalType === "answer" && payload.description) {
        if (connection.signalingState === "have-local-offer") {
          await connection.setRemoteDescription(new RTCSessionDescription(payload.description));
          await flushPendingIceCandidates(connection);
        }
        return;
      }

      if (signalType === "ice_candidate" && payload.candidate) {
        if (connection.remoteDescription) {
          try {
            await connection.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch {
            // Ignore malformed candidates.
          }
        } else {
          pendingIceCandidatesRef.current.push(payload.candidate);
        }
      }
    },
    [attachLocalTracks, ensureLocalMedia, ensurePeerConnection, flushPendingIceCandidates, sendSignal],
  );

  const handleIncomingSignal = useCallback(
    (payload) => {
      const session = activeSessionRef.current;
      if (!session || payload.sessionId !== session.id || session.status !== "accepted") {
        pendingSignalsRef.current.push(payload);
        return;
      }
      processCallSignal(session, payload).catch(() => {});
    },
    [processCallSignal],
  );

  const initializeAcceptedCall = useCallback(
    async (session) => {
      const stream = await ensureLocalMedia(session.type);
      const connection = ensurePeerConnection(session);
      attachLocalTracks(connection, stream);

      if (
        session.direction === "outgoing" &&
        offerSentForSessionRef.current !== session.id &&
        connection.signalingState === "stable"
      ) {
        const offer = await connection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: session.type === "video",
        });
        await connection.setLocalDescription(offer);
        await sendSignal({
          sessionId: session.id,
          toUserId: session.peerUserId,
          signalType: "offer",
          description: connection.localDescription,
          callType: session.type,
        });
        offerSentForSessionRef.current = session.id;
      }

      const queuedSignals = pendingSignalsRef.current.filter((item) => item.sessionId === session.id);
      pendingSignalsRef.current = pendingSignalsRef.current.filter((item) => item.sessionId !== session.id);
      for (const signal of queuedSignals) {
        await processCallSignal(session, signal);
      }
    },
    [attachLocalTracks, ensureLocalMedia, ensurePeerConnection, processCallSignal, sendSignal],
  );

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }
    setMicMuted((previous) => {
      const nextMuted = !previous;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      return nextMuted;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }
    setCameraOff((previous) => {
      const nextOff = !previous;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !nextOff;
      });
      return nextOff;
    });
  }, []);

  const startCall = useCallback(
    async (peerUserId, type = "voice") => {
      if (!isAuthenticated || !token) {
        setError("Login to start calls.");
        return { ok: false };
      }

      setActionLoading(true);
      setError("");
      try {
        const result = await callService.startCall(token, { peerUserId, type });
        await loadDashboard({ background: true });
        return { ok: true, session: result?.session ?? null };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to start call.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setActionLoading(false);
      }
    },
    [isAuthenticated, loadDashboard, token],
  );

  const respondToCall = useCallback(
    async (sessionId, action) => {
      if (!isAuthenticated || !token) {
        setError("Login to manage calls.");
        return { ok: false };
      }

      setActionLoading(true);
      setError("");
      try {
        const result = await callService.respondToCall(token, { sessionId, action });
        if (action === "decline" || action === "cancel" || action === "end") {
          teardownMedia();
          stopRingtone();
        }
        await loadDashboard({ background: true });
        return { ok: true, session: result?.session ?? null };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to update call.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setActionLoading(false);
      }
    },
    [isAuthenticated, loadDashboard, stopRingtone, teardownMedia, token],
  );

  useEffect(() => {
    isCallsVisibleRef.current = isCallsVisible;
  }, [isCallsVisible]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!isAuthenticated || !token || USE_MOCK_API) {
      return undefined;
    }

    let reconnectAttempts = 0;
    let reconnectTimerId = null;
    let isUnmounted = false;
    let socket = null;

    const connectSocket = () => {
      if (isUnmounted) {
        return;
      }

      try {
        socket = new WebSocket(createWsUrl(token));
      } catch {
        reconnectTimerId = window.setTimeout(connectSocket, 1500);
        return;
      }

      socket.onmessage = (event) => {
        let payload = null;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }

        if (!payload || typeof payload !== "object") {
          return;
        }

        if (payload.type === "call_update") {
          loadDashboard({ background: true });
          return;
        }

        if (payload.type === "call_signal") {
          handleIncomingSignal(payload);
        }
      };

      socket.onopen = () => {
        reconnectAttempts = 0;
        setIsSocketConnected(true);
      };

      socket.onerror = () => {
        if (socket && socket.readyState < 2) {
          socket.close();
        }
      };

      socket.onclose = () => {
        if (isUnmounted) {
          return;
        }
        setIsSocketConnected(false);
        const reconnectDelay = Math.min(5000, 900 + reconnectAttempts * 700);
        reconnectAttempts += 1;
        reconnectTimerId = window.setTimeout(connectSocket, reconnectDelay);
      };
    };

    connectSocket();

    return () => {
      isUnmounted = true;
      setIsSocketConnected(false);
      if (reconnectTimerId) {
        window.clearTimeout(reconnectTimerId);
      }
      if (socket && socket.readyState < 2) {
        socket.close();
      }
    };
  }, [handleIncomingSignal, isAuthenticated, loadDashboard, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return undefined;
    }

    if (!USE_MOCK_API && isSocketConnected) {
      return undefined;
    }

    const intervalMs = isCallsVisibleRef.current ? 2500 : 7000;
    const intervalId = window.setInterval(() => {
      loadDashboard({ background: true });
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, isCallsVisible, isSocketConnected, loadDashboard, token]);

  const activeSession = useMemo(() => dashboard.activeSession ?? null, [dashboard.activeSession]);

  useEffect(() => {
    activeSessionRef.current = activeSession ?? null;
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession) {
      stopRingtone();
      teardownMedia();
      setLiveDurationLabel("");
      currentSessionIdRef.current = "";
      return;
    }

    const isRinging = activeSession.status === "ringing";
    if (isRinging) {
      startRingtone();
    } else {
      stopRingtone();
    }

    if (activeSession.status === "accepted") {
      initializeAcceptedCall(activeSession).catch((mediaError) => {
        setError(mediaError?.message ?? "Unable to initialize call media.");
      });
      return;
    }

    if (activeSession.status !== "ringing") {
      teardownMedia();
      currentSessionIdRef.current = "";
    }
  }, [activeSession, initializeAcceptedCall, startRingtone, stopRingtone, teardownMedia]);

  useEffect(() => {
    if (!activeSession) {
      setLiveDurationLabel("");
      acceptedStartedAtRef.current = { sessionId: "", startedAtMs: 0 };
      return;
    }

    const fallback = activeSession.durationLabel || "0:00";
    if (activeSession.status !== "accepted") {
      setLiveDurationLabel(fallback);
      if (acceptedStartedAtRef.current.sessionId !== activeSession.id) {
        acceptedStartedAtRef.current = { sessionId: "", startedAtMs: 0 };
      }
      return;
    }

    const candidateStartTimestamp = new Date(
      activeSession.answeredAt || activeSession.createdAt || activeSession.updatedAt || "",
    ).getTime();

    const previousStart = acceptedStartedAtRef.current;
    const needsReset = previousStart.sessionId !== activeSession.id || !Number.isFinite(previousStart.startedAtMs) || previousStart.startedAtMs <= 0;

    if (needsReset) {
      if (!Number.isFinite(candidateStartTimestamp) || candidateStartTimestamp <= 0) {
        setLiveDurationLabel(fallback);
        return;
      }
      acceptedStartedAtRef.current = { sessionId: activeSession.id, startedAtMs: candidateStartTimestamp };
    } else if (Number.isFinite(candidateStartTimestamp) && candidateStartTimestamp > 0) {
      acceptedStartedAtRef.current = {
        sessionId: activeSession.id,
        startedAtMs: Math.min(previousStart.startedAtMs, candidateStartTimestamp),
      };
    }

    if (!acceptedStartedAtRef.current.startedAtMs) {
      setLiveDurationLabel(fallback);
      return;
    }

    const update = () => {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - acceptedStartedAtRef.current.startedAtMs) / 1000));
      setLiveDurationLabel(formatDurationLabel(elapsedSeconds));
    };

    update();
    const intervalId = window.setInterval(update, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeSession]);

  useEffect(() => {
    return () => {
      stopRingtone();
      teardownMedia();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [stopRingtone, teardownMedia]);

  const contacts = useMemo(() => dashboard.contacts ?? [], [dashboard.contacts]);
  const recentSessions = useMemo(() => dashboard.recentSessions ?? [], [dashboard.recentSessions]);
  const activeSessionWithRuntime = useMemo(
    () =>
      activeSession
        ? {
            ...activeSession,
            durationLabel: liveDurationLabel || activeSession.durationLabel || "0:00",
          }
        : null,
    [activeSession, liveDurationLabel],
  );
  const hasIncomingCall = useMemo(
    () =>
      Boolean(
        activeSessionWithRuntime &&
          activeSessionWithRuntime.status === "ringing" &&
          activeSessionWithRuntime.direction === "incoming",
      ),
    [activeSessionWithRuntime],
  );

  return {
    activeSession: activeSessionWithRuntime,
    contacts,
    recentSessions,
    hasIncomingCall,
    localStream,
    remoteStream,
    micMuted,
    cameraOff,
    mediaReady,
    loading,
    actionLoading,
    error,
    loadDashboard,
    startCall,
    respondToCall,
    toggleMic,
    toggleCamera,
  };
}
