export function formatDateTime(value) {
  if (!value) {
    return "NA";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "NA";
  }
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusTone(status) {
  if (status === "active" || status === "resolved") {
    return "border-aqua/35 bg-aqua/15 text-aqua";
  }
  if (status === "suspended" || status === "under_review") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-200";
  }
  if (status === "banned" || status === "open") {
    return "border-coral/35 bg-coral/15 text-coral";
  }
  if (status === "dismissed") {
    return "border-white/20 bg-white/10 text-slate-300";
  }
  return "border-white/20 bg-white/10 text-slate-300";
}
