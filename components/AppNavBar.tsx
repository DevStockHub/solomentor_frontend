import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  LayoutDashboard,
  Users,
  BookOpenCheck,
  Sparkles,
  BarChart3,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

export function AppNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark } = useTheme();

  // Hide nav bar inside the live mentoring cockpit or the dedicated full-screen AI chat
  if (pathname.includes('/live') || pathname === '/chat' || pathname.startsWith('/chat/')) {
    return null;
  }

  const tabs = [
    { label: 'Overview', Icon: LayoutDashboard, route: '/' },
    { label: 'Students', Icon: Users, route: '/students' },
    { label: 'Sessions', Icon: BookOpenCheck, route: '/session-plans' },
    { label: 'AI Coach', Icon: Sparkles, route: '/chat' },
    { label: 'Insights', Icon: BarChart3, route: '/progress' },
  ];

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View
        style={[
          styles.pillBar,
          {
            backgroundColor: colors.navBg,
            borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.2)',
            shadowColor: colors.primary,
          },
        ]}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          const IconComponent = tab.Icon;
          const activeColor = colors.primary;
          const inactiveColor = colors.textMuted;

          return (
            <TouchableOpacity
              key={tab.route}
              style={[
                styles.tabItem,
                active && [
                  styles.activeTabItem,
                  { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)' },
                ],
              ]}
              onPress={() => router.push(tab.route as any)}
              activeOpacity={0.7}
            >
              <IconComponent
                size={20}
                color={active ? activeColor : inactiveColor}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? activeColor : inactiveColor },
                  active && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
              {active && (
                <View
                  style={[
                    styles.activeIndicatorDot,
                    { backgroundColor: activeColor },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 14,
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 100,
  },
  pillBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 28,
    borderWidth: 1.2,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    minWidth: 60,
  },
  activeTabItem: {
    transform: [{ scale: 1.02 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  activeTabLabel: {
    fontWeight: '800',
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
