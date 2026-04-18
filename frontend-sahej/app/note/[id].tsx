import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StatusBar } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "../../src/components/GlassCard";
import { copy } from "../../src/constants/copy";
import { createNote, deleteNote, getNoteById, updateNote } from "../../src/features/notes/store";
import { NoteRecord } from "../../src/features/notes/types";
import { JournalRecord, getJournalEntryById } from "../../src/lib/journalStore";
import { getRouteText } from "../../src/lib/routeParams";
import { spacing } from "../../src/theme/spacing";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { typography } from "../../src/theme/typography";

function toTagArray(rawValue: string) {
  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function NoteEditorScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    linkedReflectionId?: string | string[];
  }>();
  const id = getRouteText(params.id);
  const linkedReflectionId = getRouteText(params.linkedReflectionId);
  const isNewNote = id === "new";
  const { theme, statusBarStyle } = useThemePreference();

  const [noteRecord, setNoteRecord] = useState<NoteRecord | null>(null);
  const [linkedEntryPreview, setLinkedEntryPreview] = useState<JournalRecord | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [activeLinkedReflectionId, setActiveLinkedReflectionId] = useState<string | undefined>(
    linkedReflectionId || undefined
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateNote = async () => {
      if (!isNewNote) {
        const note = await getNoteById(id);

        if (!isMounted || !note) {
          return;
        }

        setNoteRecord(note);
        setTitle(note.title);
        setBody(note.body);
        setTagsInput(note.tags.join(", "));
        setActiveLinkedReflectionId(note.linkedReflectionId);

        if (note.linkedReflectionId) {
          const linkedEntry = await getJournalEntryById(note.linkedReflectionId);

          if (isMounted) {
            setLinkedEntryPreview(linkedEntry);
          }
        }
        return;
      }

      if (!linkedReflectionId) {
        return;
      }

      const linkedEntry = await getJournalEntryById(linkedReflectionId);

      if (!isMounted || !linkedEntry) {
        return;
      }

      setTitle(`Reflection: ${linkedEntry.emotionProfile.primaryEmotion}`);
      setBody(
        `${linkedEntry.journalEntry.summary}\n\n${linkedEntry.mirrorLine}\n\n${linkedEntry.reframePrompt}`
      );
      setTagsInput(linkedEntry.primaryPattern);
      setActiveLinkedReflectionId(linkedEntry.id);
      setLinkedEntryPreview(linkedEntry);
    };

    void hydrateNote();

    return () => {
      isMounted = false;
    };
  }, [id, isNewNote, linkedReflectionId]);

  const noteTags = useMemo(() => toTagArray(tagsInput), [tagsInput]);

  const handleSave = async () => {
    if (isNewNote) {
      const created = await createNote({
        title,
        body,
        tags: noteTags,
        linkedReflectionId: activeLinkedReflectionId
      });

      router.replace(`/note/${created.id}`);
      return;
    }

    const updated = await updateNote(id, {
      title,
      body,
      tags: noteTags,
      linkedReflectionId: activeLinkedReflectionId
    });
    setNoteRecord(updated ?? null);
    router.replace("/notes");
  };

  const handleDelete = async () => {
    if (isNewNote) {
      router.back();
      return;
    }

    await deleteNote(id);
    router.replace("/notes");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.aura, { backgroundColor: theme.auraSoft }]} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => {
            router.back();
          }}
          style={[styles.backButton, { borderColor: theme.borderStrong }]}
        >
          <Text style={[styles.backButtonText, { color: theme.textPrimary }]}>Back</Text>
        </Pressable>

        <GlassCard style={styles.editorCard} theme={theme}>
          <Text style={[styles.vaultLabel, { color: theme.textMuted }]}>Quick note</Text>
          <Text style={[styles.welcomeLine, { color: theme.textSecondary }]}>
            Capture now. Refine later.
          </Text>

          {!isNewNote && noteRecord ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.textMuted }]}>
                Created: {formatDate(noteRecord.createdAt)}
              </Text>
              <Text style={[styles.metaText, { color: theme.textMuted }]}>
                Updated: {formatDate(noteRecord.updatedAt)}
              </Text>
            </View>
          ) : null}

          {linkedEntryPreview ? (
            <View
              style={[
                styles.linkedContext,
                {
                  borderColor: theme.infoBorder,
                  backgroundColor: theme.infoSurface
                }
              ]}
            >
              <Text style={[styles.linkedTitle, { color: theme.textPrimary }]}>
                Linked from reflection
              </Text>
              <Text style={[styles.linkedBody, { color: theme.textSecondary }]}>
                {linkedEntryPreview.journalEntry.summary}
              </Text>
              <Text style={[styles.linkedMeta, { color: theme.textMuted }]}>
                {linkedEntryPreview.emotionProfile.primaryEmotion} | {linkedEntryPreview.primaryPattern}
              </Text>
            </View>
          ) : activeLinkedReflectionId ? (
            <Text style={[styles.linkedHint, { color: theme.textMuted }]}>
              {copy.noteEditor.linkedHint}
            </Text>
          ) : null}

          <TextInput
            onChangeText={setTitle}
            placeholder={copy.noteEditor.titlePlaceholder}
            placeholderTextColor={theme.textMuted}
            selectionColor={theme.accent}
            style={[
              styles.titleInput,
              {
                color: theme.textPrimary,
                borderColor: theme.border
              }
            ]}
            value={title}
          />

          <TextInput
            multiline
            onChangeText={setBody}
            placeholder={copy.noteEditor.bodyPlaceholder}
            placeholderTextColor={theme.textMuted}
            selectionColor={theme.accent}
            style={[
              styles.bodyInput,
              {
                color: theme.textPrimary,
                borderColor: theme.border
              }
            ]}
            textAlignVertical="top"
            value={body}
          />

          <TextInput
            onChangeText={setTagsInput}
            placeholder={copy.noteEditor.tagsPlaceholder}
            placeholderTextColor={theme.textMuted}
            selectionColor={theme.accent}
            style={[
              styles.tagsInput,
              {
                color: theme.textPrimary,
                borderColor: theme.border
              }
            ]}
            value={tagsInput}
          />

          <View style={styles.tagPreviewRow}>
            {noteTags.slice(0, 4).map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tagChip,
                  {
                    borderColor: theme.borderStrong,
                    backgroundColor: theme.infoSurface
                  }
                ]}
              >
                <Text style={[styles.tagChipText, { color: theme.textMuted }]}>#{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleSave}
              style={[styles.primaryButton, { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.buttonText, { color: theme.textPrimary }]}>
                {copy.noteEditor.saveAction}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={[styles.secondaryButton, { borderColor: theme.borderStrong }]}
            >
              <Text style={[styles.buttonText, { color: theme.textPrimary }]}>
                {copy.noteEditor.deleteAction}
              </Text>
            </Pressable>
          </View>
        </GlassCard>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl + 60
  },
  backButton: {
    alignSelf: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  backButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight
  },
  editorCard: {
    paddingVertical: spacing.xl
  },
  vaultLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
    textTransform: "uppercase"
  },
  welcomeLine: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.md
  },
  metaRow: {
    marginBottom: spacing.sm
  },
  metaText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight
  },
  linkedContext: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md
  },
  linkedTitle: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    textTransform: "uppercase"
  },
  linkedBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  linkedMeta: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs
  },
  linkedHint: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.sm
  },
  titleInput: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.md,
    minHeight: 66,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  bodyInput: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: typography.body.fontSize,
    lineHeight: 26,
    minHeight: 300,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  tagsInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: typography.body.fontSize,
    marginTop: spacing.md,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  tagPreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm
  },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: spacing.xs,
    marginRight: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  tagChipText: {
    fontSize: 11
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: spacing.lg
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: spacing.md
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.md
  },
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
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
