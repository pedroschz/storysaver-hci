# Story Saver A5 Implementation Prototypes

**Team Members:** Pedro Sánchez-Gil, Zachary Gin, Stanley Jin
**Code Attribution:** Initial codebase generation drafted by Gemini 3.1 Pro (via Cursor), with revisions and UI design implementations by Pedro Sánchez-Gil, Zachary Gin, and Stanley Jin.

## Overview
This repository contains the Story Saver prototype, a standalone React Native (Expo) app built for Assignment 5.

- **`story-saver-app`** *(active)*: The core prototype. A mock multi-user social app where each user has their own gallery of photo "stories", a friends list, and private one-on-one chat threads that can optionally reference a specific post. Photos are imported directly from the device photo library, and all state (current user, stories, chat threads) persists across sessions via `AsyncStorage`.
- **`insta-mock-app`** *(deprecated, kept for reference)*: An earlier prototype that demonstrated cross-app deep linking from a simulated Instagram client into Story Saver. This app is no longer part of the active flow; Story Saver is now fully standalone and adds stories directly from the device's Photos app.

---

## Prerequisites

To run the prototype, you will need:
1. **Node.js** installed on your computer.
2. The **Expo Go** app installed on your physical iOS or Android device.
3. Both your computer and your mobile device must be connected to the **same Wi-Fi network**.

---

## Running the Prototype

1. Open a terminal and navigate to the `story-saver-app` directory:
   ```bash
   cd story-saver-app
   ```
2. Install dependencies (only required the first time):
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Open the **Camera** app on your phone and scan the QR code in the terminal.
5. Tap the prompt to open it in **Expo Go**.

> The first time you add a story, iOS/Android will prompt for access to your photo library. Allow access to use the "Add Story" flow.

---

## Feature Walkthrough

### 1. Mock Multi-User Login
When the app launches (and any time you log out), you land on a **Login** screen listing four mock accounts: Jane, Alice, Bob, and Charlie. Tapping one logs you in as that user. The current user is persisted, so restarting the app keeps you signed in until you tap **Log Out** in the Profile tab.

Each user has their own avatar, bio, and friends list defined in [`story-saver-app/mockData.js`](./story-saver-app/mockData.js).

### 2. Gallery (Home tab)
Shows all stories from you and your friends, with a horizontal strip to filter by author ("All", "Me", or any friend). Tapping a story opens the **"Chat about post"** flow — pick which friend you want to discuss the post with.

A floating **+** button opens the device's photo library (via `expo-image-picker`) and adds the selected image as a new story owned by the currently logged-in user.

### 3. Friends tab
Shows your friends. Tapping a friend opens their **Friend Profile** screen, which displays their bio and a combined grid of posts from both of you. Each post is tagged with its author; tapping one opens a chat with that friend pre-filled with the post as context. There is also an **Open Chat** button to start a chat without referencing a post.

### 4. Private Chats
Chats are strictly one-on-one between the logged-in user and another user, keyed by the sorted pair of user IDs. A message may optionally carry a `postId`, in which case the referenced post appears as a small card inside the message bubble — mirroring the "reply to story" interaction on Instagram.

Because chats and stories are persisted, you can:
1. Log in as **Jane**, post a new story, and send Alice a message about it.
2. Log out, log in as **Alice**, open Jane's profile, tap Jane's post, and see Jane's message waiting.
3. Reply as Alice, log back in as Jane, and see the reply.

### 5. Profile tab
Displays the current user's avatar, bio, story count, and friend count. Contains the **Log Out** action that clears the active session and returns you to the Login screen.

---

## Technical Requirements Core Code Snippets

1. **Mock Authentication & Session Persistence**: [`LoginScreen`](./story-saver-app/App.js) and the `login`/`logout`/AsyncStorage hydration logic inside the top-level `App` component in [`story-saver-app/App.js`](./story-saver-app/App.js).
2. **Interactive Memory Gallery**: `GalleryScreen` in [`story-saver-app/App.js`](./story-saver-app/App.js), including the `FlatList` 2-column grid and the friend-filter strip.
3. **State-Based Data Filtering**: Filtering by `filterUserId` inside `GalleryScreen`.
4. **Photo Library Integration**: The `pickImage` handler in `GalleryScreen` using `expo-image-picker`.
5. **Private Chat System**:
   - Data model: `chatKey(a, b)` and `mockChats` in [`story-saver-app/mockData.js`](./story-saver-app/mockData.js).
   - Persistence: `sendMessage` and `persistChats` in the top-level `App` component.
   - UI: `ChatScreen`, including the "About this post" banner and per-message post-reference cards.
6. **Friend Profile Flow**: `FriendProfileScreen` in [`story-saver-app/App.js`](./story-saver-app/App.js), which lists shared posts and routes into `ChatScreen`.
7. **Post → Partner Selection Flow**: `SelectChatPartnerScreen` in [`story-saver-app/App.js`](./story-saver-app/App.js).
8. **Multi-Screen Navigation**: `TabNavigator` and the top-level `Stack.Navigator` inside `App` in [`story-saver-app/App.js`](./story-saver-app/App.js).

---

## Repository Structure
```text
storysaver-hci/
├── README.md               # You are here
├── story-saver-app/        # Active Story Saver React Native App
│   ├── App.js              # Main application logic, navigation, screens, and AsyncStorage
│   ├── mockData.js         # Users, mock stories, and seeded private chat threads
│   ├── app.json
│   └── package.json
└── insta-mock-app/         # Deprecated Instagram simulation (kept for reference only)
    ├── App.js
    └── package.json
```
