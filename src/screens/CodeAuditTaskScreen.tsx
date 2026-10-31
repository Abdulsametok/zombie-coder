import React, { useState } from 'react';
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
import { useGame } from '../state/GameContext';
import { Colors } from '../theme/designSystem';

export function CodeAuditTaskScreen(): React.JSX.Element {
  const {
    profile,
    energy,
    tasks,
    selectedTaskId,
    taskStatuses,
    leaveTaskAudit,
    submitEngineeringDecision,
    setActiveScreen,
  } = useGame();

  const task = tasks.find(t => t.id === selectedTaskId) || tasks[0];
  const isCompleted = taskStatuses[task.id] === 'completed';

  // Kopya vermemek için varsayılan olarak ilk seçeneği (tarafsız) seçili başlatıyoruz
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>(
    task.decisions[0].id,
  );
  const [customStrategyNote, setCustomStrategyNote] = useState<string>('');
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    title: string;
    message: string;
    isTrap: boolean;
  } | null>(null);

  const handleSubmit = () => {
    const result = submitEngineeringDecision(
      task.id,
      selectedDecisionId,
      customStrategyNote,
    );
    setSubmissionFeedback(result);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      {/* Top Stitch Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            accessibilityLabel="Görevden Çık"
            onPress={leaveTaskAudit}
            style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Mimari, Planlama &amp; Satış Stratejisi
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.debugBadge}>
            <Text style={styles.debugBadgeText}>STRATEJİ_MODU</Text>
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
        {/* Status Vitals Micro-Bar */}
        <View style={styles.vitalsMicroBar}>
          <Text style={styles.vitalItemText}>
            ⚡ ENERJİ: <Text style={styles.energyValueText}>{energy}%</Text>
          </Text>
          <Text style={styles.vitalItemText}>
            ◈ ODAK: <Text style={{ color: Colors.secondary }}>■■■□</Text>
          </Text>
          <Text style={[styles.vitalItemText, { color: Colors.secondary }]}>
            ◷ SÜRE: {task.estimatedMinutes}:00
          </Text>
        </View>

        {/* Task Header & Acceptance Criteria Card */}
        <View style={styles.taskCard}>
          <View style={styles.rowBetween}>
            <View style={styles.flexOne}>
              <Text style={styles.missionTag}>{task.missionTag}</Text>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskSub}>{task.moduleSubtitle}</Text>
            </View>
            <View style={styles.npcBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.npcBadgeText}>{task.npcSender}</Text>
            </View>
          </View>

          <View style={styles.npcQuoteBox}>
            <Text style={styles.npcCourseLabel}>{task.courseLabel}</Text>
            <Text style={styles.npcQuoteText}>{task.npcQuote}</Text>
          </View>

          {/* Acceptance Criteria */}
          <View style={styles.criteriaBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.criteriaHeader}>
                HEDEF KRİTERLER (STRATEJİ &amp; MİMARİ HEDEFLER)
              </Text>
              <Text style={styles.criteriaCountText}>
                {isCompleted ? '2/2 TAMAMLANDI' : '1/2 TAMAMLANDI'}
              </Text>
            </View>

            {task.acceptanceCriteria.map(ac => {
              const passed = ac.initialPassed || isCompleted;
              return (
                <View key={ac.id} style={styles.criterionRow}>
                  <Text
                    style={[
                      styles.criterionCheckbox,
                      {
                        color: passed ? Colors.primaryContainer : Colors.error,
                      },
                    ]}>
                    {passed ? '☑' : '☐'}
                  </Text>
                  <Text
                    style={[
                      styles.criterionLabel,
                      passed && styles.criterionLabelPassed,
                    ]}>
                    {ac.label}
                  </Text>
                  <View
                    style={[
                      styles.criterionStatusBadge,
                      passed
                        ? styles.criterionPassedBg
                        : styles.criterionPendingBg,
                    ]}>
                    <Text
                      style={[
                        styles.criterionStatusText,
                        {
                          color: passed
                            ? Colors.primaryContainer
                            : Colors.error,
                        },
                      ]}>
                      {passed ? 'GEÇTİ' : 'BEKLİYOR'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Mimari Diyagram / Planlama & Satış Vaka Şeması */}
        <View style={styles.ideFrame}>
          <View style={styles.ideTopBar}>
            <View style={styles.ideDotsRow}>
              <View
                style={[
                  styles.windowDot,
                  { backgroundColor: Colors.errorBright },
                ]}
              />
              <View
                style={[styles.windowDot, { backgroundColor: Colors.warning }]}
              />
              <View
                style={[
                  styles.windowDot,
                  { backgroundColor: Colors.primaryContainer },
                ]}
              />
              <View style={styles.fileTab}>
                <Text style={styles.fileTabText}>{task.fileName}</Text>
                <View style={styles.fileUnsavedDot} />
              </View>
            </View>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>{task.languageTag}</Text>
            </View>
          </View>

          <View style={styles.codeViewport}>
            {task.codeLines.map(line => (
              <View
                key={line.lineNumber}
                style={[
                  styles.codeLineRow,
                  line.isBugHighlight && styles.codeLineBugHighlight,
                ]}>
                <Text
                  style={[
                    styles.lineNumber,
                    line.isBugHighlight && { color: Colors.error },
                  ]}>
                  {line.lineNumber}
                </Text>
                <View style={styles.codeContentWrap}>
                  <Text
                    style={[
                      styles.codeText,
                      line.isComment && styles.codeCommentText,
                      line.isBugHighlight && styles.codeBugText,
                    ]}>
                    {line.content}
                  </Text>
                  {line.bugBadgeText && (
                    <View style={styles.zombieBugPill}>
                      <Text style={styles.zombieBugPillText}>
                        {line.bugBadgeText}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Vaka Özeti Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>◈</Text>
          <View style={styles.flexOne}>
            <Text style={styles.warningTitle}>{task.warningTitle}</Text>
            <Text style={styles.warningBody}>{task.warningBody}</Text>
          </View>
        </View>

        {/* Decision Radio Cards (Kopya vermeyen tarafsız görünüm) */}
        <View style={styles.decisionSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.decisionHeader}>
              [STRATEJİ VE MİMARİ KARAR SEÇİMİ]
            </Text>
            <Text style={styles.decisionReqText}>
              KOPYA YOK • ANALİZ EDİP SEÇ
            </Text>
          </View>

          {task.decisions.map(option => {
            const selected = option.id === selectedDecisionId;
            // Gönderim öncesinde tüm seçenekler tarafsız renkte gösterilir
            const revealedColor = submissionFeedback
              ? option.badgeTone === 'optimal'
                ? Colors.primaryContainer
                : option.badgeTone === 'balanced'
                ? Colors.secondary
                : Colors.error
              : Colors.secondary;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.decisionCard,
                  selected && {
                    borderColor: revealedColor,
                    backgroundColor: Colors.surfaceContainer,
                  },
                ]}
                onPress={() => setSelectedDecisionId(option.id)}>
                <View
                  style={[
                    styles.decisionCheckCircle,
                    selected && { backgroundColor: revealedColor },
                  ]}>
                  <Text style={styles.decisionCheckMark}>
                    {selected ? '✓' : ''}
                  </Text>
                </View>

                <View style={styles.flexOne}>
                  <View style={styles.rowBetween}>
                    <Text
                      style={[
                        styles.decisionTitle,
                        selected && { color: revealedColor },
                      ]}>
                      {option.title}
                    </Text>
                    <View
                      style={[
                        styles.decisionToneBadge,
                        { borderColor: revealedColor },
                      ]}>
                      <Text
                        style={[
                          styles.decisionToneText,
                          { color: revealedColor },
                        ]}>
                        {option.badgeText}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.decisionDesc}>{option.description}</Text>

                  <View style={styles.impactRow}>
                    {option.impactSummary.map((imp, idx) => (
                      <Text
                        key={idx}
                        style={[
                          styles.impactText,
                          idx === 0 && [
                            styles.impactPrimaryText,
                            { color: revealedColor },
                          ],
                        ]}>
                        {idx > 0 ? `• ${imp}` : imp}
                      </Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Kullanıcının Kendi Fikrini / Stratejisini Yazabileceği Alan */}
          <View style={styles.customIdeaBox}>
            <Text style={styles.customIdeaTitle}>
              💡 SENİN FİKRİN VE STRATEJİ NOTUN (OYUN DÜNYANI ŞEKİLLENDİRİR):
            </Text>
            <TextInput
              accessibilityLabel="Kendi Strateji Notunu Yaz"
              value={customStrategyNote}
              onChangeText={setCustomStrategyNote}
              placeholder="Bu vaka hakkında kendi mimari, planlama veya satış fikrini yaz (design.md hafızana eklenir)..."
              placeholderTextColor={Colors.outline}
              style={styles.customIdeaInput}
            />
          </View>
        </View>

        {/* Feedback Toast Card (Shown after submitting decision) */}
        {submissionFeedback && (
          <View
            style={[
              styles.feedbackCard,
              {
                borderColor: submissionFeedback.isTrap
                  ? Colors.error
                  : Colors.primaryContainer,
              },
            ]}>
            <Text
              style={[
                styles.feedbackTitle,
                {
                  color: submissionFeedback.isTrap
                    ? Colors.error
                    : Colors.primaryContainer,
                },
              ]}>
              {submissionFeedback.title}
            </Text>
            <Text style={styles.feedbackMessage}>
              {submissionFeedback.message}
            </Text>
            <View style={styles.feedbackActionRow}>
              <TouchableOpacity
                style={styles.returnDesktopBtn}
                onPress={() => setActiveScreen('zombie_os')}>
                <Text style={styles.returnDesktopText}>
                  &gt;_ ZombieOS Masaüstüne Dön
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goSleepBtn}
                onPress={() => setActiveScreen('end_of_day_journal')}>
                <Text style={styles.goSleepText}>☾ Günü Bitir &amp; Günlük</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Submit CTA */}
        <TouchableOpacity
          accessibilityLabel="Mühendislik Kararını Gönder"
          style={styles.submitDecisionBtn}
          onPress={handleSubmit}>
          <Text style={styles.submitDecisionText}>
            🚀 Strateji ve Mimari Kararını Uygula
          </Text>
        </TouchableOpacity>

        <Text style={styles.commitHashHint}>
          ● Seçimin ve yazdığın strateji notu oyun dünyandaki design.md belleğine işlenecek
        </Text>
      </ScrollView>
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
  energyValueText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  impactPrimaryText: {
    fontWeight: '700',
  },
  headerBar: {
    height: 54,
    paddingHorizontal: 14,
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
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 6,
  },
  backArrow: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  debugBadgeText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 28,
  },
  vitalsMicroBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  vitalItemText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  taskCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#222a3a',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  missionTag: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  taskTitle: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  taskSub: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  npcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryContainer,
  },
  npcBadgeText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  npcQuoteBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },
  npcCourseLabel: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  npcQuoteText: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontStyle: 'italic',
  },
  criteriaBlock: {
    gap: 6,
  },
  criteriaHeader: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  criteriaCountText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 8,
  },
  criterionCheckbox: {
    fontSize: 14,
    fontWeight: '700',
  },
  criterionLabel: {
    flex: 1,
    color: Colors.onSurface,
    fontSize: 12,
  },
  criterionLabelPassed: {
    textDecorationLine: 'line-through',
    opacity: 0.75,
  },
  criterionStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  criterionPassedBg: {
    backgroundColor: 'rgba(0, 255, 102, 0.12)',
  },
  criterionPendingBg: {
    backgroundColor: 'rgba(147, 0, 10, 0.28)',
  },
  criterionStatusText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  ideFrame: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252d3d',
  },
  ideTopBar: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ideDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  windowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  fileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 6,
    gap: 5,
  },
  fileTabText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  fileUnsavedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  langBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langBadgeText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  codeViewport: {
    padding: 10,
    gap: 4,
  },
  codeLineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  codeLineBugHighlight: {
    backgroundColor: 'rgba(76, 215, 246, 0.14)',
    borderLeftWidth: 2,
    borderLeftColor: Colors.secondary,
  },
  lineNumber: {
    width: 18,
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  codeContentWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  codeText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  codeCommentText: {
    color: Colors.outline,
    fontStyle: 'italic',
  },
  codeBugText: {
    color: Colors.primaryFixed,
    fontWeight: '700',
  },
  zombieBugPill: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  zombieBugPillText: {
    color: Colors.onSecondaryContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  warningBanner: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2c384e',
  },
  warningIcon: {
    color: Colors.secondary,
    fontSize: 18,
  },
  warningTitle: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  warningBody: {
    color: Colors.onSurface,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  decisionSection: {
    gap: 8,
  },
  decisionHeader: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  decisionReqText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  decisionCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: '#222836',
  },
  decisionCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  decisionCheckMark: {
    color: Colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  decisionTitle: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  decisionToneBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  decisionToneText: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
  },
  decisionDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  impactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  impactText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  customIdeaBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#28344b',
    gap: 6,
    marginTop: 4,
  },
  customIdeaTitle: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  customIdeaInput: {
    backgroundColor: Colors.surfaceContainer,
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#313d56',
  },
  feedbackCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  feedbackTitle: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackMessage: {
    color: Colors.onSurface,
    fontSize: 12,
    lineHeight: 18,
  },
  feedbackActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  returnDesktopBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHighest,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  returnDesktopText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  goSleepBtn: {
    flex: 1,
    backgroundColor: Colors.secondaryContainer,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  goSleepText: {
    color: Colors.onSecondaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  submitDecisionBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDecisionText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  commitHashHint: {
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 9,
    textAlign: 'center',
  },
});
