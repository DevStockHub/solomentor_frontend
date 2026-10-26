import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  UserPlus,
  School,
  Phone,
  FileText,
  GraduationCap,
  Sparkles,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { useMentorStore } from '@/store/mentorStore';
import { useTheme } from '@/theme/ThemeContext';

export default function CreateStudentScreen() {
  const router = useRouter();
  const { profile } = useMentorStore();
  const { colors, isDark } = useTheme();

  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('Upper Sixth');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const gradeOptions = [
    'Form 4',
    'Form 5 / O-Level',
    'Lower Sixth',
    'Upper Sixth',
    'University Freshman',
    'Other',
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter the student\'s name.');
      return;
    }
    setIsLoading(true);
    try {
      await api.createStudent({
        mentor_id: profile?.id,
        name: name.trim(),
        school: school.trim() || undefined,
        grade: grade || undefined,
        contact: contact.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create student profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={[styles.content, { paddingBottom: 160 }]}
        keyboardShouldPersistTaps="handled"
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
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Student</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Main Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
            ]}
          >
            <UserPlus size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Student Profile</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              Secondary school learner details & diagnostics
            </Text>
          </View>
        </View>

        {/* Name */}
        <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Kelvin N."
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* School */}
        <View style={styles.labelWithIcon}>
          <School size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Secondary School / College
          </Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. GBHS Yaounde / Buea High"
          placeholderTextColor={colors.textMuted}
          value={school}
          onChangeText={setSchool}
        />

        {/* Grade / Level Pills */}
        <View style={styles.labelWithIcon}>
          <GraduationCap size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Class / Academic Level
          </Text>
        </View>
        <View style={styles.gradeGrid}>
          {gradeOptions.map((g) => {
            const isSelected = grade === g;
            return (
              <TouchableOpacity
                key={g}
                style={[
                  styles.gradePill,
                  {
                    backgroundColor: isSelected ? colors.primaryGlow : colors.surfaceElevated,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setGrade(g)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.gradeText,
                    {
                      color: isSelected ? colors.primary : colors.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contact */}
        <View style={styles.labelWithIcon}>
          <Phone size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Contact / WhatsApp (Optional)
          </Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="+237 6..."
          placeholderTextColor={colors.textMuted}
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />

        {/* Diagnostic Notes */}
        <View style={styles.labelWithIcon}>
          <FileText size={14} color={colors.accent} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Diagnostic Notes & Target Exams
          </Text>
        </View>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Aiming for A in Pure Maths with Mechanics. Struggles with integration by substitution and projectile motion..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleCreate}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#050B14" />
          ) : (
            <>
              <Sparkles size={16} color="#050B14" strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={styles.submitButtonText}>Register Student Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  gradePill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  gradeText: {
    fontSize: 12,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 90,
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#050B14',
    fontSize: 14,
    fontWeight: '800',
  },
});
