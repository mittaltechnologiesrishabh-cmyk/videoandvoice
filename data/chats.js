const chats = [
  {
    id: 1,
    user: 'Sarah Johnson',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'See you tomorrow!',
    time: '2m',
    unread: 2,
    online: true,
    messages: [
      { id: 1, text: 'Hey! How are you?', sender: 'them', time: '10:30 AM' },
      { id: 2, text: "I'm good! How about you?", sender: 'me', time: '10:32 AM' },
      { id: 3, text: 'Doing great! Want to meet tomorrow?', sender: 'them', time: '10:35 AM' },
      { id: 4, text: 'Sure! What time works for you?', sender: 'me', time: '10:36 AM' },
      { id: 5, text: 'See you tomorrow!', sender: 'them', time: '10:40 AM' }
    ]
  },

  {
    id: 2,
    user: 'Mike Chen',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Thanks for the help!',
    time: '1h',
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: 'Could you help me with the project?', sender: 'them', time: '9:15 AM' },
      { id: 2, text: 'Of course! What do you need?', sender: 'me', time: '9:20 AM' },
      { id: 3, text: 'Thanks for the help!', sender: 'them', time: '9:45 AM' }
    ]
  },

  {
    id: 3,
    user: 'Emma Wilson',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'That sounds amazing!',
    time: '3h',
    unread: 0,
    online: true,
    messages: [
      { id: 1, text: 'Check out this new restaurant', sender: 'me', time: '8:00 AM' },
      { id: 2, text: 'That sounds amazing!', sender: 'them', time: '8:30 AM' }
    ]
  }
];

export default chats;
