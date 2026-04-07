import React, { useState, useEffect, createContext, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { mockMemories } from './mockData';

const COLORS = {
  lightBeige: '#E9DFD8',
  lightPink: '#E7B3B0',
  mediumPink: '#E05C73',
  darkBurgundy: '#8C0F2E',
};

const MemoryContext = createContext();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- SCREENS --- //

function HelloWorldScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.helloText}>Hello World</Text>
    </View>
  );
}

function StyleGuideScreen() {
  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Colors</Text>
        <View style={styles.colorRow}><View style={[styles.colorBox, { backgroundColor: COLORS.lightBeige }]} /><Text style={styles.bodyText}>Light Beige (#E9DFD8)</Text></View>
        <View style={styles.colorRow}><View style={[styles.colorBox, { backgroundColor: COLORS.lightPink }]} /><Text style={styles.bodyText}>Light Pink (#E7B3B0)</Text></View>
        <View style={styles.colorRow}><View style={[styles.colorBox, { backgroundColor: COLORS.mediumPink }]} /><Text style={styles.bodyText}>Medium Pink (#E05C73)</Text></View>
        <View style={styles.colorRow}><View style={[styles.colorBox, { backgroundColor: COLORS.darkBurgundy }]} /><Text style={styles.bodyText}>Dark Burgundy (#8C0F2E)</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Typography</Text>
        <Text style={[styles.bodyText, { fontWeight: '300' }]}>Light Font Weight Example</Text>
        <Text style={[styles.bodyText, { fontWeight: '500' }]}>Medium Font Weight Example</Text>
        <Text style={[styles.bodyText, { fontWeight: 'bold' }]}>Bold Font Weight Example</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Icons</Text>
        <View style={styles.iconRow}>
          <FontAwesome name="heart" size={32} color={COLORS.mediumPink} />
          <FontAwesome name="bookmark" size={32} color={COLORS.darkBurgundy} />
          <Ionicons name="images" size={32} color={COLORS.darkBurgundy} />
          <Ionicons name="person" size={32} color={COLORS.darkBurgundy} />
        </View>
      </View>
    </ScrollView>
  );
}

function GalleryScreen({ navigation }) {
  const { memories, filterUser, setFilterUser } = useContext(MemoryContext);

  const displayedMemories = filterUser 
    ? memories.filter(m => m.user === filterUser)
    : memories;

  const renderMemoryCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.memoryCard}
      onPress={() => navigation.navigate('MemoryDetail', { memory: item })}
    >
      <Image source={{ uri: item.image }} style={styles.memoryImage} />
      <View style={styles.memoryInfoOverlay}>
        <Text style={styles.memoryTitle}>{item.title}</Text>
        <Text style={styles.memoryDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.galleryContainer}>
      <View style={styles.galleryHeader}>
        <Text style={styles.galleryTitle}>Gallery</Text>
      </View>

      {/* Horizontal User Selection Strip */}
      <View style={styles.userStripContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.userStrip}>
          <TouchableOpacity 
            style={styles.userIconContainer} 
            onPress={() => setFilterUser(null)}
          >
            <View style={[styles.userIconCircle, !filterUser && styles.userIconActive]}>
              <Ionicons name="people" size={24} color={!filterUser ? COLORS.darkBurgundy : '#666'} />
            </View>
            <Text style={[styles.userIconName, !filterUser && styles.userIconNameActive]}>All</Text>
          </TouchableOpacity>
          
          {MOCK_FRIENDS.map(user => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.userIconContainer} 
              onPress={() => setFilterUser(user.name)}
            >
              <Image 
                source={{ uri: user.avatar }} 
                style={[
                  styles.userIconCircle, 
                  filterUser === user.name && styles.userIconActive
                ]} 
              />
              <Text style={[styles.userIconName, filterUser === user.name && styles.userIconNameActive]}>
                {user.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.divider} />
      
      <FlatList
        data={displayedMemories}
        keyExtractor={(item) => item.id}
        renderItem={renderMemoryCard}
        contentContainerStyle={styles.galleryList}
        numColumns={2}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No memories found.</Text>}
      />

      {/* Compact Quick Actions Header hidden behind a tiny absolute button or removed since Hello World is checked */}
      <View style={{position: 'absolute', bottom: 20, right: 20}}>
          <TouchableOpacity style={[styles.compactButton, {marginBottom: 10}]} onPress={() => navigation.navigate('HelloWorld')}>
            <Text style={styles.compactButtonText}>Hello</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactButton} onPress={() => navigation.navigate('StyleGuide')}>
            <Text style={styles.compactButtonText}>Styles</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}

const MOCK_FRIENDS = [
  { id: '1', name: 'Alice Smith', username: '@alice', avatar: 'https://picsum.photos/seed/aliceAvatar/100/100' },
  { id: '2', name: 'Bob Johnson', username: '@bobj', avatar: 'https://picsum.photos/seed/bobAvatar/100/100' },
  { id: '3', name: 'Charlie Davis', username: '@charlie_d', avatar: 'https://picsum.photos/seed/charlieAvatar/100/100' },
];

function FriendsScreen() {
  const renderFriend = ({ item }) => (
    <View style={styles.friendCard}>
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendUsername}>{item.username}</Text>
      </View>
      <TouchableOpacity style={styles.friendButton}>
        <Text style={styles.friendButtonText}>Connected</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.listContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends List</Text>
        <TouchableOpacity>
          <Ionicons name="person-add" size={24} color={COLORS.darkBurgundy} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_FRIENDS}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

function ProfileScreen() {
  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.profileContent}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: 'https://picsum.photos/seed/myAvatar/150/150' }} style={styles.profileAvatar} />
        <Text style={styles.profileName}>Jane Doe</Text>
        <Text style={styles.profileUsername}>@jane_storysaver</Text>
        <Text style={styles.profileBio}>Preserving memories, one story at a time. ✨</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>14</Text>
          <Text style={styles.statLabel}>Memories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>3</Text>
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
        <TouchableOpacity style={styles.settingRow}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.darkBurgundy} />
          <Text style={styles.settingText}>Log Out</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function UserSelectScreen({ navigation }) {
  const { setFilterUser } = useContext(MemoryContext);
  const users = ['Alice', 'Bob', 'Charlie'];

  const selectUser = (user) => {
    setFilterUser(user);
    navigation.goBack();
  };

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.headerText}>Select a Person</Text>
      {users.map(user => (
        <TouchableOpacity key={user} style={styles.button} onPress={() => selectUser(user)}>
          <Text style={styles.buttonText}>{user}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MemoryDetailScreen({ route }) {
  const { memory } = route.params;
  const messages = memory.messages || [];

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.detailContainer}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Top Image Preview */}
        <View style={styles.detailImageContainer}>
          <Image source={{ uri: memory.image }} style={styles.detailImage} />
          <View style={styles.detailImageOverlay}>
            <Text style={styles.detailOverlayUser}>
              {memory.userAvatar && <Image source={{ uri: memory.userAvatar }} style={styles.detailMiniAvatar} />}
              {' '}
              {memory.user} ❤️
            </Text>
            <Text style={styles.detailOverlayTime}>10:30 AM</Text>
          </View>
        </View>

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          {messages.length > 0 ? (
            <FlatList
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              scrollEnabled={false}
            />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No messages saved for this memory.</Text>
          )}
          <Text style={styles.savedMemoryFooter}>Saved Memory{'\n'}{memory.date}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SaveMemoryScreen({ navigation, route }) {
  const { memories, setMemories } = useContext(MemoryContext);
  const params = route.params || {};

  const handleSave = () => {
    const newMemory = {
      id: Math.random().toString(),
      title: params.caption || 'Imported Story',
      date: params.date || new Date().toDateString(),
      image: params.image || 'https://picsum.photos/seed/default/400/300',
      user: params.user || 'Unknown'
    };
    
    setMemories([newMemory, ...memories]);
    Alert.alert("Success", "Memory saved successfully!");
    navigation.navigate('MainTabs');
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.headerText}>Save New Memory</Text>
      <Text style={styles.bodyText}>You received a story from Instagram Mock:</Text>
      
      <View style={styles.memoryCard}>
        {params.image && <Image source={{ uri: params.image }} style={styles.memoryImage} />}
        <View style={styles.memoryInfo}>
          <Text style={styles.memoryTitle}>{params.caption || 'No Caption'}</Text>
          <View style={styles.memoryMetaRow}>
            <Text style={styles.memoryUser}>from {params.user || 'Unknown User'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={[styles.button, { marginTop: 30 }]} onPress={handleSave}>
        <Text style={styles.buttonText}>Confirm & Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { marginTop: 15, backgroundColor: '#999' }]} onPress={() => navigation.navigate('MainTabs')}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- NAVIGATORS --- //

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.darkBurgundy,
        tabBarInactiveTintColor: COLORS.mediumPink,
        headerStyle: { backgroundColor: COLORS.lightBeige },
        headerTintColor: COLORS.darkBurgundy,
        headerTitleStyle: { fontWeight: 'bold' }
      })}
    >
      <Tab.Screen name="Home" component={GalleryScreen} options={{ title: 'Story Saver' }} />
      <Tab.Screen name="Friends" component={FriendsScreen} options={{ title: 'Friends' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// --- APP CONFIG --- //

const linking = {
  prefixes: ['storysaver://'],
  config: {
    screens: {
      SaveMemory: 'save',
    },
  },
};

export default function App() {
  const [memories, setMemories] = useState(mockMemories);
  const [filterUser, setFilterUser] = useState(null);

  return (
    <MemoryContext.Provider value={{ memories, setMemories, filterUser, setFilterUser }}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator 
          screenOptions={{ 
            headerStyle: { backgroundColor: COLORS.lightBeige },
            headerTintColor: COLORS.darkBurgundy,
            headerTitleStyle: { fontWeight: 'bold' }
          }}
        >
          {/* Main Tab Navigator has its own headers, so hide the stack header */}
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          
          <Stack.Screen name="MemoryDetail" component={MemoryDetailScreen} options={({ route }) => ({ title: route.params.memory.title, headerRight: () => <Ionicons name="share-outline" size={24} color={COLORS.darkBurgundy} /> })} />
          <Stack.Screen name="HelloWorld" component={HelloWorldScreen} options={{ title: 'Hello World' }} />
          <Stack.Screen name="StyleGuide" component={StyleGuideScreen} options={{ title: 'Style Guide' }} />
          <Stack.Screen name="UserSelect" component={UserSelectScreen} options={{ title: 'Filter by Person', presentation: 'modal' }} />
          <Stack.Screen name="SaveMemory" component={SaveMemoryScreen} options={{ title: 'Save Memory' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </MemoryContext.Provider>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  helloText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkBurgundy,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
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
  bodyText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: COLORS.mediumPink,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.lightBeige,
  },
  compactButton: {
    backgroundColor: COLORS.mediumPink,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  compactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    paddingBottom: 20,
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
  memoryUser: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.mediumPink,
  },
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
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  detailOverlayTime: {
    fontSize: 12,
    color: '#666',
  },
  chatContainer: {
    paddingHorizontal: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
    maxWidth: '75%',
  },
  messageMe: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageThem: {
    backgroundColor: COLORS.lightPink,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  messageTextMe: {
    color: '#333',
  },
  messageTextThem: {
    color: COLORS.darkBurgundy,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  messageTimeMe: {
    color: '#999',
    textAlign: 'left',
  },
  messageTimeThem: {
    color: COLORS.darkBurgundy,
    opacity: 0.7,
    textAlign: 'right',
  },
  savedMemoryFooter: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 10,
    marginTop: 20,
  }
});