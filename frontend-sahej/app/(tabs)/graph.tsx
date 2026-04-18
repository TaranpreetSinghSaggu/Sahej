import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { copy } from "../../src/constants/copy";
import {
  ThoughtMapEdge,
  ThoughtMapNode,
  ThoughtMapNodeShape,
  buildJournalGraphLayout
} from "../../src/features/journal/graphLayout";
import { listNotes } from "../../src/features/notes/store";
import { NoteRecord } from "../../src/features/notes/types";
import { JournalRecord, listJournalEntries } from "../../src/lib/journalStore";
import { spacing } from "../../src/theme/spacing";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { typography } from "../../src/theme/typography";

const MIN_ZOOM = 0.72;
const MAX_ZOOM = 1.45;
const ZOOM_STEP = 0.14;

function hexToRgba(hexColor: string, alpha: number) {
  const normalized = hexColor.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(170, 170, 170, ${alpha})`;
  }

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function toNodeBackground(color: string) {
  return hexToRgba(color, 0.24);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function getEdgeColor(edge: ThoughtMapEdge, accent: string, border: string, sourceColor: string) {
  if (edge.kind === "linked") {
    return hexToRgba(accent, 0.24);
  }

  if (edge.kind === "emotion") {
    return hexToRgba(sourceColor, 0.16);
  }

  return hexToRgba(border, 0.14);
}

function getEdgeThickness(edge: ThoughtMapEdge, zoom: number) {
  const baseThickness = edge.kind === "linked" ? 1.9 : edge.kind === "emotion" ? 1.2 : 0.95;
  return Math.max(0.8, baseThickness * Math.min(1.15, zoom));
}

function getAnchorRadius(shape: ThoughtMapNodeShape, nodeSize: number) {
  if (shape === "triangle") {
    return nodeSize * 0.6;
  }

  if (shape === "diamond") {
    return nodeSize * 0.57;
  }

  if (shape === "droplet") {
    return nodeSize * 0.52;
  }

  if (shape === "petal") {
    return nodeSize * 0.55;
  }

  if (shape === "note") {
    return nodeSize * 0.58;
  }

  return nodeSize * 0.5;
}

interface RenderNode extends ThoughtMapNode {
  renderX: number;
  renderY: number;
  renderSize: number;
  renderTextSize: number;
}

function createRenderNode(node: ThoughtMapNode, zoom: number): RenderNode {
  const renderSize = Math.max(30, node.size * zoom);

  return {
    ...node,
    renderX: node.x * zoom,
    renderY: node.y * zoom,
    renderSize,
    renderTextSize: Math.max(9, Math.min(12, 8 + zoom * 2.4))
  };
}

function renderShape(
  node: RenderNode,
  borderColor: string,
  background: string,
  pulseScale: Animated.AnimatedInterpolation<number>
) {
  const shapeSize = node.renderSize;
  const shapeBorderWidth = Math.max(1.1, shapeSize * 0.035);
  const animatedScale =
    node.type === "reflection"
      ? {
          transform: [{ scale: pulseScale }]
        }
      : undefined;

  if (node.shape === "triangle") {
    const triangleWidth = shapeSize * 0.9;
    const triangleHeight = shapeSize * 0.78;

    return (
      <Animated.View style={animatedScale}>
        <View
          style={[
            styles.triangle,
            {
              borderLeftWidth: triangleWidth / 2,
              borderRightWidth: triangleWidth / 2,
              borderBottomWidth: triangleHeight,
              borderBottomColor: background
            }
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.triangleOutline,
            {
              borderLeftWidth: triangleWidth / 2 + shapeBorderWidth * 0.45,
              borderRightWidth: triangleWidth / 2 + shapeBorderWidth * 0.45,
              borderBottomWidth: triangleHeight + shapeBorderWidth,
              borderBottomColor: borderColor
            }
          ]}
        />
      </Animated.View>
    );
  }

  if (node.shape === "diamond") {
    return (
      <Animated.View
        style={[
          {
            width: shapeSize * 0.78,
            height: shapeSize * 0.78,
            borderRadius: 10,
            borderWidth: shapeBorderWidth,
            borderColor,
            backgroundColor: background,
            transform: [{ rotate: "45deg" }]
          },
          animatedScale
        ]}
      />
    );
  }

  if (node.shape === "droplet") {
    return (
      <Animated.View
        style={[
          {
            width: shapeSize * 0.72,
            height: shapeSize,
            borderRadius: shapeSize * 0.43,
            borderTopLeftRadius: shapeSize * 0.28,
            borderTopRightRadius: shapeSize * 0.28,
            borderWidth: shapeBorderWidth,
            borderColor,
            backgroundColor: background
          },
          animatedScale
        ]}
      />
    );
  }

  if (node.shape === "petal") {
    return (
      <Animated.View
        style={[
          {
            width: shapeSize * 0.86,
            height: shapeSize * 0.86,
            borderRadius: shapeSize * 0.38,
            borderWidth: shapeBorderWidth,
            borderColor,
            backgroundColor: background,
            transform: [{ rotate: "38deg" }]
          },
          animatedScale
        ]}
      />
    );
  }

  if (node.shape === "note") {
    return (
      <View
        style={{
          width: shapeSize * 0.9,
          height: shapeSize * 0.9,
          borderRadius: 11,
          borderWidth: shapeBorderWidth,
          borderColor,
          borderStyle: "dashed",
          backgroundColor: background
        }}
      />
    );
  }

  return (
    <Animated.View
      style={[
        {
          width: shapeSize * 0.9,
          height: shapeSize * 0.9,
          borderRadius: 999,
          borderWidth: shapeBorderWidth,
          borderColor,
          backgroundColor: background
        },
        animatedScale
      ]}
    />
  );
}

export default function GraphScreen() {
  const { theme, statusBarStyle } = useThemePreference();
  const [entries, setEntries] = useState<JournalRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [selectedNode, setSelectedNode] = useState<ThoughtMapNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.03,
          duration: 2300,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0.985,
          duration: 2300,
          useNativeDriver: true
        })
      ])
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [pulse]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        const [nextEntries, nextNotes] = await Promise.all([listJournalEntries(120), listNotes()]);

        if (!isMounted) {
          return;
        }

        setEntries(nextEntries);
        setNotes(nextNotes);
      };

      void loadData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const layout = useMemo(() => buildJournalGraphLayout(entries, notes), [entries, notes]);
  const renderNodes = useMemo(() => layout.nodes.map((node) => createRenderNode(node, zoom)), [layout.nodes, zoom]);
  const nodeByKey = useMemo(() => new Map(renderNodes.map((node) => [node.key, node])), [renderNodes]);
  const pulseScale = useMemo(() => pulse.interpolate({ inputRange: [0.985, 1.03], outputRange: [0.985, 1.03] }), [pulse]);

  const canvasWidth = layout.width * zoom;
  const canvasHeight = layout.height * zoom;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.auraTop, { backgroundColor: theme.aura }]} />
      <View pointerEvents="none" style={[styles.auraBottom, { backgroundColor: theme.auraSoft }]} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{copy.graph.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{copy.graph.subtitle}</Text>

        {layout.nodes.length === 0 ? (
          <View style={[styles.emptyStage, { borderColor: theme.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{copy.graph.emptyTitle}</Text>
            <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>{copy.graph.emptyBody}</Text>
          </View>
        ) : (
          <>
            <View style={styles.toolbarRow}>
              <View style={styles.legendWrap}>
                <View style={styles.legendItem}>
                  <View style={[styles.reflectionLegendNode, { borderColor: theme.borderStrong }]} />
                  <Text style={[styles.legendText, { color: theme.textMuted }]}>{copy.graph.reflectionLegend}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.noteLegendNode, { borderColor: theme.borderStrong }]} />
                  <Text style={[styles.legendText, { color: theme.textMuted }]}>{copy.graph.noteLegend}</Text>
                </View>
              </View>

              <View style={styles.zoomButtons}>
                <Pressable
                  onPress={() => {
                    setZoom((current) => Math.max(MIN_ZOOM, Number((current - ZOOM_STEP).toFixed(2))));
                  }}
                  style={[styles.zoomButton, { borderColor: theme.borderStrong }]}
                >
                  <Text style={[styles.zoomText, { color: theme.textPrimary }]}>-</Text>
                </Pressable>
                <Text style={[styles.zoomLabel, { color: theme.textMuted }]}>{Math.round(zoom * 100)}%</Text>
                <Pressable
                  onPress={() => {
                    setZoom((current) => Math.min(MAX_ZOOM, Number((current + ZOOM_STEP).toFixed(2))));
                  }}
                  style={[styles.zoomButton, { borderColor: theme.borderStrong }]}
                >
                  <Text style={[styles.zoomText, { color: theme.textPrimary }]}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={[styles.graphStage, { borderColor: theme.border, backgroundColor: theme.infoSurface }]}>
              <ScrollView horizontal bounces={false} contentContainerStyle={styles.graphScrollHorizontal}>
                <ScrollView bounces={false}>
                  <View style={[styles.graphCanvas, { width: canvasWidth, height: canvasHeight }]}>
                    {layout.edges.map((edge) => {
                      const sourceNode = nodeByKey.get(edge.sourceKey);
                      const targetNode = nodeByKey.get(edge.targetKey);

                      if (!sourceNode || !targetNode) {
                        return null;
                      }

                      const dx = targetNode.renderX - sourceNode.renderX;
                      const dy = targetNode.renderY - sourceNode.renderY;
                      const rawDistance = Math.sqrt(dx * dx + dy * dy);
                      if (rawDistance < 2) {
                        return null;
                      }

                      const angle = Math.atan2(dy, dx);
                      const sourceAnchor = getAnchorRadius(sourceNode.shape, sourceNode.renderSize);
                      const targetAnchor = getAnchorRadius(targetNode.shape, targetNode.renderSize);
                      const startX = sourceNode.renderX + Math.cos(angle) * sourceAnchor;
                      const startY = sourceNode.renderY + Math.sin(angle) * sourceAnchor;
                      const endX = targetNode.renderX - Math.cos(angle) * targetAnchor;
                      const endY = targetNode.renderY - Math.sin(angle) * targetAnchor;

                      const anchoredDx = endX - startX;
                      const anchoredDy = endY - startY;
                      const distance = Math.sqrt(anchoredDx * anchoredDx + anchoredDy * anchoredDy);
                      if (distance < 2) {
                        return null;
                      }

                      const thickness = getEdgeThickness(edge, zoom);
                      const edgeColor = getEdgeColor(edge, theme.accent, theme.borderStrong, sourceNode.color);

                      return (
                        <View
                          key={edge.id}
                          style={[
                            styles.edge,
                            {
                              width: distance,
                              height: thickness,
                              left: (startX + endX) / 2 - distance / 2,
                              top: (startY + endY) / 2 - thickness / 2,
                              backgroundColor: edgeColor,
                              transform: [{ rotate: `${angle}rad` }]
                            }
                          ]}
                        />
                      );
                    })}

                    {renderNodes.map((node) => {
                      const isAutopilot = node.type === "reflection" && node.entry?.verdict === "AUTOPILOT";
                      const borderColor = isAutopilot ? theme.danger : theme.borderStrong;
                      const background = toNodeBackground(node.color);

                      return (
                        <Pressable
                          key={node.key}
                          onPress={() => {
                            setSelectedNode(node);
                          }}
                          style={[
                            styles.nodeTouch,
                            {
                              width: node.renderSize,
                              height: node.renderSize,
                              left: node.renderX - node.renderSize / 2,
                              top: node.renderY - node.renderSize / 2
                            }
                          ]}
                        >
                          {renderShape(node, borderColor, background, pulseScale)}
                          <Text style={[styles.nodeText, { color: theme.textPrimary, fontSize: node.renderTextSize }]}>
                            {node.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>

      <Modal animationType="fade" transparent visible={Boolean(selectedNode)} onRequestClose={() => setSelectedNode(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedNode(null)} />
          <View style={[styles.modalCard, { borderColor: theme.borderStrong, backgroundColor: theme.card }]}>
            {selectedNode?.type === "reflection" && selectedNode.entry ? (
              <>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Reflection node</Text>
                <Text style={[styles.modalThought, { color: theme.textSecondary }]}>
                  {truncate(selectedNode.entry.originalThought, 180)}
                </Text>
                <Text style={[styles.modalMeta, { color: theme.textMuted }]}>
                  {selectedNode.entry.emotionProfile.primaryEmotion}
                  {" -> "}
                  {selectedNode.entry.emotionProfile.secondaryEmotion}
                </Text>
                <Text style={[styles.modalMeta, { color: theme.textMuted }]}>
                  Need: {selectedNode.entry.emotionProfile.underlyingNeed}
                </Text>
                <Text style={[styles.modalMeta, { color: theme.textMuted }]}>
                  Verdict: {selectedNode.entry.verdict}
                </Text>
                <Text style={[styles.modalBody, { color: theme.textSecondary }]}>
                  {selectedNode.entry.journalEntry.summary}
                </Text>
              </>
            ) : null}

            {selectedNode?.type === "note" && selectedNode.note ? (
              <>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Note node</Text>
                <Text style={[styles.modalThought, { color: theme.textPrimary }]}>
                  {selectedNode.note.title}
                </Text>
                <Text style={[styles.modalBody, { color: theme.textSecondary }]}>
                  {truncate(selectedNode.note.body, 190)}
                </Text>
                {selectedNode.note.linkedReflectionId ? (
                  <Text style={[styles.modalMeta, { color: theme.textMuted }]}>
                    Linked reflection: {selectedNode.note.linkedReflectionId.slice(0, 10)}
                  </Text>
                ) : null}
              </>
            ) : null}

            <View style={styles.modalButtonRow}>
              <Pressable
                onPress={() => setSelectedNode(null)}
                style={[styles.modalButtonSecondary, { borderColor: theme.borderStrong }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.textPrimary }]}>Close</Text>
              </Pressable>
              {selectedNode ? (
                <Pressable
                  onPress={() => {
                    const route = selectedNode.route;
                    setSelectedNode(null);
                    router.push(route);
                  }}
                  style={[styles.modalButtonPrimary, { backgroundColor: theme.accent }]}
                >
                  <Text style={[styles.modalButtonText, { color: theme.textPrimary }]}>Open full entry</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: spacing.md
  },
  toolbarRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  legendWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    marginRight: spacing.lg
  },
  reflectionLegendNode: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1.4,
    marginRight: spacing.xs
  },
  noteLegendNode: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.4,
    marginRight: spacing.xs
  },
  legendText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight
  },
  zoomButtons: {
    alignItems: "center",
    flexDirection: "row"
  },
  zoomButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    width: 30,
    height: 30
  },
  zoomText: {
    fontSize: 20,
    lineHeight: 20
  },
  zoomLabel: {
    fontSize: 11,
    marginHorizontal: spacing.sm,
    minWidth: 44,
    textAlign: "center"
  },
  graphStage: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    padding: spacing.sm
  },
  graphScrollHorizontal: {
    minWidth: "100%"
  },
  graphCanvas: {
    borderRadius: 20
  },
  edge: {
    borderRadius: 999,
    position: "absolute"
  },
  nodeTouch: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute"
  },
  triangle: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent"
  },
  triangleOutline: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent"
  },
  nodeText: {
    fontWeight: "700",
    letterSpacing: 0.3,
    position: "absolute",
    textAlign: "center"
  },
  emptyStage: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: spacing.xxl
  },
  emptyTitle: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.sm
  },
  emptyBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: "center"
  },
  auraTop: {
    borderRadius: 999,
    height: 260,
    left: -80,
    position: "absolute",
    top: -120,
    width: 260
  },
  auraBottom: {
    borderRadius: 999,
    bottom: -120,
    height: 260,
    position: "absolute",
    right: -100,
    width: 260
  },
  modalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.48)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  modalCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    maxWidth: 420,
    padding: spacing.lg,
    width: "88%"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  modalThought: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.sm
  },
  modalBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.sm
  },
  modalMeta: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs
  },
  modalButtonRow: {
    flexDirection: "row",
    marginTop: spacing.lg
  },
  modalButtonSecondary: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: spacing.sm
  },
  modalButtonPrimary: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    paddingVertical: spacing.sm
  },
  modalButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight
  }
});
