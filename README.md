# Story Saver — HCI Prototype

**Team Members:** Pedro Sánchez-Gil, Zachary Gin, Stanley Jin  
**Mentor:** Stacy  
**Code Attribution:** Initial codebase drafted with AI assistance (Cursor), with feature design, implementation, and UI decisions by Pedro Sánchez-Gil, Zachary Gin, and Stanley Jin.

## Overview

Story Saver is a React Native (Expo) prototype that lets friends **save the story behind every photo** — not just the image, but the conversation and memories that give it meaning. Users build a shared gallery of photo stories, organize them with tags, and chat with friends directly about specific memories. The best moments from those conversations can be pinned back to the photo, becoming a permanent record of the story.

- **`story-saver-app`** *(active)*: The core prototype. A mock multi-user social app with a photo gallery, tagging, rich filtering, private chats, reactions, and story pinning. All state persists via `AsyncStorage`.
- **`insta-mock-app`** *(deprecated, kept for reference)*: An earlier prototype that demonstrated cross-app deep linking from a simulated Instagram client. No longer part of the active flow.

---

## Prerequisites

1. **Node.js** installed on your computer.
2. The **Expo Go** app installed on your physical iOS or Android device.
3. Both your computer and your device must be on the **same Wi-Fi network**.

---

## Running the Prototype

```bash
cd story-saver-app
npm install          # first time only
npx expo start
```

Scan the QR code in the terminal with your phone's camera (iOS) or the Expo Go app (Android).

> The first time you add a story, iOS/Android will prompt for photo library access. Allow it to use the Add Story flow.

---

## Feature Walkthrough

### 1. Onboarding
First-time users (per account) see a **3-step onboarding overlay** that explains the core flow: save a photo → organize it → save the story behind it. Can be replayed from **Profile → Show intro again**.

### 2. Mock Multi-User Login
The Login screen lists four mock accounts: **Jane, Alice, Bob, and Charlie**. Tap any name to sign in. Session is persisted via `AsyncStorage` — restarting the app keeps you signed in until you tap **Log Out**.

User profiles, avatars, bios, and friend relationships are defined in [`mockData.js`](./story-saver-app/mockData.js).

### 3. Gallery (Home tab)
Displays all stories from you and your friends in a **2-column grid or month-grouped Timeline view** (toggle at the top).

**Organization features:**
- **Search bar** — full-text search across story titles and tags.
- **Friend filter strip** — tap "All", "Me", or any friend's avatar to filter by author.
- **Tag filter chips** — tap one or more tags to filter by topic (OR logic); multiple tags can be active simultaneously.
- **Sort menu** — sort by Newest, Oldest, or A–Z title.
- **Story count** — live count of stories matching the current filters.
- **Clear filters** — one-tap reset when filters are active.

Each gallery card shows:
- The photo with title and date overlay.
- Up to 2 tag chips in the top-left corner.
- A chat-bubble badge (top-right) showing how many messages exist about that story.

Tapping a story opens **Story Detail**. The floating **+** button opens the device photo library to add a new story.

### 4. Story Detail
A full-screen view of a story with:

- **"The story so far"** — pinned chat highlights about this photo, shown as quoted cards with author and timestamp. This is the core feature: the conversation *becomes* the story.
- **Tags** — editable inline. Tap a filled chip to remove it, type a custom tag, or tap from a row of suggested tags.
- **Conversations** — a list of every friend you can chat with about this story, each showing the last message and a message count badge. Tap to open that chat.
- **Delete** — owners see a trash icon in the navigation header. Tapping it shows a confirmation alert before permanently deleting the story.

### 5. Private Chats
One-on-one chats keyed by the sorted pair of user IDs, persisted via `AsyncStorage`.

**Interactions:**
- The "About this story" banner at the top of the chat anchors the conversation to a specific photo.
- **Story prompt bar** — a rotating conversation starter ("What do you remember most about this day?", "Who took this photo?", etc.) appears above the input when chatting about a post. Tap to send it as a message.
- **Typing indicator** — after you send a message, the friend's username changes to "typing…" and a typing bubble appears, followed by a simulated reply (~1.4 s). Makes demos feel alive.
- **Long-press any message** to open an action sheet with:
  - **Reactions** (❤️ 😂 🔥 😢 👍) — tap to toggle. Reaction counts render as pills below the bubble.
  - **Pin to story / Unpin** — pins the message back to the Story Detail screen, building "the story so far".

### 6. Friends Tab
Lists your friends. Tapping one opens their **Friend Profile**, showing their bio and a combined grid of shared posts. Tapping a post opens Story Detail for that memory. The **Open Chat** button starts a general chat without a story context.

### 7. Profile Tab
Shows your avatar, bio, story count, and friend count. Settings rows for Notifications, Privacy, Show intro again, and **Log Out**.

---

## Technical Highlights

| Feature | Location |
|---|---|
| Mock auth & session persistence | `LoginScreen`, `login`/`logout`/AsyncStorage hydration in `App` |
| Onboarding overlay | `OnboardingOverlay` component, `STORAGE_KEYS.ONBOARDED` |
| Gallery grid + timeline view | `GalleryScreen` — `FlatList` (grid) / `SectionList` (timeline) |
| Search, multi-tag filter, sort | `displayedMemories` `useMemo` in `GalleryScreen` |
| Photo library import | `pickImage` in `GalleryScreen` via `expo-image-picker` |
| Story Detail with pinned highlights | `StoryDetailScreen`, `pinnedMessages` useMemo |
| Tag editing & suggestions | `addTag`/`removeTag` in `StoryDetailScreen`, `SUGGESTED_TAGS` in `mockData.js` |
| Delete story | `deleteMemory` in `App`, header trash button in `StoryDetailScreen` |
| Private chat system | `ChatScreen`, `chatKey`, `sendMessage`/`persistChats` in `App` |
| Story prompts | `STORY_PROMPTS` in `mockData.js`, prompt bar in `ChatScreen` |
| Simulated reply / typing indicator | `sendAutoReply` + `replyTimer` in `ChatScreen` |
| Emoji reactions | `reactToMessage` in `App`, reaction pills in `ChatScreen` |
| Pin message → save to story | `togglePinMessage` in `App`, long-press action sheet in `ChatScreen` |
| Chat message count badge on cards | `messageCountByPost` useMemo in `GalleryScreen` |
| Multi-screen navigation | `TabNavigator` + `Stack.Navigator` in `App` |
| Full AsyncStorage persistence | `persistMemories`, `persistChats`, image URL migration on load |

---

## Data Model

All seed data lives in [`mockData.js`](./story-saver-app/mockData.js):

- **`USERS`** — four mock users with avatars (real portrait photos from Unsplash/Pexels), bios, and friend lists.
- **`mockMemories`** — eight seed stories, each with a title, real topic-matched photo (Unsplash/Pexels), date, timestamp, tags, and owning `userId`.
- **`mockChats`** — pre-seeded chat threads between users, each message carrying `senderId`, `postId` (optional), `text`, `time`, `reactions`, and `pinned`.
- **`STORY_PROMPTS`** — six conversation starters shown in the chat prompt bar.
- **`SUGGESTED_TAGS`** — twelve quick-add tag suggestions.
- **`AUTO_REPLIES`** — seven canned friend replies for the simulated typing flow.
- **`REACTIONS`** — five emoji used in the reaction picker.

---

## Demo Flow (recommended for showcase)

1. **Log in as Jane.**
2. Open the **Beach Day at Santa Monica** story (Alice's post). Note the tags and conversations section.
3. Tap **Alice** in the conversations list → Chat opens with the story banner.
4. Use the **story prompt** ("What do you remember most about this day?") — send it.
5. Watch the **typing indicator**, then Alice's auto-reply.
6. **Long-press Alice's reply** → tap ❤️ to react, then **Pin to story**.
7. Go back to the story → see the pinned highlight under **"The story so far"**.
8. Back in the Gallery, toggle to **Timeline view**. Filter by `#beach`. Sort by Oldest.
9. Add a new story with **+**, tag it, delete it with the trash icon.
10. Switch to **Friends tab** → open a friend profile → tap a post → same Story Detail flow from a different entry point.

---

## Repository Structure
```
storysaver-hci/
├── README.md
├── story-saver-app/            # Active prototype
│   ├── App.js                  # All screens, navigation, context, and state logic
│   ├── mockData.js             # Users, stories, chats, prompts, and constants
│   ├── app.json
│   └── package.json
└── insta-mock-app/             # Deprecated (kept for reference)
    ├── App.js
    └── package.json
```
