import React, { useState, useEffect } from 'react';
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
  User,
  Mail,
  BookOpen,
  Sparkles,
  Save,
  Sun,
  Moon,
  Smartphone,
  CheckCircle2,
} from 'lucide-react-native';
import { useMentorStore } from '@/store/mentorStore';
import { useTheme } from '@/theme/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, createProfile } = useMentorStore();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [subjects, setSubjects] = useState(
    profile?.subjects || 'Mathematics, Physics, Computer Science'
  );
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setSubjects(profile.subjects || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    setIsSaving(true);
    try {
      if (profile?.id) {
        await updateProfile({
          name: name.trim(),
          email: email.trim() || undefined,
          subjects: subjects.trim(),
          bio: bio.trim() || undefined,
        });
        Alert.alert('Saved', 'SoloMentor profile updated successfully!');
      } else {
        await createProfile({
          name: name.trim(),
          email: email.trim() || undefined,
          subjects: subjects.trim(),
          bio: bio.trim() || undefined,
        });
        Alert.alert('Created', 'SoloMentor profile initialized!');
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings & Profile</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Theme Selection Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            marginBottom: 16,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance & Theme</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
          Auto-detects your mobile system mode with instant overrides
        </Text>

        <View style={styles.themeGrid}>
          {/* System */}
          <TouchableOpacity
            style={[
              styles.themeOptionCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: themeMode === 'system' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setThemeMode('system')}
            activeOpacity={0.7}
          >
            <Smartphone
              size={20}
              color={themeMode === 'system' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.themeOptionTitle,
                { color: themeMode === 'system' ? colors.primary : colors.text },
              ]}
            >
              System Auto
            </Text>
            {themeMode === 'system' ? (
              <CheckCircle2 size={14} color={colors.primary} style={{ marginTop: 4 }} />
            ) : null}
          </TouchableOpacity>

          {/* Dark */}
          <TouchableOpacity
            style={[
              styles.themeOptionCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: themeMode === 'dark' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setThemeMode('dark')}
            activeOpacity={0.7}
          >
            <Moon
              size={20}
              color={themeMode === 'dark' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.themeOptionTitle,
                { color: themeMode === 'dark' ? colors.primary : colors.text },
              ]}
            >
              Cyber Dark
            </Text>
            {themeMode === 'dark' ? (
              <CheckCircle2 size={14} color={colors.primary} style={{ marginTop: 4 }} />
            ) : null}
          </TouchableOpacity>

          {/* Light */}
          <TouchableOpacity
            style={[
              styles.themeOptionCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: themeMode === 'light' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setThemeMode('light')}
            activeOpacity={0.7}
          >
            <Sun
              size={20}
              color={themeMode === 'light' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.themeOptionTitle,
                { color: themeMode === 'light' ? colors.primary : colors.text },
              ]}
            >
              Clean Light
            </Text>
            {themeMode === 'light' ? (
              <CheckCircle2 size={14} color={colors.primary} style={{ marginTop: 4 }} />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mentor Credentials Card */}
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
            <User size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mentor Credentials</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Configures your STEM mentoring identity
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
          placeholder="e.g. Theo Michael"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        {/* Email */}
        <View style={styles.labelWithIcon}>
          <Mail size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Email Address (Optional)
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
          placeholder="mentor@example.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* Subjects */}
        <View style={styles.labelWithIcon}>
          <BookOpen size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Core Mentoring Subjects
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
          placeholder="e.g. Mathematics, Physics, Computer Science, ICT"
          placeholderTextColor={colors.textMuted}
          value={subjects}
          onChangeText={setSubjects}
        />

        {/* Philosophy / Bio */}
        <View style={styles.labelWithIcon}>
          <Sparkles size={14} color={colors.accent} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Mentoring Philosophy & Approach
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
          placeholder="e.g. Deep first-principles intuition, Socratic guidance, no rote memorization."
          placeholderTextColor={colors.textMuted}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              opacity: isSaving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#050B14" />
          ) : (
            <>
              <Save size={16} color="#050B14" strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
    marginBottom: 18,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  themeOptionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  themeOptionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
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
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 90,
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#050B14',
    fontSize: 14,
    fontWeight: '800',
  },
});
