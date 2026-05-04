import { useCallback, useEffect, useState } from "react";
import { discoverService } from "../services/discoverService";

const EMPTY_FEED = {
  nearbyCountLabel: "",
  heroTitle: "",
  heroDescription: "",
  stories: [],
  posts: [],
  reels: [],
  recommendations: [],
  spotlightMatches: [],
  highlight: null,
  viewerName: "Guest",
};

const EMPTY_SEARCH = {
  filters: {
    query: "",
    city: "",
    intent: "",
    interest: "",
    minAge: 18,
    maxAge: 60,
  },
  total: 0,
  results: [],
  suggestions: {
    cities: [],
    intents: [],
    interests: [],
  },
};

export function useDiscover(token) {
  const [feed, setFeed] = useState(EMPTY_FEED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interactionLoading, setInteractionLoading] = useState({});
  const [searchState, setSearchState] = useState(EMPTY_SEARCH);
  const [searchLoading, setSearchLoading] = useState(false);

  const refreshFeed = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [feedResult, reelsResult, recommendationResult] = await Promise.allSettled([
        discoverService.getDiscoverFeed(token),
        discoverService.getReelsFeed(token),
        discoverService.getRecommendations(token),
      ]);

      const baseFeed = feedResult.status === "fulfilled" ? feedResult.value : EMPTY_FEED;
      const reels = reelsResult.status === "fulfilled" ? reelsResult.value?.reels ?? [] : baseFeed.reels ?? [];
      const recommendations =
        recommendationResult.status === "fulfilled"
          ? recommendationResult.value?.recommendations ?? []
          : baseFeed.recommendations ?? [];

      setFeed({
        ...baseFeed,
        reels,
        recommendations,
      });

      if (feedResult.status === "rejected") {
        throw feedResult.reason;
      }
    } catch (apiError) {
      setError(apiError?.message ?? "Unable to load discover feed.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  const toggleFollowAuthor = useCallback(
    async (authorId) => {
      if (!token) {
        setError("Login to follow people.");
        return { ok: false };
      }

      const loadingKey = `follow:${authorId}`;
      setInteractionLoading((previous) => ({ ...previous, [loadingKey]: true }));
      setError("");

      try {
        const response = await discoverService.toggleFollowAuthor(token, { authorId });
        setFeed((previous) => ({
          ...previous,
          posts: (previous.posts ?? []).map((post) =>
            post.authorId === authorId
              ? {
                  ...post,
                  followingAuthor: response.following,
                }
              : post,
          ),
        }));
        return { ok: true };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to follow this profile.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setInteractionLoading((previous) => ({ ...previous, [loadingKey]: false }));
      }
    },
    [token],
  );

  const togglePostLike = useCallback(
    async (postId) => {
      if (!token) {
        setError("Login to like posts.");
        return { ok: false };
      }

      const loadingKey = `like:${postId}`;
      setInteractionLoading((previous) => ({ ...previous, [loadingKey]: true }));
      setError("");

      try {
        const response = await discoverService.togglePostLike(token, { postId });
        setFeed((previous) => ({
          ...previous,
          posts: (previous.posts ?? []).map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likedByViewer: response.liked,
                  likesCount: response.likesCount,
                  likesLabel: response.likesLabel,
                }
              : post,
          ),
        }));
        return { ok: true };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to update like status.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setInteractionLoading((previous) => ({ ...previous, [loadingKey]: false }));
      }
    },
    [token],
  );

  const addPostComment = useCallback(
    async (postId, text) => {
      if (!token) {
        setError("Login to comment.");
        return { ok: false };
      }

      const loadingKey = `comment:${postId}`;
      setInteractionLoading((previous) => ({ ...previous, [loadingKey]: true }));
      setError("");

      try {
        const response = await discoverService.addPostComment(token, { postId, text });
        setFeed((previous) => ({
          ...previous,
          posts: (previous.posts ?? []).map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: response.commentsCount,
                  commentsCount: response.commentsCount,
                  commentsLabel: response.commentsLabel,
                  recentComments: response.recentComments,
                }
              : post,
          ),
        }));
        return { ok: true };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to post comment.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setInteractionLoading((previous) => ({ ...previous, [loadingKey]: false }));
      }
    },
    [token],
  );

  const sharePost = useCallback(
    async (postId, channel = "copy_link") => {
      if (!token) {
        setError("Login to share posts.");
        return { ok: false };
      }

      const loadingKey = `share:${postId}`;
      setInteractionLoading((previous) => ({ ...previous, [loadingKey]: true }));
      setError("");

      try {
        const response = await discoverService.sharePost(token, { postId, channel });
        setFeed((previous) => ({
          ...previous,
          posts: (previous.posts ?? []).map((post) =>
            post.id === postId
              ? {
                  ...post,
                  sharesCount: response.shareCount,
                  sharesLabel: response.shareLabel,
                }
              : post,
          ),
        }));
        return { ok: true };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to share post.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setInteractionLoading((previous) => ({ ...previous, [loadingKey]: false }));
      }
    },
    [token],
  );

  const addReelComment = useCallback(
    async (reelId, text) => {
      if (!token) {
        setError("Login to comment on reels.");
        return { ok: false };
      }

      const loadingKey = `reel-comment:${reelId}`;
      setInteractionLoading((previous) => ({ ...previous, [loadingKey]: true }));
      setError("");

      try {
        const response = await discoverService.addReelComment(token, { reelId, text });
        setFeed((previous) => ({
          ...previous,
          reels: (previous.reels ?? []).map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  commentsCount: response.commentsCount,
                  commentsLabel: response.commentsLabel,
                  recentComments: response.recentComments,
                }
              : reel,
          ),
        }));
        return { ok: true };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to post reel comment.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setInteractionLoading((previous) => ({ ...previous, [loadingKey]: false }));
      }
    },
    [token],
  );

  const shareReel = useCallback(
    async (reelId, channel = "copy_link") => {
      if (!token) {
        setError("Login to share reels.");
        return { ok: false };
      }

      const loadingKey = `reel-share:${reelId}`;
      setInteractionLoading((previous) => ({ ...previous, [loadingKey]: true }));
      setError("");

      try {
        const response = await discoverService.shareReel(token, { reelId, channel });
        setFeed((previous) => ({
          ...previous,
          reels: (previous.reels ?? []).map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  sharesCount: response.shareCount,
                  sharesLabel: response.shareLabel,
                }
              : reel,
          ),
        }));
        return { ok: true };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to share reel.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setInteractionLoading((previous) => ({ ...previous, [loadingKey]: false }));
      }
    },
    [token],
  );

  const runSearch = useCallback(
    async (filters) => {
      setSearchLoading(true);
      setError("");
      try {
        const result = await discoverService.searchProfiles(token, filters);
        setSearchState({
          filters: result?.filters ?? EMPTY_SEARCH.filters,
          total: typeof result?.total === "number" ? result.total : 0,
          results: Array.isArray(result?.results) ? result.results : [],
          suggestions: result?.suggestions ?? EMPTY_SEARCH.suggestions,
        });
        return { ok: true };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to search profiles.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setSearchLoading(false);
      }
    },
    [token],
  );

  const refreshRecommendations = useCallback(async () => {
    try {
      const result = await discoverService.getRecommendations(token);
      setFeed((previous) => ({
        ...previous,
        recommendations: Array.isArray(result?.recommendations) ? result.recommendations : [],
      }));
      return { ok: true };
    } catch (apiError) {
      const message = apiError?.message ?? "Unable to load recommendations.";
      setError(message);
      return { ok: false, error: message };
    }
  }, [token]);

  const refreshReels = useCallback(async () => {
    try {
      const result = await discoverService.getReelsFeed(token);
      setFeed((previous) => ({
        ...previous,
        reels: Array.isArray(result?.reels) ? result.reels : [],
      }));
      return { ok: true };
    } catch (apiError) {
      const message = apiError?.message ?? "Unable to load reels.";
      setError(message);
      return { ok: false, error: message };
    }
  }, [token]);

  return {
    feed,
    loading,
    error,
    interactionLoading,
    searchState,
    searchLoading,
    refreshFeed,
    toggleFollowAuthor,
    togglePostLike,
    addPostComment,
    sharePost,
    addReelComment,
    shareReel,
    runSearch,
    refreshRecommendations,
    refreshReels,
  };
}
