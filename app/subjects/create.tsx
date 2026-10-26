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
  BookOpen,
  Code,
  FileText,
  Sparkles,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { useTheme } from '@/theme/ThemeContext';

export default function CreateSubjectScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter subject name');
      return;
    }
    setIsLoading(true);
    try {
      await api.createSubject({
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        description: description.trim() || undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create subject');
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
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add STEM Subject</Text>
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
            <BookOpen size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>STEM Subject</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              Define curriculum area & syllabus scope
            </Text>
          </View>
        </View>

        {/* Name */}
        <Text style={[styles.label, { color: colors.text }]}>Subject Name *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Further Mathematics"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Code */}
        <View style={styles.labelWithIcon}>
          <Code size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Subject Code (Optional)
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
          placeholder="e.g. FMATH / PHYS / CS"
          placeholderTextColor={colors.textMuted}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        {/* Description */}
        <View style={styles.labelWithIcon}>
          <FileText size={14} color={colors.accent} />
          <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 6 }]}>
            Syllabus Topics & Target Scope
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
          placeholder="e.g. Matrices, Complex Numbers, Differential Equations, Projectile Dynamics..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Submit */}
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
            <ActivityIndicator color="#050B14" />
          ) : (
            <>
              <Sparkles size={16} color="#050B14" strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={styles.submitButtonText}>Add STEM Subject</Text>
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
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 80,
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
