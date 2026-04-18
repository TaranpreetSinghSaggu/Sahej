import { JournalRecord } from "../../lib/journalStore";
import { NoteRecord } from "../notes/types";
import { EmotionShapeFamily, getEmotionShapeFamily } from "./emotionCatalog";

export type ThoughtMapNodeType = "reflection" | "note";
export type ThoughtMapEdgeKind = "linked" | "emotion" | "pattern";
export type ThoughtMapNodeShape = EmotionShapeFamily | "note";

export interface ThoughtMapNode {
  id: string;
  key: string;
  x: number;
  y: number;
  size: number;
  type: ThoughtMapNodeType;
  color: string;
  label: string;
  shape: ThoughtMapNodeShape;
  route: string;
  primaryPattern?: JournalRecord["primaryPattern"];
  primaryEmotion?: string;
  timestamp?: string;
  linkedReflectionId?: string;
  tags?: string[];
  entry?: JournalRecord;
  note?: NoteRecord;
}

export interface ThoughtMapEdge {
  id: string;
  sourceKey: string;
  targetKey: string;
  kind: ThoughtMapEdgeKind;
}

export interface ThoughtMapLayout {
  width: number;
  height: number;
  nodes: ThoughtMapNode[];
  edges: ThoughtMapEdge[];
}

const CANVAS_WIDTH = 1180;
const CANVAS_HEIGHT = 860;
const REFLECTION_LIMIT = 24;
const NOTE_LIMIT = 14;
const MAX_EDGES_PER_NODE = 2;

const AUTOPILOT_CENTER = { x: 300, y: 290 };
const AUTHENTIC_CENTER = { x: 880, y: 290 };
const NOTE_CENTER = { x: 590, y: 660 };

const BASE_RING_RADIUS = 76;
const RING_STEP = 64;
const NODES_PER_RING = 8;

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function positionInCluster(index: number, centerX: number, centerY: number) {
  const ring = Math.floor(index / NODES_PER_RING);
  const slot = index % NODES_PER_RING;
  const radius = BASE_RING_RADIUS + ring * RING_STEP;
  const angle = (Math.PI * 2 * slot) / NODES_PER_RING + ring * 0.32;

  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  };
}

function buildReflectionNodes(entries: JournalRecord[]): ThoughtMapNode[] {
  const autopilotEntries = entries.filter((entry) => entry.verdict === "AUTOPILOT");
  const authenticEntries = entries.filter((entry) => entry.verdict === "AUTHENTIC");

  const autopilotNodes = autopilotEntries.map((entry, index) => {
    const position = positionInCluster(index, AUTOPILOT_CENTER.x, AUTOPILOT_CENTER.y);

    return {
      id: entry.id,
      key: `r:${entry.id}`,
      x: position.x,
      y: position.y,
      size: 34 + entry.intensity * 6,
      type: "reflection" as const,
      color: entry.emotionProfile.bodyColor,
      label: entry.primaryPattern.slice(0, 3).toUpperCase(),
      shape: getEmotionShapeFamily(entry.emotionProfile.primaryEmotion),
      route: `/journal/${entry.id}`,
      primaryPattern: entry.primaryPattern,
      primaryEmotion: normalizeText(entry.emotionProfile.primaryEmotion),
      timestamp: entry.timestamp,
      entry
    };
  });

  const authenticNodes = authenticEntries.map((entry, index) => {
    const position = positionInCluster(index, AUTHENTIC_CENTER.x, AUTHENTIC_CENTER.y);

    return {
      id: entry.id,
      key: `r:${entry.id}`,
      x: position.x,
      y: position.y,
      size: 34 + entry.intensity * 6,
      type: "reflection" as const,
      color: entry.emotionProfile.bodyColor,
      label: entry.primaryPattern.slice(0, 3).toUpperCase(),
      shape: getEmotionShapeFamily(entry.emotionProfile.primaryEmotion),
      route: `/journal/${entry.id}`,
      primaryPattern: entry.primaryPattern,
      primaryEmotion: normalizeText(entry.emotionProfile.primaryEmotion),
      timestamp: entry.timestamp,
      entry
    };
  });

  return [...autopilotNodes, ...authenticNodes];
}

function buildNoteNodes(notes: NoteRecord[]): ThoughtMapNode[] {
  return notes.map((note, index) => {
    const position = positionInCluster(index, NOTE_CENTER.x, NOTE_CENTER.y);
    const normalizedTags = note.tags.map((tag) => normalizeText(tag));

    return {
      id: note.id,
      key: `n:${note.id}`,
      x: position.x,
      y: position.y,
      size: 48,
      type: "note",
      color: "#95A0B8",
      label: note.title.slice(0, 2).toUpperCase(),
      shape: "note",
      route: `/note/${note.id}`,
      linkedReflectionId: note.linkedReflectionId,
      tags: normalizedTags,
      timestamp: note.updatedAt,
      note
    };
  });
}

function addEdge(
  edges: ThoughtMapEdge[],
  seen: Set<string>,
  sourceKey: string,
  targetKey: string,
  kind: ThoughtMapEdgeKind
) {
  if (sourceKey === targetKey) {
    return;
  }

  const [first, second] = [sourceKey, targetKey].sort();
  const edgeId = `${kind}:${first}->${second}`;

  if (seen.has(edgeId)) {
    return;
  }

  seen.add(edgeId);
  edges.push({
    id: edgeId,
    sourceKey,
    targetKey,
    kind
  });
}

function buildRelationshipEdges(nodes: ThoughtMapNode[]): ThoughtMapEdge[] {
  const edges: ThoughtMapEdge[] = [];
  const seen = new Set<string>();
  const edgeCountByNode = new Map<string, number>();

  const reflectionNodes = nodes.filter((node): node is ThoughtMapNode & { type: "reflection" } => node.type === "reflection");
  const noteNodes = nodes.filter((node): node is ThoughtMapNode & { type: "note" } => node.type === "note");
  const reflectionById = new Map(reflectionNodes.map((node) => [node.id, node]));

  const canAddNodeEdge = (nodeKey: string) =>
    (edgeCountByNode.get(nodeKey) ?? 0) < MAX_EDGES_PER_NODE;

  const addBoundedEdge = (
    sourceKey: string,
    targetKey: string,
    kind: ThoughtMapEdgeKind
  ) => {
    if (!canAddNodeEdge(sourceKey) || !canAddNodeEdge(targetKey)) {
      return;
    }

    addEdge(edges, seen, sourceKey, targetKey, kind);

    edgeCountByNode.set(sourceKey, (edgeCountByNode.get(sourceKey) ?? 0) + 1);
    edgeCountByNode.set(targetKey, (edgeCountByNode.get(targetKey) ?? 0) + 1);
  };

  const emotionGroups = reflectionNodes.reduce<Map<string, ThoughtMapNode[]>>((grouped, node) => {
    const emotionKey = node.primaryEmotion ?? "";
    if (!emotionKey) {
      return grouped;
    }

    const current = grouped.get(emotionKey) ?? [];
    current.push(node);
    grouped.set(emotionKey, current);
    return grouped;
  }, new Map<string, ThoughtMapNode[]>());

  emotionGroups.forEach((groupNodes) => {
    const sortedGroup = [...groupNodes].sort((a, b) => {
      return (b.timestamp ?? "").localeCompare(a.timestamp ?? "");
    });

    for (let index = 0; index < sortedGroup.length - 1; index += 1) {
      const sourceNode = sortedGroup[index];
      const targetNode = sortedGroup[index + 1];
      addBoundedEdge(sourceNode.key, targetNode.key, "emotion");
    }
  });

  const patternGroups = reflectionNodes.reduce<Map<string, ThoughtMapNode[]>>((grouped, node) => {
    const patternKey = node.primaryPattern ?? "";
    if (!patternKey) {
      return grouped;
    }

    const current = grouped.get(patternKey) ?? [];
    current.push(node);
    grouped.set(patternKey, current);
    return grouped;
  }, new Map<string, ThoughtMapNode[]>());

  patternGroups.forEach((groupNodes) => {
    if (groupNodes.length < 3) {
      return;
    }

    const sortedGroup = [...groupNodes].sort((a, b) => {
      return (b.timestamp ?? "").localeCompare(a.timestamp ?? "");
    });

    const sourceNode = sortedGroup[0];
    const targetNode = sortedGroup[1];
    addBoundedEdge(sourceNode.key, targetNode.key, "pattern");
  });

  noteNodes.forEach((noteNode) => {
    const linkedReflection = noteNode.linkedReflectionId
      ? reflectionById.get(noteNode.linkedReflectionId)
      : undefined;

    if (linkedReflection) {
      addBoundedEdge(noteNode.key, linkedReflection.key, "linked");
      return;
    }

    const mappedReflection = reflectionNodes.find((reflectionNode) => {
      if (!noteNode.tags || noteNode.tags.length === 0 || !reflectionNode.primaryPattern) {
        return false;
      }

      return noteNode.tags.includes(reflectionNode.primaryPattern);
    });

    if (mappedReflection) {
      addBoundedEdge(noteNode.key, mappedReflection.key, "pattern");
    }
  });

  return edges;
}

export function buildJournalGraphLayout(
  entries: JournalRecord[],
  notes: NoteRecord[]
): ThoughtMapLayout {
  const recentEntries = [...entries]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, REFLECTION_LIMIT);
  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, NOTE_LIMIT);

  const reflectionNodes = buildReflectionNodes(recentEntries);
  const noteNodes = buildNoteNodes(recentNotes);
  const nodes = [...reflectionNodes, ...noteNodes];

  return {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    nodes,
    edges: buildRelationshipEdges(nodes)
  };
}
