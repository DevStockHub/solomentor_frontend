import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  UserPlus,
  Bot,
  TrendingUp,
  Moon,
  Sun,
  Settings,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react-native';
import { useMentorStore } from '@/store/mentorStore';
import { useTheme } from '@/theme/ThemeContext';
import { api } from '@/services/api';
import { Student, SessionPlan, Subject } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { profile, createProfile, fetchProfile, isLoading: isProfileLoading } = useMentorStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<SessionPlan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Setup form state
  const [setupName, setSetupName] = useState('Theo Michael');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupSubjects, setSetupSubjects] = useState('Mathematics, Physics, Computer Science');
  const [isSettingUp, setIsSettingUp] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [studentsData, plansData, subjectsData] = await Promise.all([
        api.getStudents().catch(() => []),
        api.getSessionPlans().catch(() => []),
        api.getSubjects().catch(() => []),
      ]);
      setStudents(studentsData);
      setPlans(plansData);
      setSubjects(subjectsData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
    loadDashboardData();
  };

  const handleCreateInitialProfile = async () => {
    if (!setupName.trim()) return;
    setIsSettingUp(true);
    try {
      await createProfile({
        name: setupName.trim(),
        email: setupEmail.trim() || undefined,
        subjects: setupSubjects.trim(),
      });
      loadDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSettingUp(false);
    }
  };

  if (isProfileLoading && !profile) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <Image
          source={require('@/assets/icon.png')}
          style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 24 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Profile setup card if no profile exists
  if (!profile) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.setupContainer, { backgroundColor: colors.bg, paddingBottom: 160 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.setupCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={require('@/assets/icon.png')}
                style={{ width: 68, height: 68, borderRadius: 16, marginBottom: 8 }}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.badge, { color: colors.primary, textAlign: 'center' }]}>
              SOLOMENTOR INITIALIZATION
            </Text>
            <Text style={[styles.setupTitle, { color: colors.text, textAlign: 'center' }]}>
              Welcome to SoloMentor
            </Text>
            <Text style={[styles.setupSubtitle, { color: colors.textMuted, textAlign: 'center' }]}>
              An intentional AI-native pedagogical workspace for mentoring secondary school students.
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Mentor Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Theo Michael"
              placeholderTextColor={colors.textMuted}
              value={setupName}
              onChangeText={setSetupName}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Email Address (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="mentor@example.com"
              placeholderTextColor={colors.textMuted}
              value={setupEmail}
              onChangeText={setSetupEmail}
              keyboardType="email-address"
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Core STEM Subjects
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Mathematics, Physics, Computer Science"
              placeholderTextColor={colors.textMuted}
              value={setupSubjects}
              onChangeText={setSetupSubjects}
            />

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateInitialProfile}
              disabled={isSettingUp}
            >
              {isSettingUp ? (
                <ActivityIndicator color={colors.primaryFg} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: colors.primaryFg }]}>
                  Launch Workspace
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const activeOrPlannedSessions = plans.filter((p) => p.status !== 'completed');
  const studentMap = new Map(students.map((s) => [s.id, s.name]));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Top Futuristic Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.tagRow}>
            <View
              style={[
                styles.liveDot,
                { backgroundColor: colors.success, shadowColor: colors.success },
              ]}
            />
            <Text style={[styles.greeting, { color: colors.primary }]}>
              STEM PEDAGOGY COCKPIT
            </Text>
          </View>
          <Text style={[styles.mentorName, { color: colors.text }]}>
            {profile.name}
          </Text>
        </View>

        {/* Action Buttons: Theme Toggle & Profile */}
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {isDark ? (
              <Sun size={18} color="#F59E0B" />
            ) : (
              <Moon size={18} color="#0284C7" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
          >
            <Settings size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Futuristic Metric Tiles */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: colors.text }]}>
            {students.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Students</Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.2)',
            },
          ]}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {activeOrPlannedSessions.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Active Sessions
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: colors.success }]}>
            {subjects.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Subjects</Text>
        </View>
      </View>

      {/* AI Topic Architect Banner */}
      <View
        style={[
          styles.actionBanner,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderGlow,
            shadowColor: colors.primary,
          },
        ]}
      >
        <View style={styles.actionBannerContent}>
          <View style={styles.bannerTagRow}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.actionBannerTag, { color: colors.primary }]}>
              AI TOPIC ARCHITECT
            </Text>
          </View>
          <Text style={[styles.actionBannerTitle, { color: colors.text }]}>
            Formulate Intelligent Session Plans
          </Text>
          <Text style={[styles.actionBannerSubtitle, { color: colors.textMuted }]}>
            Break down complex syllabus concepts into timed, structured lessons with Socratic diagnostic questions.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionBannerButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/session-plans/create')}
          activeOpacity={0.8}
        >
          <Sparkles size={16} color={colors.primaryFg} />
          <Text style={[styles.actionBannerButtonText, { color: colors.primaryFg }]}>
            Plan Lesson with AI
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Launch Shortcuts */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[
            styles.quickCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push('/students/create' as any)}
          activeOpacity={0.7}
        >
          <UserPlus size={20} color={colors.primary} />
          <Text style={[styles.quickTitle, { color: colors.text }]}>
            Add Student
          </Text>
          <Text style={[styles.quickDesc, { color: colors.textMuted }]}>
            Roster & diagnostic
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push('/chat')}
          activeOpacity={0.7}
        >
          <Bot size={20} color={colors.accent} />
          <Text style={[styles.quickTitle, { color: colors.text }]}>
            AI Copilot
          </Text>
          <Text style={[styles.quickDesc, { color: colors.textMuted }]}>
            Analogies & coaching
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push('/progress')}
          activeOpacity={0.7}
        >
          <TrendingUp size={20} color={colors.success} />
          <Text style={[styles.quickTitle, { color: colors.text }]}>
            Mastery Logs
          </Text>
          <Text style={[styles.quickDesc, { color: colors.textMuted }]}>
            Track stumbling blocks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active & Planned Sessions */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sessions & Lessons
        </Text>
        <TouchableOpacity onPress={() => router.push('/session-plans')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>
            View All ›
          </Text>
        </TouchableOpacity>
      </View>

      {plans.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <BookOpen size={32} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No session plans yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Use the AI Topic Architect to generate your first lesson plan.
          </Text>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
            ]}
            onPress={() => router.push('/session-plans/create')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              + Create First Plan
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        plans.slice(0, 3).map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: colors.surface,
                borderColor: plan.status === 'in_progress' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => router.push(`/session-plans/${plan.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.planCardHeader}>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      plan.status === 'in_progress'
                        ? colors.primaryGlow
                        : plan.status === 'completed'
                        ? colors.successBg
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
              <Text style={[styles.planStudent, { color: colors.textMuted }]}>
                {studentMap.get(plan.student_id) || 'Student'}
              </Text>
            </View>

            <Text style={[styles.planTitle, { color: colors.text }]}>
              {plan.title}
            </Text>
            <Text style={[styles.planDetails, { color: colors.textMuted }]}>
              {plan.topics?.length || 0} subtopics • {plan.planned_minutes || 60} mins target
            </Text>

            <View
              style={[
                styles.planCardFooter,
                { borderTopColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={styles.cockpitButton}
                onPress={() => router.push(`/session-plans/${plan.id}/live`)}
              >
                <Play size={14} color={colors.primary} />
                <Text style={[styles.cockpitButtonText, { color: colors.primary }]}>
                  Launch Live Cockpit
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Students Roster Section */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Students ({students.length})
        </Text>
        <TouchableOpacity onPress={() => router.push('/students')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>
            Directory ›
          </Text>
        </TouchableOpacity>
      </View>

      {students.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No students registered
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Add a secondary school student to assign tailored study topics.
          </Text>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
            ]}
            onPress={() => router.push('/students/create' as any)}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Register Student
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.studentScroll}
        >
          {students.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={[
                styles.studentCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push(`/students/${student.id}`)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.studentAvatar,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {student.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text
                style={[styles.studentCardName, { color: colors.text }]}
                numberOfLines={1}
              >
                {student.name}
              </Text>
              <Text
                style={[styles.studentCardGrade, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {student.grade || 'Secondary'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 110, // Generous padding for floating nav bar
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  setupContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  setupCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.2,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  setupSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  greeting: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mentorName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  actionBanner: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    marginBottom: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  actionBannerContent: {
    marginBottom: 14,
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  actionBannerTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  actionBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  actionBannerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  actionBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionBannerButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  quickDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  planCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planStudent: {
    fontSize: 12,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 12,
    marginBottom: 12,
  },
  planCardFooter: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  cockpitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  cockpitButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.2,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  secondaryButton: {
    borderWidth: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  studentScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  studentCard: {
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
    width: 110,
    borderWidth: 1.2,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
  },
  studentCardName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  studentCardGrade: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
