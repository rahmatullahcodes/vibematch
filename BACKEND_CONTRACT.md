# Spark Social Backend Contract

This frontend is backend-ready and can run with either the in-browser mock API or the local backend server.

To run the included local backend server:

- `npm run backend` (runs on `http://localhost:4000/api`)

## Environment

- `VITE_USE_MOCK_API=true` keeps the in-browser mock backend active.
- Set `VITE_USE_MOCK_API=false` and update `VITE_API_BASE_URL` to switch to your real API.
- Optional Razorpay live/test checkout:
  - `RAZORPAY_KEY_ID=<your_key_id>`
  - `RAZORPAY_KEY_SECRET=<your_key_secret>`
  - put these in `.env` or `backend/.env` and restart `npm run backend`
- Auth/session hardening:
  - `ACCESS_TOKEN_SECRET=<strong_random_secret>`
  - `REFRESH_TOKEN_SECRET=<strong_random_secret>`

## Expected Endpoints

### Auth

- `POST /auth/register`
  - body: `{ name, email, password, interests, age?, city?, bio?, avatar? }`
  - response: `{ token, user }`

- `POST /auth/login`
  - body: `{ email, password }`
  - response: `{ token, refreshToken, tokenExpiresAt, user }`

- `POST /auth/refresh`
  - body: `{ refreshToken }`
  - response: `{ token, refreshToken, tokenExpiresAt, user }`

- `GET /auth/me`
  - headers: `Authorization: Bearer <token>`
  - response: `{ user }`

### Discover

- `GET /discover/feed`
  - optional auth token
  - response:
    - `nearbyCountLabel`
    - `heroTitle`
    - `heroDescription`
    - `stories[]`
    - `posts[]`
    - `spotlightMatches[]`
    - `highlight`
    - `viewerName`

- `POST /discover/follow`
  - auth required
  - body: `{ authorId }`
  - response: `{ authorId, following }`

- `POST /discover/post-like`
  - auth required
  - body: `{ postId }`
  - response: `{ postId, liked, likesCount, likesLabel }`

- `POST /discover/post-comment`
  - auth required
  - body: `{ postId, text }`
  - response: `{ postId, comment, commentsCount, commentsLabel, recentComments }`

- `POST /discover/post-share`
  - auth required
  - body: `{ postId, channel? }`
  - response: `{ postId, shareCount, shareLabel, channel }`

- `GET /discover/reels`
  - optional auth token
  - response: `{ reels[] }`

- `POST /discover/reel-comment`
  - auth required
  - body: `{ reelId, text }`
  - response: `{ reelId, comment, commentsCount, commentsLabel, recentComments }`

- `POST /discover/reel-share`
  - auth required
  - body: `{ reelId, channel? }`
  - response: `{ reelId, shareCount, shareLabel, channel }`

- `POST /discover/search`
  - optional auth token
  - body: `{ query?, city?, intent?, interest?, minAge?, maxAge? }`
  - response: `{ filters, total, results, suggestions }`

- `GET /discover/recommendations`
  - optional auth token
  - response: `{ generatedAt, recommendations[] }`

### Swipe

- `GET /swipe/candidates`
  - auth required
  - response: `{ profiles, stats }`
  - note: profile list should include discoverable community users (excluding self)

- `POST /swipe/action`
  - auth required
  - body: `{ profileId, action }` where `action` is `pass | like | superlike`
  - response: `{ success, action, matched, profileId, matchUser, stats }`
  - note: when two users like/superlike each other, backend should mark `matched=true`
    and create a direct chat thread for both users

### Chat

- `GET /chat/threads`
  - auth required
  - response: `thread[]`

- `GET /chat/threads/:threadId/messages`
  - auth required
  - response: `{ threadId, messages }`

- `POST /chat/messages`
  - auth required
  - body: `{ threadId, text }`
  - response: `{ message }`

- `POST /chat/typing`
  - auth required
  - body: `{ threadId, isTyping }`
  - response: `{ success, threadId, isTyping }`

- `POST /chat/read`
  - auth required
  - body: `{ threadId }`
  - response: `{ threadId, updatedMessageIds, peerUserId, peerThreadId }`

- `POST /chat/messages/react`
- `POST /chat/messages/delete`
- `POST /chat/messages/report`
- `POST /chat/user/report`
- `GET /chat/user/blocked`
- `POST /chat/user/block`
- `POST /chat/user/unblock`
- `POST /chat/user/unmatch`
  - auth required
  - each endpoint follows request/response contract used by current frontend services

### Calls

- `GET /calls`
  - auth required
  - response: `{ activeSession, recentSessions, contacts }`

- `POST /calls/start`
  - auth required
  - body: `{ peerUserId, type: "voice" | "video" }`
  - response: `{ session, reused }`

- `POST /calls/respond`
  - auth required
  - body: `{ sessionId, action: "accept" | "decline" | "cancel" | "end" }`
  - response: `{ session }`

- `POST /calls/signal`
  - auth required
  - body:
    - offer/answer: `{ sessionId, toUserId, signalType: "offer"|"answer", description, callType? }`
    - ice: `{ sessionId, toUserId, signalType: "ice_candidate", candidate, callType? }`
  - response: `{ success: true }`
  - note: signaling payload is relayed over websocket as `call_signal`

### Notifications

- `GET /notifications`
  - auth required
  - response: `{ notifications, unreadCount, preferences, queuedEmailCount }`

- `GET /notifications/preferences`
  - auth required
  - response: `{ preferences }`

- `POST /notifications/preferences`
  - auth required
  - body:
    - single toggle: `{ channel: "inApp|browser|email", type: "<notification_type|all>", enabled: boolean }`
    - full update: `{ preferences }`
  - response: `{ success, preferences }`

### Moderation (Admin)

- `GET /moderation/reports?status=all|open|under_review|resolved|dismissed`
  - admin required
  - response: `{ reports, summary }`

- `POST /moderation/reports/resolve`
  - admin required
  - body: `{ reportId, action: dismiss|review|warn|suspend|ban, note?, suspendHours? }`
  - response: `{ success, report, moderatedUser }`

- `GET /moderation/audit`
  - admin required
  - response: `{ audit }`

- `POST /moderation/users/status`
  - admin required
  - body: `{ targetUserId, action: activate|suspend|ban, reason? }`
  - response: `{ success, user }`

### Analytics (Admin)

- `GET /analytics/dashboard`
  - admin required
  - response: `{ generatedAt, metrics, trends }`

### Health

- `GET /health`
  - response: `{ status, now, service }`
