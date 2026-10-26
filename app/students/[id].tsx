import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Sparkles,
  Phone,
  School,
  GraduationCap,
  BookOpen,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { Student, SessionPlan, ProgressRecord } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import { FormattedContent } from '@/components/FormattedContent';

export default function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();

  const [student, setStudent] = useState<Student | null>(null);
  const [plans, setPlans] = useState<SessionPlan[]>([]);
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (studentId: string) => {
    setIsLoading(true);
    try {
      const [studentData, plansData, progressData] = await Promise.all([
        api.getStudent(studentId),
        api.getSessionPlans(studentId).catch(() => []),
        api.getProgressRecords(studentId).catch(() => []),
      ]);
      setStudent(studentData);
      setPlans(plansData);
      setRecords(progressData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !student) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading student dossier...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
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
          <Text style={[styles.backText, { color: colors.primary }]}>Roster</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Student Dossier</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Hero Profile Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: isDark ? colors.borderGlow : colors.primary,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {student.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={[styles.name, { color: colors.text }]}>{student.name}</Text>

        <View style={styles.metaRow}>
          <GraduationCap size={13} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {student.grade || 'Secondary Level'}
          </Text>
          <Text style={{ color: colors.textMuted }}>•</Text>
          <School size={13} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {student.school || 'Secondary School'}
          </Text>
        </View>

        {student.contact ? (
          <View style={[styles.contactPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Phone size={12} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.text }]}>{student.contact}</Text>
          </View>
        ) : null}

        {student.notes ? (
          <View
            style={[
              styles.notesBox,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.notesLabelRow}>
              <FileText size={12} color={colors.accent} />
              <Text style={[styles.notesLabel, { color: colors.accent }]}>
                Diagnostic Notes & Goals
              </Text>
            </View>
            <FormattedContent content={student.notes} />
          </View>
        ) : null}
      </View>

      {/* Plan Session CTA */}
      <TouchableOpacity
        style={[styles.planButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push(`/session-plans/create?student_id=${student.id}` as any)}
        activeOpacity={0.8}
      >
        <Sparkles size={16} color="#050B14" strokeWidth={2.5} style={{ marginRight: 6 }} />
        <Text style={styles.planButtonText}>Plan Session with AI Architect</Text>
      </TouchableOpacity>

      {/* Sessions Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <BookOpen size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mentoring Sessions ({plans.length})
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/session-plans/create?student_id=${student.id}` as any)}
        >
          <Text style={[styles.sectionActionText, { color: colors.primary }]}>+ New</Text>
        </TouchableOpacity>
      </View>

      {plans.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No sessions planned for {student.name} yet.
          </Text>
        </View>
      ) : (
        plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push(`/session-plans/${plan.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.planRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
                <Text style={[styles.planMeta, { color: colors.textMuted }]}>
                  {plan.topics?.length || 0} topics • {plan.planned_minutes || 60}m planned
                </Text>
              </View>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      plan.status === 'in_progress'
                        ? colors.primaryGlow
                        : plan.status === 'completed'
                        ? colors.successGlow
                        : colors.surfaceElevated,
                    borderColor:
                      plan.status === 'in_progress'
                        ? colors.primary
                        : plan.status === 'completed'
                        ? colors.success
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    {
                      color:
                        plan.status === 'in_progress'
                          ? colors.primary
                          : plan.status === 'completed'
                          ? colors.success
                          : colors.textMuted,
                    },
                  ]}
                >
                  {plan.status === 'in_progress'
                    ? '⚡ LIVE'
                    : plan.status === 'completed'
                    ? '✓ COMPLETED'
                    : 'PLANNED'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Progress & Stumbles Log */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <View style={styles.sectionTitleRow}>
          <AlertCircle size={16} color={colors.accent} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mastery & Struggle Log ({records.length})
          </Text>
        </View>
      </View>

      {records.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No struggle logs recorded yet. Launch a live session cockpit to document real-time stumbles and breakthrough explanations.
          </Text>
        </View>
      ) : (
        records.map((rec) => (
          <View
            key={rec.id}
            style={[
              styles.recordCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {rec.struggle_noted ? (
              <View style={styles.recordItem}>
                <View style={styles.recordLabelRow}>
                  <AlertCircle size={12} color={colors.warning} />
                  <Text style={[styles.recordLabel, { color: colors.warning }]}>
                    Struggle Observed
                  </Text>
                </View>
                <FormattedContent content={rec.struggle_noted} />
              </View>
            ) : null}

            {rec.approach_used ? (
              <View style={styles.recordItem}>
                <View style={styles.recordLabelRow}>
                  <Sparkles size={12} color={colors.primary} />
                  <Text style={[styles.recordLabel, { color: colors.primary }]}>
                    Pedagogical Approach / Analogy
                  </Text>
                </View>
                <FormattedContent content={rec.approach_used} />
              </View>
            ) : null}

            {rec.outcome ? (
              <View style={styles.recordItem}>
                <View style={styles.recordLabelRow}>
                  <CheckCircle2 size={12} color={colors.success} />
                  <Text style={[styles.recordLabel, { color: colors.success }]}>
                    Outcome / Mastery Status
                  </Text>
                </View>
                <Text style={[styles.recordOutcomeText, { color: colors.success }]}>
                  {rec.outcome}
                </Text>
              </View>
            ) : null}
          </View>
        ))
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.2,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  contactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesBox: {
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    width: '100%',
    borderWidth: 1,
  },
  notesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  planButtonText: {
    color: '#050B14',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  planCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.2,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  planMeta: {
    fontSize: 12,
    marginTop: 3,
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
  recordCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  recordItem: {
    marginBottom: 8,
  },
  recordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordOutcomeText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
