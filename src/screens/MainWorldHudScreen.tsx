import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WORLD_MAPS } from '../game/maps/worldMaps';
import { getActiveInteraction } from '../game/collision/collision';
import { DormSceneCanvas } from '../game/engine/DormSceneCanvas';
import { useGame } from '../state/GameContext';
import { Colors } from '../theme/designSystem';

const TOTAL_SEGMENTS = 7;

function SegmentedBar({
  value,
  activeColor,
}: {
  value: number;
  activeColor: string;
}): React.JSX.Element {
  const filledCount = Math.round(
    (Math.max(0, Math.min(100, value)) / 100) * TOTAL_SEGMENTS,
  );
  return (
    <View style={styles.segmentedTrack}>
      {Array.from({ length: TOTAL_SEGMENTS }).map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.segmentPip,
            {
              backgroundColor:
                idx < filledCount ? activeColor : Colors.surfaceVariant,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function MainWorldHudScreen(): React.JSX.Element {
  const {
    profile,
    gameDay,
    formattedClock,
    location,
    playerPosition,
    playerFacing,
    energy,
    motivation,
    metrics,
    tasks,
    taskStatuses,
    statusBanner,
    movePlayer,
    changeLocation,
    interactWithCurrentSpot,
    setActiveScreen,
    setStatusBanner,
  } = useGame();

  const currentMap = WORLD_MAPS[location];

  const activeInteraction = useMemo(
    () => getActiveInteraction(currentMap, playerPosition, playerFacing),
    [currentMap, playerPosition, playerFacing],
  );

  const pendingTaskCount = useMemo(
    () => tasks.filter(t => taskStatuses[t.id] !== 'completed').length,
    [tasks, taskStatuses],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      {/* Top Stitch Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.onlineDot} />
          <Text style={styles.headerTitle}>Main 2D Game World HUD</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.gpaBadge}>
            <Text style={styles.gpaText}>GPA {profile.gpa}</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Profil ve Kariyer Ayarları"
            onPress={() => setActiveScreen('career_setup')}
            style={styles.avatarCircle}>
            <Text style={styles.avatarCircleText}>
              {profile.name.slice(0, 2).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Compact Game Status HUD */}
        <View style={styles.statusCard}>
          <View style={styles.statusTopRow}>
            <View style={styles.dayClockPill}>
              <Text style={styles.clockIcon}>◷</Text>
              <Text style={styles.dayText}>Gün {gameDay}</Text>
              <Text style={styles.clockText}>{formattedClock}</Text>
            </View>
            <View style={styles.locationPill}>
              <View style={styles.locationPing} />
              <Text style={styles.locationText}>{currentMap.title}</Text>
            </View>
          </View>

          {/* Location Switcher Row (Ev / Üniversite / Spor Salonu) */}
          <View style={styles.locationTabsRow}>
            <TouchableOpacity
              style={[
                styles.locSwitchBtn,
                location === 'dorm' && styles.locSwitchBtnActive,
              ]}
              onPress={() => changeLocation('dorm')}>
              <Text
                style={[
                  styles.locSwitchText,
                  location === 'dorm' && styles.locSwitchTextActive,
                ]}>
                🏠 Ev (Çalışma Odası)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.locSwitchBtn,
                location === 'university' && styles.locSwitchBtnActive,
              ]}
              onPress={() => changeLocation('university')}>
              <Text
                style={[
                  styles.locSwitchText,
                  location === 'university' && styles.locSwitchTextActive,
                ]}>
                🎓 Üniversite
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.locSwitchBtn,
                location === 'gym' && styles.locSwitchBtnActive,
              ]}
              onPress={() => changeLocation('gym')}>
              <Text
                style={[
                  styles.locSwitchText,
                  location === 'gym' && styles.locSwitchTextActive,
                ]}>
                💪 Spor Salonu
              </Text>
            </TouchableOpacity>
          </View>

          {/* Segmented Vitals Row */}
          <View style={styles.vitalsRow}>
            <View style={styles.vitalBox}>
              <View style={styles.vitalLabelRow}>
                <Text style={styles.vitalLabel}>⚡ Enerji</Text>
                <Text
                  style={[
                    styles.vitalPercent,
                    { color: Colors.primaryContainer },
                  ]}>
                  %{energy}
                </Text>
              </View>
              <SegmentedBar
                value={energy}
                activeColor={Colors.primaryContainer}
              />
            </View>

            <View style={styles.vitalBox}>
              <View style={styles.vitalLabelRow}>
                <Text style={styles.vitalLabel}>◈ Motivasyon</Text>
                <Text style={[styles.vitalPercent, { color: Colors.secondary }]}>
                  %{motivation}
                </Text>
              </View>
              <SegmentedBar value={motivation} activeColor={Colors.secondary} />
            </View>
          </View>
        </View>

        {/* 2D Skia Viewport Canvas */}
        <DormSceneCanvas
          map={currentMap}
          playerPosition={playerPosition}
          playerFacing={playerFacing}
          activeInteraction={activeInteraction}
          onTriggerInteraction={interactWithCurrentSpot}
        />

        {/* Live Telemetry / Interaction Feedback Strip */}
        <View style={styles.telemetryStrip}>
          <Text style={styles.telemetryPrompt}>&gt;_</Text>
          <Text style={styles.telemetryText} numberOfLines={2}>
            {statusBanner}
          </Text>
        </View>

        {/* Bottom Control Panel: Tactile D-Pad & Primary Interact Button */}
        <View style={styles.controlsSection}>
          {/* D-Pad */}
          <View style={styles.dpadContainer}>
            <TouchableOpacity
              accessibilityLabel="Yukarı"
              style={[styles.dpadBtn, styles.dpadUp]}
              onPress={() => movePlayer('up')}>
              <Text style={styles.dpadArrow}>▲</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="Sol"
              style={[styles.dpadBtn, styles.dpadLeft]}
              onPress={() => movePlayer('left')}>
              <Text style={styles.dpadArrow}>◀</Text>
            </TouchableOpacity>

            <View style={styles.dpadCenter}>
              <View style={styles.dpadCenterDot} />
            </View>

            <TouchableOpacity
              accessibilityLabel="Sağ"
              style={[styles.dpadBtn, styles.dpadRight]}
              onPress={() => movePlayer('right')}>
              <Text style={styles.dpadArrow}>▶</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="Aşağı"
              style={[styles.dpadBtn, styles.dpadDown]}
              onPress={() => movePlayer('down')}>
              <Text style={styles.dpadArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Green Interact Button */}
          <TouchableOpacity
            accessibilityLabel="Etkileşim"
            activeOpacity={0.85}
            style={[
              styles.interactBtn,
              !activeInteraction && styles.interactBtnIdle,
            ]}
            onPress={interactWithCurrentSpot}>
            <Text style={styles.interactIcon}>⊡</Text>
            <Text style={styles.interactTitle}>ETKİLEŞİM</Text>
            <Text style={styles.interactSubtitle}>
              {activeInteraction ? activeInteraction.keyHint : '[SPACE]'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Fast-Action HUD Bar */}
        <View style={styles.fastActionRow}>
          <TouchableOpacity
            style={styles.fastActionPill}
            onPress={() => setActiveScreen('zombie_os')}>
            <Text style={styles.fastActionLabel}>☰ Görevler</Text>
            <View style={styles.taskCountBadge}>
              <Text style={styles.taskCountText}>{pendingTaskCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fastActionPill}
            onPress={() =>
              setStatusBanner(
                `[METRİKLER] Kod Okuma: ${metrics.kod_okuryazarligi} | Sistem: ${metrics.sistem_dusuncesi} | AI Denetim: ${metrics.ai_denetimi} | Sabır: ${metrics.hata_ayiklama_sabri}`,
              )
            }>
            <Text style={styles.fastActionLabel}>▤ İstatistik</Text>
            <View style={styles.lvlBadge}>
              <Text style={styles.lvlBadgeText}>LVL {profile.grade}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen('world_hud')}>
          <Text style={[styles.navLabel, styles.navLabelActive]}>
            ▣ CAMPUS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen('zombie_os')}>
          <Text style={styles.navLabel}>&gt;_ OS DECK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen('end_of_day_journal')}>
          <Text style={styles.navLabel}>☾ DORM</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerBar: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1c2230',
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.primaryContainer,
  },
  headerTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpaBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gpaText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 10,
  },
  statusCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayClockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  clockIcon: {
    color: Colors.secondary,
    fontSize: 13,
  },
  dayText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
  },
  clockText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  locationPing: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryContainer,
  },
  locationText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  locationTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  locSwitchBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2536',
  },
  locSwitchBtnActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  locSwitchText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  locSwitchTextActive: {
    color: Colors.secondary,
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vitalBox: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 6,
    borderRadius: 6,
    gap: 4,
  },
  vitalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vitalLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  vitalPercent: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  segmentedTrack: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    padding: 1.5,
    gap: 2,
  },
  segmentPip: {
    flex: 1,
    borderRadius: 1.5,
  },
  telemetryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
  },
  telemetryPrompt: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  telemetryText: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  dpadContainer: {
    width: 138,
    height: 138,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222836',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#31384a',
  },
  dpadUp: {
    top: 6,
  },
  dpadDown: {
    bottom: 6,
  },
  dpadLeft: {
    left: 6,
  },
  dpadRight: {
    right: 6,
  },
  dpadArrow: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  dpadCenter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.outlineVariant,
  },
  interactBtn: {
    width: 118,
    height: 118,
    borderRadius: 12,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 2,
    borderColor: Colors.primaryFixed,
  },
  interactBtnIdle: {
    opacity: 0.9,
  },
  interactIcon: {
    color: Colors.onPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  interactTitle: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  interactSubtitle: {
    color: Colors.onPrimaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  fastActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fastActionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  fastActionLabel: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  taskCountBadge: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  taskCountText: {
    color: Colors.onSecondaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  lvlBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  lvlBadgeText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomNav: {
    height: 54,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: '#1c2230',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  navLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  navLabelActive: {
    color: Colors.primaryContainer,
  },
});
