import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Clock,
  HelpCircle,
  AlertTriangle,
  Play,
  X,
} from 'lucide-react-native';
import { useSessionStore } from '@/store/sessionStore';
import { useTheme } from '@/theme/ThemeContext';
import { TopicTimer } from '@/components/TopicTimer';
import { SessionControlBar } from '@/components/SessionControlBar';
import { AIChatBubble } from '@/components/AIChatBubble';
import { api } from '@/services/api';
import { Topic } from '@/types';

export default function LiveSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();

  const {
    activePlan,
    currentTopic,
    fetchPlan,
    startTopic,
    completeTopic,
    markTopicStruggling,
    nextTopic,
  } = useSessionStore();

  const [copilotAdvice, setCopilotAdvice] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  // Copilot modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [struggleQuery, setStruggleQuery] = useState('');

  useEffect(() => {
    if (id && (!activePlan || activePlan.id !== id)) {
      fetchPlan(id);
    }
  }, [id, activePlan?.id]);

  useEffect(() => {
    if (activePlan && activePlan.topics && activePlan.topics.length > 0) {
      if (!currentTopic) {
        const inProgress = activePlan.topics.find((t: Topic) => t.status === 'in_progress');
        const pending = activePlan.topics.find((t: Topic) => t.status === 'pending');
        const toStart = inProgress || pending;
        if (toStart) {
          startTopic(toStart.id);
        }
      }
    }
  }, [activePlan, currentTopic]);

  const handleAskCopilot = async (customStruggle?: string) => {
    const struggleText =
      customStruggle ||
      struggleQuery ||
      'Student is hesitating on the core concept and making formula errors.';
    if (!currentTopic) return;

    setIsCopilotLoading(true);
    setCopilotAdvice(null);
    try {
      const res = await api.getCopilotHint({
        topic_title: currentTopic.title,
        student_struggle: struggleText,
        elapsed_minutes: currentTopic.actual_minutes || 5,
      });
      setCopilotAdvice(res.advice);
      setModelUsed(res.model_used || 'AI Copilot');
      setModalVisible(false);
      setStruggleQuery('');
    } catch (error: any) {
      Alert.alert('AI Copilot Error', error.message || 'Could not fetch copilot hint');
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleTopicComplete = async () => {
    if (!currentTopic?.id || !activePlan) return;
    await completeTopic(currentTopic.id);

    // Record positive mastery
    api.createProgressRecord({
      student_id: activePlan.student_id,
      subject_id: activePlan.subject_id,
      session_plan_id: activePlan.id,
      topic_id: currentTopic.id,
      outcome: 'Mastered concept during 1-on-1 pacing',
      effectiveness_rating: 5,
    }).catch(() => null);

    setCopilotAdvice(null);
  };

  const handleTopicStruggling = async () => {
    if (!currentTopic?.id || !activePlan) return;
    await markTopicStruggling(currentTopic.id);

    // Record struggle note
    api.createProgressRecord({
      student_id: activePlan.student_id,
      subject_id: activePlan.subject_id,
      session_plan_id: activePlan.id,
      topic_id: currentTopic.id,
      struggle_noted: `Student struggled with: ${currentTopic.title}`,
      outcome: 'Needs review / reinforced diagnostic problems',
      effectiveness_rating: 2,
    }).catch(() => null);

    // Automatically trigger copilot hint
    handleAskCopilot(`Student flagged as struggling with ${currentTopic.title}`);
  };

  const handleNextTopic = () => {
    if (!currentTopic?.id || !activePlan) return;
    nextTopic(currentTopic.id);
    setCopilotAdvice(null);
  };

  const handleEndSession = () => {
    Alert.alert(
      'Finish Session',
      'Mark this entire mentoring session as complete?',
      [
        { text: 'Keep Mentoring', style: 'cancel' },
        {
          text: 'Complete & Exit',
          onPress: async () => {
            if (activePlan) {
              await api.updateSessionPlan(activePlan.id, {
                status: 'completed',
                ended_at: new Date().toISOString(),
              }).catch(() => null);
            }
            router.replace('/session-plans');
          },
        },
      ]
    );
  };

  if (!activePlan) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Opening Live Cockpit...
        </Text>
      </View>
    );
  }

  const completedTopicsCount =
    activePlan.topics?.filter((t) => t.status === 'completed').length || 0;
  const totalTopicsCount = activePlan.topics?.length || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top Cockpit Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={colors.textMuted} />
          <Text style={[styles.exitText, { color: colors.textMuted }]}>Pause</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {activePlan.title}
          </Text>
          <Text style={[styles.headerProgress, { color: colors.primary }]}>
            {completedTopicsCount} / {totalTopicsCount} topics mastered
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.finishButton, { backgroundColor: colors.success }]}
          onPress={handleEndSession}
          activeOpacity={0.8}
        >
          <CheckCircle2 size={14} color="#FFFFFF" />
          <Text style={styles.finishText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Active Topic Banner */}
        {currentTopic ? (
          <View
            style={[
              styles.activeTopicCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderGlow,
                shadowColor: colors.primary,
              },
            ]}
          >
            <View style={styles.badgeRow}>
              <View style={[styles.pulsingDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.activeBadge, { color: colors.primary }]}>
                CURRENT TOPIC
              </Text>
            </View>

            <Text style={[styles.topicName, { color: colors.text }]}>
              {currentTopic.title}
            </Text>

            <TopicTimer
              plannedMinutes={currentTopic.planned_minutes}
              actualMinutes={currentTopic.actual_minutes}
              extraMinutes={currentTopic.extra_minutes}
              status={currentTopic.status}
            />
          </View>
        ) : (
          <View
            style={[
              styles.allDoneCard,
              { backgroundColor: colors.surface, borderColor: colors.success },
            ]}
          >
            <CheckCircle2 size={36} color={colors.success} />
            <Text style={[styles.allDoneTitle, { color: colors.text }]}>
              All Topics Completed!
            </Text>
            <Text style={[styles.allDoneSubtitle, { color: colors.textMuted }]}>
              Great mentoring flow. Ready to wrap up and log insights.
            </Text>
            <TouchableOpacity
              style={[styles.finishBigButton, { backgroundColor: colors.success }]}
              onPress={handleEndSession}
            >
              <Text style={styles.finishBigButtonText}>Complete Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Copilot Advice Card */}
        {isCopilotLoading && (
          <View
            style={[
              styles.copilotLoadingCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.copilotLoadingText, { color: colors.primary }]}>
              Copilot is crafting an intuitive analogy & diagnostic question...
            </Text>
          </View>
        )}

        {copilotAdvice && (
          <AIChatBubble
            message={copilotAdvice}
            modelUsed={modelUsed || 'AI Copilot'}
            title="Instant Pedagogical Guidance"
          />
        )}

        {/* Topic Roadmap Checklist */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          Session Checklist
        </Text>

        {activePlan.topics?.map((topic, idx) => {
          const isCurrent = currentTopic?.id === topic.id;
          const isDone = topic.status === 'completed';

          return (
            <TouchableOpacity
              key={topic.id || idx}
              style={[
                styles.topicRow,
                {
                  backgroundColor: isCurrent ? colors.surfaceElevated : colors.surface,
                  borderColor: isCurrent ? colors.primary : colors.border,
                },
                isDone && styles.topicRowCompleted,
              ]}
              onPress={() => startTopic(topic.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.topicCheckCircle,
                  {
                    backgroundColor: isDone
                      ? colors.success
                      : isCurrent
                      ? colors.primary
                      : colors.surfaceElevated,
                    borderColor: isDone
                      ? colors.success
                      : isCurrent
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                {isDone ? (
                  <CheckCircle2 size={16} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.topicCheckText,
                      { color: isCurrent ? colors.primaryFg : colors.textMuted },
                    ]}
                  >
                    {idx + 1}
                  </Text>
                )}
              </View>

              <View style={styles.topicRowTextContainer}>
                <Text
                  style={[
                    styles.topicRowTitle,
                    { color: colors.text },
                    isDone && styles.topicRowTitleCompleted,
                  ]}
                >
                  {topic.title}
                </Text>
                <Text style={[styles.topicRowMeta, { color: colors.textMuted }]}>
                  {topic.planned_minutes} mins • {topic.status.replace('_', ' ')}
                </Text>
              </View>

              {isCurrent && (
                <View style={[styles.currentIndicator, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.currentIndicatorText, { color: colors.primaryFg }]}>
                    LIVE
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Futuristic Floating Control Bar */}
      <SessionControlBar
        currentTopicId={currentTopic?.id || null}
        onStruggle={handleTopicStruggling}
        onComplete={handleTopicComplete}
        onNext={handleNextTopic}
        onAskCopilot={() => setModalVisible(true)}
      />

      {/* Copilot Ask Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderTopColor: colors.border },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleRow}>
                <Sparkles size={20} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Pedagogical Copilot
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              What specific concept or obstacle is the student struggling with?
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Student keeps confusing derivative sign or choosing u vs dv..."
              placeholderTextColor={colors.textMuted}
              value={struggleQuery}
              onChangeText={setStruggleQuery}
              multiline
              numberOfLines={3}
            />

            <View style={styles.presetRow}>
              {[
                'Needs a visual analogy',
                'Break into smaller micro-steps',
                'Give a diagnostic Socratic question',
              ].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleAskCopilot(preset)}
                >
                  <Text style={[styles.presetText, { color: colors.primary }]}>
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalCancelButton,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, { backgroundColor: colors.primary }]}
                onPress={() => handleAskCopilot()}
              >
                <Text style={[styles.modalSubmitText, { color: colors.primaryFg }]}>
                  Get Teaching Advice
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.2,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  exitText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  headerProgress: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  finishText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  activeTopicCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    marginBottom: 16,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  topicName: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  allDoneCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.2,
  },
  allDoneTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  allDoneSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  finishBigButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  finishBigButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  copilotLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.2,
  },
  copilotLoadingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.2,
  },
  topicRowCompleted: {
    opacity: 0.5,
  },
  topicCheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.2,
  },
  topicCheckText: {
    fontSize: 11,
    fontWeight: '800',
  },
  topicRowTextContainer: {
    flex: 1,
  },
  topicRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  topicRowTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  topicRowMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  currentIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentIndicatorText: {
    fontSize: 10,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderTopWidth: 1.5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.2,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.2,
  },
  modalCancelText: {
    fontWeight: '700',
    fontSize: 14,
  },
  modalSubmitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
