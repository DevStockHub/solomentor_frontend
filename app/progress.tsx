import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  BarChart3,
  TrendingUp,
  User,
  Star,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { ProgressRecord, Student, Subject } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import { FormattedContent } from '@/components/FormattedContent';

export default function ProgressScreen() {
  const { colors, isDark } = useTheme();
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProgress = async () => {
    try {
      const [recordsData, studentsData, subjectsData] = await Promise.all([
        api.getProgressRecords(selectedStudentId || undefined),
        api.getStudents().catch(() => []),
        api.getSubjects().catch(() => []),
      ]);
      setRecords(recordsData);
      setStudents(studentsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [selectedStudentId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProgress();
  };

  const studentMap = new Map(students.map((s) => [s.id, s.name]));
  const subjectMap = new Map(subjects.map((sub) => [sub.id, sub.name]));

  const highEffectiveness = records.filter((r) => (r.effectiveness_rating || 0) >= 4);
  const struggles = records.filter((r) => r.struggle_noted);
  const masteryRate = records.length > 0 ? Math.round((highEffectiveness.length / records.length) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleBadgeRow}>
          <Text style={[styles.title, { color: colors.text }]}>Pedagogical Insights</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
            ]}
          >
            <BarChart3 size={12} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {records.length} Logs
            </Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Stumbling blocks, breakthrough analogies & mastery analytics
        </Text>
      </View>

      {/* Filter by Student */}
      {students.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
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
                styles.filterChipText,
                {
                  color: selectedStudentId === null ? colors.primary : colors.textMuted,
                  fontWeight: selectedStudentId === null ? '700' : '500',
                },
              ]}
            >
              All Students ({records.length})
            </Text>
          </TouchableOpacity>

          {students.map((s) => {
            const isSelected = selectedStudentId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.filterChip,
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
                    styles.filterChipText,
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

      {/* Overview Metrics Cards */}
      <View style={styles.metricRow}>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {records.length}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            Touchpoints
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.metricValue, { color: colors.success }]}>
            {masteryRate}%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            Mastery Rate
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.metricValue, { color: colors.warning }]}>
            {struggles.length}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            Struggles
          </Text>
        </View>
      </View>

      {/* Progress Records List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Analyzing learning metrics...
          </Text>
        </View>
      ) : records.length === 0 ? (
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
            <BarChart3 size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No pedagogical records yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            As you mark topics during live mentoring sessions, diagnostic stumbling blocks and effective approaches will automatically aggregate here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
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
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Card Top Row */}
              <View style={styles.cardTopRow}>
                <View style={styles.cardStudentWrap}>
                  <User size={13} color={colors.primary} />
                  <Text style={[styles.cardStudent, { color: colors.text }]}>
                    {studentMap.get(item.student_id) || 'Student'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.ratingBadge,
                    {
                      backgroundColor:
                        (item.effectiveness_rating || 3) >= 4
                          ? colors.successGlow
                          : colors.surfaceElevated,
                      borderColor:
                        (item.effectiveness_rating || 3) >= 4
                          ? colors.success
                          : colors.border,
                    },
                  ]}
                >
                  <Star
                    size={11}
                    color={
                      (item.effectiveness_rating || 3) >= 4 ? colors.success : colors.warning
                    }
                    fill={
                      (item.effectiveness_rating || 3) >= 4 ? colors.success : colors.warning
                    }
                  />
                  <Text
                    style={[
                      styles.ratingText,
                      {
                        color:
                          (item.effectiveness_rating || 3) >= 4
                            ? colors.success
                            : colors.text,
                      },
                    ]}
                  >
                    {item.effectiveness_rating || 3}/5
                  </Text>
                </View>
              </View>

              {item.subject_id && subjectMap.get(item.subject_id) ? (
                <View style={styles.subjectTagWrap}>
                  <BookOpen size={11} color={colors.primary} />
                  <Text style={[styles.subjectTag, { color: colors.primary }]}>
                    {subjectMap.get(item.subject_id)}
                  </Text>
                </View>
              ) : null}

              {item.struggle_noted ? (
                <View
                  style={[
                    styles.struggleBox,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.struggleLabelRow}>
                    <AlertTriangle size={12} color={colors.warning} />
                    <Text style={[styles.struggleLabel, { color: colors.warning }]}>
                      Struggle Identified:
                    </Text>
                  </View>
                  <FormattedContent content={item.struggle_noted} />
                </View>
              ) : null}

              {item.approach_used ? (
                <View
                  style={[
                    styles.approachBox,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.approachLabelRow}>
                    <Sparkles size={12} color={colors.primary} />
                    <Text style={[styles.approachLabel, { color: colors.primary }]}>
                      Pedagogical Analogy / Method:
                    </Text>
                  </View>
                  <FormattedContent content={item.approach_used} />
                </View>
              ) : null}

              {item.outcome ? (
                <View style={styles.outcomeRow}>
                  <CheckCircle2 size={13} color={colors.success} />
                  <Text style={[styles.outcomeLabel, { color: colors.textMuted }]}>
                    Outcome:{' '}
                  </Text>
                  <Text style={[styles.outcomeText, { color: colors.success }]}>
                    {item.outcome}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
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
    marginBottom: 14,
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
  filterScroll: {
    maxHeight: 40,
    marginBottom: 14,
  },
  filterContent: {
    gap: 8,
    paddingRight: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 110, // Floating nav bar padding
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardStudentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardStudent: {
    fontSize: 14,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subjectTagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  subjectTag: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  struggleBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  struggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  struggleLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  approachBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  approachLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  approachLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  outcomeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  outcomeText: {
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
  },
});
