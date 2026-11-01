import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SEMESTER_EXAMS,
  UNIVERSITY_LECTURES,
  evaluateStudentAnswer,
} from '../features/curriculum/lectureCatalog';
import { useGame } from '../state/GameContext';
import { Colors } from '../theme/designSystem';

export function ClassroomLectureScreen(): React.JSX.Element {
  const {
    profile,
    gameDay,
    currentLectureOrder,
    completedLectureOrders,
    activeHomework,
    examResults,
    setActiveScreen,
    assignLectureHomework,
    completeLecture,
    submitHomeworkExcuse,
    recordExamResult,
  } = useGame();

  // State
  const [excuseText, setExcuseText] = useState('');
  const [excuseSubmitted, setExcuseSubmitted] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [studentAnswerText, setStudentAnswerText] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    isPassed: boolean;
    professorFeedback: string;
  } | null>(null);

  // Exam answers: questionId -> selectedOptionId
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examSubmittedResult, setExamSubmittedResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  // Check if yesterday's homework needs audit
  const hasYesterdayHomeworkToAudit =
    activeHomework &&
    activeHomework.assignedDay < gameDay &&
    activeHomework.status !== 'excused';

  const isExamDue =
    completedLectureOrders.length >= 5 &&
    (!examResults[1] || !examResults[1].passed);

  // Determine current lecture
  const currentLecture =
    UNIVERSITY_LECTURES.find(l => l.orderNumber === currentLectureOrder) ||
    UNIVERSITY_LECTURES[UNIVERSITY_LECTURES.length - 1];

  const totalSlides = currentLecture.slides.length;
  // Slide 0..totalSlides-1: Lecture slides
  // Slide totalSlides: Ara soru (In-lecture question)
  // Slide totalSlides+1: Ödev atama (Homework assignment)

  const handleAuditContinue = () => {
    // Audit completed, proceed to lecture or exam
    setExcuseSubmitted(true);
  };

  const handleExcuseSubmit = () => {
    const trimmed = excuseText.trim();
    if (!trimmed) {
      Alert.alert('Gerekçe Gerekli', 'Lütfen dünkü ödevi neden yapamadığınızı kısaca belirtin.');
      return;
    }
    submitHomeworkExcuse(trimmed);
    setExcuseSubmitted(true);
  };

  const handleAnswerSubmit = () => {
    if (!studentAnswerText.trim()) {
      Alert.alert('Boş Cevap', 'Lütfen tahtadaki soruya yönelik bir cevap yazın.');
      return;
    }
    const evalRes = evaluateStudentAnswer(studentAnswerText, currentLecture.question);
    setEvaluationResult(evalRes);
  };

  const handleAcceptHomeworkAndLeave = () => {
    // Assign homework and mark lecture as completed
    assignLectureHomework({
      lectureId: currentLecture.id,
      lectureOrder: currentLecture.orderNumber,
      title: currentLecture.homework.title,
      topic: currentLecture.homework.topic,
      problemStatement: currentLecture.homework.problemStatement,
      targetOutput: currentLecture.homework.targetOutput,
      status: 'assigned',
      assignedDay: gameDay,
      xpReward: currentLecture.homework.xpReward,
    });
    completeLecture(currentLecture.orderNumber);
    setActiveScreen('world_hud');
  };

  const handleExamOptionSelect = (qId: string, optId: string) => {
    setExamAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const handleExamSubmit = () => {
    const exam = SEMESTER_EXAMS[0];
    const totalQuestions = exam.questions.length;
    let correctCount = 0;

    exam.questions.forEach(q => {
      const selectedId = examAnswers[q.id];
      const correctOpt = q.options.find(o => o.isCorrect);
      if (selectedId && correctOpt && selectedId === correctOpt.id) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= exam.passingScore;
    recordExamResult(exam.examNumber, score, passed);
    setExamSubmittedResult({ score, passed });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0e1f13" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topBarBadge}>KAMPÜS // LAB AMFİSİ</Text>
          <Text style={styles.topBarTitle}>YAZ 101 — Prof. Dr. Demir</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Kampüse Dön"
          style={styles.leaveClassBtn}
          onPress={() => setActiveScreen('world_hud')}>
          <Text style={styles.leaveClassBtnText}>⇥ Kampüse Dön</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* A. YALNIZCA GEREKTİĞİNDE: DÜNKÜ ÖDEV DENETİMİ */}
        {hasYesterdayHomeworkToAudit && !excuseSubmitted ? (
          <View style={styles.auditContainer}>
            <View style={styles.auditHeader}>
              <Text style={styles.auditBadge}>ÖDEV DENETİMİ</Text>
              <Text style={styles.auditTitle}>Dünkü Ödev Kontrolü</Text>
              <Text style={styles.auditSub}>Ders: {activeHomework.title}</Text>
            </View>

            {activeHomework.status === 'completed' ? (
              <View style={styles.auditSuccessBox}>
                <Text style={styles.profSpeechAvatar}>👨‍🏫 Prof. Demir:</Text>
                <Text style={styles.profSpeechText}>
                  {`"Dünkü ödev teslimini inceledim: '${activeHomework.title}'.\n\nİşlenen konu (${activeHomework.topic}) bağlamındaki mühendislik yaklaşımın ve çıktın başarılı şekilde arşivlendi. Harika disiplin!\n\nŞimdi bugünkü dersimize geçebiliriz."`}
                </Text>
                <TouchableOpacity
                  style={styles.continueAuditBtn}
                  onPress={handleAuditContinue}>
                  <Text style={styles.continueAuditBtnText}>Bugünkü Derse Başla →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.auditWarningBox}>
                <Text style={styles.profSpeechAvatar}>👨‍🏫 Prof. Demir:</Text>
                <Text style={styles.profSpeechText}>
                  {`"Dünkü ödevin teslim edilmemiş görünüyor: '${activeHomework.title}'.\n\nYazılım mühendisliğinde zamanında teslim ve sorumluluk esastır. Derse başlamadan önce sormak zorundayım:\n\nDünkü ödevi neden tamamlayamadın?"`}
                </Text>
                <TextInput
                  accessibilityLabel="Ödev Mazereti"
                  style={styles.excuseInput}
                  multiline
                  placeholder="Mazeretinizi veya sebebinizi buraya yazın..."
                  placeholderTextColor="#78909c"
                  value={excuseText}
                  onChangeText={setExcuseText}
                />
                <TouchableOpacity
                  style={styles.submitExcuseBtn}
                  onPress={handleExcuseSubmit}>
                  <Text style={styles.submitExcuseBtnText}>
                    Mazereti Hocaya İlet ve Derse Geç →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : isExamDue && !examSubmittedResult ? (
          /* B. VİZE SINAVI OTURUMU (HER 5 DERSTEN SONRA) */
          <View style={styles.examContainer}>
            <View style={styles.examHeader}>
              <View style={styles.examBadgeBox}>
                <Text style={styles.examBadgeText}>1. DÖNEM VİZE SINAVI</Text>
              </View>
              <Text style={styles.examTitle}>Ders 1 - 5 Kapsamlı Sınav Oturumu</Text>
              <Text style={styles.examSubtitle}>
                {SEMESTER_EXAMS[0].coveredLecturesDescription}
              </Text>
              <Text style={styles.examNote}>
                Baraj: %{SEMESTER_EXAMS[0].passingScore} // Yalnızca geride kalan ilk 5 dersin konularını kapsar.
              </Text>
            </View>

            {SEMESTER_EXAMS[0].questions.map((q, idx) => (
              <View key={q.id} style={styles.examQuestionCard}>
                <Text style={styles.examQuestionPrompt}>{q.prompt}</Text>
                <View style={styles.examOptionsList}>
                  {q.options.map(opt => {
                    const isSelected = examAnswers[q.id] === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.examOptionRow,
                          isSelected && styles.examOptionRowSelected,
                        ]}
                        onPress={() => handleExamOptionSelect(q.id, opt.id)}>
                        <View
                          style={[
                            styles.examRadioCircle,
                            isSelected && styles.examRadioCircleSelected,
                          ]}>
                          {isSelected && <View style={styles.examRadioInner} />}
                        </View>
                        <Text
                          style={[
                            styles.examOptionText,
                            isSelected && styles.examOptionTextSelected,
                          ]}>
                          {opt.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.submitExamBtn}
              onPress={handleExamSubmit}>
              <Text style={styles.submitExamBtnText}>Vize Sınavını Tamamla &amp; Teslim Et</Text>
            </TouchableOpacity>
          </View>
        ) : examSubmittedResult ? (
          /* VİZE SINAVI SONUÇ EKRANI */
          <View style={styles.examResultCard}>
            <Text style={styles.examResultHeader}>VİZE SINAV DEĞERLENDİRMESİ</Text>
            <Text style={styles.examResultScore}>
              PUAN: %{examSubmittedResult.score}
            </Text>
            <View
              style={[
                styles.examStatusBox,
                examSubmittedResult.passed
                  ? styles.examStatusBoxPass
                  : styles.examStatusBoxFail,
              ]}>
              <Text style={styles.examStatusText}>
                {examSubmittedResult.passed
                  ? '✅ TEBRİKLER! VİZE SINAVINI BAŞARIYLA GEÇTİNİZ.'
                  : '❌ BARAJIN ALTINDA KALDINIZ. (%70 Gerekli)'}
              </Text>
            </View>
            <Text style={styles.examResultNote}>
              {examSubmittedResult.passed
                ? 'Prof. Demir: "Tebrik ederim, ilk 5 dersin AI-Native ve sistem düşüncesi kavramlarını çok iyi özümsemişsin. Akademik siciline başarı olarak işlendi."'
                : 'Prof. Demir: "Temel konseptlerde eksikler var. Lütfen ders notlarını ve geçmiş ödevleri tekrar gözden geçir."'}
            </Text>
            <TouchableOpacity
              style={styles.continueAuditBtn}
              onPress={() => setActiveScreen('world_hud')}>
              <Text style={styles.continueAuditBtnText}>Kampüse Dön →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* C. STANDART DERS AKIŞI (KARA TAHTA) */
          <View style={styles.chalkboardFrame}>
            {/* Tahta Üst Bar */}
            <View style={styles.chalkboardHeader}>
              <View style={styles.chalkboardHeaderLeft}>
                <Text style={styles.chalkCourseCode}>
                  {currentLecture.courseName}
                </Text>
                <Text style={styles.chalkLectureTitle}>
                  {`DERS ${currentLecture.orderNumber}: ${currentLecture.title}`}
                </Text>
              </View>
              <View style={styles.chalkSlideBadge}>
                <Text style={styles.chalkSlideBadgeText}>
                  {currentSlideIndex < totalSlides
                    ? `Slayt ${currentSlideIndex + 1} / ${totalSlides + 2}`
                    : currentSlideIndex === totalSlides
                    ? `Ders İçi Soru (${totalSlides + 1} / ${totalSlides + 2})`
                    : `Ödev Ataması (${totalSlides + 2} / ${totalSlides + 2})`}
                </Text>
              </View>
            </View>

            {/* Tahta İçeriği */}
            <View style={styles.chalkboardSurface}>
              {/* Slayt Gösterimi */}
              {currentSlideIndex < totalSlides && (
                <View style={styles.slideContentBox}>
                  <Text style={styles.chalkHeading}>
                    {currentLecture.slides[currentSlideIndex].heading}
                  </Text>

                  {currentLecture.slides[currentSlideIndex].bulletPoints.map(
                    (point, pIdx) => (
                      <View key={pIdx} style={styles.bulletRow}>
                        <Text style={styles.chalkBullet}>✦</Text>
                        <Text style={styles.chalkBulletText}>{point}</Text>
                      </View>
                    ),
                  )}

                  {currentLecture.slides[currentSlideIndex].highlightText && (
                    <View style={styles.chalkHighlightBox}>
                      <Text style={styles.chalkHighlightTitle}>[MİMARİ NOT]:</Text>
                      <Text style={styles.chalkHighlightContent}>
                        {currentLecture.slides[currentSlideIndex].highlightText}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* ARA DEĞERLENDİRME SORUSU SLAYTI */}
              {currentSlideIndex === totalSlides && (
                <View style={styles.questionSlideBox}>
                  <View style={styles.questionNoticeBox}>
                    <Text style={styles.questionNoticeTitle}>
                      PROF. DEMİR'DEN ARA DEĞERLENDİRME SORUSU
                    </Text>
                    <Text style={styles.questionNoticeSub}>
                      * Yalnızca derste işlenen konudan sorulmaktadır. AI-Native bakış açınızı ve sistem farkındalığınızı açıklayın.
                    </Text>
                  </View>

                  <Text style={styles.chalkQuestionText}>
                    {currentLecture.question.questionText}
                  </Text>

                  <TextInput
                    accessibilityLabel="Ders Cevabınız"
                    style={styles.chalkAnswerInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Düşüncenizi ve yaklaşımınızı kendi cümlelerinizle açıklayın..."
                    placeholderTextColor="#6c8872"
                    value={studentAnswerText}
                    onChangeText={setStudentAnswerText}
                  />

                  <TouchableOpacity
                    style={styles.submitAnswerBtn}
                    onPress={handleAnswerSubmit}>
                    <Text style={styles.submitAnswerBtnText}>
                      Cevabı Hocaya Sun ✍️
                    </Text>
                  </TouchableOpacity>

                  {/* DEĞERLENDİRME SONUCU */}
                  {evaluationResult && (
                    <View
                      style={[
                        styles.evalResultBox,
                        evaluationResult.isPassed
                          ? styles.evalResultBoxSuccess
                          : styles.evalResultBoxWarning,
                      ]}>
                      <Text style={styles.profSpeechAvatar}>
                        👨‍🏫 Prof. Demir:
                      </Text>
                      <Text
                        style={[
                          styles.evalFeedbackText,
                          evaluationResult.isPassed
                            ? styles.evalFeedbackTextSuccess
                            : styles.evalFeedbackTextWarning,
                        ]}>
                        {evaluationResult.professorFeedback}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* DERS SONU ÖDEV ATAMA SLAYTI */}
              {currentSlideIndex === totalSlides + 1 && (
                <View style={styles.homeworkSlideBox}>
                  <View style={styles.homeworkBadgeBox}>
                    <Text style={styles.homeworkBadgeText}>DERS ÖDEVİ TANIMLANDI</Text>
                  </View>
                  <Text style={styles.chalkHwTitle}>
                    {currentLecture.homework.title}
                  </Text>

                  <View style={styles.hwDetailBox}>
                    <Text style={styles.hwDetailLabel}>📌 İŞLENEN KONU / SORUN:</Text>
                    <Text style={styles.hwDetailValue}>
                      {currentLecture.homework.problemStatement}
                    </Text>
                  </View>

                  <View style={styles.hwDetailBox}>
                    <Text style={styles.hwDetailLabel}>
                      🎯 HEDEFLENEN MÜHENDİSLİK ÇIKTISI:
                    </Text>
                    <Text style={styles.hwDetailValue}>
                      {currentLecture.homework.targetOutput}
                    </Text>
                  </View>

                  <View style={styles.hwInstructionBox}>
                    <Text style={styles.hwInstructionText}>
                      💬 Prof. Demir: "Bu ödevi yurt odandaki ZombieOS bilgisayarından çözüp teslim edebilirsin. Yarın derse başladığımızda ödevini denetleyeceğim."
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.acceptHwBtn}
                    onPress={handleAcceptHomeworkAndLeave}>
                    <Text style={styles.acceptHwBtnText}>
                      Ödevi Kabul Et &amp; Kampüse Dön →
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Tahta Altı Navigasyon Bar */}
            <View style={styles.chalkboardFooter}>
              <TouchableOpacity
                disabled={currentSlideIndex === 0}
                style={[
                  styles.navBtn,
                  currentSlideIndex === 0 && styles.navBtnDisabled,
                ]}
                onPress={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}>
                <Text style={styles.navBtnText}>← Önceki Slayt</Text>
              </TouchableOpacity>

              <View style={styles.chalkDotsRow}>
                {Array.from({ length: totalSlides + 2 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chalkDot,
                      i === currentSlideIndex && styles.chalkDotActive,
                    ]}
                  />
                ))}
              </View>

              {currentSlideIndex < totalSlides + 1 ? (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() =>
                    setCurrentSlideIndex(prev =>
                      Math.min(totalSlides + 1, prev + 1),
                    )
                  }>
                  <Text style={styles.navBtnText}>
                    {currentSlideIndex === totalSlides ? 'Ödeve Geç →' : 'Sonraki Slayt →'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.navBtnDone}
                  onPress={handleAcceptHomeworkAndLeave}>
                  <Text style={styles.navBtnDoneText}>Dersi Bitir ✓</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a160e',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0e1f13',
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a24',
  },
  topBarLeft: {
    flex: 1,
  },
  topBarBadge: {
    color: '#65d98d',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  topBarTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  leaveClassBtn: {
    backgroundColor: '#1b3820',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a6642',
  },
  leaveClassBtnText: {
    color: '#a3e4b7',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Audit
  auditContainer: {
    backgroundColor: '#132316',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#315438',
  },
  auditHeader: {
    marginBottom: 14,
  },
  auditBadge: {
    color: '#f9a825',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  auditTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  auditSub: {
    color: '#a0bfa5',
    fontSize: 13,
    marginTop: 2,
  },
  auditSuccessBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  auditWarningBox: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  profSpeechAvatar: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  profSpeechText: {
    color: '#e0ece2',
    fontSize: 14,
    lineHeight: 22,
  },
  excuseInput: {
    backgroundColor: '#0a160e',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 13,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#4a6e50',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitExcuseBtn: {
    backgroundColor: '#d87a18',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  submitExcuseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  continueAuditBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  continueAuditBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Exam
  examContainer: {
    backgroundColor: '#101d14',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#2e5b38',
  },
  examHeader: {
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#24452c',
    paddingBottom: 14,
  },
  examBadgeBox: {
    backgroundColor: 'rgba(239, 83, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  examBadgeText: {
    color: '#ef5350',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  examTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  examSubtitle: {
    color: '#a5d6a7',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  examNote: {
    color: '#81c784',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  examQuestionCard: {
    backgroundColor: '#152b1b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#285032',
  },
  examQuestionPrompt: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 20,
  },
  examOptionsList: {
    gap: 8,
  },
  examOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#0c1a10',
    borderWidth: 1,
    borderColor: '#1f3f27',
  },
  examOptionRowSelected: {
    backgroundColor: '#1b3b22',
    borderColor: '#4caf50',
  },
  examRadioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#5a8264',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  examRadioCircleSelected: {
    borderColor: '#4caf50',
  },
  examRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  examOptionText: {
    color: '#b0d4b8',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  examOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  submitExamBtn: {
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitExamBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  // Exam Result
  examResultCard: {
    backgroundColor: '#122518',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#386341',
  },
  examResultHeader: {
    color: '#81c784',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  examResultScore: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 12,
  },
  examStatusBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  examStatusBoxPass: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  examStatusBoxFail: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  examStatusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  examResultNote: {
    color: '#c2dfc8',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Chalkboard
  chalkboardFrame: {
    backgroundColor: '#162b1b',
    borderRadius: 16,
    borderWidth: 8,
    borderColor: '#543d2b', // Ahşap tahta çerçevesi
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  chalkboardHeader: {
    backgroundColor: '#122417',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#26482e',
  },
  chalkboardHeaderLeft: {
    flex: 1,
  },
  chalkCourseCode: {
    color: '#7bc78f',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  chalkLectureTitle: {
    color: '#f4fbf5',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  chalkSlideBadge: {
    backgroundColor: '#1b3b22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chalkSlideBadgeText: {
    color: '#8fe0a2',
    fontSize: 11,
    fontWeight: '700',
  },
  chalkboardSurface: {
    padding: 18,
    minHeight: 320,
    backgroundColor: '#162b1b',
  },
  slideContentBox: {
    gap: 14,
  },
  chalkHeading: {
    color: '#f7df8b', // Tebeşir sarısı başlık
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  chalkBullet: {
    color: '#a5d6a7',
    fontSize: 12,
    marginTop: 3,
  },
  chalkBulletText: {
    color: '#e8f5e9',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  chalkHighlightBox: {
    backgroundColor: 'rgba(247, 223, 139, 0.08)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(247, 223, 139, 0.3)',
    marginTop: 8,
  },
  chalkHighlightTitle: {
    color: '#f7df8b',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  chalkHighlightContent: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  // Question Slide
  questionSlideBox: {
    gap: 12,
  },
  questionNoticeBox: {
    backgroundColor: 'rgba(100, 221, 23, 0.12)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#64dd17',
  },
  questionNoticeTitle: {
    color: '#b2ff59',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  questionNoticeSub: {
    color: '#dcedc8',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },
  chalkQuestionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    marginVertical: 4,
  },
  chalkAnswerInput: {
    backgroundColor: '#0c1a10',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#396342',
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitAnswerBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitAnswerBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  evalResultBox: {
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  evalResultBoxSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1.5,
    borderColor: '#4caf50',
  },
  evalResultBoxWarning: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: '#ff9800',
  },
  evalFeedbackText: {
    fontSize: 13,
    lineHeight: 20,
  },
  evalFeedbackTextSuccess: {
    color: '#c8e6c9',
    fontWeight: '600',
  },
  evalFeedbackTextWarning: {
    color: '#ffe0b2',
    fontWeight: '600',
  },

  // Homework Slide
  homeworkSlideBox: {
    gap: 12,
  },
  homeworkBadgeBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  homeworkBadgeText: {
    color: '#ffc107',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  chalkHwTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  hwDetailBox: {
    backgroundColor: '#0f2014',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2b4d33',
  },
  hwDetailLabel: {
    color: '#81c784',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  hwDetailValue: {
    color: '#e8f5e9',
    fontSize: 13,
    lineHeight: 19,
  },
  hwInstructionBox: {
    backgroundColor: 'rgba(129, 199, 132, 0.1)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#81c784',
  },
  hwInstructionText: {
    color: '#dcedc8',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  acceptHwBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  acceptHwBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  // Chalkboard Footer
  chalkboardFooter: {
    backgroundColor: '#122417',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#26482e',
  },
  navBtn: {
    backgroundColor: '#1b3b22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#376b42',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnText: {
    color: '#c8e6c9',
    fontSize: 12,
    fontWeight: '700',
  },
  navBtnDone: {
    backgroundColor: '#388e3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navBtnDoneText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  chalkDotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chalkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2e5b38',
  },
  chalkDotActive: {
    backgroundColor: '#f7df8b',
    width: 14,
  },
});
