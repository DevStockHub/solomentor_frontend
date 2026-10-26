import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronDown,
  Sparkles,
  ArrowUp,
  Bot,
  User,
  Plus,
  Trash2,
  X,
  MessageSquare,
  History,
  Lightbulb,
} from 'lucide-react-native';
import { useChatStore } from '@/store/chatStore';
import { useTheme } from '@/theme/ThemeContext';
import { FormattedContent } from '@/components/FormattedContent';

export default function ChatScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    sessions,
    activeSessionId,
    activeSessionTitle,
    messages,
    isLoading,
    fetchSessions,
    createSession,
    switchSession,
    deleteSession,
    sendMessage,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Quick suggestion prompts
  const suggestions = [
    '🔍 Analyze all student stumbles & progress',
    '⚡ Intuitive analogy for projectile motion',
    '📐 Form 5 / O-Level calculus pacing tips',
    '💡 Socratic diagnostic questions for Kelvin',
  ];

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    try {
      await fetchSessions();
      const currentSessions = useChatStore.getState().sessions;

      if (currentSessions.length > 0) {
        await switchSession(currentSessions[0].id);
      } else {
        await createSession('General Mentoring Copilot');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;
    setInput('');
    try {
      await sendMessage(text);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNewSession = async () => {
    setShowSessionsModal(false);
    try {
      await createSession('New Chat');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create new chat session');
    }
  };

  const handleDeleteSession = (sessionId: string, sessionTitle: string) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${sessionTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(sessionId);
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  if (isInitializing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading SoloMentor Copilot...
        </Text>
      </View>
    );
  }

  const hasInput = input.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
    >
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Left: Stack Go Back button */}
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>

        {/* Center: Session Pill / Selector */}
        <TouchableOpacity
          style={[
            styles.sessionPill,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
          onPress={() => setShowSessionsModal(true)}
          activeOpacity={0.7}
        >
          <MessageSquare size={13} color={colors.primary} />
          <Text
            style={[styles.sessionPillText, { color: colors.text }]}
            numberOfLines={1}
          >
            {activeSessionTitle || 'New Chat'}
          </Text>
          <ChevronDown size={14} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Right: + New Chat Button */}
        <TouchableOpacity
          style={[
            styles.newChatButton,
            { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
          ]}
          onPress={handleCreateNewSession}
          activeOpacity={0.7}
        >
          <Plus size={16} color={colors.primary} strokeWidth={2.8} />
        </TouchableOpacity>
      </View>

      {/* Messages Feed */}
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              <Bot size={36} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              AI Pedagogical Copilot
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Equipped with real-time knowledge of all your enrolled students, curriculum roadmaps, and documented stumbling blocks.
            </Text>

            {/* Quick Suggestions */}
            <View style={styles.emptySuggestionsList}>
              {suggestions.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.suggestionCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => handleSend(prompt)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionCardText, { color: colors.text }]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isAI = item.role === 'ai';
              return (
                <View
                  style={[
                    styles.messageBubble,
                    isAI
                      ? [
                          styles.aiBubble,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]
                      : [
                          styles.userBubble,
                          {
                            backgroundColor: colors.primary,
                          },
                        ],
                  ]}
                >
                  <View style={styles.roleHeaderRow}>
                    {isAI ? (
                      <Bot size={13} color={colors.primary} />
                    ) : (
                      <User size={13} color="#050B14" />
                    )}
                    <Text
                      style={[
                        styles.roleTag,
                        { color: isAI ? colors.primary : '#050B14' },
                      ]}
                    >
                      {isAI ? 'SoloMentor AI' : 'You (Mentor)'}
                    </Text>
                  </View>

                  {isAI ? (
                    <FormattedContent content={item.content} />
                  ) : (
                    <Text style={styles.userText}>{item.content}</Text>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Suggestion Chips Above Input */}
      {messages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionScroll}
          contentContainerStyle={styles.suggestionScrollContent}
        >
          {suggestions.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.suggestionChip,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
              onPress={() => handleSend(prompt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionChipText, { color: colors.textMuted }]}>
                {prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Modern ChatGPT / Gemini-style Input Capsule */}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.bg,
          },
        ]}
      >
        <View
          style={[
            styles.modernCapsule,
            {
              backgroundColor: colors.surface,
              borderColor: hasInput ? colors.primary : colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.capsuleInput,
              { color: colors.text },
            ]}
            placeholder="Message SoloMentor Copilot..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
          />

          <View style={styles.capsuleBottomRow}>
            <View style={styles.contextBadge}>
              <Sparkles size={12} color={colors.primary} />
              <Text style={[styles.contextBadgeText, { color: colors.primary }]}>
                Live App Knowledge Active
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.sendButtonCircle,
                {
                  backgroundColor: hasInput ? colors.primary : colors.surfaceElevated,
                  borderColor: hasInput ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleSend()}
              disabled={!hasInput || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={hasInput ? '#050B14' : colors.textMuted} />
              ) : (
                <ArrowUp
                  size={18}
                  color={hasInput ? '#050B14' : colors.textMuted}
                  strokeWidth={2.8}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sessions Drawer Modal */}
      <Modal
        visible={showSessionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSessionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSessionsModal(false)}
          />

          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <History size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Chat Conversations
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.closeModalButton,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
                onPress={() => setShowSessionsModal(false)}
              >
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* New Chat Button */}
            <TouchableOpacity
              style={[
                styles.modalNewChatButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleCreateNewSession}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#050B14" strokeWidth={2.8} style={{ marginRight: 6 }} />
              <Text style={styles.modalNewChatText}>Start New Conversation</Text>
            </TouchableOpacity>

            {/* Sessions List */}
            <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
              {sessions.length === 0 ? (
                <Text style={[styles.emptySessionText, { color: colors.textMuted }]}>
                  No conversations saved yet.
                </Text>
              ) : (
                sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  return (
                    <View
                      key={sess.id}
                      style={[
                        styles.sessionItemRow,
                        {
                          backgroundColor: isActive ? colors.primaryGlow : colors.surfaceElevated,
                          borderColor: isActive ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.sessionItemContent}
                        onPress={async () => {
                          setShowSessionsModal(false);
                          if (!isActive) {
                            await switchSession(sess.id);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <MessageSquare
                          size={16}
                          color={isActive ? colors.primary : colors.textMuted}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.sessionItemTitle,
                              {
                                color: isActive ? colors.primary : colors.text,
                                fontWeight: isActive ? '800' : '600',
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {sess.title}
                          </Text>
                          {sess.last_message ? (
                            <Text
                              style={[styles.sessionItemSubtitle, { color: colors.textMuted }]}
                              numberOfLines={1}
                            >
                              {sess.last_message}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.sessionDeleteBtn}
                        onPress={() => handleDeleteSession(sess.id, sess.title)}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={15} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: '52%',
  },
  sessionPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  newChatButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
    paddingBottom: 16,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    maxWidth: '88%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1.2,
    borderBottomLeftRadius: 4,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userText: {
    color: '#050B14',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptySuggestionsList: {
    width: '100%',
    gap: 8,
  },
  suggestionCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionCardText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionScroll: {
    maxHeight: 40,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  suggestionScrollContent: {
    gap: 8,
    paddingRight: 10,
  },
  suggestionChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
    paddingTop: 4,
  },
  modernCapsule: {
    borderRadius: 22,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  capsuleInput: {
    fontSize: 14,
    minHeight: 40,
    maxHeight: 110,
    paddingTop: 0,
    paddingBottom: 6,
  },
  capsuleBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sendButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeModalButton: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalNewChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  modalNewChatText: {
    color: '#050B14',
    fontSize: 14,
    fontWeight: '800',
  },
  sessionsList: {
    maxHeight: 340,
  },
  emptySessionText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 13,
  },
  sessionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.2,
  },
  sessionItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  sessionItemTitle: {
    fontSize: 13,
  },
  sessionItemSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sessionDeleteBtn: {
    padding: 6,
  },
});
