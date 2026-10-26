import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { FormattedContent } from '@/components/FormattedContent';

interface AIChatBubbleProps {
  message: string;
  modelUsed?: string;
  title?: string;
}

export function AIChatBubble({ message, modelUsed, title }: AIChatBubbleProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.3)',
          shadowColor: colors.primary,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={[styles.badge, { color: colors.primary }]}>
            {title || 'AI Pedagogical Copilot'}
          </Text>
        </View>
        {modelUsed && (
          <Text style={[styles.modelText, { color: colors.textMuted }]}>
            {modelUsed.split('/').pop()?.replace(':free', '')}
          </Text>
        )}
      </View>

      <FormattedContent content={message} fontSize={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.2,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  modelText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
