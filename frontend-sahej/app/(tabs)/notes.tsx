import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { StatusBar } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "../../src/components/GlassCard";
import { copy } from "../../src/constants/copy";
import { listNotes } from "../../src/features/notes/store";
import { NoteRecord } from "../../src/features/notes/types";
import { spacing } from "../../src/theme/spacing";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { typography } from "../../src/theme/typography";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export default function NotesScreen() {
  const { theme, statusBarStyle } = useThemePreference();
  const [notes, setNotes] = useState<NoteRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadNotes = async () => {
        const nextNotes = await listNotes();

        if (isMounted) {
          setNotes(nextNotes);
        }
      };

      void loadNotes();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const linkedCount = useMemo(
    () => notes.filter((note) => Boolean(note.linkedReflectionId)).length,
    [notes]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.aura, { backgroundColor: theme.auraSoft }]} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{copy.notes.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{copy.notes.subtitle}</Text>

        <GlassCard style={styles.summaryCard} theme={theme}>
          <Text style={[styles.summaryEyebrow, { color: theme.textMuted }]}>Your notebook</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Saved notes</Text>
              <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{notes.length}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Linked to reflections</Text>
              <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{linkedCount}</Text>
            </View>
          </View>
        </GlassCard>

        <Pressable
          onPress={() => {
            router.push({
              pathname: "/note/[id]",
              params: {
                id: "new"
              }
            });
          }}
          style={[styles.newButton, { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.newButtonText, { color: theme.textPrimary }]}>+ {copy.notes.newAction}</Text>
          <Text style={[styles.newButtonSubtext, { color: theme.textPrimary }]}>Capture a thought in seconds</Text>
        </Pressable>

        {notes.length === 0 ? (
          <GlassCard style={styles.emptyCard} theme={theme}>
            <Text style={[styles.emptySymbol, { color: theme.textMuted }]}>o</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{copy.notes.emptyTitle}</Text>
            <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>{copy.notes.emptyBody}</Text>
          </GlassCard>
        ) : (
          notes.map((note) => (
            <Pressable
              key={note.id}
              onPress={() => {
                router.push(`/note/${note.id}`);
              }}
            >
              <GlassCard style={styles.noteCard} theme={theme}>
                <Text style={[styles.noteTitle, { color: theme.textPrimary }]}>{note.title}</Text>
                <Text style={[styles.noteBody, { color: theme.textSecondary }]}>
                  {truncate(note.body, 190)}
                </Text>

                <View style={styles.tagsRow}>
                  {note.tags.slice(0, 3).map((tag) => (
                    <View
                      key={`${note.id}-${tag}`}
                      style={[
                        styles.tagChip,
                        {
                          borderColor: theme.borderStrong,
                          backgroundColor: theme.infoSurface
                        }
                      ]}
                    >
                      <Text style={[styles.tagText, { color: theme.textMuted }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.noteMetaRow}>
                  <Text style={[styles.noteMeta, { color: theme.textMuted }]}>
                    {formatTimestamp(note.updatedAt)}
                  </Text>
                  {note.linkedReflectionId ? (
                    <View style={[styles.linkedChip, { borderColor: theme.infoBorder, backgroundColor: theme.infoSurface }]}>
                      <Text style={[styles.linkedChipText, { color: theme.textMuted }]}>
                        {copy.notes.linkedPrefix} {note.linkedReflectionId.slice(0, 8)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </GlassCard>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl + 60
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.lg
  },
  summaryCard: {
    marginBottom: spacing.md
  },
  summaryEyebrow: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize
  },
  summaryValue: {
    fontSize: 21,
    fontWeight: "700"
  },
  divider: {
    height: 30,
    width: 1
  },
  newButton: {
    alignItems: "center",
    borderRadius: 18,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md
  },
  newButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
  },
  newButtonSubtext: {
    fontSize: 11,
    marginTop: 3,
    opacity: 0.88
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xxl
  },
  emptySymbol: {
    fontSize: 34,
    marginBottom: spacing.xs,
    textAlign: "center"
  },
  emptyTitle: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.sm,
    textAlign: "center"
  },
  emptyBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: "center"
  },
  noteCard: {
    marginBottom: spacing.md,
    paddingVertical: spacing.lg
  },
  noteTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  noteBody: {
    fontSize: typography.body.fontSize,
    lineHeight: 25
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md
  },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: spacing.xs,
    marginRight: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  tagText: {
    fontSize: 11
  },
  noteMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm
  },
  noteMeta: {
    fontSize: typography.caption.fontSize,
    marginRight: spacing.md
  },
  linkedChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  linkedChipText: {
    fontSize: 10
  },
  aura: {
    position: "absolute",
    top: -110,
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 999
  }
});
