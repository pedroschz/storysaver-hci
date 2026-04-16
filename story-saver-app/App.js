import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Image,
  FlatList, Alert, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { USERS, mockMemories, mockChats, chatKey } from './mockData';

const COLORS = {
  lightBeige: '#E9DFD8',
  lightPink: '#E7B3B0',
  mediumPink: '#E05C73',
  darkBurgundy: '#8C0F2E',
};

const STORAGE_KEYS = {
  MEMORIES: '@storysaver_memories',
  CURRENT_USER: '@storysaver_current_user',
  CHATS: '@storysaver_chats',
};

const AppContext = createContext();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- SCREENS --- //

function LoginScreen() {
  const { login } = useContext(AppContext);
  const userList = Object.values(USERS);

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginHeader}>
        <Ionicons name="heart-circle" size={80} color={COLORS.mediumPink} />
        <Text style={styles.loginTitle}>Story Saver</Text>
        <Text style={styles.loginSubtitle}>Choose who you are</Text>
      </View>
      <View style={styles.loginList}>
        {userList.map(user => (
          <TouchableOpacity key={user.id} style={styles.loginCard} onPress={() => login(user.id)}>
            <Image source={{ uri: user.avatar }} style={styles.loginAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.loginName}>{user.name}</Text>
              <Text style={styles.loginUsername}>{user.username}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumPink} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function GalleryScreen({ navigation }) {
  const { memories, currentUser, addMemory } = useContext(AppContext);
  const [filterUserId, setFilterUserId] = useState(null);

  const friends = currentUser.friends.map(id => USERS[id]).filter(Boolean);

  const visibleMemories = memories.filter(m => {
    const isMyStory = m.userId === currentUser.id;
    const isFriendStory = currentUser.friends.includes(m.userId);
    return isMyStory || isFriendStory;
  });

  const displayedMemories = filterUserId
    ? visibleMemories.filter(m => m.userId === filterUserId)
    : visibleMemories;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    Alert.prompt
      ? Alert.prompt('New Story', 'Add a caption:', (caption) => {
          saveNewMemory(uri, caption || 'Untitled Story');
        })
      : saveWithFallbackPrompt(uri);
  };

  const saveWithFallbackPrompt = (uri) => {
    saveNewMemory(uri, 'Untitled Story');
    Alert.alert('Story Added', 'Your new story has been saved to the gallery.');
  };

  const saveNewMemory = (uri, title) => {
    const newMemory = {
      id: Date.now().toString(),
      title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: uri,
      userId: currentUser.id,
      messages: [],
    };
    addMemory(newMemory);
  };

  const renderMemoryCard = ({ item }) => {
    const author = USERS[item.userId];
    return (
      <TouchableOpacity
        style={styles.memoryCard}
        onPress={() => navigation.navigate('SelectChatPartner', { postId: item.id })}
      >
        <Image source={{ uri: item.image }} style={styles.memoryImage} />
        <View style={styles.memoryInfoOverlay}>
          <Text style={styles.memoryTitle}>{item.title}</Text>
          <Text style={styles.memoryDate}>
            {author ? author.name.split(' ')[0] : ''} · {item.date}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.galleryContainer}>
      <View style={styles.galleryHeader}>
        <Text style={styles.galleryTitle}>Gallery</Text>
      </View>

      <View style={styles.userStripContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.userStrip}>
          <TouchableOpacity style={styles.userIconContainer} onPress={() => setFilterUserId(null)}>
            <View style={[styles.userIconCircle, !filterUserId && styles.userIconActive]}>
              <Ionicons name="people" size={24} color={!filterUserId ? COLORS.darkBurgundy : '#666'} />
            </View>
            <Text style={[styles.userIconName, !filterUserId && styles.userIconNameActive]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.userIconContainer} onPress={() => setFilterUserId(currentUser.id)}>
            <Image
              source={{ uri: currentUser.avatar }}
              style={[styles.userIconCircle, filterUserId === currentUser.id && styles.userIconActive]}
            />
            <Text style={[styles.userIconName, filterUserId === currentUser.id && styles.userIconNameActive]}>Me</Text>
          </TouchableOpacity>

          {friends.map(user => (
            <TouchableOpacity key={user.id} style={styles.userIconContainer} onPress={() => setFilterUserId(user.id)}>
              <Image
                source={{ uri: user.avatar }}
                style={[styles.userIconCircle, filterUserId === user.id && styles.userIconActive]}
              />
              <Text style={[styles.userIconName, filterUserId === user.id && styles.userIconNameActive]}>
                {user.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.divider} />

      <FlatList
        data={displayedMemories}
        keyExtractor={item => item.id}
        renderItem={renderMemoryCard}
        contentContainerStyle={styles.galleryList}
        numColumns={2}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>No stories yet.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={pickImage} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function FriendsScreen({ navigation }) {
  const { currentUser } = useContext(AppContext);
  const friends = currentUser.friends.map(id => USERS[id]).filter(Boolean);

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => navigation.navigate('FriendProfile', { friendId: item.id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendUsername}>{item.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.mediumPink} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.listContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>
      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={renderFriend}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>No friends yet.</Text>}
      />
    </View>
  );
}

function ProfileScreen() {
  const { currentUser, memories, logout } = useContext(AppContext);
  const myMemories = memories.filter(m => m.userId === currentUser.id);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Switch to a different account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.profileContent}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: currentUser.avatar }} style={styles.profileAvatar} />
        <Text style={styles.profileName}>{currentUser.name}</Text>
        <Text style={styles.profileUsername}>{currentUser.username}</Text>
        <Text style={styles.profileBio}>{currentUser.bio}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{myMemories.length}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{currentUser.friends.length}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingRow}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.darkBurgundy} />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow}>
          <Ionicons name="lock-closed-outline" size={24} color={COLORS.darkBurgundy} />
          <Text style={styles.settingText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.mediumPink} />
          <Text style={[styles.settingText, { color: COLORS.mediumPink }]}>Log Out</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SelectChatPartnerScreen({ navigation, route }) {
  const { currentUser, memories } = useContext(AppContext);
  const { postId } = route.params;
  const post = memories.find(m => m.id === postId);
  const friends = currentUser.friends.map(id => USERS[id]).filter(Boolean);

  return (
    <View style={styles.listContainer}>
      {post && (
        <View style={styles.postPreviewCard}>
          <Image source={{ uri: post.image }} style={styles.postPreviewImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.postPreviewTitle}>{post.title}</Text>
            <Text style={styles.postPreviewDate}>Pick who to chat with about this post</Text>
          </View>
        </View>
      )}
      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999' }}>No friends yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendCard}
            onPress={() => navigation.replace('Chat', { otherUserId: item.id, postId })}
          >
            <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.friendUsername}>{item.username}</Text>
            </View>
            <Ionicons name="chatbubble-ellipses" size={22} color={COLORS.mediumPink} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function FriendProfileScreen({ navigation, route }) {
  const { currentUser, memories } = useContext(AppContext);
  const { friendId } = route.params;
  const friend = USERS[friendId];

  const posts = memories
    .filter(m => m.userId === friendId || m.userId === currentUser.id)
    .sort((a, b) => String(b.id).localeCompare(String(a.id)));

  if (!friend) {
    return (
      <View style={styles.centerContainer}>
        <Text>Friend not found.</Text>
      </View>
    );
  }

  const renderPost = ({ item }) => {
    const author = USERS[item.userId];
    const isMine = item.userId === currentUser.id;
    return (
      <TouchableOpacity
        style={styles.memoryCard}
        onPress={() => navigation.navigate('Chat', { otherUserId: friendId, postId: item.id })}
      >
        <Image source={{ uri: item.image }} style={styles.memoryImage} />
        <View style={[styles.authorTag, isMine ? styles.authorTagMine : null]}>
          <Text style={styles.authorTagText}>{isMine ? 'You' : author.name.split(' ')[0]}</Text>
        </View>
        <View style={styles.memoryInfoOverlay}>
          <Text style={styles.memoryTitle}>{item.title}</Text>
          <Text style={styles.memoryDate}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        numColumns={2}
        contentContainerStyle={styles.galleryList}
        ListHeaderComponent={
          <View>
            <View style={styles.friendProfileHeader}>
              <Image source={{ uri: friend.avatar }} style={styles.profileAvatar} />
              <Text style={styles.profileName}>{friend.name}</Text>
              <Text style={styles.profileUsername}>{friend.username}</Text>
              <Text style={styles.profileBio}>{friend.bio}</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Chat', { otherUserId: friendId })}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Open Chat</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionLabel}>Shared posts · tap to chat about one</Text>
          </View>
        }
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>No posts yet.</Text>}
      />
    </View>
  );
}

function ChatScreen({ route }) {
  const { currentUser, memories, chats, sendMessage } = useContext(AppContext);
  const { otherUserId, postId } = route.params;
  const other = USERS[otherUserId];
  const post = postId ? memories.find(m => m.id === postId) : null;
  const key = chatKey(currentUser.id, otherUserId);
  const messages = chats[key] || [];
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(otherUserId, trimmed, postId);
    setText('');
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser.id;
    const refPost = item.postId ? memories.find(m => m.id === item.postId) : null;
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        {refPost && (
          <View style={[styles.messageContextCard, isMe ? styles.messageContextMine : styles.messageContextTheirs]}>
            <Image source={{ uri: refPost.image }} style={styles.messageContextImage} />
            <Text
              style={[styles.messageContextTitle, isMe ? { color: '#fff' } : null]}
              numberOfLines={1}
            >
              {refPost.title}
            </Text>
          </View>
        )}
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
          {item.time}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.detailContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.chatHeader}>
        <Image source={{ uri: other.avatar }} style={styles.chatHeaderAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.chatHeaderName}>{other.name}</Text>
          <Text style={styles.chatHeaderUsername}>{other.username}</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chatScroll}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {post && (
          <View style={styles.activePostBanner}>
            <Image source={{ uri: post.image }} style={styles.activePostImage} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.activePostLabel}>About this post</Text>
              <Text style={styles.activePostTitle} numberOfLines={1}>{post.title}</Text>
            </View>
          </View>
        )}

        {messages.length > 0 ? (
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            scrollEnabled={false}
          />
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 30, color: '#666' }}>
            No messages yet. Say hi to {other.name.split(' ')[0]}!
          </Text>
        )}
      </ScrollView>

      <View style={styles.chatInputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder={`Message ${other.name.split(' ')[0]}...`}
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.chatSendButton} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// --- NAVIGATORS --- //

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Friends') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.darkBurgundy,
        tabBarInactiveTintColor: COLORS.mediumPink,
        headerStyle: { backgroundColor: COLORS.lightBeige },
        headerTintColor: COLORS.darkBurgundy,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={GalleryScreen} options={{ title: 'Story Saver' }} />
      <Tab.Screen name="Friends" component={FriendsScreen} options={{ title: 'Friends' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// --- APP --- //

export default function App() {
  const [memories, setMemories] = useState([]);
  const [chats, setChats] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedMemories, storedChats] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
          AsyncStorage.getItem(STORAGE_KEYS.MEMORIES),
          AsyncStorage.getItem(STORAGE_KEYS.CHATS),
        ]);
        if (storedUser) setCurrentUserId(storedUser);
        setMemories(storedMemories ? JSON.parse(storedMemories) : mockMemories);
        setChats(storedChats ? JSON.parse(storedChats) : mockChats);
      } catch {
        setMemories(mockMemories);
        setChats(mockChats);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistMemories = async (next) => {
    setMemories(next);
    try { await AsyncStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(next)); } catch {}
  };

  const persistChats = async (next) => {
    setChats(next);
    try { await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(next)); } catch {}
  };

  const login = async (userId) => {
    setCurrentUserId(userId);
    try { await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId); } catch {}
  };

  const logout = async () => {
    setCurrentUserId(null);
    try { await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER); } catch {}
  };

  const addMemory = (newMemory) => {
    persistMemories([newMemory, ...memories]);
  };

  const sendMessage = (otherUserId, text, postId) => {
    const key = chatKey(currentUserId, otherUserId);
    const newMsg = {
      id: Date.now().toString(),
      text,
      senderId: currentUserId,
      postId: postId || null,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    const next = { ...chats, [key]: [...(chats[key] || []), newMsg] };
    persistChats(next);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.mediumPink} />
      </View>
    );
  }

  const currentUser = USERS[currentUserId];

  return (
    <AppContext.Provider value={{ memories, chats, currentUser, addMemory, sendMessage, login, logout }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.lightBeige },
            headerTintColor: COLORS.darkBurgundy,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {!currentUser ? (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
              <Stack.Screen
                name="SelectChatPartner"
                component={SelectChatPartnerScreen}
                options={{ title: 'Chat about post' }}
              />
              <Stack.Screen
                name="FriendProfile"
                component={FriendProfileScreen}
                options={({ route }) => {
                  const friend = USERS[route.params.friendId];
                  return { title: friend?.name || 'Friend' };
                }}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route }) => {
                  const other = USERS[route.params.otherUserId];
                  return { title: other?.name || 'Chat' };
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </AppContext.Provider>
  );
}

// --- STYLES --- //

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Login
  loginContainer: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
    marginTop: 10,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  loginList: {
    gap: 12,
  },
  loginCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  loginAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: COLORS.lightPink,
  },
  loginName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
  },
  loginUsername: {
    fontSize: 14,
    color: '#666',
  },

  // Gallery
  galleryContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  galleryHeader: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: COLORS.lightBeige,
  },
  galleryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
  },
  userStripContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  userStrip: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  userIconContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  userIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightBeige,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userIconActive: {
    borderColor: COLORS.mediumPink,
  },
  userIconName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  userIconNameActive: {
    color: COLORS.darkBurgundy,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightPink,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  galleryList: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  memoryCard: {
    flex: 1,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
    height: 200,
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  memoryInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  memoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  memoryDate: {
    fontSize: 10,
    color: '#ddd',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.mediumPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },

  // Friends
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
  },
  listContent: {
    padding: 15,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
  },
  friendButton: {
    backgroundColor: COLORS.lightBeige,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.mediumPink,
  },
  friendButtonText: {
    color: COLORS.mediumPink,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Profile
  profileContent: {
    padding: 20,
    paddingTop: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: COLORS.mediumPink,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
    marginBottom: 5,
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.lightPink,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.mediumPink,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
    paddingBottom: 5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },

  // Memory Detail
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
  },
  detailImageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  detailImage: {
    width: '80%',
    height: 400,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  detailImageOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginTop: 10,
  },
  detailOverlayUser: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.darkBurgundy,
  },
  detailMiniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  detailOverlayTime: {
    fontSize: 12,
    color: '#666',
  },
  chatContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
    maxWidth: '75%',
  },
  messageMe: {
    backgroundColor: COLORS.mediumPink,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  messageThem: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTextThem: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  messageTimeThem: {
    color: '#999',
    textAlign: 'left',
  },

  // Select partner / post preview
  postPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
  },
  postPreviewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  postPreviewTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
  },
  postPreviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Friend profile
  friendProfileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightBeige,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.mediumPink,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
    marginTop: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  authorTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(140, 15, 46, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  authorTagMine: {
    backgroundColor: 'rgba(224, 92, 115, 0.9)',
  },
  authorTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Chat header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
  },
  chatHeaderUsername: {
    fontSize: 12,
    color: '#666',
  },
  chatScroll: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  activePostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.mediumPink,
  },
  activePostImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  activePostLabel: {
    fontSize: 11,
    color: COLORS.mediumPink,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activePostTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkBurgundy,
    marginTop: 2,
  },
  messageContextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
    marginBottom: 6,
  },
  messageContextMine: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  messageContextTheirs: {
    backgroundColor: COLORS.lightBeige,
  },
  messageContextImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 8,
  },
  messageContextTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkBurgundy,
  },

  // Chat input
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightPink,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  chatSendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.mediumPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
