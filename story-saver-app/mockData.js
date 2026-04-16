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

export const mockMemories = [
  {
    id: '1',
    title: 'Beach Day at Santa Monica',
    date: 'July 15, 2025',
    image: 'https://picsum.photos/seed/beach/400/500',
    userId: 'alice',
  },
  {
    id: '2',
    title: 'Graduation Ceremony',
    date: 'May 20, 2025',
    image: 'https://picsum.photos/seed/grad/400/500',
    userId: 'bob',
  },
  {
    id: '3',
    title: 'Hiking in Yosemite',
    date: 'September 5, 2025',
    image: 'https://picsum.photos/seed/hike/400/500',
    userId: 'charlie',
  },
  {
    id: '4',
    title: 'Christmas Eve Dinner',
    date: 'December 24, 2025',
    image: 'https://picsum.photos/seed/xmas/400/500',
    userId: 'alice',
  },
  {
    id: '5',
    title: 'Road Trip to Vegas',
    date: 'March 10, 2026',
    image: 'https://picsum.photos/seed/vegas/400/500',
    userId: 'bob',
  },
  {
    id: '6',
    title: 'Coffee Date',
    date: 'Mar 18, 2026',
    image: 'https://picsum.photos/seed/coffee/400/500',
    userId: 'charlie',
  },
  {
    id: '7',
    title: 'Park Picnic',
    date: 'Feb 22, 2026',
    image: 'https://picsum.photos/seed/picnic/400/500',
    userId: 'alice',
  },
  {
    id: '8',
    title: 'San Diego Summer',
    date: 'June 14, 2025',
    image: 'https://picsum.photos/seed/sandiego/400/500',
    userId: 'bob',
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
