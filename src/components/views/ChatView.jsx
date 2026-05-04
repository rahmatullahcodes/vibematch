import { useEffect, useMemo, useRef, useState } from "react";

function getDeliveryLabel(status) {
  if (status === "read") {
    return "Read";
  }
  if (status === "delivered") {
    return "Delivered";
  }
  return "Sent";
}

function canMarkReadNow(mobilePanel) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const isMobileViewport = window.innerWidth < 1024;
  if (isMobileViewport && mobilePanel !== "chat") {
    return false;
  }

  return document.visibilityState === "visible" && document.hasFocus();
}

function ChatView({
  threads,
  activeThreadId,
  setActiveThreadId,
  activeThread,
  messages,
  threadsLoading,
  messagesLoading,
  sendLoading,
  isPeerTyping,
  error,
  onSendMessage,
  onTyping,
  onRefresh,
  onMarkThreadRead,
  onReactMessage,
  onDeleteMessage,
  onReportMessage,
  onReportUser,
  onBlockUser,
  onUnmatchUser,
  onStartVoiceCall,
  onStartVideoCall,
  onLoginRequest,
  isAuthenticated,
}) {
  const [draft, setDraft] = useState("");
  const [mobilePanel, setMobilePanel] = useState("threads");
  const [replyTarget, setReplyTarget] = useState(null);
  const [actionMessageId, setActionMessageId] = useState("");
  const [localNotice, setLocalNotice] = useState("");
  const messagesPanelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingSentRef = useRef(false);
  const latestMessageId = useMemo(() => messages[messages.length - 1]?.id ?? "", [messages]);
  const lastOutgoingMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.from === "me") {
        return messages[index];
      }
    }
    return null;
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) {
      return;
    }

    const response = await onSendMessage(content, {
      replyToId: replyTarget?.id || "",
    });
    if (response) {
      setDraft("");
      setReplyTarget(null);
      if (typingSentRef.current && onTyping) {
        onTyping(false);
        typingSentRef.current = false;
      }
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleDraftChange = (event) => {
    const nextValue = event.target.value;
    setDraft(nextValue);

    if (!onTyping || !activeThreadId) {
      return;
    }

    const hasContent = Boolean(nextValue.trim());
    if (hasContent && !typingSentRef.current) {
      onTyping(true);
      typingSentRef.current = true;
    }

    if (!hasContent && typingSentRef.current) {
      onTyping(false);
      typingSentRef.current = false;
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (hasContent) {
      typingTimeoutRef.current = window.setTimeout(() => {
        if (typingSentRef.current) {
          onTyping(false);
          typingSentRef.current = false;
        }
      }, 1600);
    }
  };

  const handleThreadSelect = (threadId) => {
    if (typingSentRef.current && onTyping) {
      onTyping(false);
      typingSentRef.current = false;
    }
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setActiveThreadId(threadId);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobilePanel("chat");
    }
  };

  const handleReportUser = async () => {
    if (!activeThread?.peerUserId) {
      return;
    }
    const confirmed = window.confirm(`Report ${activeThread.name} for safety review?`);
    if (!confirmed) {
      return;
    }
    const response = await onReportUser(activeThread.peerUserId, "User-level safety concern");
    if (response?.ok) {
      setLocalNotice("User reported successfully.");
    }
  };

  const handleBlockUser = async () => {
    if (!activeThread?.peerUserId) {
      return;
    }
    const confirmed = window.confirm(`Block ${activeThread.name}? You will lose this conversation.`);
    if (!confirmed) {
      return;
    }
    const response = await onBlockUser(activeThread.peerUserId);
    if (response?.ok) {
      setReplyTarget(null);
      setLocalNotice(`${activeThread.name} blocked.`);
      setMobilePanel("threads");
    }
  };

  const handleUnmatchUser = async () => {
    if (!activeThread?.peerUserId) {
      return;
    }
    const confirmed = window.confirm(`Unmatch ${activeThread.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }
    const response = await onUnmatchUser(activeThread.peerUserId);
    if (response?.ok) {
      setReplyTarget(null);
      setLocalNotice(`You unmatched ${activeThread.name}.`);
      setMobilePanel("threads");
    }
  };

  const handleStartVoiceCall = async () => {
    if (!isAuthenticated) {
      onLoginRequest();
      return;
    }
    if (!activeThread?.peerUserId || !onStartVoiceCall) {
      return;
    }
    const response = await onStartVoiceCall(activeThread.peerUserId);
    if (response?.ok) {
      setLocalNotice(`Voice call started with ${activeThread.name}.`);
    }
  };

  const handleStartVideoCall = async () => {
    if (!isAuthenticated) {
      onLoginRequest();
      return;
    }
    if (!activeThread?.peerUserId || !onStartVideoCall) {
      return;
    }
    const response = await onStartVideoCall(activeThread.peerUserId);
    if (response?.ok) {
      setLocalNotice(`Video call started with ${activeThread.name}.`);
    }
  };

  useEffect(() => {
    if (!activeThreadId || !onMarkThreadRead) {
      return;
    }
    if (!canMarkReadNow(mobilePanel)) {
      return;
    }
    onMarkThreadRead(activeThreadId);
  }, [activeThreadId, latestMessageId, mobilePanel, onMarkThreadRead]);

  useEffect(() => {
    if (!activeThreadId) {
      return;
    }

    const panel = messagesPanelRef.current;
    if (!panel) {
      return;
    }

    window.requestAnimationFrame(() => {
      panel.scrollTop = panel.scrollHeight;
    });
  }, [activeThreadId]);

  useEffect(() => {
    const panel = messagesPanelRef.current;
    if (!panel || !latestMessageId) {
      return;
    }

    const distanceFromBottom = panel.scrollHeight - panel.scrollTop - panel.clientHeight;
    const shouldStickToBottom = distanceFromBottom < 160;
    if (!shouldStickToBottom) {
      return;
    }

    window.requestAnimationFrame(() => {
      panel.scrollTop = panel.scrollHeight;
    });
  }, [latestMessageId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      if (typingSentRef.current && onTyping) {
        onTyping(false);
      }
    };
  }, [onTyping]);

  return (
    <div className="space-y-6">
      <section className="glass animate-rise rounded-3xl p-6 [animation-delay:80ms]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-3xl text-white md:text-4xl">Message Hub</h2>
            <p className="mt-1 text-sm text-slate-300">Secure conversations for date planning and follow-ups.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isAuthenticated && (
              <button
                onClick={onRefresh}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Refresh Chats
              </button>
            )}
            {!isAuthenticated && (
              <button
                onClick={onLoginRequest}
                className="rounded-full border border-coral/40 bg-coral/20 px-4 py-2 text-xs font-semibold text-white"
              >
                Login required for messaging
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="glass animate-rise flex items-center gap-2 rounded-2xl p-2 lg:hidden">
        <button
          onClick={() => setMobilePanel("threads")}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            mobilePanel === "threads" ? "bg-coral text-white" : "text-slate-300"
          }`}
        >
          Conversations
        </button>
        <button
          onClick={() => setMobilePanel("chat")}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            mobilePanel === "chat" ? "bg-coral text-white" : "text-slate-300"
          }`}
        >
          Active Chat
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={`glass animate-rise h-[min(46vh,400px)] min-h-[260px] flex-col rounded-3xl p-4 [animation-delay:140ms] sm:h-[min(54vh,460px)] sm:min-h-[320px] lg:flex lg:h-[min(66vh,680px)] lg:min-h-[460px] ${
            mobilePanel === "chat" ? "hidden" : "flex"
          }`}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Conversations</p>
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-300">
              {threads.length} active
            </span>
          </div>

          {threadsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="surface-soft h-14 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="scrollbar-hidden flex-1 space-y-2 overflow-y-auto pr-1">
              {threads.map((thread) => {
                const isActive = thread.id === activeThreadId;

                return (
                  <button
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-white/20 bg-white/12"
                        : "border-transparent hover:border-white/10 hover:bg-white/8"
                    }`}
                  >
                    <img src={thread.avatar} alt={thread.name} className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          {thread.kind === "direct" && thread.isPeerOnline && <span className="h-2 w-2 rounded-full bg-aqua" />}
                          <p className="truncate text-sm font-semibold text-white">{thread.name}</p>
                        </div>
                        <span className="text-[11px] text-slate-400">{thread.time}</span>
                      </div>
                      <p className="truncate text-xs text-slate-300">{thread.preview}</p>
                    </div>
                    {thread.unread > 0 && (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-coral text-[11px] font-semibold text-white">
                        {thread.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <article
          className={`glass animate-rise h-[min(56vh,500px)] min-h-[300px] flex-col overflow-hidden rounded-3xl p-4 [animation-delay:180ms] sm:h-[min(64vh,620px)] sm:min-h-[420px] sm:p-5 lg:flex lg:h-[min(68vh,720px)] lg:min-h-[520px] ${
            mobilePanel === "threads" ? "hidden" : "flex"
          }`}
        >
          {activeThread ? (
            <>
              <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeThread.avatar} alt={activeThread.name} className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-white">{activeThread.name}</p>
                    <p className="text-xs text-slate-300">{isPeerTyping ? "Typing..." : activeThread.status}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => setMobilePanel("threads")}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-slate-200 lg:hidden"
                  >
                    Back
                  </button>
                  {activeThread.kind === "direct" && (
                    <button
                      onClick={handleStartVoiceCall}
                      disabled={!activeThread?.peerUserId}
                      className="rounded-full border border-aqua/30 bg-aqua/15 px-3 py-1 text-[10px] font-semibold text-aqua disabled:opacity-60"
                    >
                      Voice
                    </button>
                  )}
                  {activeThread.kind === "direct" && (
                    <button
                      onClick={handleStartVideoCall}
                      disabled={!activeThread?.peerUserId}
                      className="rounded-full border border-coral/35 bg-coral/15 px-3 py-1 text-[10px] font-semibold text-coral disabled:opacity-60"
                    >
                      Video
                    </button>
                  )}
                  {activeThread.kind === "direct" && (
                    <button
                      onClick={handleReportUser}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-slate-200"
                    >
                      Report
                    </button>
                  )}
                  <span className="rounded-full border border-aqua/30 bg-aqua/15 px-3 py-1 text-[10px] font-semibold text-aqua">
                    Encrypted
                  </span>
                </div>
              </div>

              {activeThread.kind === "direct" && activeThread.peerUserId && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleBlockUser}
                    className="rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-100"
                  >
                    Block User
                  </button>
                  <button
                    onClick={handleUnmatchUser}
                    className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold text-amber-100"
                  >
                    Unmatch
                  </button>
                </div>
              )}

              <div ref={messagesPanelRef} className="scrollbar-hidden flex-1 overflow-y-auto pb-1 pr-1">
                {messagesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="surface-soft h-12 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : messages.length ? (
                  <div className="space-y-3">
                    <div className="sticky top-0 z-10 flex justify-center pb-2 pt-1">
                      <span className="rounded-full border border-white/20 bg-slate-900/65 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] text-slate-200 backdrop-blur">
                        TODAY
                      </span>
                    </div>

                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-full">
                          {msg.replyTo?.text && (
                            <div className="mb-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] text-slate-300">
                              Reply: {msg.replyTo.text}
                            </div>
                          )}

                          <div
                            className={`max-w-xs rounded-2xl px-4 py-2 text-sm leading-relaxed md:max-w-md ${
                              msg.from === "me"
                                ? "bg-gradient-to-r from-coral to-ember text-white"
                                : "surface-soft text-slate-100"
                            }`}
                          >
                            <p className="break-words">{msg.text}</p>
                            {msg.sentAt && <p className="mt-1 text-[10px] opacity-80">{msg.sentAt}</p>}
                          </div>

                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {Object.entries(msg.reactions).map(([emoji, count]) => (
                                <span key={emoji} className="rounded-full bg-white/12 px-2 py-0.5 text-[11px] text-slate-100">
                                  {emoji} {count}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => setReplyTarget(msg)}
                              className="text-[11px] font-semibold text-slate-400 hover:text-white"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => setActionMessageId((previous) => (previous === msg.id ? "" : msg.id))}
                              className="text-[11px] font-semibold text-slate-400 hover:text-white"
                            >
                              Actions
                            </button>
                            {msg.from === "me" && msg.id === lastOutgoingMessage?.id && (
                              <p className="text-[10px] font-medium text-slate-400">{getDeliveryLabel(msg.deliveryStatus)}</p>
                            )}
                          </div>

                          {actionMessageId === msg.id && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              <button
                                onClick={() => onReactMessage(msg.id, "\u2764\uFE0F")}
                                className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white"
                              >
                                {"\u2764\uFE0F"}
                              </button>
                              <button
                                onClick={() => onReactMessage(msg.id, "\uD83D\uDD25")}
                                className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white"
                              >
                                {"\uD83D\uDD25"}
                              </button>
                              <button
                                onClick={() => onReactMessage(msg.id, "\uD83D\uDC4D")}
                                className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white"
                              >
                                {"\uD83D\uDC4D"}
                              </button>
                              <button
                                onClick={() => onReportMessage(msg.id)}
                                className="rounded-lg border border-red-400/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-100"
                              >
                                Report
                              </button>
                              {msg.from === "me" && (
                                <button
                                  onClick={() => onDeleteMessage(msg.id)}
                                  className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">No messages yet.</p>
                )}
              </div>

              {replyTarget && (
                <div className="mt-3 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  Replying to: "{replyTarget.text.slice(0, 80)}"
                  <button
                    onClick={() => setReplyTarget(null)}
                    className="ml-2 rounded-md border border-white/20 px-2 py-0.5 text-[10px] text-white"
                  >
                    Clear
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row">
                <input
                  type="text"
                  value={draft}
                  onChange={handleDraftChange}
                  placeholder="Write a thoughtful opener..."
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendLoading || !isAuthenticated}
                  className="rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center text-sm text-slate-300">
              Choose a conversation from left panel to start chatting.
            </div>
          )}
        </article>
      </section>

      {(error || localNotice) && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            error
              ? "border border-red-400/35 bg-red-500/10 text-red-100"
              : "border border-aqua/30 bg-aqua/10 text-aqua"
          }`}
        >
          {error || localNotice}
        </p>
      )}
    </div>
  );
}

export default ChatView;
