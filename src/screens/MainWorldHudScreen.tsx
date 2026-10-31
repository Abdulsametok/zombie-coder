import React, { useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  DAILY_NPC_CHAT_LIMIT,
  NPC_CHAT_TOKEN_COST,
  NpcId,
  getFirstMeetingPrompts,
  getRelationshipTier,
  needsFirstMeeting,
} from '../features/social/npcRelationshipEngine';
import { FLOOR_THEMES } from '../features/theme/adaptiveFloorTheme';
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
    tokenLimit,
    tokensUsed,
    floorTheme,
    lastThemeAnalysisReason,
    analyzeChatAndAdaptTheme,
    logoutAccount,
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
    activeChatNpcId,
    npcChatHistories,
    npcDailyChatCounts,
    targetWalkTile,
    isWalking,
    activeDialogueBubble,
    statusBanner,
    walkToTile,
    changeLocation,
    interactWithCurrentSpot,
    talkToNpc,
    openNpcChat,
    closeNpcChat,
    sendNpcChatMessageAsync,
    advanceDialogueBubble,
    setCommunicationStyle,
    setActiveScreen,
    setStatusBanner,
  } = useGame();

  const [chatThemeInput, setChatThemeInput] = useState<string>('');
  const [npcFreeTextInput, setNpcFreeTextInput] = useState<string>('');
  const [selectedUniNpcId, setSelectedUniNpcId] =
    useState<NpcId>('prof_demir');
  const [isSendingNpcMsg, setIsSendingNpcMsg] = useState<boolean>(false);

  const activeFloorThemeMeta =
    FLOOR_THEMES[floorTheme] || FLOOR_THEMES.terminal_matrix;

  const currentMap = WORLD_MAPS[location];

  const activeNpcId: NpcId = useMemo(() => {
    if (activeChatNpcId) {
      return activeChatNpcId;
    }
    if (location === 'gym') {
      return 'coach_burak';
    }
    if (location === 'university') {
      return selectedUniNpcId;
    }
    return 'kaan_mentor';
  }, [activeChatNpcId, location, selectedUniNpcId]);

  const activeNpc = npcRelationships[activeNpcId];
  const activeNpcTier = getRelationshipTier(activeNpc.familiarity);
  const tierLabel =
    activeNpcTier === 'first_time'
      ? 'İLK TANIŞMA'
      : activeNpcTier === 'acquaintance'
      ? 'TANIDIK'
      : 'GÜVENİLİR MÜDAVİM';

  const currentChatHistory = npcChatHistories[activeNpcId] || [];
  const usedChatsToday = npcDailyChatCounts[activeNpcId] || 0;
  const remainingChatsToday = Math.max(
    0,
    DAILY_NPC_CHAT_LIMIT - usedChatsToday,
  );

  const isFirstMeeting = needsFirstMeeting(activeNpc);
  const firstMeetingPrompts = useMemo(
    () => getFirstMeetingPrompts(profile.name),
    [profile.name],
  );

  const activeInteraction = useMemo(
    () => getActiveInteraction(currentMap, playerPosition, playerFacing),
    [currentMap, playerPosition, playerFacing],
  );

  const pendingTaskCount = useMemo(
    () => tasks.filter(t => taskStatuses[t.id] !== 'completed').length,
    [tasks, taskStatuses],
  );

  const handleSendNpcMessage = async (msgText: string) => {
    const trimmed = msgText.trim();
    if (!trimmed || isSendingNpcMsg) {
      return;
    }
    setIsSendingNpcMsg(true);
    setNpcFreeTextInput('');
    try {
      const res = await sendNpcChatMessageAsync(activeNpcId, trimmed);
      if (!res.ok) {
        setNpcFreeTextInput(trimmed);
      }
    } finally {
      setIsSendingNpcMsg(false);
    }
  };

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
          <Text style={styles.headerTitle}>@{profile.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.gpaBadge}>
            <Text style={styles.gpaText}>
              TK {tokenLimit - tokensUsed}/{tokenLimit}
            </Text>
          </View>
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
          <TouchableOpacity
            accessibilityLabel="Oturumu Kapat"
            onPress={logoutAccount}
            style={styles.logoutSmallBtn}>
            <Text style={styles.logoutSmallBtnText}>Çıkış</Text>
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
                🎓 Üniversite (Hoca &amp; Kaan)
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
                💪 Spor Salonu (Koç)
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

        {/* 2D Skia Viewport Canvas (Point-and-Click / Tap-to-Move + Speech Bubble + Dinamik Zemin) */}
        <DormSceneCanvas
          map={currentMap}
          playerPosition={playerPosition}
          playerFacing={playerFacing}
          playerUsername={profile.username}
          floorTheme={floorTheme}
          activeInteraction={activeInteraction}
          onTriggerInteraction={interactWithCurrentSpot}
          targetWalkTile={targetWalkTile}
          isWalking={isWalking}
          onTapTile={walkToTile}
          activeDialogueBubble={activeDialogueBubble}
          onAdvanceDialogue={advanceDialogueBubble}
          onTalkToSceneNpc={npcId => {
            if (location === 'university') {
              setSelectedUniNpcId(npcId);
            }
            talkToNpc(npcId);
          }}
        />

        {/* Live Telemetry / Interaction Feedback Strip */}
        <View style={styles.telemetryStrip}>
          <Text style={styles.telemetryPrompt}>&gt;_</Text>
          <Text style={styles.telemetryText} numberOfLines={2}>
            {statusBanner}
          </Text>
        </View>

        {/* Faz 7 + Canlı AI NPC Sohbet & Mentorluk Paneli */}
        <View style={styles.npcSocialCard}>
          {/* Üniversitedeyken Prof. Demir (Algoritma/Mimari) ve Kaan (Planlama/Pazarlama) seçimi */}
          {location === 'university' && (
            <View style={styles.uniNpcSelectorRow}>
              <TouchableOpacity
                style={[
                  styles.uniNpcTabBtn,
                  activeNpcId === 'prof_demir' && styles.uniNpcTabBtnActive,
                ]}
                onPress={() => {
                  setSelectedUniNpcId('prof_demir');
                  walkToTile({ x: 5, y: 3 }, () => openNpcChat('prof_demir'));
                }}>
                <Text
                  style={[
                    styles.uniNpcTabText,
                    activeNpcId === 'prof_demir' && styles.uniNpcTabTextActive,
                  ]}>
                  🎓 Prof. Demir (Algoritma &amp; Mimari)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.uniNpcTabBtn,
                  activeNpcId === 'kaan_mentor' && styles.uniNpcTabBtnActive,
                ]}
                onPress={() => {
                  setSelectedUniNpcId('kaan_mentor');
                  walkToTile({ x: 8, y: 6 }, () => openNpcChat('kaan_mentor'));
                }}>
                <Text
                  style={[
                    styles.uniNpcTabText,
                    activeNpcId === 'kaan_mentor' && styles.uniNpcTabTextActive,
                  ]}>
                  📋 Kaan (Planlama &amp; Pazarlama)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {location === 'dorm' && !activeChatNpcId && (
            <View style={styles.dormMentorHintBox}>
              <Text style={styles.dormMentorHintTitle}>
                📍 MENTORLAR KAMPÜSTE VE SPOR SALONUNDA
              </Text>
              <Text style={styles.dormMentorHintDesc}>
                Kaan artık Üniversite çalışma alanında ürün planlaması anlatıyor! Prof. Demir ile algoritma/mimari dersi veya Kaan ile planlama için Üniversite’ye, Koç Burak ile satış taktikleri için Spor Salonu’na git.
              </Text>
              <View style={styles.uniNpcSelectorRow}>
                <TouchableOpacity
                  style={styles.uniNpcTabBtn}
                  onPress={() => changeLocation('university')}>
                  <Text style={styles.uniNpcTabTextActive}>
                    🎓 Üniversiteye Git (Prof. Demir &amp; Kaan)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uniNpcTabBtn}
                  onPress={() => changeLocation('gym')}>
                  <Text style={styles.uniNpcTabTextActive}>
                    💪 Spor Salonuna Git (Koç Burak)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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
              <Text style={styles.npcRoleSubText}>{activeNpc.roleTitle}</Text>
              <Text style={styles.npcStatsText}>
                Tanışıklık: %{activeNpc.familiarity} • Güven: %{activeNpc.trust}{' '}
                • Günlük Hak: {remainingChatsToday}/{DAILY_NPC_CHAT_LIMIT} (-
                {NPC_CHAT_TOKEN_COST} TK)
              </Text>
            </View>
            <TouchableOpacity
              accessibilityLabel={`${activeNpc.name} ile Konuş`}
              style={styles.npcTalkBtn}
              onPress={() => {
                if (location === 'dorm') {
                  changeLocation('university');
                  setSelectedUniNpcId('kaan_mentor');
                  openNpcChat('kaan_mentor');
                  return;
                }
                walkToTile(
                  activeNpcId === 'prof_demir'
                    ? { x: 5, y: 3 }
                    : activeNpcId === 'kaan_mentor'
                    ? { x: 8, y: 6 }
                    : { x: 5, y: 4 },
                  () => talkToNpc(activeNpcId),
                );
              }}>
              <Text style={styles.npcTalkBtnText}>
                {activeChatNpcId === activeNpcId ? 'SOHBET AÇIK' : 'SOHBET ET'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ETKİLEŞİMLİ NPC SOHBET PANELİ (2 Hazır Metin + 1 Serbest Text Alanı + AI Yanıtı) */}
          <View style={styles.interactiveChatPanel}>
            <View style={styles.chatPanelHeaderRow}>
              <Text style={styles.chatPanelTitle}>
                💬 {activeNpc.name.toUpperCase()} İLE CANLI AI SOHBET
              </Text>
              {activeChatNpcId && (
                <TouchableOpacity onPress={closeNpcChat}>
                  <Text style={styles.chatCloseText}>[Gizle]</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* İlk tanışma ekranı (oyuncu bu NPC ile hiç konuşmadıysa) */}
            {isFirstMeeting && (
              <View style={styles.emptyChatWelcomeBox}>
                <Text style={styles.emptyChatWelcomeText}>
                  {`${activeNpc.name} ile ilk kez karşılaşıyorsun. Hazır cümlelerden birini seçip düzenleyebilir ya da kendi cümlenle kendini tanıtabilirsin.`}
                </Text>
              </View>
            )}

            {/* Geçmiş Mesajlar */}
            {currentChatHistory.length > 0 && (
              <View style={styles.chatMessagesList}>
                {currentChatHistory.slice(-6).map(turn => (
                  <View
                    key={turn.id}
                    style={[
                      styles.chatTurnBubble,
                      turn.speaker === 'player'
                        ? styles.chatTurnPlayer
                        : turn.speaker === 'system'
                        ? styles.chatTurnSystem
                        : styles.chatTurnNpc,
                    ]}>
                    <Text style={styles.chatTurnSpeaker}>
                      {turn.speaker === 'player'
                        ? `👤 ${turn.speakerName}`
                        : turn.speaker === 'system'
                        ? '⚠ SİSTEM BİLDİRİMİ'
                        : `💬 ${turn.speakerName}`}
                    </Text>
                    <Text
                      style={[
                        styles.chatTurnText,
                        turn.speaker === 'system' && styles.chatTurnSystemText,
                      ]}>
                      {turn.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {isSendingNpcMsg && (
              <Text style={styles.typingIndicatorText}>
                {activeNpc.name} yazıyor...
              </Text>
            )}

            {remainingChatsToday > 0 && tokensUsed + NPC_CHAT_TOKEN_COST <= tokenLimit ? (
              <>
                {isFirstMeeting && (
                  <>
                    <Text style={styles.quickPromptsHeading}>
                      İLK TANIŞMA — HAZIR CÜMLELER (dokununca metin alanına yazılır):
                    </Text>
                    <View style={styles.quickPromptsCol}>
                      {firstMeetingPrompts.map(opt => (
                        <TouchableOpacity
                          key={opt.id}
                          accessibilityLabel={opt.label}
                          disabled={isSendingNpcMsg}
                          style={styles.quickPromptBtn}
                          onPress={() => setNpcFreeTextInput(opt.messageText)}>
                          <Text style={styles.quickPromptBtnText}>
                            [{opt.label}]
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <View style={styles.freeChatInputRow}>
                  <TextInput
                    accessibilityLabel="NPC Sohbet Mesajı Yaz"
                    value={npcFreeTextInput}
                    onChangeText={setNpcFreeTextInput}
                    editable={!isSendingNpcMsg}
                    placeholder={
                      isFirstMeeting
                        ? 'Kendini tanıt veya istediğini yaz...'
                        : `${activeNpc.name} ile sohbet et...`
                    }
                    placeholderTextColor={Colors.outline}
                    style={styles.freeChatTextInput}
                  />
                  <TouchableOpacity
                    accessibilityLabel="NPC Mesajını Gönder"
                    disabled={isSendingNpcMsg}
                    style={styles.freeChatSendBtn}
                    onPress={() => handleSendNpcMessage(npcFreeTextInput)}>
                    <Text style={styles.freeChatSendBtnText}>
                      {isSendingNpcMsg ? '...' : 'GÖNDER'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.limitReachedBanner}>
                <Text style={styles.limitReachedText}>
                  🔒{' '}
                  {remainingChatsToday === 0
                    ? `${activeNpc.name} ile bugünkü konuşma hakkın (${DAILY_NPC_CHAT_LIMIT}/${DAILY_NPC_CHAT_LIMIT}) doldu. Token kotanı korumak için diğer mentorlarla konuşabilir veya günü bitirebilirsin.`
                    : 'Günlük AI Token kotan doldu! Yeni güne geçerek kotanı yenileyebilirsin.'}
                </Text>
              </View>
            )}
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

            <View style={styles.activeThemeBadge}>
              <Text style={styles.activeThemeBadgeText}>
                🎨 Zemin: {activeFloorThemeMeta.shortLabel}
              </Text>
            </View>
          </View>

          {/* Sohbetten Zemin / Tema Analizi (design.md Uyarlaması) */}
          <View style={styles.themeAnalysisBox}>
            <Text style={styles.themeAnalysisReason} numberOfLines={2}>
              📄 design.md: {lastThemeAnalysisReason}
            </Text>
            <View style={styles.themeChatRow}>
              <TextInput
                accessibilityLabel="Sohbetten Tema Analizi Mesajı"
                value={chatThemeInput}
                onChangeText={setChatThemeInput}
                placeholder="Zemin temasını uyarla (ör: yeşil matrix / mavi mimari / mor ai / sıcak ahşap)..."
                placeholderTextColor={Colors.outline}
                style={styles.themeChatInput}
              />
              <TouchableOpacity
                accessibilityLabel="Sohbeti Analiz Et ve Zemini Uyarla"
                style={styles.themeChatSendBtn}
                onPress={() => {
                  if (chatThemeInput.trim()) {
                    analyzeChatAndAdaptTheme(chatThemeInput);
                    setChatThemeInput('');
                  }
                }}>
                <Text style={styles.themeChatSendText}>UYARLA</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.themeQuickRow}>
              <TouchableOpacity
                style={styles.themeQuickChip}
                onPress={() =>
                  analyzeChatAndAdaptTheme(
                    'Hızlı terminal ve yeşil matrix zemini seviyorum',
                  )
                }>
                <Text style={styles.themeQuickChipText}>🟢 Matrix</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.themeQuickChip}
                onPress={() =>
                  analyzeChatAndAdaptTheme(
                    'Akademik sistem mimarisi ve mavi blueprint zemin olsun',
                  )
                }>
                <Text style={styles.themeQuickChipText}>🔵 Blueprint</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.themeQuickChip}
                onPress={() =>
                  analyzeChatAndAdaptTheme(
                    'Yapay zeka denetimi ve siber mor neon zemin istiyorum',
                  )
                }>
                <Text style={styles.themeQuickChipText}>🟣 Siber Mor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.themeQuickChip}
                onPress={() =>
                  analyzeChatAndAdaptTheme(
                    'Sıcak ahşap kehribar zemin ve denge odaklı ortam',
                  )
                }>
                <Text style={styles.themeQuickChipText}>🟠 Kehribar</Text>
              </TouchableOpacity>
            </View>
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
                      ? { x: 5, y: 3 }
                      : { x: 5, y: 4 },
                    () => {
                      if (location === 'university') {
                        setSelectedUniNpcId('prof_demir');
                        talkToNpc('prof_demir');
                      } else if (location === 'gym') {
                        talkToNpc('coach_burak');
                      }
                    },
                  )
                }>
                <Text style={styles.quickWalkChipText}>
                  {location === 'dorm'
                    ? '💻 Bilgisayar'
                    : location === 'university'
                    ? '🎓 Prof. Demir'
                    : '🏋️ Koç Burak'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickWalkChip}
                onPress={() => {
                  if (location === 'dorm') {
                    changeLocation('university');
                    setSelectedUniNpcId('kaan_mentor');
                    openNpcChat('kaan_mentor');
                    return;
                  }
                  if (location === 'university') {
                    setSelectedUniNpcId('kaan_mentor');
                    walkToTile({ x: 8, y: 6 }, () => talkToNpc('kaan_mentor'));
                    return;
                  }
                  walkToTile({ x: 5, y: 4 }, () => talkToNpc('coach_burak'));
                }}>
                <Text style={styles.quickWalkChipText}>
                  {location === 'gym' ? '💬 Satış Sohbeti' : '📋 Kaan (Planlama)'}
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
            <Text style={styles.fastActionLabel}>☰ Strateji &amp; Vakalar</Text>
            <View style={styles.taskCountBadge}>
              <Text style={styles.taskCountText}>{pendingTaskCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fastActionPill}
            onPress={() =>
              setStatusBanner(
                `[YETKİNLİKLER] Temeller: ${metrics.kod_okuryazarligi} | Mimari & Planlama: ${metrics.sistem_dusuncesi} | Strateji & Denetim: ${metrics.ai_denetimi} | Sabır & Satış: ${metrics.hata_ayiklama_sabri}`,
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
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#222a3a',
    gap: 8,
  },
  uniNpcSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  uniNpcTabBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#263044',
    alignItems: 'center',
  },
  uniNpcTabBtnActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  uniNpcTabText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  uniNpcTabTextActive: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  dormMentorHintBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#243044',
    gap: 6,
  },
  dormMentorHintTitle: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  dormMentorHintDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
  },
  npcTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  npcPortraitThumbBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  npcPortraitThumb: {
    width: 34,
    height: 34,
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
  npcRoleSubText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 1,
  },
  npcStatsText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
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
  interactiveChatPanel: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#283347',
    gap: 8,
  },
  chatPanelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatPanelTitle: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  chatCloseText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  chatTurnSystem: {
    backgroundColor: 'rgba(255, 180, 0, 0.08)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 180, 0, 0.45)',
    alignSelf: 'center',
    width: '96%',
  },
  chatTurnSystemText: {
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  typingIndicatorText: {
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 10,
    fontStyle: 'italic',
  },
  emptyChatWelcomeBox: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 6,
    padding: 8,
  },
  emptyChatWelcomeText: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 16,
  },
  chatMessagesList: {
    gap: 6,
  },
  chatTurnBubble: {
    borderRadius: 8,
    padding: 8,
    gap: 3,
  },
  chatTurnPlayer: {
    backgroundColor: 'rgba(0, 229, 91, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 91, 0.35)',
    alignSelf: 'flex-end',
    width: '92%',
  },
  chatTurnNpc: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.35)',
    alignSelf: 'flex-start',
    width: '96%',
  },
  chatTurnSpeaker: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  chatTurnText: {
    color: Colors.onSurface,
    fontSize: 11,
    lineHeight: 16,
  },
  quickPromptsHeading: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  quickPromptsCol: {
    gap: 6,
  },
  quickPromptBtn: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  quickPromptBtnText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  freeChatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  freeChatTextInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#33415c',
  },
  freeChatSendBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  freeChatSendBtnText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  limitReachedBanner: {
    backgroundColor: 'rgba(147, 0, 10, 0.25)',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  limitReachedText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
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
  logoutSmallBtn: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutSmallBtnText: {
    color: Colors.error,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  activeThemeBadge: {
    marginLeft: 'auto',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  activeThemeBadgeText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  themeAnalysisBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 6,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1f293b',
    marginTop: 2,
  },
  themeAnalysisReason: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    lineHeight: 13,
  },
  themeChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeChatInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#293246',
  },
  themeChatSendBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 4,
  },
  themeChatSendText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  themeQuickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  themeQuickChip: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#273042',
  },
  themeQuickChipText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
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
