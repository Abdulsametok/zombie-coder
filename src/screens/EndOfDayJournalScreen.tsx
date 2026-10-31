import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { selectJournalQuestionForDay } from '../features/journal/journalEngine';
import { useGame } from '../state/GameContext';
import { Colors } from '../theme/designSystem';

export function EndOfDayJournalScreen(): React.JSX.Element {
  const {
    profile,
    gameDay,
    energy,
    motivation,
    activitiesToday,
    completedTaskIdsToday,
    triggeredTrapToday,
    lastQuestionId,
    journalCompletedForCurrentDay,
    latestEvaluation,
    latestEvaluationSource,
    submitJournalEntry,
    submitJournalEntryAsync,
    confirmAndStartNextDay,
    setActiveScreen,
  } = useGame();

  const question = useMemo(
    () =>
      selectJournalQuestionForDay({
        completedTaskCountToday: completedTaskIdsToday.length,
        triggeredTrapToday,
        lastQuestionId,
      }),
    [completedTaskIdsToday.length, triggeredTrapToday, lastQuestionId],
  );

  const [selectedQuickAnswerId, setSelectedQuickAnswerId] = useState<string>(
    question.quickAnswers[1]?.id || question.quickAnswers[0]?.id,
  );
  const [freeTextNote, setFreeTextNote] = useState<string>('');
  const [guardWarning, setGuardWarning] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const handleAnalyzeJournal = async (skippedDetails: boolean) => {
    setGuardWarning(null);
    setIsEvaluating(true);
    try {
      await submitJournalEntryAsync({
        selectedQuickAnswerId: skippedDetails ? null : selectedQuickAnswerId,
        freeTextNote: skippedDetails ? '' : freeTextNote,
        skippedDetails,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSleepAndNextDay = () => {
    if (!journalCompletedForCurrentDay) {
      // Eğer kullanıcı doğrudan yeşil butona basarsa önce seçili yanıtla günlüğü değerlendirip yeni güne geçirir
      submitJournalEntry({
        selectedQuickAnswerId,
        freeTextNote,
        skippedDetails: false,
      });
    }
    const res = confirmAndStartNextDay();
    if (!res.ok && res.reason) {
      setGuardWarning(res.reason);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      {/* Top Stitch Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.onlineDot} />
          <Text style={styles.headerTitle}>End Of Day Reflection</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.gpaBadge}>
            <Text style={styles.gpaText}>GPA {profile.gpa}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarCircleText}>
              {profile.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 1. Gün Sonu Özeti Kartı */}
        <View style={styles.summaryCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.summaryTitle}>
              ☾ {gameDay}. GÜN SONU ÖZETİ
            </Text>
            <View style={styles.nightBadge}>
              <Text style={styles.nightBadgeText}>23:30 // GECE MODU</Text>
            </View>
          </View>

          <View style={styles.dormBannerBox}>
            <Text style={styles.dormLocationText}>📍 Blok B-402 Dorm</Text>
            <Text style={styles.quietHoursText}>Sessiz Saatler devrede</Text>
          </View>

          <View style={styles.activityList}>
            {activitiesToday.length === 0 ? (
              <View style={styles.activityItem}>
                <Text style={styles.activityCheck}>○</Text>
                <Text style={styles.activityLabel}>
                  Bugün serbest / dinlenme odaklı geçirildi
                </Text>
                <Text style={styles.activityBadge}>DİNLENME</Text>
              </View>
            ) : (
              activitiesToday.map(act => (
                <View key={act.id} style={styles.activityItem}>
                  <Text style={styles.activityCheck}>✓</Text>
                  <Text style={styles.activityLabel}>{act.label}</Text>
                  <Text style={styles.activityBadge}>{act.badge}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.vitalsGrid}>
            <View style={styles.vitalCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.vitalCardLabel}>KALAN ENERJİ</Text>
                <Text style={[styles.vitalCardVal, { color: Colors.error }]}>
                  %{energy}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${energy}%`, backgroundColor: Colors.error },
                  ]}
                />
              </View>
            </View>

            <View style={styles.vitalCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.vitalCardLabel}>MOTİVASYON</Text>
                <Text
                  style={[styles.vitalCardVal, { color: Colors.secondary }]}>
                  %{motivation}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${motivation}%`,
                      backgroundColor: Colors.secondary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 2. Personalzy AI Günlüğü (Zorunlu Değerlendirme) */}
        <View style={styles.journalCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.journalTitle}>◈ PERSONALZY AI GÜNLÜĞÜ</Text>
            <View style={styles.reflexBadge}>
              <Text style={styles.reflexBadgeText}>MODÜL // REFLEKS</Text>
            </View>
          </View>

          <View style={styles.questionBox}>
            <Text style={styles.questionLabel}>💬 GÜNÜN SORUSU</Text>
            <Text style={styles.questionText}>{question.questionText}</Text>
          </View>

          <Text style={styles.subHeaderLabel}>HIZLI YANIT SEÇİMİ</Text>
          <View style={styles.quickAnswerList}>
            {question.quickAnswers.map(qa => {
              const active = qa.id === selectedQuickAnswerId;
              return (
                <TouchableOpacity
                  key={qa.id}
                  style={[
                    styles.quickAnswerBtn,
                    active && styles.quickAnswerBtnActive,
                  ]}
                  onPress={() => {
                    setSelectedQuickAnswerId(qa.id);
                    handleAnalyzeJournal(false);
                  }}>
                  <View style={styles.rowCenterGap}>
                    <View
                      style={[
                        styles.qaDot,
                        active && { backgroundColor: Colors.primaryContainer },
                      ]}
                    />
                    <Text
                      style={[
                        styles.qaLabel,
                        active && styles.qaLabelActive,
                      ]}>
                      {qa.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.qaTag,
                      active && { color: Colors.primaryFixedDim },
                    ]}>
                    {qa.tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Serbest Not */}
          <View style={styles.freeNoteGroup}>
            <View style={styles.rowBetween}>
              <Text style={styles.subHeaderLabel}>SERBEST NOT</Text>
              <Text style={styles.optionalLabel}>İSTEĞE BAĞLI</Text>
            </View>
            <View style={styles.noteInputBox}>
              <Text style={styles.notePrompt}>&gt;_</Text>
              <TextInput
                value={freeTextNote}
                onChangeText={setFreeTextNote}
                placeholder="Kişisel mühendislik notun (isteğe bağlı)..."
                placeholderTextColor={Colors.outline}
                multiline
                style={styles.noteInput}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.evaluateBtn}
            disabled={isEvaluating}
            onPress={() => handleAnalyzeJournal(false)}>
            <Text style={styles.evaluateBtnText}>
              {isEvaluating
                ? '◈ Personalzy AI Günlüğü Analiz Ediyor...'
                : '◈ Günlüğü Personalzy ile Değerlendir'}
            </Text>
          </TouchableOpacity>

          {/* Zorunlu Günlük İçin Minimum Değerlendirme / Paylaşmama Seçeneği (plan.md Bölüm 3.2) */}
          <TouchableOpacity
            accessibilityLabel="Bugün paylaşmak istemiyorum"
            style={styles.skipDetailsBtn}
            onPress={() => handleAnalyzeJournal(true)}>
            <Text style={styles.skipDetailsText}>
              Bugün paylaşmak istemiyorum (Minimum değerlendirme ile uyu)
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Personalzy Değerlendirmesi Kartı (`agent.md` çıktısı) */}
        {latestEvaluation && (
          <View style={styles.evaluationCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.evalHeader}>
                🤖 PERSONALZY DEĞERLENDİRMESİ
              </Text>
              <View style={styles.reflexBadge}>
                <Text style={styles.reflexBadgeText}>
                  {latestEvaluationSource === 'gemini_live'
                    ? 'GEMINI LIVE'
                    : 'DOĞRULANMIŞ ŞABLON'}
                </Text>
              </View>
            </View>

            <View style={styles.evalQuoteBox}>
              <Text style={styles.evalQuoteText}>
                “{latestEvaluation.oyuncuya_mesaj}”
              </Text>
              <Text style={styles.evalSignature}>
                — Mentor Personalzy v2.4
              </Text>
            </View>

            <Text style={styles.subHeaderLabel}>STAT DEĞİŞİMLERİ</Text>
            <View style={styles.statDeltaGrid}>
              <View style={styles.statDeltaChip}>
                <Text style={styles.statDeltaVal}>
                  +{latestEvaluation.metrik_degisimleri.kod_okuryazarligi}{' '}
                  OKURYAZARLIK
                </Text>
                <Text style={styles.statDeltaSub}>Code Literacy</Text>
              </View>
              <View style={styles.statDeltaChip}>
                <Text
                  style={[styles.statDeltaVal, { color: Colors.secondary }]}>
                  +{latestEvaluation.metrik_degisimleri.ai_denetimi} AI DENETİM
                </Text>
                <Text style={styles.statDeltaSub}>AI Auditing</Text>
              </View>
            </View>

            <View style={styles.nextTaskBox}>
              <Text style={styles.nextTaskHeader}>
                ⚑ ERTESİ GÜN GÖREV ÖNERİSİ (AGENT.MD)
              </Text>
              <Text style={styles.nextTaskTitle}>
                {latestEvaluation.ertesi_gun_remediasyon_gorevi.gorev_adi}
              </Text>
              <Text style={styles.nextTaskDesc}>
                {latestEvaluation.ertesi_gun_remediasyon_gorevi.aciklama} (NPC:{' '}
                {latestEvaluation.ertesi_gun_remediasyon_gorevi.gorevi_veren_npc}
                )
              </Text>
            </View>
          </View>
        )}

        {guardWarning && (
          <Text style={styles.guardWarningText}>{guardWarning}</Text>
        )}

        {/* 4. Onayla ve Yeni Güne Başla */}
        <TouchableOpacity
          accessibilityLabel="Onayla ve Yeni Güne Başla"
          style={[
            styles.sleepBtn,
            !journalCompletedForCurrentDay && styles.sleepBtnPending,
          ]}
          onPress={handleSleepAndNextDay}>
          <Text style={styles.sleepBtnText}>
            🛏 Onayla ve {gameDay + 1}. Güne Başla (Uyu & Dinlen)
          </Text>
        </TouchableOpacity>

        <Text style={styles.syncFooterText}>
          Veriler yerel zombiedb'ye kaydedilecek // Otomatik Senkronizasyon
        </Text>
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
          <Text style={styles.navLabel}>&gt;_ OS DECK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen('end_of_day_journal')}>
          <Text style={[styles.navLabel, styles.navLabelActive]}>☾ DORM</Text>
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
    paddingBottom: 28,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenterGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#222a3a',
  },
  summaryTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
  },
  nightBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  nightBadgeText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  dormBannerBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  dormLocationText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  quietHoursText: {
    color: Colors.primaryFixedDim,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  activityList: {
    gap: 6,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  activityCheck: {
    color: Colors.primaryContainer,
    fontWeight: '700',
  },
  activityLabel: {
    flex: 1,
    color: Colors.onSurface,
    fontSize: 12,
  },
  activityBadge: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    padding: 8,
    borderRadius: 6,
    gap: 5,
  },
  vitalCardLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  vitalCardVal: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  journalCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#252d3d',
  },
  journalTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
  },
  reflexBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reflexBadgeText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  questionBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  questionLabel: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  questionText: {
    color: Colors.onSurface,
    fontSize: 13,
    lineHeight: 19,
  },
  subHeaderLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  optionalLabel: {
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  quickAnswerList: {
    gap: 6,
  },
  quickAnswerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickAnswerBtnActive: {
    borderColor: Colors.primaryContainer,
  },
  qaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  qaLabel: {
    color: Colors.onSurface,
    fontSize: 12,
  },
  qaLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  freeNoteGroup: {
    gap: 6,
  },
  qaTag: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  noteInputBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  notePrompt: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  noteInput: {
    flex: 1,
    color: Colors.onSurface,
    fontSize: 12,
    minHeight: 42,
    textAlignVertical: 'top',
  },
  evaluateBtn: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  evaluateBtnText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  skipDetailsBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  skipDetailsText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  evaluationCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  evalHeader: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  evalQuoteBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  evalQuoteText: {
    color: Colors.onSurface,
    fontSize: 12,
    lineHeight: 18,
  },
  evalSignature: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
  },
  statDeltaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statDeltaChip: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 6,
    padding: 8,
  },
  statDeltaVal: {
    color: Colors.primaryFixedDim,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  statDeltaSub: {
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  nextTaskBox: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  nextTaskHeader: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  nextTaskTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  nextTaskDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  guardWarningText: {
    color: Colors.error,
    fontFamily: 'monospace',
    fontSize: 11,
    textAlign: 'center',
  },
  sleepBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepBtnPending: {
    opacity: 0.92,
  },
  sleepBtnText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  syncFooterText: {
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 9,
    textAlign: 'center',
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
