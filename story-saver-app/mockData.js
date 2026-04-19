export const USERS = {
  jane: {
    id: 'jane',
    name: 'Jane Doe',
    username: '@jane_storysaver',
    avatar: 'https://picsum.photos/seed/janeAvatar/100/100',
    bio: 'Preserving memories, one story at a time.',
    friends: ['alice', 'bob', 'charlie'],
  },
  alice: {
    id: 'alice',
    name: 'Alice Smith',
    username: '@alice',
    avatar: 'https://picsum.photos/seed/aliceAvatar/100/100',
    bio: 'Adventure seeker & coffee lover.',
    friends: ['jane', 'charlie'],
  },
  bob: {
    id: 'bob',
    name: 'Bob Johnson',
    username: '@bobj',
    avatar: 'https://picsum.photos/seed/bobAvatar/100/100',
    bio: 'Living one day at a time.',
    friends: ['jane', 'charlie'],
  },
  charlie: {
    id: 'charlie',
    name: 'Charlie Davis',
    username: '@charlie_d',
    avatar: 'https://picsum.photos/seed/charlieAvatar/100/100',
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
    image: 'https://picsum.photos/seed/beach/400/500',
    userId: 'alice',
    tags: ['beach', 'travel'],
  },
  {
    id: '2',
    title: 'Graduation Ceremony',
    date: 'May 20, 2025',
    timestamp: ts(2025, 5, 20),
    image: 'https://picsum.photos/seed/grad/400/500',
    userId: 'bob',
    tags: ['school', 'family'],
  },
  {
    id: '3',
    title: 'Hiking in Yosemite',
    date: 'September 5, 2025',
    timestamp: ts(2025, 9, 5),
    image: 'https://picsum.photos/seed/hike/400/500',
    userId: 'charlie',
    tags: ['hike', 'travel'],
  },
  {
    id: '4',
    title: 'Christmas Eve Dinner',
    date: 'December 24, 2025',
    timestamp: ts(2025, 12, 24),
    image: 'https://picsum.photos/seed/xmas/400/500',
    userId: 'alice',
    tags: ['holiday', 'family', 'food'],
  },
  {
    id: '5',
    title: 'Road Trip to Vegas',
    date: 'March 10, 2026',
    timestamp: ts(2026, 3, 10),
    image: 'https://picsum.photos/seed/vegas/400/500',
    userId: 'bob',
    tags: ['roadtrip', 'travel'],
  },
  {
    id: '6',
    title: 'Coffee Date',
    date: 'Mar 18, 2026',
    timestamp: ts(2026, 3, 18),
    image: 'https://picsum.photos/seed/coffee/400/500',
    userId: 'charlie',
    tags: ['coffee', 'food'],
  },
  {
    id: '7',
    title: 'Park Picnic',
    date: 'Feb 22, 2026',
    timestamp: ts(2026, 2, 22),
    image: 'https://picsum.photos/seed/picnic/400/500',
    userId: 'alice',
    tags: ['food', 'family'],
  },
  {
    id: '8',
    title: 'San Diego Summer',
    date: 'June 14, 2025',
    timestamp: ts(2025, 6, 14),
    image: 'https://picsum.photos/seed/sandiego/400/500',
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
