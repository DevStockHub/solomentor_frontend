import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookOpenCheck,
  Plus,
  Play,
  Clock,
  User,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  GraduationCap,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { SessionPlan, Student } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

export default function SessionPlansScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [plans, setPlans] = useState<SessionPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [plansData, studentsData] = await Promise.all([
        api.getSessionPlans(selectedStudentId || undefined),
        api.getStudents().catch(() => []),
      ]);
      setPlans(plansData);
      setStudents(studentsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStudentId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const studentMap = new Map(students.map((s) => [s.id, s.name]));

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <View style={styles.titleBadgeRow}>
            <Text style={[styles.title, { color: colors.text }]}>Session Plans</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ]}
            >
              <BookOpenCheck size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {plans.length} Roadmaps
              </Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Targeted lessons & Socratic pedagogical pacing
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/session-plans/create')}
          activeOpacity={0.8}
        >
          <Sparkles size={15} color="#050B14" strokeWidth={2.5} style={{ marginRight: 4 }} />
          <Text style={styles.createButtonText}>Plan AI</Text>
        </TouchableOpacity>
      </View>

      {/* Student Filter Pills */}
      {students.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor:
                  selectedStudentId === null ? colors.primaryGlow : colors.surface,
                borderColor: selectedStudentId === null ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedStudentId(null)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                {
                  color: selectedStudentId === null ? colors.primary : colors.textMuted,
                  fontWeight: selectedStudentId === null ? '700' : '500',
                },
              ]}
            >
              All Students ({plans.length})
            </Text>
          </TouchableOpacity>

          {students.map((s) => {
            const isSelected = selectedStudentId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primaryGlow : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedStudentId(s.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected ? colors.primary : colors.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Plan List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading session roadmaps...
          </Text>
        </View>
      ) : plans.length === 0 ? (
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <BookOpenCheck size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No session plans found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Generate a targeted, timed curriculum plan for your students with AI assistance.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/session-plans/create')}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color="#050B14" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.primaryButtonText}>Create AI Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const isLive = item.status === 'in_progress';
            const isDone = item.status === 'completed';
            return (
              <TouchableOpacity
                style={[
                  styles.planCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isLive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => router.push(`/session-plans/${item.id}`)}
                activeOpacity={0.7}
              >
                {/* Top Status & Student */}
                <View style={styles.planHeader}>
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
                      {isLive ? '⚡ LIVE NOW' : isDone ? '✓ COMPLETED' : 'PLANNED'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.studentBadge,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    ]}
                  >
                    <User size={11} color={colors.primary} />
                    <Text style={[styles.studentBadgeText, { color: colors.text }]}>
                      {studentMap.get(item.student_id) || 'Student'}
                    </Text>
                  </View>
                </View>

                {/* Title & Metadata */}
                <Text style={[styles.planTitle, { color: colors.text }]}>{item.title}</Text>

                <View style={styles.metaRow}>
                  <Clock size={12} color={colors.textMuted} />
                  <Text style={[styles.planMeta, { color: colors.textMuted }]}>
                    {item.planned_minutes || 60} mins target
                  </Text>
                  <Text style={{ color: colors.textMuted }}>•</Text>
                  <BookOpenCheck size={12} color={colors.textMuted} />
                  <Text style={[styles.planMeta, { color: colors.textMuted }]}>
                    {item.topics?.length || 0} subtopics
                  </Text>
                </View>

                {/* Topics Preview */}
                {item.topics && item.topics.length > 0 && (
                  <View
                    style={[
                      styles.topicsPreview,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    ]}
                  >
                    {item.topics.slice(0, 3).map((t, idx) => (
                      <View key={t.id || idx} style={styles.topicBulletRow}>
                        <View
                          style={[
                            styles.dot,
                            {
                              backgroundColor:
                                t.status === 'completed'
                                  ? colors.success
                                  : t.status === 'in_progress'
                                  ? colors.primary
                                  : colors.textMuted,
                            },
                          ]}
                        />
                        <Text
                          style={[styles.topicBullet, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {t.title} ({t.planned_minutes}m)
                        </Text>
                      </View>
                    ))}
                    {item.topics.length > 3 && (
                      <Text style={[styles.moreTopicsText, { color: colors.primary }]}>
                        +{item.topics.length - 3} more subtopics...
                      </Text>
                    )}
                  </View>
                )}

                {/* Footer Cockpit Launch */}
                <View
                  style={[
                    styles.planCardFooter,
                    { borderTopColor: colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.cockpitButton, { backgroundColor: colors.primaryGlow }]}
                    onPress={() => router.push(`/session-plans/${item.id}/live`)}
                    activeOpacity={0.8}
                  >
                    <Play size={14} color={colors.primary} />
                    <Text style={[styles.cockpitButtonText, { color: colors.primary }]}>
                      Launch Live Cockpit
                    </Text>
                  </TouchableOpacity>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#050B14',
    fontWeight: '800',
    fontSize: 13,
  },
  filterScroll: {
    maxHeight: 40,
    marginBottom: 14,
  },
  filterContent: {
    gap: 8,
    paddingRight: 10,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 110, // Generous padding for floating nav bar
  },
  planCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  planHeader: {
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
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  studentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  planMeta: {
    fontSize: 12,
  },
  topicsPreview: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    gap: 6,
  },
  topicBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  topicBullet: {
    fontSize: 12,
    flex: 1,
  },
  moreTopicsText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  planCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cockpitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  cockpitButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 110,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.2,
    marginTop: 16,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#050B14',
    fontWeight: '800',
    fontSize: 13,
  },
});
