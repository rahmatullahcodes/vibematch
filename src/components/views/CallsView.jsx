import { useEffect, useRef } from "react";

function formatStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }
  return status.replace("_", " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

function CallsView({
  activeSession,
  contacts,
  recentSessions,
  localStream,
  remoteStream,
  micMuted,
  cameraOff,
  mediaReady,
  loading,
  actionLoading,
  error,
  onRefresh,
  onStartCall,
  onRespondToCall,
  onToggleMic,
  onToggleCamera,
  isAuthenticated,
  onLoginRequest,
}) {
  const remoteAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const hasIncomingCall = activeSession?.status === "ringing" && activeSession?.direction === "incoming";
  const hasLiveCall = activeSession?.status === "accepted";
  const isVideoCall = activeSession?.type === "video";

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream || null;
      if (remoteStream) {
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current
          .play()
          .then(() => {})
          .catch(() => {});
      }
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  return (
    <div className="space-y-6">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <section className="glass animate-rise rounded-3xl p-4 sm:p-6 [animation-delay:80ms]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-3xl text-white md:text-4xl">Voice + Video Calls</h2>
            <p className="mt-1 text-sm text-slate-300">
              Real-time call lounge for quick voice check-ins and high-intent video introductions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isAuthenticated ? (
              <button
                onClick={onRefresh}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Refresh Calls
              </button>
            ) : (
              <button
                onClick={onLoginRequest}
                className="rounded-full border border-coral/40 bg-coral/20 px-4 py-2 text-xs font-semibold text-white"
              >
                Login required for calls
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <article className="glass animate-rise rounded-3xl p-5 [animation-delay:130ms]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-xl text-white">Active Session</h3>
            {activeSession && (
              <span className="rounded-full border border-aqua/35 bg-aqua/10 px-3 py-1 text-[11px] font-semibold text-aqua">
                {formatStatusLabel(activeSession.status)}
              </span>
            )}
          </div>

          {!activeSession ? (
            <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">
              No active calls right now. Start a voice call from your matched contacts.
            </p>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src={activeSession.peerAvatar} alt={activeSession.peerName} className="h-12 w-12 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{activeSession.peerName}</p>
                  <p className="text-xs text-slate-300">
                    {activeSession.type === "video" ? "Video call" : "Voice call"} / {activeSession.direction}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">Duration: {activeSession.durationLabel}</p>
                <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                  Status: {formatStatusLabel(activeSession.status)}
                </p>
                <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                  Updated: {new Date(activeSession.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {hasLiveCall && (
                <div className="mt-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200">
                  {mediaReady ? "Media channel connected. You can speak now." : "Connecting media channel..."}
                </div>
              )}

              {hasLiveCall && isVideoCall && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-xl border border-white/15 bg-black/35">
                    <video ref={remoteVideoRef} autoPlay playsInline className="h-36 w-full object-cover" />
                    <p className="px-2 py-1 text-[11px] text-slate-300">Remote</p>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/15 bg-black/35">
                    <video ref={localVideoRef} autoPlay muted playsInline className="h-36 w-full object-cover" />
                    <p className="px-2 py-1 text-[11px] text-slate-300">You</p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {hasIncomingCall && (
                  <button
                    onClick={() => onRespondToCall(activeSession.id, "accept")}
                    disabled={actionLoading}
                    className="rounded-xl bg-aqua px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                  >
                    Accept
                  </button>
                )}
                {hasIncomingCall && (
                  <button
                    onClick={() => onRespondToCall(activeSession.id, "decline")}
                    disabled={actionLoading}
                    className="rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                  >
                    Decline
                  </button>
                )}
                {hasLiveCall && (
                  <button
                    onClick={onToggleMic}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    {micMuted ? "Unmute Mic" : "Mute Mic"}
                  </button>
                )}
                {hasLiveCall && isVideoCall && (
                  <button
                    onClick={onToggleCamera}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    {cameraOff ? "Turn Camera On" : "Turn Camera Off"}
                  </button>
                )}
                {hasLiveCall && (
                  <button
                    onClick={() => onRespondToCall(activeSession.id, "end")}
                    disabled={actionLoading}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                  >
                    End Call
                  </button>
                )}
                {!hasIncomingCall && activeSession.status === "ringing" && activeSession.direction === "outgoing" && (
                  <button
                    onClick={() => onRespondToCall(activeSession.id, "cancel")}
                    disabled={actionLoading}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </article>

        <aside className="glass animate-rise rounded-3xl p-5 [animation-delay:180ms]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-xl text-white">Matched Contacts</h3>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
              {contacts.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="surface-soft h-14 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">
              No direct contacts available yet. Match first from Swipe tab.
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.peerUserId} className="surface-soft rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <img src={contact.avatar} alt={contact.name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{contact.name}</p>
                      <p className="truncate text-xs text-slate-300">{contact.status}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onStartCall(contact.peerUserId, "voice")}
                      disabled={actionLoading || !isAuthenticated}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                    >
                      Voice
                    </button>
                    <button
                      onClick={() => onStartCall(contact.peerUserId, "video")}
                      disabled={actionLoading || !isAuthenticated}
                      className="rounded-xl bg-gradient-to-r from-coral to-ember px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                    >
                      Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>

      <section className="glass animate-rise rounded-3xl p-5 [animation-delay:220ms]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl text-white">Recent Calls</h3>
          <span className="text-xs text-slate-300">Call timeline</span>
        </div>

        {recentSessions.length === 0 ? (
          <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">No recent call history.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="surface-soft rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <img src={session.peerAvatar} alt={session.peerName} className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{session.peerName}</p>
                    <p className="truncate text-[11px] text-slate-300">
                      {session.type === "video" ? "Video" : "Voice"} / {session.direction}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300">
                  <span>{formatStatusLabel(session.status)}</span>
                  <span>{session.durationLabel}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
    </div>
  );
}

export default CallsView;
