import { useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, SafeAreaView, Linking, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, Feather, Ionicons } from '@expo/vector-icons';

const MOCK_STORIES = [
  {
    id: 's1',
    user: 'Your Story',
    avatar: 'https://picsum.photos/seed/myAvatar/100/100',
    image: 'https://picsum.photos/seed/mystory/500/800',
    caption: 'My morning coffee ☕️',
    date: 'July 15, 2025',
    isUser: true,
  },
  {
    id: 's2',
    user: 'lil_lapisla...',
    avatar: 'https://picsum.photos/seed/lapis/100/100',
    image: 'https://picsum.photos/seed/beach/500/800',
    caption: 'Beach day!',
    date: 'July 15, 2025',
  },
  {
    id: 's3',
    user: 'lofti232',
    avatar: 'https://picsum.photos/seed/lofti/100/100',
    image: 'https://picsum.photos/seed/hike/500/800',
    caption: 'Nature walks 🌲',
    date: 'July 15, 2025',
  },
  {
    id: 's4',
    user: 'kenzoere',
    avatar: 'https://picsum.photos/seed/kenz/100/100',
    image: 'https://picsum.photos/seed/grad/500/800',
    caption: 'Graduation vibes 🎓',
    date: 'July 15, 2025',
  },
  {
    id: 's5',
    user: 'photosbyen',
    avatar: 'https://picsum.photos/seed/photos/100/100',
    image: 'https://picsum.photos/seed/photo/500/800',
    caption: 'City streets',
    date: 'July 15, 2025',
  }
];

const MOCK_POSTS = [
  {
    id: 'p1',
    user: 'photosbyen',
    userAvatar: 'https://picsum.photos/seed/photos/100/100',
    image: 'https://picsum.photos/seed/street/500/500',
    caption: 'Crosswalks and shadows.',
    likes: 'Liked by kenzoere and others',
    date: 'November 12'
  },
  {
    id: 'p2',
    user: 'kenzoere',
    userAvatar: 'https://picsum.photos/seed/kenz/100/100',
    image: 'https://picsum.photos/seed/grad/500/500',
    caption: 'Graduation vibes 🎓 So proud of everyone!',
    likes: 'Liked by lofti232 and others',
    date: 'May 20, 2025'
  }
];

export default function App() {
  const [activeStory, setActiveStory] = useState(null);

  const handleSaveToStorySaver = (story) => {
    // Generate the deep link URL with encoded parameters
    const url = `storysaver://save?id=${story.id}&user=${encodeURIComponent(story.user)}&image=${encodeURIComponent(story.image)}&caption=${encodeURIComponent(story.caption)}&date=${encodeURIComponent(story.date)}`;
    
    // Close story view before navigating
    setActiveStory(null);

    Linking.openURL(url).catch(err => {
      alert("Couldn't open Story Saver app. Is it installed?");
    });
  };

  const renderStory = ({ item }) => (
    <TouchableOpacity 
      style={styles.storyContainer}
      onPress={() => setActiveStory(item)} // Open story viewer
    >
      <View style={[styles.storyRing, item.isUser && styles.myStoryRing]}>
        <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
        {item.isUser && (
          <View style={styles.addStoryIcon}>
            <Ionicons name="add" size={12} color="#fff" />
          </View>
        )}
      </View>
      <Text style={styles.storyUser} numberOfLines={1}>{item.user}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          <Text style={styles.username}>{item.user}</Text>
        </View>
        <Feather name="more-horizontal" size={24} color="black" />
      </View>

      <Image source={{ uri: item.image }} style={styles.postImage} />

      <View style={styles.postActions}>
        <View style={styles.leftActions}>
          <FontAwesome name="heart-o" size={28} color="black" style={styles.actionIcon} />
          <FontAwesome name="comment-o" size={28} color="black" style={styles.actionIcon} />
          <Feather name="send" size={28} color="black" style={styles.actionIcon} />
        </View>
        <FontAwesome name="bookmark-o" size={28} color="black" />
      </View>
      
      <View style={styles.likesContainer}>
        <Text style={styles.likesText}>{item.likes}</Text>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.caption}>
          <Text style={styles.boldUsername}>{item.user} </Text>
          {item.caption}
        </Text>
      </View>
      
      <Text style={styles.postDate}>{item.date}</Text>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.storiesSection}>
        <FlatList
          data={MOCK_STORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderStory}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesList}
        />
      </View>
      <View style={styles.divider} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Instagram</Text>
        <View style={styles.headerIcons}>
          <FontAwesome name="plus-square-o" size={26} color="black" style={styles.headerIcon} />
          <FontAwesome name="heart-o" size={26} color="black" style={styles.headerIcon} />
          <FontAwesome name="paper-plane-o" size={26} color="black" />
        </View>
      </View>

      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
      />
      
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={28} color="black" />
        <Ionicons name="search-outline" size={28} color="black" />
        <Feather name="youtube" size={28} color="black" />
        <Feather name="shopping-bag" size={28} color="black" />
        <Image source={{ uri: 'https://picsum.photos/seed/myAvatar/100/100' }} style={styles.navAvatar} />
      </View>
      <StatusBar style="auto" />

      {/* STORY VIEWER MODAL */}
      <Modal
        visible={!!activeStory}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setActiveStory(null)}
      >
        {activeStory && (
          <View style={styles.storyViewerContainer}>
            <Image source={{ uri: activeStory.image }} style={styles.storyViewerImage} />
            
            {/* Top Bar Overlay */}
            <SafeAreaView style={styles.storyViewerTopBar}>
              <View style={styles.storyViewerUser}>
                <Image source={{ uri: activeStory.avatar }} style={styles.storyViewerAvatar} />
                <Text style={styles.storyViewerUsername}>{activeStory.user}</Text>
                <Text style={styles.storyViewerTime}>2h</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveStory(null)} style={styles.closeStoryButton}>
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>
            </SafeAreaView>

            {/* Bottom Action Bar */}
            <SafeAreaView style={styles.storyViewerBottomBar}>
              <View style={styles.storyReplyBox}>
                <Text style={styles.storyReplyText}>Send message</Text>
              </View>
              <Ionicons name="heart-outline" size={30} color="#fff" style={styles.storyActionIcon} />
              <Ionicons name="paper-plane-outline" size={30} color="#fff" style={styles.storyActionIcon} />
              
              {/* Custom Save Button injected into the Story */}
              <TouchableOpacity 
                style={styles.storySaveButton}
                onPress={() => handleSaveToStorySaver(activeStory)}
              >
                <Ionicons name="bookmark" size={16} color="#fff" />
                <Text style={styles.storySaveButtonText}>Save in Story Saver</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        )}
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 26,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginRight: 20,
  },
  storiesSection: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  storiesList: {
    paddingHorizontal: 10,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 15,
    width: 75,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#E05C73', // Instagram-like pinkish red
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  myStoryRing: {
    borderColor: '#ddd',
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  addStoryIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0095f6',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyUser: {
    fontSize: 11,
    color: '#262626',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#dbdbdb',
  },
  postContainer: {
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginRight: 15,
  },
  likesContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  likesText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  postContent: {
    paddingHorizontal: 10,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
  },
  boldUsername: {
    fontWeight: 'bold',
  },
  postDate: {
    fontSize: 10,
    color: '#8e8e8e',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  navAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  
  // --- STORY VIEWER MODAL STYLES --- //
  storyViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyViewerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storyViewerTopBar: {
    position: 'absolute',
    top: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyViewerUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyViewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  storyViewerUsername: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  storyViewerTime: {
    color: '#ddd',
    fontSize: 12,
  },
  closeStoryButton: {
    padding: 5,
  },
  storyViewerBottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyReplyBox: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginRight: 15,
  },
  storyReplyText: {
    color: '#fff',
    fontSize: 14,
  },
  storyActionIcon: {
    marginHorizontal: 8,
  },
  storySaveButton: {
    position: 'absolute',
    bottom: 60,
    right: 0,
    backgroundColor: '#E05C73', // Story Saver's Medium Pink
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  storySaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 12,
  },
});