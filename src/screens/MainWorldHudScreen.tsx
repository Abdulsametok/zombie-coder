import React, { useMemo } from 'react';
import {
  Image,
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
import {
  AVATAR_STYLE_SPRITE_PREVIEW,
  GAME_LOGO_ASSET,
  NPC_SPRITE_ASSETS,
} from '../game/sprites/mainCharSprites';
import {
  NpcId,
  getRelationshipTier,
} from '../features/social/npcRelationshipEngine';
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
    npcRelationships,
    communicationStyle,
    targetWalkTile,
    isWalking,
    activeDialogueBubble,
    statusBanner,
    walkToTile,
    changeLocation,
    interactWithCurrentSpot,
    talkToNpc,
    advanceDialogueBubble,
    setCommunicationStyle,
    setActiveScreen,
    setStatusBanner,
  } = useGame();

  const currentMap = WORLD_MAPS[location];

  const activeNpcId: NpcId = useMemo(() => {
    if (location === 'gym') {
      return 'coach_burak';
    }
    if (location === 'university') {
      return 'prof_demir';
    }
    return 'kaan_mentor';
  }, [location]);

  const activeNpc = npcRelationships[activeNpcId];
  const activeNpcTier = getRelationshipTier(activeNpc.familiarity);
  const tierLabel =
    activeNpcTier === 'first_time'
      ? 'İLK TANIŞMA'
      : activeNpcTier === 'acquaintance'
      ? 'TANIDIK'
      : 'GÜVENİLİR MÜDAVİM';

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
          <Image
            source={GAME_LOGO_ASSET}
            style={styles.headerLogoIcon}
            resizeMode="contain"
          />
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
            <Image
              source={AVATAR_STYLE_SPRITE_PREVIEW[profile.avatarStyle]}
              style={styles.headerAvatarSprite}
              resizeMode="contain"
            />
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

        {/* 2D Skia Viewport Canvas (Point-and-Click / Tap-to-Move + Speech Bubble) */}
        <DormSceneCanvas
          map={currentMap}
          playerPosition={playerPosition}
          playerFacing={playerFacing}
          activeInteraction={activeInteraction}
          onTriggerInteraction={interactWithCurrentSpot}
          targetWalkTile={targetWalkTile}
          isWalking={isWalking}
          onTapTile={walkToTile}
          activeDialogueBubble={activeDialogueBubble}
          onAdvanceDialogue={advanceDialogueBubble}
          onTalkToSceneNpc={talkToNpc}
        />

        {/* Live Telemetry / Interaction Feedback Strip */}
        <View style={styles.telemetryStrip}>
          <Text style={styles.telemetryPrompt}>&gt;_</Text>
          <Text style={styles.telemetryText} numberOfLines={2}>
            {statusBanner}
          </Text>
        </View>

        {/* Faz 7: NPC Sosyal İlişki & Üslup Adaptasyonu Şeridi */}
        <View style={styles.npcSocialCard}>
          <View style={styles.npcTopRow}>
            <View style={styles.npcPortraitThumbBox}>
              <Image
                source={NPC_SPRITE_ASSETS[activeNpcId].portrait}
                style={styles.npcPortraitThumb}
                resizeMode="contain"
              />
            </View>
            <View style={styles.npcInfoLeft}>
              <Text style={styles.npcNameText}>
                {activeNpc.name} ({tierLabel})
              </Text>
              <Text style={styles.npcStatsText}>
                Tanışıklık: %{activeNpc.familiarity} • Güven: %{activeNpc.trust}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityLabel={`${activeNpc.name} ile Konuş`}
              style={styles.npcTalkBtn}
              onPress={() =>
                walkToTile(
                  location === 'dorm'
                    ? { x: 8, y: 8 }
                    : location === 'university'
                    ? { x: 5, y: 3 }
                    : { x: 5, y: 4 },
                  () => talkToNpc(activeNpcId),
                )
              }>
              <Text style={styles.npcTalkBtnText}>SOHBET ET</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.styleSwitchRow}>
            <Text style={styles.styleSwitchLabel}>ÜSLUP:</Text>
            <TouchableOpacity
              style={[
                styles.stylePill,
                communicationStyle === 'casual' && styles.stylePillActive,
              ]}
              onPress={() => setCommunicationStyle('casual')}>
              <Text
                style={[
                  styles.stylePillText,
                  communicationStyle === 'casual' && styles.stylePillTextActive,
                ]}>
                Samimi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stylePill,
                communicationStyle === 'formal' && styles.stylePillActive,
              ]}
              onPress={() => setCommunicationStyle('formal')}>
              <Text
                style={[
                  styles.stylePillText,
                  communicationStyle === 'formal' && styles.stylePillTextActive,
                ]}>
                Resmi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Control Panel: Point-and-Click Hızlı Hedefler & Primary Interact Button */}
        <View style={styles.controlsSection}>
          <View style={styles.quickWalkPanel}>
            <Text style={styles.quickWalkTitle}>
              🎯 TIKLA &amp; GİT (HARİTAYA DOKUN VEYA HIZLI SEÇ)
            </Text>
            <View style={styles.quickWalkBtnsRow}>
              <TouchableOpacity
                style={styles.quickWalkChip}
                onPress={() =>
                  walkToTile(
                    location === 'dorm'
                      ? { x: 2, y: 4 }
                      : location === 'university'
                      ? { x: 5, y: 2 }
                      : { x: 4, y: 3 },
                  )
                }>
                <Text style={styles.quickWalkChipText}>
                  {location === 'dorm'
                    ? '💻 Bilgisayar'
                    : location === 'university'
                    ? '🎓 Kürsü'
                    : '🏋️ İstasyon'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickWalkChip}
                onPress={() =>
                  walkToTile(
                    location === 'dorm'
                      ? { x: 8, y: 8 }
                      : location === 'university'
                      ? { x: 5, y: 3 }
                      : { x: 5, y: 4 },
                    () => talkToNpc(activeNpcId),
                  )
                }>
                <Text style={styles.quickWalkChipText}>
                  💬 {activeNpc.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickWalkChip}
                onPress={() =>
                  walkToTile(
                    location === 'dorm'
                      ? { x: 9, y: 4 }
                      : { x: 5, y: 0 },
                  )
                }>
                <Text style={styles.quickWalkChipText}>
                  {location === 'dorm' ? '🛏 Yatak' : '🚪 Çıkış'}
                </Text>
              </TouchableOpacity>
            </View>
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
              {activeInteraction ? activeInteraction.keyHint : '[DOKUN]'}
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
  headerLogoIcon: {
    width: 28,
    height: 28,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarSprite: {
    width: 26,
    height: 28,
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
  npcSocialCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#222a3a',
    gap: 6,
  },
  npcTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  npcPortraitThumbBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  npcPortraitThumb: {
    width: 32,
    height: 32,
  },
  npcInfoLeft: {
    flex: 1,
  },
  npcNameText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  npcStatsText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 2,
  },
  npcTalkBtn: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  npcTalkBtnText: {
    color: Colors.onSecondaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  styleSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  styleSwitchLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  stylePill: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  stylePillActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  stylePillText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  stylePillTextActive: {
    color: Colors.primaryContainer,
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  quickWalkPanel: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222836',
    padding: 10,
    gap: 8,
  },
  quickWalkTitle: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  quickWalkBtnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickWalkChip: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#31384a',
  },
  quickWalkChipText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  interactBtn: {
    width: 104,
    height: 92,
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
