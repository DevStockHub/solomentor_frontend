import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

interface TopicTimerProps {
  plannedMinutes: number;
  actualMinutes: number;
  extraMinutes: number;
  status: string;
}

export function TopicTimer({ plannedMinutes, actualMinutes, extraMinutes, status }: TopicTimerProps) {
  const { colors, isDark } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (status === 'in_progress') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const totalElapsed = (actualMinutes * 60) + elapsedSeconds;
  const currentMinutes = Math.floor(totalElapsed / 60);
  const currentSeconds = totalElapsed % 60;

  const targetSeconds = plannedMinutes * 60;
  const isOverrun = totalElapsed > targetSeconds;
  const progressRatio = Math.min(1, totalElapsed / (targetSeconds || 1));

  const accentColor = isOverrun ? colors.danger : colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isOverrun
            ? isDark
              ? 'rgba(239, 68, 68, 0.1)'
              : '#FEF2F2'
            : colors.surface,
          borderColor: isOverrun ? colors.danger : colors.border,
          shadowColor: accentColor,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isOverrun
                ? colors.dangerBg
                : isDark
                ? 'rgba(56, 189, 248, 0.12)'
                : 'rgba(2, 132, 199, 0.1)',
            },
          ]}
        >
          {isOverrun ? (
            <AlertTriangle size={14} color={colors.danger} />
          ) : status === 'completed' ? (
            <CheckCircle2 size={14} color={colors.success} />
          ) : (
            <Clock size={14} color={colors.primary} />
          )}
          <Text
            style={[
              styles.statusText,
              { color: isOverrun ? colors.danger : colors.primary },
            ]}
          >
            {status === 'in_progress'
              ? isOverrun
                ? 'PACING OVERRUN'
                : 'IN PROGRESS'
              : status.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.plannedLabel, { color: colors.textMuted }]}>
          Target: {plannedMinutes}m
        </Text>
      </View>

      <View style={styles.timerCenter}>
        <Text
          style={[
            styles.timeDigits,
            { color: isOverrun ? colors.danger : colors.text },
          ]}
        >
          {String(currentMinutes).padStart(2, '0')}:{String(currentSeconds).padStart(2, '0')}
        </Text>
      </View>

      {/* Futuristic Progress Bar */}
      <View
        style={[
          styles.progressBarBackground,
          { backgroundColor: colors.surfaceElevated },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progressRatio * 100}%`,
              backgroundColor: isOverrun ? colors.danger : colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        {extraMinutes > 0 ? (
          <Text style={[styles.extraText, { color: colors.warning }]}>
            +{extraMinutes}m extra added
          </Text>
        ) : (
          <Text style={[styles.footerHint, { color: colors.textMuted }]}>
            {isOverrun
              ? `Over target by ${Math.floor((totalElapsed - targetSeconds) / 60)}m`
              : `${Math.max(0, Math.ceil((targetSeconds - totalElapsed) / 60))}m remaining on this topic`}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.2,
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  plannedLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  timerCenter: {
    alignItems: 'center',
    marginVertical: 4,
  },
  timeDigits: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    alignItems: 'center',
  },
  footerHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  extraText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
