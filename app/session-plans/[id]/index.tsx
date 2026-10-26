import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Trash2,
  Play,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpenCheck,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { SessionPlan, Student } from '@/types';
import { useSessionStore } from '@/store/sessionStore';
import { useTheme } from '@/theme/ThemeContext';

export default function SessionPlanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setActivePlan } = useSessionStore();
  const { colors, isDark } = useTheme();

  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPlan(id);
    }
  }, [id]);

  const loadPlan = async (planId: string) => {
    setIsLoading(true);
    try {
      const data = await api.getSessionPlan(planId);
      setPlan(data);
      setActivePlan(data);
      if (data.student_id) {
        api.getStudent(data.student_id).then(setStudent).catch(() => null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!plan) return;
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to remove this session plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteSessionPlan(plan.id);
              router.replace('/session-plans');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !plan) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading session details...
        </Text>
      </View>
    );
  }

  const completedCount = plan.topics?.filter((t) => t.status === 'completed').length || 0;
  const totalTopics = plan.topics?.length || 0;
  const isLive = plan.status === 'in_progress';
  const isDone = plan.status === 'completed';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: colors.dangerGlow, borderColor: colors.danger },
          ]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={15} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Hero Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: isLive ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isLive
                  ? colors.primaryGlow
                  : isDone
                  ? colors.successGlow
                  : colors.surfaceElevated,
                borderColor: isLive
                  ? colors.primary
                  : isDone
                  ? colors.success
                  : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                {
                  color: isLive
                    ? colors.primary
                    : isDone
                    ? colors.success
                    : colors.textMuted,
                },
              ]}
            >
              {isLive ? '⚡ IN PROGRESS' : isDone ? '✓ COMPLETED' : 'PLANNED'}
            </Text>
          </View>

          <View style={styles.durationBadge}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={[styles.durationText, { color: colors.textMuted }]}>
              {plan.planned_minutes || 60} mins target
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{plan.title}</Text>

        {student ? (
          <View style={styles.studentRow}>
            <User size={13} color={colors.primary} />
            <Text style={[styles.studentName, { color: colors.primary }]}>
              Mentee: {student.name} ({student.grade || 'Secondary'})
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.progressSummary,
            { borderTopColor: colors.border },
          ]}
        >
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: totalTopics > 0 ? `${(completedCount / totalTopics) * 100}%` : '0%',
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textMuted }]}>
            Mastery: {completedCount} of {totalTopics} subtopics completed
          </Text>
        </View>
      </View>

      {/* Launch Live Cockpit Button */}
      <TouchableOpacity
        style={[styles.launchButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push(`/session-plans/${plan.id}/live`)}
        activeOpacity={0.8}
      >
        <Play size={18} color="#050B14" strokeWidth={2.8} style={{ marginRight: 6 }} />
        <Text style={styles.launchButtonText}>
          {isLive ? 'Resume Live Mentoring Cockpit' : 'Start Live Mentoring Cockpit'}
        </Text>
      </TouchableOpacity>

      {/* Subtopics Roadmap */}
      <View style={styles.sectionHeader}>
        <BookOpenCheck size={16} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Lesson Sequence & Subtopics
        </Text>
      </View>

      {!plan.topics || plan.topics.length === 0 ? (
        <View
          style={[
            styles.emptyTopics,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyTopicsText, { color: colors.textMuted }]}>
            No subtopics created for this plan.
          </Text>
        </View>
      ) : (
        plan.topics.map((topic, idx) => {
          const isTopicCompleted = topic.status === 'completed';
          const isTopicActive = topic.status === 'in_progress';
          const isTopicStruggling = topic.status === 'struggling';

          return (
            <View
              key={topic.id || idx}
              style={[
                styles.topicRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: isTopicActive ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.topicIndexCircle,
                  {
                    backgroundColor: isTopicActive
                      ? colors.primaryGlow
                      : colors.surfaceElevated,
                    borderColor: isTopicActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.topicIndexText,
                    { color: isTopicActive ? colors.primary : colors.textMuted },
                  ]}
                >
                  {idx + 1}
                </Text>
              </View>

              <View style={styles.topicInfo}>
                <Text style={[styles.topicTitle, { color: colors.text }]}>
                  {topic.title}
                </Text>
                <Text style={[styles.topicPacing, { color: colors.textMuted }]}>
                  Pacing: {topic.planned_minutes}m target
                  {topic.actual_minutes ? ` • Spent: ${topic.actual_minutes}m` : ''}
                </Text>
              </View>

              <View
                style={[
                  styles.topicStatusBadge,
                  {
                    backgroundColor: isTopicCompleted
                      ? colors.successGlow
                      : isTopicStruggling
                      ? colors.warningGlow
                      : isTopicActive
                      ? colors.primaryGlow
                      : colors.surfaceElevated,
                    borderColor: isTopicCompleted
                      ? colors.success
                      : isTopicStruggling
                      ? colors.warning
                      : isTopicActive
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.topicStatusText,
                    {
                      color: isTopicCompleted
                        ? colors.success
                        : isTopicStruggling
                        ? colors.warning
                        : isTopicActive
                        ? colors.primary
                        : colors.textMuted,
                    },
                  ]}
                >
                  {isTopicCompleted
                    ? '✓ Done'
                    : isTopicStruggling
                    ? 'Struggled'
                    : isTopicActive
                    ? 'Active'
                    : 'Pending'}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 110,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.2,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressSummary: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  launchButtonText: {
    color: '#050B14',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  emptyTopics: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTopicsText: {
    fontSize: 13,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.2,
  },
  topicIndexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  topicIndexText: {
    fontSize: 13,
    fontWeight: '800',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  topicPacing: {
    fontSize: 12,
    marginTop: 2,
  },
  topicStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  topicStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
