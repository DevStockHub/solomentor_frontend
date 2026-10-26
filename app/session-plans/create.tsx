import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Sparkles,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { useTheme } from '@/theme/ThemeContext';
import { FormattedContent } from '@/components/FormattedContent';
import { Student, Subject, GeneratedTopic } from '@/types';

export default function CreateSessionPlanScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ student_id?: string }>();
  const { colors, isDark } = useTheme();

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [sessionGoal, setSessionGoal] = useState('');
  const [totalMinutes, setTotalMinutes] = useState(60);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [studentsData, subjectsData] = await Promise.all([
        api.getStudents().catch(() => []),
        api.getSubjects().catch(() => []),
      ]);
      setStudents(studentsData);
      setSubjects(subjectsData);

      if (searchParams.student_id) {
        setSelectedStudentId(searchParams.student_id);
      } else if (studentsData.length > 0) {
        setSelectedStudentId(studentsData[0].id);
      }

      if (subjectsData.length > 0) {
        setSelectedSubjectId(subjectsData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!sessionGoal.trim()) {
      Alert.alert(
        'Topic Required',
        'Please enter a target topic or concept (e.g. "Calculus: Integration by Parts")',
      );
      return;
    }
    if (!selectedStudentId || !selectedSubjectId) {
      Alert.alert('Selection Required', 'Please select a student and subject');
      return;
    }

    const studentObj = students.find((s) => s.id === selectedStudentId);
    const subjectObj = subjects.find((s) => s.id === selectedSubjectId);

    setIsGenerating(true);
    try {
      const result = await api.generateTopics({
        subject: subjectObj?.name || 'STEM',
        level: studentObj?.grade || 'Upper Sixth / Secondary',
        goal: sessionGoal.trim(),
        total_minutes: totalMinutes,
        student_notes: studentObj?.notes,
      });

      setGeneratedTitle(result.title || sessionGoal.trim());
      setGeneratedSummary(result.summary || '');
      setGeneratedTopics(result.topics || []);
    } catch (error: any) {
      Alert.alert(
        'AI Generation Failed',
        error.message || 'Could not generate topics. Please check your connection.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSessionPlan = async () => {
    if (!selectedStudentId || !selectedSubjectId) {
      Alert.alert('Error', 'Student and subject must be selected.');
      return;
    }

    const titleToSave = generatedTitle.trim() || sessionGoal.trim();
    if (!titleToSave) {
      Alert.alert('Error', 'Please provide a session title.');
      return;
    }

    const topicsToSave =
      generatedTopics.length > 0
        ? generatedTopics.map((t, idx) => ({
            title: t.title,
            order_index: t.order_index || idx + 1,
            planned_minutes: t.planned_minutes || 15,
          }))
        : [
            {
              title: titleToSave,
              order_index: 1,
              planned_minutes: totalMinutes,
            },
          ];

    setIsSaving(true);
    try {
      const created = await api.createSessionPlan({
        student_id: selectedStudentId,
        subject_id: selectedSubjectId,
        title: titleToSave,
        planned_minutes: totalMinutes,
        topics: topicsToSave,
      });

      router.replace(`/session-plans/${created.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save session plan');
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          AI Topic Architect
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Formulate structured, bite-sized mentoring roadmaps with pedagogical pacing
        </Text>
      </View>

      {/* 1. Student Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          1. Select Student
        </Text>
        {students.length === 0 ? (
          <TouchableOpacity
            style={[
              styles.noStudentsBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push('/students/create' as any)}
          >
            <Text style={[styles.noStudentsText, { color: colors.primary }]}>
              + No students found. Tap to add one first.
            </Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {students.map((s) => {
              const active = selectedStudentId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedStudentId(s.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? colors.primaryFg : colors.textSecondary },
                      active && styles.chipTextActive,
                    ]}
                  >
                    {s.name} ({s.grade || 'Sec'})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* 2. Subject Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          2. Core Subject
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {subjects.map((sub) => {
            const active = selectedSubjectId === sub.id;
            return (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedSubjectId(sub.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.primaryFg : colors.textSecondary },
                    active && styles.chipTextActive,
                  ]}
                >
                  {sub.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Session Goal & Duration */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          3. Target Concept or Syllabus Topic
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Rotational Dynamics & Moment of Inertia"
          placeholderTextColor={colors.textMuted}
          value={sessionGoal}
          onChangeText={setSessionGoal}
        />

        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 14 }]}>
          Target Duration
        </Text>
        <View style={styles.durationRow}>
          {[30, 45, 60, 90].map((min) => {
            const active = totalMinutes === min;
            return (
              <TouchableOpacity
                key={min}
                style={[
                  styles.durationPill,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setTotalMinutes(min)}
                activeOpacity={0.7}
              >
                <Clock
                  size={14}
                  color={active ? colors.primaryFg : colors.textMuted}
                />
                <Text
                  style={[
                    styles.durationText,
                    { color: active ? colors.primaryFg : colors.textSecondary },
                    active && styles.durationTextActive,
                  ]}
                >
                  {min}m
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* AI Generate Button */}
      <TouchableOpacity
        style={[styles.aiGenerateButton, { backgroundColor: colors.primary }]}
        onPress={handleGenerateWithAI}
        disabled={isGenerating}
        activeOpacity={0.8}
      >
        {isGenerating ? (
          <View style={styles.buttonRow}>
            <ActivityIndicator color={colors.primaryFg} />
            <Text style={[styles.aiGenerateButtonText, { color: colors.primaryFg, marginLeft: 10 }]}>
              Architecting Pedagogical Roadmap...
            </Text>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <Sparkles size={18} color={colors.primaryFg} />
            <Text style={[styles.aiGenerateButtonText, { color: colors.primaryFg, marginLeft: 8 }]}>
              Generate Plan Breakdown with AI
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Generated Breakdown Preview */}
      {generatedTopics.length > 0 && (
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderGlow,
              shadowColor: colors.primary,
            },
          ]}
        >
          <View style={styles.previewHeader}>
            <Text style={[styles.previewBadge, { color: colors.primary }]}>
              AI GENERATED LESSON BLUEPRINT
            </Text>
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              {generatedTitle}
            </Text>
            {generatedSummary ? (
              <FormattedContent content={generatedSummary} fontSize={13} />
            ) : null}
          </View>

          <Text style={[styles.topicsListTitle, { color: colors.textSecondary }]}>
            Lesson Sequence & Socratic Strategy:
          </Text>

          {generatedTopics.map((topic, index) => (
            <View
              key={index}
              style={[
                styles.topicCard,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              <View style={styles.topicHeaderRow}>
                <Text style={[styles.topicIndexBadge, { color: colors.primary }]}>
                  Step {index + 1}
                </Text>
                <Text style={[styles.topicMinutes, { color: colors.success }]}>
                  {topic.planned_minutes} mins
                </Text>
              </View>

              <Text style={[styles.topicTitle, { color: colors.text }]}>
                {topic.title}
              </Text>

              {topic.key_concept && (
                <View style={styles.detailRow}>
                  <FormattedContent content={`📌 **Focus:** ${topic.key_concept}`} fontSize={12} />
                </View>
              )}

              {topic.socratic_question && (
                <View
                  style={[
                    styles.socraticBox,
                    {
                      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.06)',
                      borderLeftColor: colors.primary,
                    },
                  ]}
                >
                  <View style={styles.boxTagRow}>
                    <HelpCircle size={13} color={colors.primary} />
                    <Text style={[styles.socraticLabel, { color: colors.primary }]}>
                      Socratic Probe to Ask Student:
                    </Text>
                  </View>
                  <FormattedContent content={`"${topic.socratic_question}"`} fontSize={12} />
                </View>
              )}

              {topic.common_stumbling_block && (
                <View
                  style={[
                    styles.trapBox,
                    {
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB',
                      borderLeftColor: colors.warning,
                    },
                  ]}
                >
                  <View style={styles.boxTagRow}>
                    <AlertCircle size={13} color={colors.warning} />
                    <Text style={[styles.trapLabel, { color: colors.warning }]}>
                      Common Stumbling Block:
                    </Text>
                  </View>
                  <FormattedContent content={topic.common_stumbling_block} fontSize={12} />
                </View>
              )}
            </View>
          ))}

          {/* Confirm & Save Button */}
          <TouchableOpacity
            style={[styles.savePlanButton, { backgroundColor: colors.success }]}
            onPress={handleSaveSessionPlan}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonRow}>
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.savePlanButtonText}>
                  Save Plan & Ready Session ({totalMinutes}m)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1.2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    fontWeight: '800',
  },
  noStudentsBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  noStudentsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  durationTextActive: {
    fontWeight: '800',
  },
  aiGenerateButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiGenerateButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  previewCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.2,
    elevation: 4,
  },
  previewHeader: {
    marginBottom: 16,
  },
  previewBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  topicsListTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  topicIndexBadge: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  topicMinutes: {
    fontSize: 12,
    fontWeight: '800',
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  detailRow: {
    marginBottom: 8,
  },
  socraticBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3.5,
  },
  boxTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  socraticLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  trapBox: {
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3.5,
  },
  trapLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  savePlanButton: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  savePlanButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
});
