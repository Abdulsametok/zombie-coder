import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UNIVERSITY_LECTURES } from '../features/curriculum/lectureCatalog';
import { useGame } from '../state/GameContext';
import { Colors } from '../theme/designSystem';

export function ZombieOsDesktopScreen(): React.JSX.Element {
  const {
    profile,
    formattedClock,
    activeHomework,
    completedLectureOrders,
    examResults,
    metrics,
    verifiedPreferences,
    openQuestions,
    setActiveScreen,
    changeLocation,
    submitHomeworkSolution,
    clearCurrentPlayerMemory,
  } = useGame();

  // Selected option for active homework
  const currentLecture = activeHomework
    ? UNIVERSITY_LECTURES.find(l => l.orderNumber === activeHomework.lectureOrder)
    : null;
  const homeworkOptions = currentLecture?.homework.options || [];

  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    activeHomework?.selectedOptionId || (homeworkOptions[0]?.id ?? ''),
  );

  const [lastSubmissionFeedback, setLastSubmissionFeedback] = useState<string | null>(
    activeHomework?.selectedOptionFeedback || null,
  );

  const isHomeworkCompleted = activeHomework?.status === 'completed';

  const handleHomeworkSubmit = () => {
    if (!selectedOptionId) {
      Alert.alert('Seçim Yapılmadı', 'Lütfen bir mühendislik çözüm yaklaşımı seçin.');
      return;
    }
    const res = submitHomeworkSolution(selectedOptionId);
    setLastSubmissionFeedback(res.feedback);
  };

  const handleGoToCampusClass = () => {
    changeLocation('university');
    setActiveScreen('classroom_lecture');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      {/* Top Header */}
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

        {/* 1. ÜNİVERSİTE DERSİ & ÖDEV ÇALIŞMA ALANI */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionMetaLabel}>
              [DERS &amp; ÖDEV MODÜLÜ // PROF. DEMİR]
            </Text>
            <View
              style={[
                styles.hwStatusBadge,
                isHomeworkCompleted
                  ? styles.hwStatusBadgeSuccess
                  : activeHomework
                  ? styles.hwStatusBadgeWarning
                  : styles.hwStatusBadgeNeutral,
              ]}>
              <Text
                style={[
                  styles.hwStatusBadgeText,
                  isHomeworkCompleted
                    ? styles.hwStatusBadgeTextSuccess
                    : activeHomework
                    ? styles.hwStatusBadgeTextWarning
                    : styles.hwStatusBadgeTextNeutral,
                ]}>
                {isHomeworkCompleted
                  ? '✓ TESLİM EDİLDİ'
                  : activeHomework
                  ? 'BEKLİYOR (TESLİM EDİLMEDİ)'
                  : 'ÖDEV YOK'}
              </Text>
            </View>
          </View>

          {activeHomework ? (
            <View style={styles.activeHwCard}>
              <Text style={styles.hwTitle}>{activeHomework.title}</Text>

              {/* İşlenen Konu / Sorun */}
              <View style={styles.hwFieldBlock}>
                <Text style={styles.hwFieldLabel}>📌 İŞLENEN KONU / SORUN:</Text>
                <Text style={styles.hwFieldValue}>
                  {activeHomework.problemStatement}
                </Text>
              </View>

              {/* Hedeflenen Mühendislik Çıktısı */}
              <View style={styles.hwFieldBlock}>
                <Text style={styles.hwFieldLabel}>
                  🎯 HEDEFLENEN MÜHENDİSLİK ÇIKTISI:
                </Text>
                <Text style={styles.hwFieldValue}>
                  {activeHomework.targetOutput}
                </Text>
              </View>

              {/* Çözüm Seçenekleri */}
              {homeworkOptions.length > 0 && (
                <View style={styles.hwOptionsContainer}>
                  <Text style={styles.hwOptionsHeader}>
                    MÜHENDİSLİK ÇÖZÜM YAKLAŞIMI SEÇİN:
                  </Text>
                  {homeworkOptions.map(opt => {
                    const isSelected =
                      (selectedOptionId || homeworkOptions[0].id) === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        disabled={isHomeworkCompleted}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                        ]}
                        onPress={() => setSelectedOptionId(opt.id)}>
                        <View style={styles.optionHeaderRow}>
                          <View
                            style={[
                              styles.radioDot,
                              isSelected && styles.radioDotSelected,
                            ]}
                          />
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                            ]}>
                            {opt.label}
                          </Text>
                        </View>
                        <Text style={styles.optionDescription}>
                          {opt.description}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {!isHomeworkCompleted ? (
                    <TouchableOpacity
                      style={styles.submitHwBtn}
                      onPress={handleHomeworkSubmit}>
                      <Text style={styles.submitHwBtnText}>
                        Ödev Çözümünü Kaydet &amp; Teslim Et
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.submissionSummaryBox}>
                      <Text style={styles.submissionSummaryTitle}>
                        ✅ ÖDEVİNİZ BAŞARIYLA TESLİM EDİLDİ
                      </Text>
                      <Text style={styles.submissionSummaryText}>
                        {lastSubmissionFeedback ||
                          activeHomework.selectedOptionFeedback ||
                          'Çözümünüz kaydedildi. Prof. Demir yarın amfide derse başladığınızda ödevinizi denetleyecek.'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noHwCard}>
              <Text style={styles.noHwIcon}>🎓</Text>
              <Text style={styles.noHwTitle}>Bekleyen Ödeviniz Bulunmuyor</Text>
              <Text style={styles.noHwDesc}>
                Tüm ders ödevleriniz güncel. Kampüsteki amfiye gidip ders tahtasından yeni derse katılabilirsiniz.
              </Text>
              <TouchableOpacity
                style={styles.goToLectureBtn}
                onPress={handleGoToCampusClass}>
                <Text style={styles.goToLectureBtnText}>
                  Kampüse Git &amp; Derse Başla →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 2. AKADEMİK SİCİL & VİZE DURUMU */}
        <View style={styles.academicCard}>
          <Text style={styles.academicCardHeader}>
            AKADEMİK İLERLEME &amp; SINAV BİLGİSİ
          </Text>
          <View style={styles.academicRow}>
            <View style={styles.academicItem}>
              <Text style={styles.academicItemLabel}>Tamamlanan Dersler</Text>
              <Text style={styles.academicItemVal}>
                {completedLectureOrders.length} / 5 Ders
              </Text>
            </View>
            <View style={styles.academicItem}>
              <Text style={styles.academicItemLabel}>1. Dönem Vizesi</Text>
              <Text
                style={[
                  styles.academicItemVal,
                  examResults[1]?.passed
                    ? styles.valSuccess
                    : completedLectureOrders.length >= 5
                    ? styles.valWarning
                    : styles.valMuted,
                ]}>
                {examResults[1]?.passed
                  ? `GEÇTİ (%${examResults[1].score})`
                  : completedLectureOrders.length >= 5
                  ? 'SINAV HAZIR!'
                  : '5. Dersten Sonra'}
              </Text>
            </View>
          </View>

          {/* Gizli Personalzy Mühendislik Metrikleri */}
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
        </View>

        {/* 3. DESIGN.MD & SİSTEM TERCİHLERİ (Sadeleştirilmiş) */}
        <View style={styles.designMdCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.designMdTitle}>
              📄 DESIGN.MD &amp; SİSTEM TERCİHLERİ
            </Text>
            <Text style={styles.designMdVer}>v2.4</Text>
          </View>

          <View style={styles.prefChipsWrap}>
            {verifiedPreferences.map((pref, idx) => (
              <View key={idx} style={styles.prefChip}>
                <Text style={styles.prefCheck}>✓</Text>
                <Text style={styles.prefText}>{pref}</Text>
              </View>
            ))}
          </View>

          <View style={styles.openRiskBox}>
            <Text style={styles.riskIcon}>⚠</Text>
            <View style={styles.flexOne}>
              <Text style={styles.riskHeader}>AÇIK SORULAR &amp; RİSKLER:</Text>
              <Text style={styles.riskBody}>
                “{openQuestions[0] || 'Henüz açık mimari risk kaydı yok.'}”
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityLabel="Hafızayı Sıfırla"
            style={styles.clearMemoryBtn}
            onPress={clearCurrentPlayerMemory}>
            <Text style={styles.clearMemoryBtnText}>
              🗑 AI Hafızasını &amp; Tercihleri Sıfırla (Gizlilik Kontrolü)
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceContainer,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryContainer,
  },
  headerTitle: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gpaBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  gpaText: {
    color: Colors.primaryFixedDim,
    fontSize: 11,
    fontWeight: '800',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleText: {
    color: Colors.onPrimaryContainer,
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
    gap: 14,
  },
  osSystemBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  osSystemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greenPing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  osVersionText: {
    color: Colors.onSurface,
    fontSize: 12,
    fontWeight: '800',
  },
  osSubText: {
    color: Colors.outline,
    fontSize: 10,
  },
  osSystemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  osClockText: {
    color: Colors.primaryFixedDim,
    fontSize: 12,
    fontWeight: '700',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    gap: 4,
  },
  leaveBtnIcon: {
    color: Colors.error,
    fontSize: 12,
  },
  leaveBtnText: {
    color: Colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
  },

  // Section
  sectionBlock: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionMetaLabel: {
    color: Colors.outline,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hwStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hwStatusBadgeSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  hwStatusBadgeWarning: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  hwStatusBadgeNeutral: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  hwStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hwStatusBadgeTextSuccess: {
    color: '#81c784',
  },
  hwStatusBadgeTextWarning: {
    color: '#ffb74d',
  },
  hwStatusBadgeTextNeutral: {
    color: Colors.outline,
  },

  // Active Homework Card
  activeHwCard: {
    gap: 12,
  },
  hwTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  hwFieldBlock: {
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  hwFieldLabel: {
    color: Colors.primaryFixedDim,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  hwFieldValue: {
    color: Colors.onSurface,
    fontSize: 13,
    lineHeight: 19,
  },
  hwOptionsContainer: {
    gap: 10,
    marginTop: 4,
  },
  hwOptionsHeader: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  optionCard: {
    backgroundColor: Colors.surfaceContainerHighest,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(56, 142, 60, 0.15)',
    borderColor: '#4caf50',
  },
  optionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.outline,
  },
  radioDotSelected: {
    borderColor: '#4caf50',
    backgroundColor: '#4caf50',
  },
  optionLabel: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  optionLabelSelected: {
    color: '#a5d6a7',
  },
  optionDescription: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    paddingLeft: 22,
  },
  submitHwBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  submitHwBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  submissionSummaryBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4caf50',
    marginTop: 6,
  },
  submissionSummaryTitle: {
    color: '#81c784',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  submissionSummaryText: {
    color: '#e8f5e9',
    fontSize: 12,
    lineHeight: 18,
  },

  // No Homework
  noHwCard: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noHwIcon: {
    fontSize: 32,
  },
  noHwTitle: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  noHwDesc: {
    color: Colors.outline,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  goToLectureBtn: {
    backgroundColor: '#1b3820',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a6642',
    marginTop: 8,
  },
  goToLectureBtnText: {
    color: '#a3e4b7',
    fontSize: 12,
    fontWeight: '700',
  },

  // Academic Card
  academicCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    gap: 12,
  },
  academicCardHeader: {
    color: Colors.outline,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  academicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  academicItem: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  academicItemLabel: {
    color: Colors.outline,
    fontSize: 10,
    fontWeight: '700',
  },
  academicItemVal: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  valSuccess: {
    color: '#81c784',
  },
  valWarning: {
    color: '#ffb74d',
  },
  valMuted: {
    color: Colors.outline,
  },
  metricsMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  metricMiniItem: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // design.md Card
  designMdCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    gap: 10,
  },
  designMdTitle: {
    color: Colors.onSurface,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  designMdVer: {
    color: Colors.outline,
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
    borderRadius: 6,
    gap: 4,
  },
  prefCheck: {
    color: Colors.primaryContainer,
    fontSize: 10,
    fontWeight: '800',
  },
  prefText: {
    color: Colors.onSurface,
    fontSize: 11,
  },
  openRiskBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 10,
    borderRadius: 8,
    gap: 8,
    alignItems: 'flex-start',
  },
  riskIcon: {
    color: Colors.error,
    fontSize: 14,
  },
  riskHeader: {
    color: Colors.error,
    fontSize: 10,
    fontWeight: '800',
  },
  riskBody: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  clearMemoryBtn: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginTop: 4,
  },
  clearMemoryBtnText: {
    color: Colors.outline,
    fontSize: 10,
    fontWeight: '700',
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    color: Colors.outline,
    fontSize: 11,
    fontWeight: '700',
  },
  navLabelActive: {
    color: Colors.primaryContainer,
  },
});
