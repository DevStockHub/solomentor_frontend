import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle, ChevronRight, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

interface SessionControlBarProps {
  currentTopicId: string | null;
  onStruggle: () => void;
  onComplete: () => void;
  onNext: () => void;
  onAskCopilot: () => void;
}

export function SessionControlBar({
  currentTopicId,
  onStruggle,
  onComplete,
  onNext,
  onAskCopilot,
}: SessionControlBarProps) {
  const { colors, isDark } = useTheme();
  const disabled = !currentTopicId;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {/* Struggling Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
              borderColor: colors.warning,
            },
            disabled && styles.buttonDisabled,
          ]}
          disabled={disabled}
          onPress={onStruggle}
          activeOpacity={0.7}
        >
          <AlertCircle size={15} color={colors.warning} />
          <Text style={[styles.buttonLabel, { color: colors.warning }]}>
            Struggling
          </Text>
        </TouchableOpacity>

        {/* Mastered Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
              borderColor: colors.success,
            },
            disabled && styles.buttonDisabled,
          ]}
          disabled={disabled}
          onPress={onComplete}
          activeOpacity={0.7}
        >
          <CheckCircle size={15} color={colors.success} />
          <Text style={[styles.buttonLabel, { color: colors.success }]}>
            Mastered
          </Text>
        </TouchableOpacity>

        {/* Next Topic Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
              borderColor: colors.primary,
            },
            disabled && styles.buttonDisabled,
          ]}
          disabled={disabled}
          onPress={onNext}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonLabel, { color: colors.primary }]}>
            Next
          </Text>
          <ChevronRight size={15} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Ask Copilot Button */}
      <TouchableOpacity
        style={[
          styles.copilotButton,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.25)',
          },
        ]}
        onPress={onAskCopilot}
        activeOpacity={0.8}
      >
        <Sparkles size={16} color={colors.primary} />
        <Text style={[styles.copilotText, { color: colors.text }]}>
          Ask Copilot for Analogy or Socratic Hint
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  copilotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1.2,
  },
  copilotText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
