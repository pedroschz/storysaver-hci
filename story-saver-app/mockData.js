export const USERS = {
  jane: {
    id: 'jane',
    name: 'Jane Doe',
    username: '@jane_storysaver',
    // Woman smiling, warm tones — Unsplash (photo by Allef Vinicius, free)
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80',
    bio: 'Preserving memories, one story at a time.',
    friends: ['alice', 'bob', 'charlie'],
  },
  alice: {
    id: 'alice',
    name: 'Alice Smith',
    username: '@alice',
    // Woman laughing outdoors — Unsplash (photo by Brooke Cagle, free)
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80',
    bio: 'Adventure seeker & coffee lover.',
    friends: ['jane', 'charlie'],
  },
  bob: {
    id: 'bob',
    name: 'Bob Johnson',
    username: '@bobj',
    // Man smiling, casual — Unsplash (photo by Joseph Gonzalez, free)
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
    bio: 'Living one day at a time.',
    friends: ['jane', 'charlie'],
  },
  charlie: {
    id: 'charlie',
    name: 'Charlie Davis',
    username: '@charlie_d',
    // Man outdoors portrait — Unsplash (photo by Christian Buehner, free)
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
    bio: 'Photographer & hiker.',
    friends: ['jane', 'alice', 'bob'],
  },
};

export const chatKey = (a, b) => [a, b].sort().join(':');

// Suggested tag palette used for filtering and quick-add
export const SUGGESTED_TAGS = [
  'travel', 'food', 'beach', 'hike', 'school', 'family',
  'birthday', 'concert', 'coffee', 'roadtrip', 'holiday', 'sports',
];

const ts = (y, m, d) => new Date(y, m - 1, d).getTime();

export const mockMemories = [
  {
    id: '1',
    title: 'Beach Day at Santa Monica',
    date: 'July 15, 2025',
    timestamp: ts(2025, 7, 15),
    // People walking on Santa Monica beach at sunset — Unsplash (Tommaso Teloni, free)
    image: 'https://images.unsplash.com/photo-1622583529718-b68ded6804d8?w=400&h=500&fit=crop&q=80',
    userId: 'alice',
    tags: ['beach', 'travel'],
  },
  {
    id: '2',
    title: 'Graduation Ceremony',
    date: 'May 20, 2025',
    timestamp: ts(2025, 5, 20),
    // Graduates in caps & gowns celebrating — Pexels (Emily Ranquist, free)
    image: 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    userId: 'bob',
    tags: ['school', 'family'],
  },
  {
    id: '3',
    title: 'Hiking in Yosemite',
    date: 'September 5, 2025',
    timestamp: ts(2025, 9, 5),
    // Yosemite Valley with El Capitan and Half Dome — Unsplash (Anna Iurova, free)
    image: 'https://images.unsplash.com/photo-1764027052811-aee7f812e41d?w=400&h=500&fit=crop&q=80',
    userId: 'charlie',
    tags: ['hike', 'travel'],
  },
  {
    id: '4',
    title: 'Christmas Eve Dinner',
    date: 'December 24, 2025',
    timestamp: ts(2025, 12, 24),
    // Festive Christmas table with lights & decorations — Unsplash (Dragon White Munthe, free)
    image: 'https://images.unsplash.com/photo-1763463608554-1a1d7ec7147b?w=400&h=500&fit=crop&q=80',
    userId: 'alice',
    tags: ['holiday', 'family', 'food'],
  },
  {
    id: '5',
    title: 'Road Trip to Vegas',
    date: 'March 10, 2026',
    timestamp: ts(2026, 3, 10),
    // Las Vegas Strip at night, neon lights — Unsplash (Tom Podmore, free)
    image: 'https://images.unsplash.com/photo-1684575571081-d6abda485519?w=400&h=500&fit=crop&q=80',
    userId: 'bob',
    tags: ['roadtrip', 'travel'],
  },
  {
    id: '6',
    title: 'Coffee Date',
    date: 'Mar 18, 2026',
    timestamp: ts(2026, 3, 18),
    // Friends laughing together at a coffee shop — Unsplash (Brooke Cagle, free)
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=500&fit=crop&q=80',
    userId: 'charlie',
    tags: ['coffee', 'food'],
  },
  {
    id: '7',
    title: 'Park Picnic',
    date: 'Feb 22, 2026',
    timestamp: ts(2026, 2, 22),
    // Friends enjoying a picnic on the grass — Pexels (Andrea Piacquadio, free)
    image: 'https://images.pexels.com/photos/3776870/pexels-photo-3776870.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    userId: 'alice',
    tags: ['food', 'family'],
  },
  {
    id: '8',
    title: 'San Diego Summer',
    date: 'June 14, 2025',
    timestamp: ts(2025, 6, 14),
    // Path to La Jolla Shores beach with palm trees — Unsplash (Christopher Magat, free)
    image: 'https://images.unsplash.com/photo-1739157288855-498e38456a59?w=400&h=500&fit=crop&q=80',
    userId: 'bob',
    tags: ['beach', 'travel'],
  },
];

export const mockChats = {
  [chatKey('jane', 'alice')]: [
    { id: 'ja1', senderId: 'alice', text: 'Beach day was 10/10', time: '2:30 PM', postId: '1' },
    { id: 'ja2', senderId: 'jane', text: 'Right?? Let\u2019s go again soon', time: '2:35 PM', postId: '1' },
  ],
  [chatKey('jane', 'bob')]: [
    { id: 'jb1', senderId: 'bob', text: 'We graduated!!', time: '11:00 AM', postId: '2' },
    { id: 'jb2', senderId: 'jane', text: 'Finally 😭', time: '11:05 AM', postId: '2' },
  ],
  [chatKey('jane', 'charlie')]: [
    { id: 'jc1', senderId: 'charlie', text: 'The hike was brutal but worth it', time: '6:10 PM', postId: '3' },
    { id: 'jc2', senderId: 'jane', text: 'Can we go back to that coffee place?', time: '10:30 AM', postId: '6' },
  ],
  [chatKey('alice', 'charlie')]: [
    { id: 'ac1', senderId: 'alice', text: 'Loved your Yosemite shots', time: '7:00 PM', postId: '3' },
  ],
};

// Conversation starters shown on a story to spark "saving the story behind the photo"
export const STORY_PROMPTS = [
  'What do you remember most about this day?',
  'Who took this photo?',
  'What were we laughing about?',
  'What happened right before this?',
  'How did you feel in this moment?',
  'What\u2019s the story behind this?',
];

export const REACTIONS = ['❤️', '😂', '🔥', '😢', '👍'];

// Canned replies the "friend" sends back so demos feel alive.
export const AUTO_REPLIES = [
  'omg yes 😭',
  'haha that was such a good day',
  'we have to do this again soon',
  'I was just thinking about this!',
  'send me the pic??',
  'best day ever fr',
  'ok now I\u2019m nostalgic',
];
