# Story Saver A5 Implementation Prototypes

**Team Members:** Pedro Sánchez-Gil, Zachary Gin, Stanley Jin
**Code Attribution:** Initial codebase generation drafted by Gemini 3.1 Pro (via Cursor), with revisions and UI design implementations by Pedro Sánchez-Gil, Zachary Gin, and Stanley Jin.

## Overview
This repository contains two standalone React Native (Expo) projects used to satisfy the Assignment 5 Technical Requirements.

1. **`story-saver-app`**: The core application prototype featuring the Style Guide, "Hello World", and the dynamic Memory Gallery with state-based filtering and custom styling.
2. **`insta-mock-app`**: A simulated Instagram client built to test our primary technical risk: App-to-App communication. Tapping on a "Story" here triggers a deep link that passes data securely into the Story Saver app.

---

## Prerequisites

To run these prototypes, you will need:
1. **Node.js** installed on your computer.
2. The **Expo Go** app installed on your physical iOS or Android device.
3. Both your computer and your mobile device must be connected to the **same Wi-Fi network**.

---

## Running the Prototypes

To fully test the cross-app Deep Linking requirement, **both apps must be running simultaneously in separate terminal windows.**

### Step 1: Start the Story Saver App
This is the main application.

1. Open a new terminal and navigate to the `story-saver-app` directory:
   ```bash
   cd story-saver-app
   ```
2. Install the necessary dependencies (only required the first time):
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Open the **Camera** app on your phone and scan the QR code generated in the terminal.
5. Tap the prompt to open it in **Expo Go**. Keep this running in the background of your phone.

### Step 2: Start the Instagram Mock App
This is the simulated app that sends data to Story Saver.

1. Open a **second, separate terminal window** and navigate to the `insta-mock-app` directory:
   ```bash
   cd insta-mock-app
   ```
2. Install dependencies (only required the first time):
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Open the **Camera** app on your phone and scan the new QR code generated in this second terminal.
5. Tap the prompt to open it in **Expo Go**.

---

## Testing the Technical Requirements

Once both apps are loaded, you can test the requirements as shown in our evidence clippings:

### 1. Deep Linking & Save Memory Flow (Req 4 & 7)
1. Ensure the **Insta Mock App** is open on your screen.
2. At the top of the feed, you will see a horizontally scrolling list of circular **Stories**.
3. **Tap any Story** (e.g., the one labeled "lil_lapisla...").
4. Your phone will automatically deep-link and switch to the **Story Saver App**, displaying a "Save New Memory" preview screen populated with the data from Instagram.
5. Tap **Confirm & Save**.
6. You will be redirected to the Home Gallery, and the new memory will instantly appear at the top of the feed.

### 2. State-Based Filtering (Req 5)
1. Inside the **Story Saver App**, open the **Gallery** tab (Home icon).
2. At the top, you will see a horizontally scrolling list of user profiles (All, Alice, Bob, Charlie).
3. Tap on **Alice**. Notice that the gallery instantly filters to show only memories associated with Alice, and her avatar ring turns pink.
4. Tap **All** to clear the filter.

### 3. "Hello World" & Style Guide (Req 1 & 2)
1. Inside the **Story Saver App**, open the **Gallery** tab (Home icon).
2. Look at the bottom-right corner of the screen. You will see two small, compact floating buttons.
3. Tap **Hello** to view the "Hello World" requirement screen.
4. Tap **Styles** to view the comprehensive style guide displaying our color palette, typography, and icons.

---

## Technical Requirements Core Code Snippets

1. **"Hello world" app**: [`HelloWorldScreen` implementation](./story-saver-app/App.js#L25-L31)
2. **"Hello styles"**: [`StyleGuideScreen` implementation](./story-saver-app/App.js#L33-L62)
3. **Interactive Memory Gallery Rendering**: [`GalleryScreen` and memory rendering](./story-saver-app/App.js#L64-L146) (Specifically `renderMemoryCard` at [L71-L82](./story-saver-app/App.js#L71-L82) and `FlatList` at [L126-L133](./story-saver-app/App.js#L126-L133))
4. **State-Based Data Filtering**: [Filtering logic](./story-saver-app/App.js#L67-L69) and [User Selection Strip](./story-saver-app/App.js#L91-L122)
5. **Cross-App Communication (Deep Linking)**: 
   - **Sending data**: [`handleSaveToStorySaver` in Insta Mock App](./insta-mock-app/App.js#L74-L84)
   - **Receiving data**: [Linking Config](./story-saver-app/App.js#L377-L384) and [`SaveMemoryScreen` in Story Saver App](./story-saver-app/App.js#L301-L342)
6. **Multi-Screen Navigation**: [`TabNavigator`](./story-saver-app/App.js#L346-L373) and main [`Stack.Navigator`](./story-saver-app/App.js#L386-L413)
7. **Detail contextual memory views**: [`MemoryDetailScreen` implementation](./story-saver-app/App.js#L251-L299)
8. **Pseudo Instagram App with Additional Story Saving Features**: [Insta Mock App `App.js`](./insta-mock-app/App.js#L71-L229) and [Mock Data](./insta-mock-app/App.js#L6-L69)

---

##  Repository Structure
```text
storysaver-hci/
├── README.md               # You are here
├── story-saver-app/        # Core Story Saver React Native App
│   ├── App.js              # Main application logic & navigation
│   ├── mockData.js         # Structured data for the gallery
│   ├── app.json            # Contains the "storysaver://" deep link scheme config
│   └── package.json
└── insta-mock-app/         # Instagram Simulation App
    ├── App.js              # Instagram UI & deep link dispatch logic
    └── package.json
```