import { useMemo, useState } from "react";

function getInitials(name) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatIntent(intent) {
  if (typeof intent !== "string" || !intent.trim()) {
    return "Not set";
  }
  return intent.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function DiscoverView({
  feed,
  loading,
  error,
  searchState,
  searchLoading,
  onRefresh,
  onOpenSwipe,
  onOpenAuth,
  onToggleFollow,
  onToggleLike,
  onAddPostComment,
  onSharePost,
  onAddReelComment,
  onShareReel,
  onSearch,
  onRefreshRecommendations,
  onRefreshReels,
  interactionLoading,
  isAuthenticated,
}) {
  const [selectedPostId, setSelectedPostId] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    city: "",
    intent: "",
    interest: "",
    minAge: 21,
    maxAge: 34,
  });
  const [postCommentDrafts, setPostCommentDrafts] = useState({});
  const [reelCommentDrafts, setReelCommentDrafts] = useState({});

  const stories = feed?.stories ?? [];
  const posts = feed?.posts ?? [];
  const reels = feed?.reels ?? [];
  const spotlightMatches = feed?.spotlightMatches ?? [];
  const recommendations = feed?.recommendations ?? [];

  const selectedPost = useMemo(() => posts.find((post) => post.id === selectedPostId) ?? null, [posts, selectedPostId]);
  const profileUnlocked = Boolean(selectedPost?.likedByViewer || selectedPost?.followingAuthor);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await onSearch(searchFilters);
  };

  const handlePostComment = async (postId) => {
    const comment = (postCommentDrafts[postId] ?? "").trim();
    if (!comment) {
      return;
    }
    const response = await onAddPostComment(postId, comment);
    if (response?.ok) {
      setPostCommentDrafts((previous) => ({ ...previous, [postId]: "" }));
    }
  };

  const handleReelComment = async (reelId) => {
    const comment = (reelCommentDrafts[reelId] ?? "").trim();
    if (!comment) {
      return;
    }
    const response = await onAddReelComment(reelId, comment);
    if (response?.ok) {
      setReelCommentDrafts((previous) => ({ ...previous, [reelId]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass animate-rise rounded-3xl p-4 sm:p-5 md:p-7 [animation-delay:60ms]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-100">
              {feed.nearbyCountLabel || "Discovering nearby profiles..."}
            </p>
            <h2 className="mt-4 max-w-2xl font-heading text-2xl leading-tight text-white sm:text-3xl md:text-5xl">
              {feed.heroTitle || "Curated social matching for meaningful conversations"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
              {feed.heroDescription || "Live stories, personality-first matches, and date planning in one space."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onOpenSwipe}
                className="rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow"
              >
                Start Matching
              </button>
              {!isAuthenticated && (
                <button
                  onClick={onOpenAuth}
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Create Account
                </button>
              )}
              <button
                onClick={onRefresh}
                className="rounded-2xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Refresh Feed
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="surface-soft rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Profiles Online</p>
              <p className="mt-2 font-heading text-3xl text-coral">12.4k</p>
              <p className="text-xs text-slate-300">Active in your city now</p>
            </div>
            <div className="surface-soft rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">New Matches</p>
              <p className="mt-2 font-heading text-3xl text-aqua">87</p>
              <p className="text-xs text-slate-300">In the last 24 hours</p>
            </div>
            <div className="surface-soft rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Community Score</p>
              <p className="mt-2 font-heading text-3xl text-amber-300">4.8</p>
              <p className="text-xs text-slate-300">User experience rating</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass animate-rise rounded-3xl p-4 sm:p-5 [animation-delay:120ms]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl text-white">Advanced Search</h3>
          <span className="text-xs text-slate-300">{searchState?.total ?? 0} results</span>
        </div>
        <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-8">
          <input
            value={searchFilters.query}
            onChange={(event) => setSearchFilters((previous) => ({ ...previous, query: event.target.value }))}
            placeholder="Search name, city, vibe"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none xl:col-span-2"
          />
          <input
            value={searchFilters.city}
            onChange={(event) => setSearchFilters((previous) => ({ ...previous, city: event.target.value }))}
            placeholder="City"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
          />
          <select
            value={searchFilters.intent}
            onChange={(event) => setSearchFilters((previous) => ({ ...previous, intent: event.target.value }))}
            className="rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm text-white focus:border-coral/70 focus:outline-none"
          >
            <option value="">Any intent</option>
            <option value="dating">Dating</option>
            <option value="long_term">Long term</option>
            <option value="friendship">Friendship</option>
            <option value="casual">Casual</option>
          </select>
          <input
            value={searchFilters.interest}
            onChange={(event) => setSearchFilters((previous) => ({ ...previous, interest: event.target.value }))}
            placeholder="Interest"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
          />
          <input
            type="number"
            min={18}
            max={70}
            value={searchFilters.minAge}
            onChange={(event) =>
              setSearchFilters((previous) => ({
                ...previous,
                minAge: Number(event.target.value) || 18,
              }))
            }
            placeholder="Min age"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
          />
          <input
            type="number"
            min={18}
            max={70}
            value={searchFilters.maxAge}
            onChange={(event) =>
              setSearchFilters((previous) => ({
                ...previous,
                maxAge: Number(event.target.value) || 60,
              }))
            }
            placeholder="Max age"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {searchState?.results?.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {searchState.results.slice(0, 6).map((result) => (
              <article key={result.id} className="surface-soft rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <img src={result.avatar} alt={result.name} className="h-11 w-11 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {result.name}, {result.age}
                    </p>
                    <p className="truncate text-xs text-slate-300">
                      {result.city} / {formatIntent(result.intent)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-200">{result.bio}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="glass animate-rise rounded-3xl p-4 sm:p-5 [animation-delay:130ms]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl text-white">Live Stories</h3>
          <button onClick={onRefresh} className="text-sm font-medium text-coral transition hover:text-amber-300">
            Reload
          </button>
        </div>

        {loading ? (
          <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">Loading stories...</p>
        ) : (
          <div className="scrollbar-hidden flex gap-4 overflow-x-auto pb-2">
            {stories.map((story) => (
              <article key={story.id} className="min-w-[120px] max-w-[120px]">
                <div className="rounded-full bg-gradient-to-tr from-coral via-ember to-aqua p-[2px]">
                  <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10">
                    <img src={story.image} alt={story.name} className="h-full w-full object-cover" />
                  </div>
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-white">{story.name}</p>
                <p className="truncate text-xs text-slate-300">{story.city}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="glass animate-rise rounded-3xl p-4 sm:p-5 [animation-delay:150ms]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl text-white">Smart Recommendations</h3>
          <button
            onClick={onRefreshRecommendations}
            className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {recommendations.slice(0, 6).map((profile) => (
            <article key={profile.id} className="surface-soft rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {profile.name}, {profile.age}
                  </p>
                  <p className="truncate text-xs text-slate-300">
                    {profile.city} / {profile.recommendationScore}% fit
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-200">{profile.reasons?.[0] || "High intent alignment"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          {posts.map((post, index) => {
            const followLoading = Boolean(interactionLoading?.[`follow:${post.authorId}`]);
            const likeLoading = Boolean(interactionLoading?.[`like:${post.id}`]);
            const commentLoading = Boolean(interactionLoading?.[`comment:${post.id}`]);
            const shareLoading = Boolean(interactionLoading?.[`share:${post.id}`]);
            const likesLabel = post.likesLabel ?? (typeof post.likesCount === "number" ? `${post.likesCount}` : post.likes);

            return (
              <article
                key={post.id}
                className="glass animate-rise rounded-3xl p-4 sm:p-5"
                style={{ animationDelay: `${220 + index * 70}ms` }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-tr from-coral to-aqua text-sm font-bold text-white">
                      {getInitials(post.author)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{post.author}</p>
                      <p className="text-xs text-slate-300">
                        {post.handle} / {post.time}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => (isAuthenticated ? onToggleFollow(post.authorId) : onOpenAuth())}
                    disabled={followLoading}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                      post.followingAuthor
                        ? "border-aqua/50 bg-aqua/20 text-aqua hover:bg-aqua/30"
                        : "border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
                    }`}
                  >
                    {followLoading ? "..." : post.followingAuthor ? "Following" : "Follow"}
                  </button>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-slate-200">{post.caption}</p>

                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img src={post.image} alt={post.author} className="h-64 w-full object-cover sm:h-80" />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300 sm:text-sm">
                  <button
                    onClick={() => (isAuthenticated ? onToggleLike(post.id) : onOpenAuth())}
                    disabled={likeLoading}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 sm:text-sm ${
                      post.likedByViewer
                        ? "border-coral/45 bg-coral/20 text-coral hover:bg-coral/30"
                        : "border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
                    }`}
                  >
                    {likeLoading ? "Updating..." : post.likedByViewer ? "Unlike" : "Like"} / {likesLabel} likes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPostId(post.id)}
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10 sm:text-sm"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => (isAuthenticated ? onSharePost(post.id, "copy_link") : onOpenAuth())}
                    disabled={shareLoading}
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-60 sm:text-sm"
                  >
                    {shareLoading ? "Sharing..." : `Share / ${post.sharesLabel || post.sharesCount || 0}`}
                  </button>
                  <span>{post.commentsLabel || post.commentsCount || post.comments || 0} comments</span>
                </div>

                <div className="mt-3 space-y-2">
                  {(post.recentComments ?? []).slice(-2).map((comment) => (
                    <div key={comment.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                      <span className="font-semibold text-white">{comment.authorName}:</span> {comment.text}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={postCommentDrafts[post.id] ?? ""}
                    onChange={(event) =>
                      setPostCommentDrafts((previous) => ({
                        ...previous,
                        [post.id]: event.target.value,
                      }))
                    }
                    placeholder="Add a comment..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={commentLoading}
                    onClick={() => (isAuthenticated ? handlePostComment(post.id) : onOpenAuth())}
                    className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {commentLoading ? "Posting..." : "Comment"}
                  </button>
                </div>
              </article>
            );
          })}

          {posts.length === 0 && !loading && (
            <div className="surface-soft rounded-3xl px-4 py-8 text-center text-sm text-slate-300">
              No posts available at the moment.
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="glass animate-rise rounded-3xl p-4 sm:p-5 [animation-delay:280ms]">
            <h3 className="font-heading text-lg text-white">Spotlight Matches</h3>
            <div className="mt-4 space-y-3">
              {spotlightMatches.map((match) => (
                <div key={match.id} className="surface-soft rounded-2xl p-3">
                  <div className={`mb-3 h-20 rounded-xl bg-gradient-to-br ${match.gradient} animate-floaty`} />
                  <p className="text-sm font-semibold text-white">
                    {match.name}, {match.age}
                  </p>
                  <p className="text-xs text-slate-300">{match.vibe}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass animate-rise rounded-3xl p-4 sm:p-5 [animation-delay:340ms]">
            <h3 className="font-heading text-lg text-white">Tonight Highlight</h3>
            <div className="mt-4 rounded-2xl border border-aqua/30 bg-gradient-to-br from-aqua/20 to-cyan-500/10 p-4">
              <p className="text-sm font-semibold text-white">
                {feed.highlight?.title || "City Hangout"} / {feed.highlight?.timeLabel || "8:30 PM"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-200">
                {feed.highlight?.description || "Curated social event recommendations are loading."}
              </p>
              <button className="mt-4 w-full rounded-xl bg-aqua px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto">
                Reserve Spot
              </button>
            </div>
          </section>

          <section className="glass animate-rise rounded-3xl p-5 [animation-delay:380ms]">
            <h3 className="font-heading text-lg text-white">Feed Assistant</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {feed.viewerName ? `${feed.viewerName}, ` : ""}keep your profile bio crisp and use one strong opener for higher response rate.
            </p>
          </section>
        </aside>
      </section>

      <section className="glass animate-rise rounded-3xl p-4 sm:p-5 [animation-delay:420ms]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl text-white">Stories/Reels</h3>
          <button
            onClick={onRefreshReels}
            className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Refresh Reels
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reels.map((reel) => {
            const commentLoading = Boolean(interactionLoading?.[`reel-comment:${reel.id}`]);
            const shareLoading = Boolean(interactionLoading?.[`reel-share:${reel.id}`]);
            return (
              <article key={reel.id} className="surface-soft rounded-2xl p-3">
                <div className="relative overflow-hidden rounded-xl border border-white/10">
                  <img src={reel.thumbnail} alt={reel.author} className="h-44 w-full object-cover" />
                  <span className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                    {reel.durationLabel}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-white">{reel.author}</p>
                  <p className="text-xs text-slate-300">
                    {reel.handle} / {reel.city}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-200">{reel.caption}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  <span>{reel.viewsLabel} views</span>
                  <span>{reel.likesLabel} likes</span>
                  <span>{reel.commentsLabel} comments</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={shareLoading}
                    onClick={() => (isAuthenticated ? onShareReel(reel.id, "copy_link") : onOpenAuth())}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                  >
                    {shareLoading ? "Sharing..." : `Share (${reel.sharesLabel || reel.sharesCount || 0})`}
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {(reel.recentComments ?? []).slice(-2).map((comment) => (
                    <div key={comment.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                      <span className="font-semibold text-white">{comment.authorName}:</span> {comment.text}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <input
                    type="text"
                    value={reelCommentDrafts[reel.id] ?? ""}
                    onChange={(event) =>
                      setReelCommentDrafts((previous) => ({
                        ...previous,
                        [reel.id]: event.target.value,
                      }))
                    }
                    placeholder="Comment on reel..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={commentLoading}
                    onClick={() => (isAuthenticated ? handleReelComment(reel.id) : onOpenAuth())}
                    className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {commentLoading ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {error && (
        <p className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>
      )}

      {selectedPost && (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-slate-950/75 px-3 py-6">
          <div className="glass-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={selectedPost.profile?.avatar || selectedPost.image}
                  alt={selectedPost.author}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-heading text-2xl text-white">{selectedPost.author}</p>
                  <p className="truncate text-xs text-slate-300">{selectedPost.handle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPostId("")}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                Age: {selectedPost.profile?.age || "Not shared"}
              </p>
              <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                City: {selectedPost.profile?.city || "Not shared"}
              </p>
              <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                Intent: {formatIntent(selectedPost.profile?.intent)}
              </p>
              <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                Verification:{" "}
                {selectedPost.profile?.verification?.phone ||
                selectedPost.profile?.verification?.selfie ||
                selectedPost.profile?.verification?.id
                  ? "Verified"
                  : "Not verified"}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(selectedPost.profile?.interests ?? []).map((item) => (
                <span key={item} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-slate-100">
                  {item}
                </span>
              ))}
            </div>

            {profileUnlocked ? (
              <div className="mt-5 rounded-2xl border border-aqua/30 bg-aqua/10 p-4 text-sm text-slate-100">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-aqua">Unlocked Details</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Occupation: {selectedPost.profile?.occupation || "Not shared"}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Education: {selectedPost.profile?.education || "Not shared"}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Relationship Goal: {selectedPost.profile?.relationshipGoal || "Not shared"}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Last Active: {selectedPost.profile?.lastActiveLabel || "Recently"}
                  </p>
                </div>
                <p className="mt-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200">
                  {selectedPost.profile?.prompt || "Intentional conversation helps build better connection."}
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">More details are locked.</p>
                <p className="mt-1 text-xs text-slate-300">
                  Profile ko like ya follow karne ke baad advanced details unlock ho jayenge.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => (isAuthenticated ? onToggleLike(selectedPost.id) : onOpenAuth())}
                    disabled={Boolean(interactionLoading?.[`like:${selectedPost.id}`])}
                    className="rounded-xl border border-coral/45 bg-coral/20 px-3 py-2 text-xs font-semibold text-coral transition hover:bg-coral/30 disabled:opacity-60"
                  >
                    {interactionLoading?.[`like:${selectedPost.id}`] ? "Updating..." : "Like Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => (isAuthenticated ? onToggleFollow(selectedPost.authorId) : onOpenAuth())}
                    disabled={Boolean(interactionLoading?.[`follow:${selectedPost.authorId}`])}
                    className="rounded-xl border border-aqua/45 bg-aqua/20 px-3 py-2 text-xs font-semibold text-aqua transition hover:bg-aqua/30 disabled:opacity-60"
                  >
                    {interactionLoading?.[`follow:${selectedPost.authorId}`] ? "Updating..." : "Follow Profile"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DiscoverView;
