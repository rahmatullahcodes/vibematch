import { useCallback, useEffect, useMemo, useState } from "react";
import { matchService } from "../services/matchService";

const EMPTY_STATS = {
  likes: 0,
  matches: 0,
  superLikes: 0,
  passes: 0,
};

const DEFAULT_FILTERS = {
  minAge: 18,
  maxAge: 99,
  city: "all",
  intent: "all",
  interest: "",
  verifiedOnly: false,
  sortBy: "compatibility",
};

function normalizeIntent(intent) {
  if (typeof intent !== "string") {
    return "";
  }
  return intent.trim().toLowerCase();
}

function isProfileVerified(profile) {
  return Boolean(profile?.verification?.phone || profile?.verification?.selfie || profile?.verification?.id);
}

function getProfileLastActiveMinutes(profile) {
  const directValue = Number(profile?.lastActiveMinutes);
  if (Number.isFinite(directValue) && directValue >= 0) {
    return directValue;
  }

  const detailsValue = Number(profile?.details?.lastActiveMinutes);
  if (Number.isFinite(detailsValue) && detailsValue >= 0) {
    return detailsValue;
  }

  const label = typeof profile?.details?.lastActiveLabel === "string" ? profile.details.lastActiveLabel.toLowerCase() : "";
  if (!label) {
    return 100000;
  }

  if (label.includes("now")) {
    return 0;
  }

  const minutesMatch = label.match(/(\d+)\s*m/);
  if (minutesMatch) {
    return Number(minutesMatch[1]) || 0;
  }

  const hoursMatch = label.match(/(\d+)\s*h/);
  if (hoursMatch) {
    return (Number(hoursMatch[1]) || 0) * 60;
  }

  const daysMatch = label.match(/(\d+)\s*d/);
  if (daysMatch) {
    return (Number(daysMatch[1]) || 0) * 1440;
  }

  return 100000;
}

export function useSwipe(token, isAuthenticated) {
  const [allProfiles, setAllProfiles] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastAction, setLastAction] = useState("");
  const [lastMatchName, setLastMatchName] = useState("");
  const [matchedProfileIds, setMatchedProfileIds] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filterOptions = useMemo(() => {
    const cityOptions = Array.from(
      new Set(
        allProfiles
          .map((profile) => (typeof profile.city === "string" ? profile.city.trim() : ""))
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
    const intentOptions = Array.from(
      new Set(allProfiles.map((profile) => normalizeIntent(profile.intent)).filter(Boolean)),
    );
    return {
      cities: cityOptions,
      intents: intentOptions,
    };
  }, [allProfiles]);

  const profiles = useMemo(() => {
    const interestQuery = filters.interest.trim().toLowerCase();
    const filteredProfiles = allProfiles.filter((profile) => {
      const age = Number(profile.age) || 0;
      const city = typeof profile.city === "string" ? profile.city.trim() : "";
      const intent = normalizeIntent(profile.intent);
      const interests = Array.isArray(profile.interests) ? profile.interests.map((item) => item.toLowerCase()) : [];

      if (age < filters.minAge || age > filters.maxAge) {
        return false;
      }
      if (filters.city !== "all" && city !== filters.city) {
        return false;
      }
      if (filters.intent !== "all" && intent !== filters.intent) {
        return false;
      }
      if (interestQuery && !interests.some((item) => item.includes(interestQuery))) {
        return false;
      }
      if (filters.verifiedOnly && !isProfileVerified(profile)) {
        return false;
      }
      return true;
    });

    const sortedProfiles = [...filteredProfiles];
    if (filters.sortBy === "last_active") {
      sortedProfiles.sort((a, b) => getProfileLastActiveMinutes(a) - getProfileLastActiveMinutes(b));
    } else if (filters.sortBy === "distance") {
      sortedProfiles.sort((a, b) => (Number(a.distanceKm) || 999) - (Number(b.distanceKm) || 999));
    } else {
      sortedProfiles.sort((a, b) => (Number(b.compatibility) || 0) - (Number(a.compatibility) || 0));
    }

    return sortedProfiles;
  }, [allProfiles, filters]);

  const currentProfile = useMemo(() => {
    if (!profiles.length) {
      return null;
    }
    return profiles[currentIndex % profiles.length];
  }, [currentIndex, profiles]);

  const refreshProfiles = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setAllProfiles([]);
      setStats(EMPTY_STATS);
      setCurrentIndex(0);
      setMatchedProfileIds([]);
      setError("Login to start swiping.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await matchService.getSwipeCandidates(token);
      setAllProfiles(response?.profiles ?? []);
      setStats(response?.stats ?? EMPTY_STATS);
      setCurrentIndex(0);
      const history = Array.isArray(response?.history) ? response.history : [];
      const matchedIds = Array.from(
        new Set(
          history
            .filter((item) => item?.matched && typeof item?.profileId === "string")
            .map((item) => item.profileId),
        ),
      );
      setMatchedProfileIds(matchedIds);
    } catch (apiError) {
      setError(apiError?.message ?? "Unable to load swipe profiles.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const sendAction = useCallback(
    async (action) => {
      if (!currentProfile || actionLoading || !token) {
        return null;
      }

      setActionLoading(true);
      setError("");

      try {
        const response = await matchService.sendSwipeAction(token, {
          profileId: currentProfile.id,
          action,
        });

        setLastAction(action);
        setLastMatchName(response?.matched ? response?.matchUser?.name ?? "" : "");
        if (response?.matched && typeof response?.profileId === "string") {
          setMatchedProfileIds((previous) =>
            previous.includes(response.profileId) ? previous : [...previous, response.profileId],
          );
        }
        setCurrentIndex((previous) => previous + 1);
        if (response?.stats) {
          setStats(response.stats);
        } else {
          setStats((previous) => {
            if (action === "pass") {
              return { ...previous, passes: previous.passes + 1 };
            }
            if (action === "superlike") {
              return {
                ...previous,
                superLikes: previous.superLikes + 1,
                matches: response?.matched ? previous.matches + 1 : previous.matches,
              };
            }
            return {
              ...previous,
              likes: previous.likes + 1,
              matches: response?.matched ? previous.matches + 1 : previous.matches,
            };
          });
        }
        return response;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to submit swipe action.");
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, currentProfile, token],
  );

  const isCurrentProfileMatched = useMemo(() => {
    if (!currentProfile?.id) {
      return false;
    }
    return matchedProfileIds.includes(currentProfile.id);
  }, [currentProfile?.id, matchedProfileIds]);

  const updateFilters = useCallback((nextPartial) => {
    setFilters((previous) => ({
      ...previous,
      ...nextPartial,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [filters.city, filters.intent, filters.interest, filters.maxAge, filters.minAge, filters.sortBy, filters.verifiedOnly]);

  return {
    currentProfile,
    stats,
    loading,
    actionLoading,
    error,
    lastAction,
    lastMatchName,
    refreshProfiles,
    sendAction,
    filters,
    updateFilters,
    resetFilters,
    filterOptions,
    filteredCount: profiles.length,
    totalCount: allProfiles.length,
    isCurrentProfileMatched,
  };
}
