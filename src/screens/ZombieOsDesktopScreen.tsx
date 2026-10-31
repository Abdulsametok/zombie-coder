import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WorkspaceFolderId } from '../features/tasks/taskCatalog';
import { getCurriculumForYear } from '../features/curriculum/curriculumRoadmap';
import { useGame } from '../state/GameContext';
import { Colors } from '../theme/designSystem';

export function ZombieOsDesktopScreen(): React.JSX.Element {
  const {
    profile,
    formattedClock,
    tasks,
    taskStatuses,
    selectedTaskId,
    verifiedPreferences,
    openQuestions,
    metrics,
    setActiveScreen,
    selectTaskForAudit,
    clearCurrentPlayerMemory,
  } = useGame();

  const [selectedFolder, setSelectedFolder] =
    useState<WorkspaceFolderId | null>(null);
  const [selectedCurriculumYear, setSelectedCurriculumYear] = useState<
    1 | 2 | 3 | 4
  >(profile.grade);

  const yearModules = getCurriculumForYear(selectedCurriculumYear);

  const activeTask =
    tasks.find(t => {
      if (selectedFolder && selectedFolder !== 'ai_memory') {
        return t.folder === selectedFolder;
      }
      return t.id === selectedTaskId;
    }) || tasks[0];

  const activeTaskStatus = taskStatuses[activeTask.id] || 'available';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      {/* Top Stitch Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.onlineDot} />
          <Text style={styles.headerTitle}>In Game ZombieOS Desktop</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.gpaBadge}>
            <Text style={styles.gpaText}>GPA {profile.gpa}</Text>
          </View>
          <TouchableOpacity
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
        {/* ZombieOS Simulated System Bar */}
        <View style={styles.osSystemBar}>
          <View style={styles.osSystemLeft}>
            <View style={styles.greenPing} />
            <View>
              <Text style={styles.osVersionText}>ZombieOS v2.4</Text>
              <Text style={styles.osSubText}>
                [ÖĞRENCİ SÜRÜMÜ // DORM-NET]
              </Text>
            </View>
          </View>

          <View style={styles.osSystemRight}>
            <Text style={styles.osClockText}>{formattedClock}</Text>
            <TouchableOpacity
              accessibilityLabel="Bilgisayardan Kalk"
              style={styles.leaveBtn}
              onPress={() => setActiveScreen('world_hud')}>
              <Text style={styles.leaveBtnIcon}>⇥</Text>
              <Text style={styles.leaveBtnText}>Kalk</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive 2x2 Desktop Folders Grid */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionMetaLabel}>
              [SYS.FS // MASAÜSTÜ DİZİNİ]
            </Text>
            <Text style={styles.sectionCountLabel}>4 ÖĞE BULUNDU</Text>
          </View>

          <View style={styles.folderGrid}>
            {/* Folder 1: Üniversite */}
            <TouchableOpacity
              style={[
                styles.folderCard,
                selectedFolder === 'university' && styles.folderCardSelected,
              ]}
              onPress={() =>
                setSelectedFolder(
                  selectedFolder === 'university' ? null : 'university',
                )
              }>
              <View style={styles.folderTopRow}>
                <View style={styles.folderIconBox}>
                  <Text style={[styles.folderIcon, { color: Colors.secondary }]}>
                    📁
                  </Text>
                </View>
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentBadgeText}>! ÖDEV</Text>
                </View>
              </View>
              <View>
                <Text style={styles.folderTitle}>Üniversite</Text>
                <Text
                  style={[styles.folderSub, { color: Colors.secondary }]}
                  numberOfLines={1}>
                  BMB101 & BMB201
                </Text>
                <Text style={styles.folderDesc} numberOfLines={1}>
                  Quizler & Laboratuvar
                </Text>
              </View>
            </TouchableOpacity>

            {/* Folder 2: Projelerim */}
            <TouchableOpacity
              style={[
                styles.folderCard,
                selectedFolder === 'my_projects' && styles.folderCardSelected,
              ]}
              onPress={() =>
                setSelectedFolder(
                  selectedFolder === 'my_projects' ? null : 'my_projects',
                )
              }>
              <View style={styles.folderTopRow}>
                <View style={styles.folderIconBox}>
                  <Text
                    style={[
                      styles.folderIcon,
                      { color: Colors.primaryContainer },
                    ]}>
                    &gt;_
                  </Text>
                </View>
                <View style={styles.versionBadge}>
                  <Text style={styles.versionBadgeText}>v0.3b</Text>
                </View>
              </View>
              <View>
                <Text style={styles.folderTitle}>Projelerim</Text>
                <Text
                  style={[styles.folderSub, { color: Colors.primaryFixedDim }]}
                  numberOfLines={1}>
                  Terminal Rogue
                </Text>
                <Text style={styles.folderDesc} numberOfLines={1}>
                  Mini Indie Simülasyonu
                </Text>
              </View>
            </TouchableOpacity>

            {/* Folder 3: Zombie Projeleri */}
            <TouchableOpacity
              style={[
                styles.folderCard,
                selectedFolder === 'zombie_projects' &&
                  styles.folderCardSelected,
              ]}
              onPress={() =>
                setSelectedFolder(
                  selectedFolder === 'zombie_projects'
                    ? null
                    : 'zombie_projects',
                )
              }>
              <View style={styles.folderTopRow}>
                <View style={styles.folderIconBox}>
                  <Text style={[styles.folderIcon, { color: Colors.error }]}>
                    ☠
                  </Text>
                </View>
                <View style={styles.bugBadge}>
                  <Text style={styles.bugBadgeText}>99+ BUG</Text>
                </View>
              </View>
              <View>
                <Text style={[styles.folderTitle, { color: Colors.error }]}>
                  Zombie Projeleri
                </Text>
                <Text
                  style={[styles.folderSub, { color: Colors.onErrorContainer }]}
                  numberOfLines={1}>
                  Legacy Auth Servisi
                </Text>
                <Text style={styles.folderDesc} numberOfLines={1}>
                  Zehirli Monolit Kod
                </Text>
              </View>
            </TouchableOpacity>

            {/* Folder 4: AI Hafızası */}
            <TouchableOpacity
              style={[
                styles.folderCard,
                selectedFolder === 'ai_memory' && styles.folderCardSelected,
              ]}
              onPress={() =>
                setSelectedFolder(
                  selectedFolder === 'ai_memory' ? null : 'ai_memory',
                )
              }>
              <View style={styles.folderTopRow}>
                <View style={styles.folderIconBox}>
                  <Text
                    style={[
                      styles.folderIcon,
                      { color: Colors.secondaryFixed },
                    ]}>
                    ◈
                  </Text>
                </View>
                <View style={styles.syncedBadge}>
                  <Text style={styles.syncedBadgeText}>SYNCED</Text>
                </View>
              </View>
              <View>
                <Text style={styles.folderTitle}>AI Hafızası</Text>
                <Text
                  style={[styles.folderSub, { color: Colors.secondary }]}
                  numberOfLines={1}>
                  design.md Modülü
                </Text>
                <Text style={styles.folderDesc} numberOfLines={1}>
                  Aktif Öğrenci Kararları
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Engineering Task Card */}
        <View style={styles.activeTaskCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.rowCenterGap}>
              <View style={styles.cyanDot} />
              <Text style={styles.activeTaskHeaderLabel}>
                AKTİF MÜHENDİSLİK GÖREVİ
              </Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>
                {activeTask.difficulty}
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.activeTaskTitle}>{activeTask.title}</Text>
            <Text style={styles.activeTaskDesc}>
              {activeTask.warningBody}
            </Text>
          </View>

          {/* Task Switcher Pills (3 Görev Türü Arasında Hızlı Seçim) */}
          <View style={styles.taskSelectorRow}>
            {tasks.map(t => {
              const isSelected = t.id === activeTask.id;
              const st = taskStatuses[t.id] || 'available';
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.taskSwitchPill,
                    isSelected && styles.taskSwitchPillActive,
                  ]}
                  onPress={() => {
                    setSelectedFolder(null);
                    selectTaskForAudit(t.id);
                  }}>
                  <Text
                    style={[
                      styles.taskSwitchText,
                      isSelected && styles.taskSwitchTextActive,
                    ]}>
                    {t.fileName} {st === 'completed' ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.taskMetaBar}>
            <Text style={styles.taskTimeText}>
              ◷ Tahmini: {activeTask.estimatedMinutes} dk oyun içi
            </Text>
            <View style={styles.rowCenterGap}>
              <Text style={styles.zorlukLabel}>ZORLUK</Text>
              <View style={styles.zorlukBars}>
                {[1, 2, 3].map(lvl => (
                  <View
                    key={lvl}
                    style={[
                      styles.zorlukBarPip,
                      {
                        backgroundColor:
                          lvl <= activeTask.difficultyLevel
                            ? Colors.primaryContainer
                            : Colors.surfaceContainerHighest,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            accessibilityLabel="Kod İncelemesini Başlat"
            style={styles.startReviewBtn}
            onPress={() => selectTaskForAudit(activeTask.id)}>
            <Text style={styles.startReviewBtnText}>
              &lt;/&gt;{' '}
              {activeTaskStatus === 'completed'
                ? 'KOD İNCELEMESİNİ TEKRAR GÖR'
                : 'KOD İNCELEMESİNİ BAŞLAT'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* design.md Preview & AI Memory Card */}
        <View style={styles.designMdCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.designMdTitle}>
              📄 DESIGN.MD ÖNİZLEME & AI BELLEĞİ
            </Text>
            <Text style={styles.designMdVer}>v1.1</Text>
          </View>

          <Text style={styles.sectionMetaLabel}>DOĞRULANAN TERCİHLER:</Text>
          <View style={styles.prefChipsWrap}>
            {verifiedPreferences.map((pref, idx) => (
              <View key={idx} style={styles.prefChip}>
                <Text style={styles.prefCheck}>✓</Text>
                <Text style={styles.prefText}>{pref}</Text>
              </View>
            ))}
          </View>

          {/* Gizli Personalzy Mühendislik Metrikleri Özeti */}
          <View style={styles.metricsMiniGrid}>
            <Text style={styles.metricMiniItem}>
              Sistem Düşüncesi: {metrics.sistem_dusuncesi}
            </Text>
            <Text style={styles.metricMiniItem}>
              Kod Okuryazarlığı: {metrics.kod_okuryazarligi}
            </Text>
            <Text style={styles.metricMiniItem}>
              AI Denetimi: {metrics.ai_denetimi}
            </Text>
            <Text style={styles.metricMiniItem}>
              Hata Sabrı: {metrics.hata_ayiklama_sabri}
            </Text>
          </View>

          <View style={styles.openRiskBox}>
            <Text style={styles.riskIcon}>⚠</Text>
            <View style={styles.flexOne}>
              <Text style={styles.riskHeader}>AÇIK SORULAR & RİSKLER:</Text>
              <Text style={styles.riskBody}>
                “{openQuestions[0] || 'Henüz açık risk kaydı yok.'}”
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityLabel="Hafızayı Sıfırla"
            style={styles.clearMemoryBtn}
            onPress={clearCurrentPlayerMemory}>
            <Text style={styles.clearMemoryBtnText}>
              🗑 AI Hafızasını & Tercihleri Sıfırla (Gizlilik Kontrolü)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Faz 8: 4 Yıllık Müfredat Haritası (G1.1 – G8.2) */}
        <View style={styles.curriculumCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.designMdTitle}>
              🎓 4 YILLIK MÜFREDAT YOL HARİTASI (G1.1–G8.2)
            </Text>
            <Text style={styles.designMdVer}>{selectedCurriculumYear}. SINIF</Text>
          </View>

          <View style={styles.yearTabsRow}>
            {([1, 2, 3, 4] as const).map(yr => (
              <TouchableOpacity
                key={yr}
                style={[
                  styles.yearTabBtn,
                  selectedCurriculumYear === yr && styles.yearTabBtnActive,
                ]}
                onPress={() => setSelectedCurriculumYear(yr)}>
                <Text
                  style={[
                    styles.yearTabText,
                    selectedCurriculumYear === yr && styles.yearTabTextActive,
                  ]}>
                  {yr}. Sınıf
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {yearModules.map(mod => {
            const linkedTask = mod.linkedTaskId
              ? tasks.find(t => t.id === mod.linkedTaskId)
              : undefined;
            const st = mod.linkedTaskId
              ? taskStatuses[mod.linkedTaskId]
              : undefined;

            return (
              <View key={mod.code} style={styles.curriculumItemRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.curriculumCodeTitle}>
                    [{mod.code}] {mod.title} ({mod.semesterLabel})
                  </Text>
                  <Text style={styles.curriculumTrapText}>
                    ☠ Zombie Trap: {mod.zombieTrapName}
                  </Text>
                </View>
                {linkedTask && (
                  <TouchableOpacity
                    style={styles.curriculumOpenBtn}
                    onPress={() => selectTaskForAudit(linkedTask.id)}>
                    <Text style={styles.curriculumOpenBtnText}>
                      {st === 'completed' ? '✓ ÇÖZÜLDÜ' : 'DENETLE'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen('world_hud')}>
          <Text style={styles.navLabel}>▣ CAMPUS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen('zombie_os')}>
          <Text style={[styles.navLabel, styles.navLabelActive]}>
            &gt;_ OS DECK
          </Text>
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
  flexOne: {
    flex: 1,
  },
  headerBar: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1c2230',
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
    padding: 14,
    gap: 14,
    paddingBottom: 24,
  },
  osSystemBar: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  osSystemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenPing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryContainer,
  },
  osVersionText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  osSubText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  osSystemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  osClockText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    gap: 4,
  },
  leaveBtnIcon: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  leaveBtnText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionMetaLabel: {
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionCountLabel: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  folderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  folderCard: {
    width: '48.2%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 12,
    height: 124,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  folderCardSelected: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  folderTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  folderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  urgentBadge: {
    backgroundColor: Colors.errorContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentBadgeText: {
    color: Colors.onErrorContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  versionBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  versionBadgeText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  bugBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bugBadgeText: {
    color: Colors.onError,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  syncedBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  syncedBadgeText: {
    color: Colors.secondaryFixed,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  folderTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
  },
  folderSub: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  folderDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  activeTaskCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#222a3a',
  },
  rowCenterGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  activeTaskHeaderLabel: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  difficultyBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyBadgeText: {
    color: Colors.primaryFixedDim,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  activeTaskTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 17,
    fontWeight: '700',
  },
  activeTaskDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  taskSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  taskSwitchPill: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2a3042',
  },
  taskSwitchPillActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  taskSwitchText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  taskSwitchTextActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  taskMetaBar: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTimeText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  zorlukLabel: {
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  zorlukBars: {
    flexDirection: 'row',
    gap: 3,
  },
  zorlukBarPip: {
    width: 6,
    height: 12,
    borderRadius: 2,
  },
  startReviewBtn: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startReviewBtnText: {
    color: Colors.onSecondaryContainer,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  designMdCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#222a3a',
  },
  designMdTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  designMdVer: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  prefChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prefChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  prefCheck: {
    color: Colors.primaryContainer,
    fontSize: 11,
    fontWeight: '700',
  },
  prefText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  metricsMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 8,
    borderRadius: 6,
  },
  metricMiniItem: {
    width: '48%',
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  openRiskBox: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  riskIcon: {
    color: Colors.error,
    fontSize: 15,
  },
  riskHeader: {
    color: Colors.error,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  riskBody: {
    color: Colors.onSurface,
    fontSize: 12,
    marginTop: 2,
  },
  clearMemoryBtn: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a242b',
  },
  clearMemoryBtnText: {
    color: Colors.onErrorContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  curriculumCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#222a3a',
  },
  yearTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  yearTabBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  yearTabBtnActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  yearTabText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  yearTabTextActive: {
    color: Colors.primaryContainer,
  },
  curriculumItemRow: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  curriculumCodeTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  curriculumTrapText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 2,
  },
  curriculumOpenBtn: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  curriculumOpenBtnText: {
    color: Colors.onSecondaryContainer,
    fontFamily: 'monospace',
    fontSize: 9,
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
