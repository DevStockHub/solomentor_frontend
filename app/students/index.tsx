import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Users,
  Search,
  Plus,
  X,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { Student } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

export default function StudentsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.school && s.school.toLowerCase().includes(search.toLowerCase())) ||
      (s.grade && s.grade.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <View style={styles.titleBadgeRow}>
            <Text style={[styles.title, { color: colors.text }]}>Student Roster</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ]}
            >
              <Users size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {students.length} Total
              </Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Secondary school learners & personalized progress
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/students/create' as any)}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#050B14" strokeWidth={2.8} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name, school, or level..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Student List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading students...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <GraduationCap size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {search ? 'No students match search' : 'No students registered'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {search
              ? 'Try searching by a different name, level, or school.'
              : 'Add your first mentee to start personalizing topics, tracking struggles, and managing sessions.'}
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/students/create' as any)}
          >
            <Plus size={16} color="#050B14" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.primaryButtonText}>Register Student</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.studentCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push(`/students/${item.id}`)}
              activeOpacity={0.7}
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
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {item.grade || 'Secondary'} • {item.school || 'Secondary School'}
                </Text>
                {item.notes ? (
                  <View style={styles.notePreviewRow}>
                    <Sparkles size={11} color={colors.accent} style={{ marginRight: 4 }} />
                    <Text
                      style={[styles.notesPreview, { color: colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {item.notes}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View
                style={[
                  styles.chevronCircle,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#050B14',
    fontWeight: '800',
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 16,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: 110, // Generous padding for floating nav bar
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  notePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  notesPreview: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 110,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.2,
    marginTop: 16,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#050B14',
    fontWeight: '800',
    fontSize: 13,
  },
});
