import React, { useState, useEffect, createContext, useContext, useRef, useMemo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Image,
  FlatList, Alert, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Modal, SectionList, Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
  USERS, mockMemories, mockChats, chatKey,
  SUGGESTED_TAGS, AUTO_REPLIES, STORY_PROMPTS, REACTIONS,
} from './mockData';

const COLORS = {
  white: '#FFFFFF',
  lightBeige: '#E9DFD8',
  lightPink: '#E7B3B0',
  mediumPink: '#E05C73',
  darkBurgundy: '#8C0F2E',
};

const STORAGE_KEYS = {
  MEMORIES: '@storysaver_memories',
  CURRENT_USER: '@storysaver_current_user',
  CHATS: '@storysaver_chats',
  ONBOARDED: '@storysaver_onboarded',
};

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest', icon: 'arrow-down' },
  { id: 'oldest', label: 'Oldest', icon: 'arrow-up' },
  { id: 'title', label: 'A–Z', icon: 'text' },
];

const AppContext = createContext();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const nowTime = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const monthLabel = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// --- LOGIN --- //

function LoginScreen() {
  const { login } = useContext(AppContext);
  const userList = Object.values(USERS);

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginHeader}>
        <Ionicons name="heart-circle" size={80} color={COLORS.mediumPink} />
        <Text style={styles.loginTitle}>Story Saver</Text>
        <Text style={styles.loginSubtitle}>Save the story behind every photo</Text>
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

// --- ONBOARDING --- //

const ONBOARD_STEPS = [
  {
    icon: 'cloud-upload',
    title: 'Save a photo',
    body: 'Tap the + button to add any photo to your gallery. Tag it so you can find it later.',
  },
  {
    icon: 'pricetags',
    title: 'Organize your way',
    body: 'Filter by friend, tag, or month. Sort newest, oldest, or A–Z. Search across everything.',
  },
  {
    icon: 'chatbubbles',
    title: 'Save the story',
    body: 'Open a photo and chat about it with a friend. Pin the best replies — they become the story behind the photo.',
  },
];

function OnboardingOverlay({ visible, onDone }) {
  const [step, setStep] = useState(0);
  if (!visible) return null;
  const cur = ONBOARD_STEPS[step];
  const last = step === ONBOARD_STEPS.length - 1;
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.onboardBackdrop}>
        <View style={styles.onboardCard}>
          <View style={styles.onboardIconWrap}>
            <Ionicons name={cur.icon} size={42} color="#fff" />
          </View>
          <Text style={styles.onboardTitle}>{cur.title}</Text>
          <Text style={styles.onboardBody}>{cur.body}</Text>

          <View style={styles.onboardDots}>
            {ONBOARD_STEPS.map((_, i) => (
              <View key={i} style={[styles.onboardDot, i === step && styles.onboardDotActive]} />
            ))}
          </View>

          <View style={styles.onboardActions}>
            <TouchableOpacity onPress={onDone}>
              <Text style={styles.onboardSkip}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.onboardNext}
              onPress={() => (last ? onDone() : setStep(step + 1))}
            >
              <Text style={styles.onboardNextText}>{last ? 'Get started' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// --- GALLERY --- //

function GalleryScreen({ navigation }) {
  const { memories, chats, currentUser, addMemory } = useContext(AppContext);
  const [filterUserId, setFilterUserId] = useState(null);
  const [filterTags, setFilterTags] = useState([]); // multi-select OR
  const [sort, setSort] = useState('newest');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' | 'timeline'
  const [search, setSearch] = useState('');

  const friends = currentUser.friends.map(id => USERS[id]).filter(Boolean);

  const visibleMemories = memories.filter(m => {
    const isMyStory = m.userId === currentUser.id;
    const isFriendStory = currentUser.friends.includes(m.userId);
    return isMyStory || isFriendStory;
  });

  // Map of postId -> count of unread-ish messages (we just count any messages since UI mock has no read state)
  const messageCountByPost = useMemo(() => {
    const out = {};
    Object.values(chats).forEach(thread => {
      thread.forEach(m => {
        if (m.postId) out[m.postId] = (out[m.postId] || 0) + 1;
      });
    });
    return out;
  }, [chats]);

  const availableTags = useMemo(() => {
    const set = new Set();
    visibleMemories.forEach(m => (m.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [visibleMemories]);

  const displayedMemories = useMemo(() => {
    let out = visibleMemories;
    if (filterUserId) out = out.filter(m => m.userId === filterUserId);
    if (filterTags.length > 0) {
      out = out.filter(m => (m.tags || []).some(t => filterTags.includes(t)));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(m =>
        (m.title || '').toLowerCase().includes(q) ||
        (m.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    const sorted = [...out];
    if (sort === 'newest') sorted.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    else if (sort === 'oldest') sorted.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    else if (sort === 'title') sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    return sorted;
  }, [visibleMemories, filterUserId, filterTags, sort, search]);

  // For timeline view: group into [{ title: 'July 2025', data: [[m1,m2],[m3]] }] (pairs for 2-col rows)
  const timelineSections = useMemo(() => {
    const groups = {};
    displayedMemories.forEach(m => {
      const key = monthLabel(m.timestamp || Date.now());
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.keys(groups).map(k => {
      const items = groups[k];
      const rows = [];
      for (let i = 0; i < items.length; i += 2) {
        rows.push(items.slice(i, i + 2));
      }
      return { title: k, data: rows };
    });
  }, [displayedMemories]);

  const toggleTag = (t) => {
    setFilterTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

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
    if (Alert.prompt) {
      Alert.prompt('New Story', 'Add a caption:', (caption) => {
        saveNewMemory(uri, caption || 'Untitled Story');
      });
    } else {
      saveNewMemory(uri, 'Untitled Story');
    }
  };

  const saveNewMemory = (uri, title) => {
    const now = Date.now();
    const newMemory = {
      id: now.toString(),
      title,
      date: formatDate(now),
      timestamp: now,
      image: uri,
      userId: currentUser.id,
      tags: [],
    };
    addMemory(newMemory);
    navigation.navigate('StoryDetail', { postId: newMemory.id });
  };

  const renderCard = (item) => {
    if (!item) return <View style={[styles.memoryCard, { backgroundColor: 'transparent' }]} />;
    const author = USERS[item.userId];
    const tags = item.tags || [];
    const msgCount = messageCountByPost[item.id] || 0;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.memoryCard}
        onPress={() => navigation.navigate('StoryDetail', { postId: item.id })}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.image }} style={styles.memoryImage} />
        {tags.length > 0 && (
          <View style={styles.cardTagRow}>
            {tags.slice(0, 2).map(t => (
              <View key={t} style={styles.cardTagChip}>
                <Text style={styles.cardTagText}>#{t}</Text>
              </View>
            ))}
          </View>
        )}
        {msgCount > 0 && (
          <View style={styles.cardMsgBadge}>
            <Ionicons name="chatbubble" size={10} color="#fff" />
            <Text style={styles.cardMsgBadgeText}>{msgCount}</Text>
          </View>
        )}
        <View style={styles.memoryInfoOverlay}>
          <Text style={styles.memoryTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.memoryDate}>
            {author ? author.name.split(' ')[0] : ''} · {item.date}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGridItem = ({ item }) => renderCard(item);

  const renderTimelineRow = ({ item }) => (
    <View style={styles.timelineRow}>
      {renderCard(item[0])}
      {item[1] ? renderCard(item[1]) : <View style={styles.memoryCard} />}
    </View>
  );

  const activeSort = SORT_OPTIONS.find(o => o.id === sort);
  const filtersActive = !!filterUserId || filterTags.length > 0 || !!search.trim();

  const headerArea = (
    <>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={COLORS.darkBurgundy} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stories or #tags"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
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

      {availableTags.length > 0 && (
        <View style={styles.tagFilterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            <TouchableOpacity
              style={[styles.tagFilterChip, filterTags.length === 0 && styles.tagFilterChipActive]}
              onPress={() => setFilterTags([])}
            >
              <Text style={[styles.tagFilterText, filterTags.length === 0 && styles.tagFilterTextActive]}>All tags</Text>
            </TouchableOpacity>
            {availableTags.map(t => {
              const active = filterTags.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.tagFilterChip, active && styles.tagFilterChipActive]}
                  onPress={() => toggleTag(t)}
                >
                  <Text style={[styles.tagFilterText, active && styles.tagFilterTextActive]}>#{t}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.toolbarRow}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, view === 'grid' && styles.viewToggleBtnActive]}
            onPress={() => setView('grid')}
          >
            <Ionicons name="grid" size={14} color={view === 'grid' ? '#fff' : COLORS.darkBurgundy} />
            <Text style={[styles.viewToggleText, view === 'grid' && { color: '#fff' }]}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, view === 'timeline' && styles.viewToggleBtnActive]}
            onPress={() => setView('timeline')}
          >
            <Ionicons name="time" size={14} color={view === 'timeline' ? '#fff' : COLORS.darkBurgundy} />
            <Text style={[styles.viewToggleText, view === 'timeline' && { color: '#fff' }]}>Timeline</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sortButton} onPress={() => setSortMenuOpen(true)}>
          <Ionicons name="swap-vertical" size={14} color={COLORS.darkBurgundy} />
          <Text style={styles.sortButtonText}>{activeSort.label}</Text>
        </TouchableOpacity>
      </View>

      {filtersActive && (
        <TouchableOpacity style={styles.clearFiltersRow} onPress={() => {
          setFilterUserId(null); setFilterTags([]); setSearch('');
        }}>
          <Ionicons name="close-circle" size={14} color={COLORS.mediumPink} />
          <Text style={styles.clearFiltersText}>Clear filters</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={styles.galleryContainer}>
      <View style={styles.galleryHeader}>
        <Text style={styles.galleryTitle}>Gallery</Text>
        <Text style={styles.gallerySubtitle}>{displayedMemories.length} stor{displayedMemories.length === 1 ? 'y' : 'ies'}</Text>
      </View>

      {view === 'grid' ? (
        <FlatList
          data={displayedMemories}
          keyExtractor={item => item.id}
          renderItem={renderGridItem}
          numColumns={2}
          contentContainerStyle={styles.galleryList}
          ListHeaderComponent={headerArea}
          ListEmptyComponent={<EmptyGallery onAdd={pickImage} hasFilters={filtersActive} />}
        />
      ) : (
        <SectionList
          sections={timelineSections}
          keyExtractor={(item, idx) => `row-${idx}-${item[0]?.id || ''}`}
          renderItem={renderTimelineRow}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
          )}
          contentContainerStyle={styles.galleryList}
          ListHeaderComponent={headerArea}
          ListEmptyComponent={<EmptyGallery onAdd={pickImage} hasFilters={filtersActive} />}
          stickySectionHeadersEnabled={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={pickImage} activeOpacity={0.85}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={sortMenuOpen} transparent animationType="fade" onRequestClose={() => setSortMenuOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSortMenuOpen(false)}>
          <View style={styles.sortMenu}>
            <Text style={styles.sortMenuTitle}>Sort stories</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={styles.sortMenuRow}
                onPress={() => { setSort(opt.id); setSortMenuOpen(false); }}
              >
                <Ionicons name={opt.icon} size={18} color={COLORS.darkBurgundy} />
                <Text style={[styles.sortMenuText, sort === opt.id && { fontWeight: 'bold' }]}>
                  {opt.label}
                </Text>
                {sort === opt.id && (
                  <Ionicons name="checkmark" size={18} color={COLORS.mediumPink} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function EmptyGallery({ onAdd, hasFilters }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name={hasFilters ? 'search' : 'images'} size={36} color={COLORS.mediumPink} />
      </View>
      <Text style={styles.emptyTitle}>
        {hasFilters ? 'No stories match' : 'No stories yet'}
      </Text>
      <Text style={styles.emptyBody}>
        {hasFilters
          ? 'Try clearing a filter or searching for something else.'
          : 'Add your first photo and start saving the story behind it.'}
      </Text>
      {!hasFilters && (
        <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.emptyButtonText}>Add a story</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- STORY DETAIL --- //

function StoryDetailScreen({ navigation, route }) {
  const { memories, chats, currentUser, updateMemoryTags, deleteMemory } = useContext(AppContext);
  const { postId } = route.params;
  const post = memories.find(m => m.id === postId);
  const [tagInput, setTagInput] = useState('');

  const isMine = post?.userId === currentUser.id;

  // Show delete button in header only for own stories
  useEffect(() => {
    if (!isMine) return;
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Delete story',
              'This will permanently remove the story and cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    deleteMemory(postId);
                    navigation.goBack();
                  },
                },
              ]
            )
          }
          style={{ marginRight: 4 }}
        >
          <Ionicons name="trash-outline" size={22} color={COLORS.mediumPink} />
        </TouchableOpacity>
      ),
    });
  }, [isMine, postId]);

  if (!post) {
    return (
      <View style={styles.centerContainer}>
        <Text>Story not found.</Text>
      </View>
    );
  }

  const author = USERS[post.userId];
  const tags = post.tags || [];

  const friends = currentUser.friends.map(id => USERS[id]).filter(Boolean);

  // All pinned messages across all my chats that reference this post (the "saved story")
  const pinnedMessages = useMemo(() => {
    const out = [];
    Object.entries(chats).forEach(([key, msgs]) => {
      if (!key.includes(currentUser.id)) return;
      msgs.forEach(m => {
        if (m.postId === post.id && m.pinned) {
          out.push({ ...m, _threadKey: key });
        }
      });
    });
    return out.sort((a, b) => (a.id < b.id ? -1 : 1));
  }, [chats, currentUser.id, post.id]);

  const threadsByFriend = friends.map(f => {
    const k = chatKey(currentUser.id, f.id);
    const msgs = (chats[k] || []).filter(m => m.postId === post.id);
    return { friend: f, last: msgs[msgs.length - 1], count: msgs.length };
  });

  const addTag = (tag) => {
    const clean = (tag || '').trim().toLowerCase().replace(/^#/, '');
    if (!clean) return;
    if (tags.includes(clean)) { setTagInput(''); return; }
    updateMemoryTags(post.id, [...tags, clean]);
    setTagInput('');
  };
  const removeTag = (tag) => updateMemoryTags(post.id, tags.filter(t => t !== tag));
  const suggestable = SUGGESTED_TAGS.filter(t => !tags.includes(t));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }} contentContainerStyle={{ paddingBottom: 30 }}>
      <Image source={{ uri: post.image }} style={styles.storyHeroImage} />

      <View style={styles.storyMetaBlock}>
        <View style={styles.storyAuthorRow}>
          <Image source={{ uri: author.avatar }} style={styles.storyAuthorAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storyAuthorName}>{isMine ? 'You' : author.name}</Text>
            <Text style={styles.storyDate}>{post.date}</Text>
          </View>
        </View>
        <Text style={styles.storyTitle}>{post.title}</Text>
      </View>

      {/* The saved story = pinned highlights */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderInline}>
          <Ionicons name="bookmark" size={14} color={COLORS.mediumPink} />
          <Text style={styles.sectionLabel}>The story so far</Text>
        </View>
        {pinnedMessages.length === 0 ? (
          <Text style={styles.helperText}>
            Long-press a message in any chat about this photo and tap{' '}
            <Text style={{ fontWeight: 'bold', color: COLORS.darkBurgundy }}>Pin to story</Text>{' '}
            to capture it here.
          </Text>
        ) : (
          pinnedMessages.map(m => {
            const sender = USERS[m.senderId];
            return (
              <View key={m.id} style={styles.pinnedCard}>
                <Image source={{ uri: sender?.avatar }} style={styles.pinnedAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pinnedAuthor}>
                    {sender?.name || 'Unknown'} <Text style={styles.pinnedTime}>· {m.time}</Text>
                  </Text>
                  <Text style={styles.pinnedText}>{m.text}</Text>
                </View>
                <Ionicons name="bookmark" size={14} color={COLORS.mediumPink} />
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tags</Text>
        <View style={styles.tagWrap}>
          {tags.length === 0 && (
            <Text style={styles.helperText}>No tags yet — add some to organize your gallery.</Text>
          )}
          {tags.map(t => (
            <TouchableOpacity key={t} style={styles.tagChipFilled} onPress={() => removeTag(t)}>
              <Text style={styles.tagChipFilledText}>#{t}</Text>
              <Ionicons name="close" size={12} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tagInputRow}>
          <TextInput
            style={styles.tagInput}
            placeholder="Add a tag (e.g. travel)"
            placeholderTextColor="#999"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={() => addTag(tagInput)}
            returnKeyType="done"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.tagAddButton} onPress={() => addTag(tagInput)}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {suggestable.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {suggestable.map(t => (
              <TouchableOpacity key={t} style={styles.tagChipOutline} onPress={() => addTag(t)}>
                <Text style={styles.tagChipOutlineText}>+ #{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Conversations</Text>
        {threadsByFriend.length === 0 ? (
          <Text style={styles.helperText}>Add friends to start a chat about this memory.</Text>
        ) : (
          threadsByFriend.map(({ friend, last, count }) => (
            <TouchableOpacity
              key={friend.id}
              style={styles.threadRow}
              onPress={() => navigation.navigate('Chat', { otherUserId: friend.id, postId: post.id })}
            >
              <Image source={{ uri: friend.avatar }} style={styles.threadAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.threadName}>{friend.name}</Text>
                <Text style={styles.threadPreview} numberOfLines={1}>
                  {last
                    ? `${last.senderId === currentUser.id ? 'You: ' : ''}${last.text}`
                    : 'Tap to start a conversation'}
                </Text>
              </View>
              {count > 0 && (
                <View style={styles.threadBadge}>
                  <Text style={styles.threadBadgeText}>{count}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={COLORS.mediumPink} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// --- FRIENDS / PROFILE --- //

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
        ListEmptyComponent={<Text style={styles.helperTextCentered}>No friends yet.</Text>}
      />
    </View>
  );
}

function ProfileScreen() {
  const { currentUser, memories, logout, replayOnboarding } = useContext(AppContext);
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
        <TouchableOpacity style={styles.settingRow} onPress={replayOnboarding}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.darkBurgundy} />
          <Text style={styles.settingText}>Show intro again</Text>
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

function FriendProfileScreen({ navigation, route }) {
  const { currentUser, memories } = useContext(AppContext);
  const { friendId } = route.params;
  const friend = USERS[friendId];

  const posts = memories
    .filter(m => m.userId === friendId || m.userId === currentUser.id)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  if (!friend) {
    return (<View style={styles.centerContainer}><Text>Friend not found.</Text></View>);
  }

  const renderPost = ({ item }) => {
    const author = USERS[item.userId];
    const isMine = item.userId === currentUser.id;
    return (
      <TouchableOpacity
        style={styles.memoryCard}
        onPress={() => navigation.navigate('StoryDetail', { postId: item.id })}
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
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
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
            <Text style={styles.sectionLabel}>Shared posts · tap to open</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.helperTextCentered}>No posts yet.</Text>}
      />
    </View>
  );
}

// --- CHAT --- //

function ChatScreen({ route }) {
  const {
    currentUser, memories, chats, sendMessage, sendAutoReply,
    togglePinMessage, reactToMessage,
  } = useContext(AppContext);
  const { otherUserId, postId } = route.params;
  const other = USERS[otherUserId];
  const post = postId ? memories.find(m => m.id === postId) : null;
  const key = chatKey(currentUser.id, otherUserId);
  const messages = chats[key] || [];
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [actionsForId, setActionsForId] = useState(null);
  const scrollRef = useRef(null);
  const replyTimer = useRef(null);

  // Rotate prompts each time we open the chat with a post
  const promptIdx = useMemo(
    () => Math.floor(Math.random() * STORY_PROMPTS.length),
    [postId]
  );

  useEffect(() => () => { if (replyTimer.current) clearTimeout(replyTimer.current); }, []);

  const handleSend = (override) => {
    const trimmed = (override ?? text).trim();
    if (!trimmed) return;
    sendMessage(otherUserId, trimmed, postId);
    setText('');

    setTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      sendAutoReply(otherUserId, reply, postId);
      setTyping(false);
    }, 1400);
  };

  const usePrompt = (p) => handleSend(p);

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser.id;
    const refPost = item.postId ? memories.find(m => m.id === item.postId) : null;
    const reactions = item.reactions || {};
    const reactionEntries = Object.entries(reactions).filter(([, users]) => users.length > 0);
    return (
      <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
        <Pressable
          onLongPress={() => setActionsForId(item.id)}
          delayLongPress={250}
          style={[
            styles.messageBubble,
            isMe ? styles.messageMe : styles.messageThem,
            item.pinned && styles.messageBubblePinned,
          ]}
        >
          {item.pinned && (
            <View style={styles.pinnedTag}>
              <Ionicons name="bookmark" size={10} color="#fff" />
              <Text style={styles.pinnedTagText}>Pinned to story</Text>
            </View>
          )}
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
        </Pressable>
        {reactionEntries.length > 0 && (
          <View style={[styles.reactionRow, isMe ? { alignSelf: 'flex-end' } : null]}>
            {reactionEntries.map(([emoji, users]) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.reactionPill,
                  users.includes(currentUser.id) && styles.reactionPillMine,
                ]}
                onPress={() => reactToMessage(otherUserId, item.id, emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text style={styles.reactionCount}>{users.length}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const activeMsg = messages.find(m => m.id === actionsForId);

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
          <Text style={styles.chatHeaderUsername}>
            {typing ? 'typing…' : other.username}
          </Text>
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
              <Text style={styles.activePostLabel}>About this story</Text>
              <Text style={styles.activePostTitle} numberOfLines={1}>{post.title}</Text>
            </View>
          </View>
        )}

        {messages.length === 0 && (
          <Text style={styles.helperTextCentered}>
            No messages yet. Say hi to {other.name.split(' ')[0]}!
          </Text>
        )}

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />

        {typing && (
          <View style={[styles.messageBubble, styles.messageThem, styles.typingBubble]}>
            <Text style={{ color: '#666', fontStyle: 'italic' }}>
              {other.name.split(' ')[0]} is typing…
            </Text>
          </View>
        )}
      </ScrollView>

      {post && (
        <View style={styles.promptBar}>
          <Ionicons name="sparkles" size={14} color={COLORS.mediumPink} />
          <Text style={styles.promptLabel}>Story prompt</Text>
          <TouchableOpacity style={styles.promptChip} onPress={() => usePrompt(STORY_PROMPTS[promptIdx])}>
            <Text style={styles.promptChipText} numberOfLines={1}>
              {STORY_PROMPTS[promptIdx]}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.chatInputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder={`Message ${other.name.split(' ')[0]}...`}
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.chatSendButton} onPress={() => handleSend()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Long-press action sheet */}
      <Modal
        visible={!!actionsForId}
        transparent
        animationType="fade"
        onRequestClose={() => setActionsForId(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setActionsForId(null)}>
          <View style={styles.actionSheet}>
            <Text style={styles.actionSheetTitle} numberOfLines={2}>
              {activeMsg?.text}
            </Text>

            <View style={styles.reactionPickerRow}>
              {REACTIONS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={styles.reactionPickerBtn}
                  onPress={() => {
                    reactToMessage(otherUserId, actionsForId, e);
                    setActionsForId(null);
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeMsg?.postId && (
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => {
                  togglePinMessage(otherUserId, actionsForId);
                  setActionsForId(null);
                }}
              >
                <Ionicons
                  name={activeMsg?.pinned ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={COLORS.mediumPink}
                />
                <Text style={styles.actionRowText}>
                  {activeMsg?.pinned ? 'Unpin from story' : 'Pin to story'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={() => setActionsForId(null)}
            >
              <Ionicons name="close" size={20} color="#666" />
              <Text style={[styles.actionRowText, { color: '#666' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
        headerStyle: { backgroundColor: COLORS.white },
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedMemories, storedChats, onboarded] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
          AsyncStorage.getItem(STORAGE_KEYS.MEMORIES),
          AsyncStorage.getItem(STORAGE_KEYS.CHATS),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        ]);
        if (storedUser) setCurrentUserId(storedUser);

        const mems = storedMemories ? JSON.parse(storedMemories) : mockMemories;
        const migrated = mems.map(m => {
          // Replace any stale picsum placeholder URLs with the new relevant images
          const freshMock = mockMemories.find(mock => mock.id === m.id);
          const image = (m.image || '').includes('picsum.photos') && freshMock
            ? freshMock.image
            : m.image;
          return {
            ...m,
            image,
            tags: m.tags || [],
            timestamp: m.timestamp || Date.parse(m.date) || Date.now(),
          };
        });
        setMemories(migrated);

        setChats(storedChats ? JSON.parse(storedChats) : mockChats);
        if (!onboarded) setShowOnboarding(true);
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

  const finishOnboarding = async () => {
    setShowOnboarding(false);
    try { await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, '1'); } catch {}
  };
  const replayOnboarding = () => setShowOnboarding(true);

  const addMemory = (newMemory) => persistMemories([newMemory, ...memories]);

  const deleteMemory = (postId) => {
    persistMemories(memories.filter(m => m.id !== postId));
  };

  const updateMemoryTags = (postId, tags) => {
    persistMemories(memories.map(m => (m.id === postId ? { ...m, tags } : m)));
  };

  const appendMessage = (otherUserId, msg) => {
    const key = chatKey(currentUserId, otherUserId);
    const next = { ...chats, [key]: [...(chats[key] || []), msg] };
    persistChats(next);
  };

  const sendMessage = (otherUserId, text, postId) => {
    appendMessage(otherUserId, {
      id: `${Date.now()}-me`,
      text,
      senderId: currentUserId,
      postId: postId || null,
      time: nowTime(),
      reactions: {},
      pinned: false,
    });
  };
  const sendAutoReply = (otherUserId, text, postId) => {
    appendMessage(otherUserId, {
      id: `${Date.now()}-them`,
      text,
      senderId: otherUserId,
      postId: postId || null,
      time: nowTime(),
      reactions: {},
      pinned: false,
    });
  };

  const togglePinMessage = (otherUserId, msgId) => {
    const key = chatKey(currentUserId, otherUserId);
    const thread = chats[key] || [];
    const next = {
      ...chats,
      [key]: thread.map(m => (m.id === msgId ? { ...m, pinned: !m.pinned } : m)),
    };
    persistChats(next);
  };

  const reactToMessage = (otherUserId, msgId, emoji) => {
    const key = chatKey(currentUserId, otherUserId);
    const thread = chats[key] || [];
    const next = {
      ...chats,
      [key]: thread.map(m => {
        if (m.id !== msgId) return m;
        const r = { ...(m.reactions || {}) };
        const list = r[emoji] || [];
        r[emoji] = list.includes(currentUserId)
          ? list.filter(u => u !== currentUserId)
          : [...list, currentUserId];
        if (r[emoji].length === 0) delete r[emoji];
        return { ...m, reactions: r };
      }),
    };
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
    <AppContext.Provider value={{
      memories, chats, currentUser,
      addMemory, deleteMemory, updateMemoryTags,
      sendMessage, sendAutoReply,
      togglePinMessage, reactToMessage,
      login, logout, replayOnboarding,
    }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.white },
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
                name="StoryDetail"
                component={StoryDetailScreen}
                options={{ title: 'Story' }}
              />
              <Stack.Screen
                name="FriendProfile"
                component={FriendProfileScreen}
                options={({ route }) => ({
                  title: USERS[route.params.friendId]?.name || 'Friend',
                })}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route }) => ({
                  title: USERS[route.params.otherUserId]?.name || 'Chat',
                })}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {!!currentUser && (
        <OnboardingOverlay visible={showOnboarding} onDone={finishOnboarding} />
      )}
      <StatusBar style="auto" />
    </AppContext.Provider>
  );
}

// --- STYLES --- //

const styles = StyleSheet.create({
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  scrollContainer: { flex: 1, backgroundColor: COLORS.white },
  helperText: { color: '#777', fontSize: 13, lineHeight: 18 },
  helperTextCentered: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 13 },

  // Login
  loginContainer: {
    flex: 1, backgroundColor: COLORS.white,
    justifyContent: 'center', paddingHorizontal: 30,
  },
  loginHeader: { alignItems: 'center', marginBottom: 40 },
  loginTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.darkBurgundy, marginTop: 10 },
  loginSubtitle: { fontSize: 15, color: '#666', marginTop: 5, fontWeight: '500' },
  loginList: { gap: 12 },
  loginCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 15, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  loginAvatar: {
    width: 50, height: 50, borderRadius: 25, marginRight: 15,
    borderWidth: 2, borderColor: COLORS.lightPink,
  },
  loginName: { fontSize: 17, fontWeight: 'bold', color: COLORS.darkBurgundy },
  loginUsername: { fontSize: 14, color: '#666' },

  // Onboarding
  onboardBackdrop: {
    flex: 1, backgroundColor: 'rgba(140, 15, 46, 0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  onboardCard: {
    width: '100%', backgroundColor: COLORS.white, borderRadius: 20,
    padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 8,
  },
  onboardIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.mediumPink,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  onboardTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.darkBurgundy, marginBottom: 8 },
  onboardBody: { fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 20 },
  onboardDots: { flexDirection: 'row', gap: 6, marginTop: 18 },
  onboardDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.lightPink,
  },
  onboardDotActive: { backgroundColor: COLORS.mediumPink, width: 18 },
  onboardActions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', marginTop: 22,
  },
  onboardSkip: { color: '#888', fontSize: 14, fontWeight: '500' },
  onboardNext: {
    backgroundColor: COLORS.mediumPink,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22,
  },
  onboardNextText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Gallery
  galleryContainer: { flex: 1, backgroundColor: COLORS.white },
  galleryHeader: {
    paddingTop: 18, paddingBottom: 14, paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  galleryTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.darkBurgundy },
  gallerySubtitle: { fontSize: 12, color: '#7a4a55', marginTop: 2, fontWeight: '500' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.lightPink,
    borderRadius: 22, marginHorizontal: 15, marginTop: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', padding: 0 },

  userStripContainer: { backgroundColor: COLORS.white, paddingTop: 14, paddingBottom: 6 },
  userStrip: { paddingHorizontal: 15, alignItems: 'center' },
  userIconContainer: { alignItems: 'center', marginRight: 18 },
  userIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.lightBeige,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 5, borderWidth: 2, borderColor: 'transparent',
  },
  userIconActive: { borderColor: COLORS.mediumPink },
  userIconName: { fontSize: 12, color: '#666', fontWeight: '500' },
  userIconNameActive: { color: COLORS.darkBurgundy, fontWeight: 'bold' },

  tagFilterRow: { paddingVertical: 6, backgroundColor: COLORS.white },
  tagFilterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.lightPink, backgroundColor: COLORS.white,
    marginRight: 8,
  },
  tagFilterChipActive: { backgroundColor: COLORS.mediumPink, borderColor: COLORS.mediumPink },
  tagFilterText: { color: COLORS.darkBurgundy, fontSize: 12, fontWeight: '600' },
  tagFilterTextActive: { color: '#fff' },

  toolbarRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingTop: 8, paddingBottom: 6, backgroundColor: COLORS.white,
  },
  viewToggle: {
    flexDirection: 'row', backgroundColor: COLORS.lightBeige, borderRadius: 16, padding: 3,
  },
  viewToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 13,
  },
  viewToggleBtnActive: { backgroundColor: COLORS.mediumPink },
  viewToggleText: { color: COLORS.darkBurgundy, fontSize: 12, fontWeight: '600' },
  sortButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.white, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.lightPink,
  },
  sortButtonText: { color: COLORS.darkBurgundy, fontWeight: '600', fontSize: 13 },
  clearFiltersRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 15, paddingBottom: 4, backgroundColor: COLORS.white,
  },
  clearFiltersText: { color: COLORS.mediumPink, fontSize: 12, fontWeight: '600' },

  galleryList: { paddingHorizontal: 10, paddingBottom: 90 },
  memoryCard: {
    flex: 1, margin: 5, borderRadius: 14, overflow: 'hidden',
    backgroundColor: COLORS.lightBeige, height: 200,
  },
  memoryImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardTagRow: {
    position: 'absolute', top: 6, left: 6, right: 6,
    flexDirection: 'row', flexWrap: 'wrap', gap: 4,
  },
  cardTagChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  cardTagText: { fontSize: 10, fontWeight: 'bold', color: COLORS.darkBurgundy },
  cardMsgBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.mediumPink,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10,
  },
  cardMsgBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  memoryInfoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 10,
  },
  memoryTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  memoryDate: { fontSize: 10, color: '#ddd' },

  // Timeline
  timelineRow: { flexDirection: 'row' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 15, paddingTop: 16, paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 13, fontWeight: 'bold', color: COLORS.darkBurgundy,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  sectionHeaderLine: {
    flex: 1, height: 1, backgroundColor: COLORS.lightPink, marginLeft: 10,
  },

  // Empty
  emptyState: {
    alignItems: 'center', paddingHorizontal: 30, paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.lightBeige,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkBurgundy, marginBottom: 6 },
  emptyBody: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  emptyButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.mediumPink,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22,
  },
  emptyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // FAB
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.mediumPink,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 6,
  },

  // Modal sheets
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  sortMenu: {
    backgroundColor: COLORS.white, padding: 20,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  sortMenuTitle: {
    fontSize: 16, fontWeight: 'bold', color: COLORS.darkBurgundy, marginBottom: 10,
  },
  sortMenuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  sortMenuText: { fontSize: 15, color: '#333' },

  actionSheet: {
    backgroundColor: COLORS.white, padding: 18,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  actionSheetTitle: {
    fontSize: 13, color: '#666', fontStyle: 'italic',
    marginBottom: 12, paddingHorizontal: 4,
  },
  reactionPickerRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 8, marginBottom: 8,
    backgroundColor: COLORS.lightBeige, borderRadius: 16,
  },
  reactionPickerBtn: { padding: 6 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f1f1',
  },
  actionRowText: { fontSize: 15, color: COLORS.darkBurgundy, fontWeight: '600' },

  // Story detail
  storyHeroImage: { width: '100%', height: 380, resizeMode: 'cover' },
  storyMetaBlock: { padding: 16 },
  storyAuthorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  storyAuthorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  storyAuthorName: { fontSize: 15, fontWeight: 'bold', color: COLORS.darkBurgundy },
  storyDate: { fontSize: 12, color: '#666' },
  storyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.darkBurgundy },

  section: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#f1e5e2',
  },
  sectionHeaderInline: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6,
  },

  pinnedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.lightBeige,
    padding: 10, borderRadius: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: COLORS.mediumPink,
  },
  pinnedAvatar: { width: 30, height: 30, borderRadius: 15 },
  pinnedAuthor: { fontSize: 12, fontWeight: 'bold', color: COLORS.darkBurgundy },
  pinnedTime: { fontWeight: '500', color: '#888' },
  pinnedText: { fontSize: 14, color: '#333', marginTop: 2 },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tagChipFilled: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.mediumPink,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  tagChipFilledText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tagChipOutline: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.lightPink, marginRight: 6,
  },
  tagChipOutlineText: { color: COLORS.darkBurgundy, fontSize: 12, fontWeight: '600' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  tagInput: {
    flex: 1, backgroundColor: COLORS.lightBeige,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    fontSize: 14, color: '#333',
  },
  tagAddButton: {
    marginLeft: 8, width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.mediumPink,
    justifyContent: 'center', alignItems: 'center',
  },

  threadRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f5ecea',
  },
  threadAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  threadName: { fontSize: 14, fontWeight: 'bold', color: COLORS.darkBurgundy },
  threadPreview: { fontSize: 12, color: '#666', marginTop: 2 },
  threadBadge: {
    backgroundColor: COLORS.mediumPink,
    minWidth: 20, height: 20, borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center', alignItems: 'center', marginRight: 6,
  },
  threadBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Friends
  listContainer: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 15, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightPink,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkBurgundy },
  listContent: { padding: 15 },
  friendCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, padding: 15, borderRadius: 12,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.lightPink,
  },
  friendAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkBurgundy },
  friendUsername: { fontSize: 14, color: '#666' },

  // Profile
  profileContent: { padding: 20, paddingTop: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  profileAvatar: {
    width: 100, height: 100, borderRadius: 50, marginBottom: 10,
    borderWidth: 3, borderColor: COLORS.mediumPink,
  },
  profileName: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkBurgundy, marginBottom: 5 },
  profileUsername: { fontSize: 16, color: '#666', marginBottom: 10 },
  profileBio: { fontSize: 14, color: '#333', textAlign: 'center', paddingHorizontal: 20 },
  statsContainer: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12,
    paddingVertical: 15, marginBottom: 30,
    borderWidth: 1, borderColor: COLORS.lightPink,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.lightPink },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: COLORS.mediumPink, marginBottom: 5 },
  statLabel: { fontSize: 14, color: '#666' },
  settingsSection: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 15,
    borderWidth: 1, borderColor: COLORS.lightPink,
  },
  sectionTitle: {
    fontSize: 20, fontWeight: 'bold', color: COLORS.darkBurgundy,
    marginBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.lightPink,
    paddingBottom: 5,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  settingText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 15 },

  // Friend profile
  friendProfileHeader: {
    alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.mediumPink,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 22, marginTop: 15,
  },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  sectionLabel: {
    fontSize: 13, color: COLORS.darkBurgundy, fontWeight: '600',
    paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  authorTag: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(140, 15, 46, 0.85)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  authorTagMine: { backgroundColor: 'rgba(224, 92, 115, 0.9)' },
  authorTagText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Chat
  detailContainer: { flex: 1, backgroundColor: COLORS.white },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightPink,
  },
  chatHeaderAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  chatHeaderName: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkBurgundy },
  chatHeaderUsername: { fontSize: 12, color: '#666' },
  chatScroll: { paddingHorizontal: 15, paddingVertical: 10, paddingBottom: 20 },
  activePostBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, padding: 10, borderRadius: 12, marginBottom: 15,
    borderLeftWidth: 3, borderLeftColor: COLORS.mediumPink,
  },
  activePostImage: { width: 44, height: 44, borderRadius: 8 },
  activePostLabel: {
    fontSize: 11, color: COLORS.mediumPink,
    fontWeight: 'bold', textTransform: 'uppercase',
  },
  activePostTitle: {
    fontSize: 14, fontWeight: '600', color: COLORS.darkBurgundy, marginTop: 2,
  },

  messageBubble: { padding: 12, borderRadius: 20 },
  messageMe: {
    backgroundColor: COLORS.mediumPink, borderBottomRightRadius: 5,
  },
  messageThem: {
    backgroundColor: COLORS.white, borderBottomLeftRadius: 5,
    borderWidth: 1, borderColor: COLORS.lightBeige,
  },
  messageBubblePinned: {
    borderWidth: 1.5, borderColor: COLORS.darkBurgundy,
  },
  pinnedTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.darkBurgundy,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
    alignSelf: 'flex-start', marginBottom: 6,
  },
  pinnedTagText: { color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 0.4 },
  typingBubble: { paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start' },
  messageText: { fontSize: 14, lineHeight: 18 },
  messageTextMe: { color: '#fff' },
  messageTextThem: { color: '#333' },
  messageTime: { fontSize: 10, marginTop: 4 },
  messageTimeMe: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  messageTimeThem: { color: '#999', textAlign: 'left' },
  messageContextCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 6, borderRadius: 10, marginBottom: 6,
  },
  messageContextMine: { backgroundColor: 'rgba(255,255,255,0.2)' },
  messageContextTheirs: { backgroundColor: COLORS.lightBeige },
  messageContextImage: { width: 32, height: 32, borderRadius: 6, marginRight: 8 },
  messageContextTitle: {
    flex: 1, fontSize: 12, fontWeight: '600', color: COLORS.darkBurgundy,
  },

  reactionRow: {
    flexDirection: 'row', gap: 4, marginTop: 4, marginHorizontal: 4,
  },
  reactionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.lightPink,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10,
  },
  reactionPillMine: { backgroundColor: COLORS.lightPink, borderColor: COLORS.mediumPink },
  reactionEmoji: { fontSize: 12 },
  reactionCount: { fontSize: 10, fontWeight: 'bold', color: COLORS.darkBurgundy },

  promptBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: COLORS.lightBeige,
  },
  promptLabel: {
    fontSize: 11, color: COLORS.mediumPink,
    fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.4,
  },
  promptChip: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14,
  },
  promptChipText: { fontSize: 13, color: COLORS.darkBurgundy, fontWeight: '500' },

  chatInputBar: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.lightPink,
  },
  chatInput: {
    flex: 1, backgroundColor: COLORS.lightBeige, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#333',
  },
  chatSendButton: {
    marginLeft: 10, width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.mediumPink,
    justifyContent: 'center', alignItems: 'center',
  },
});
