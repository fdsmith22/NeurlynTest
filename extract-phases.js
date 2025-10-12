// Extract phase information from console log

const log = `BASELINE_OPENNESS_1 When I discover a hidden path while walking, I usu
BASELINE_CONSCIENTIOUSNESS_1 My workspace naturally stays organized without muc
BASELINE_EXTRAVERSION_1 After a long week, a crowded party sounds perfect
ANXIETY_OCD_4 These thoughts and behaviors significantly interfe
BASELINE_AGREEABLENESS_1 I find it satisfying when someone who wronged me f
NEO_FACET_1073 I frequently worry about things that might go wron
HEXACO_H1_1 I wouldn't use flattery to get a raise or promotio
COG_ANALY_001 When solving problems, I prefer to think step-by-s
NEO_FACET_1001 I often get lost in my own imaginary worlds and da
NEO_FACET_1019 I feel capable and effective in what I do.
[PHASE TRANSITION: warmup → exploration]
HEXACO_H2_1 I would never accept a bribe, even if it were very
SOMATIC_HEALTH_ANXIETY_1 I worry a lot about having a serious illness
NEO_FACET_1037 I genuinely enjoy connecting with people and showi
HEXACO_H3_1 I am not interested in having expensive luxuries
NEO_FACET_1055 I believe most people are fundamentally good and w
ATT_ANX_002 I worry constantly about my relationships ending
NEO_FACET_1076 I get angry and frustrated easily when things don'
HEXACO_H4_1 I don't think I deserve special treatment
NEO_FACET_1079 I often feel sad, hopeless, or discouraged.
NDV_ADHD_001 I have trouble concentrating on tasks that require
NEO_FACET_1004 I am deeply moved by the beauty I find in art, nat
NEO_FACET_1022 I keep my living and working spaces neat and organ
NEO_FACET_1058 I am frank, sincere, and straightforward with othe
ATTACHMENT_ANXIOUS_1 I worry that people close to me will abandon me
NEO_FACET_1082 I feel uncomfortable and self-conscious in social
SUBSTANCE_ALCOHOL_1 How often do you have a drink containing alcohol?
NEO_FACET_1007 I experience my emotions intensely and value emoti
NEO_FACET_1040 I love being part of large groups and social gathe
NEO_FACET_1025 I always follow through on my commitments, even wh
ATTACHMENT_AVOIDANT_1 I prefer not to show others how I feel deep down
[PHASE TRANSITION: exploration → deepening]
MANIA_MDQ_1 Has there ever been a period of time when you felt
BASELINE_EF_1 I start tasks right away rather than procrastinati
NEO_FACET_1061 I genuinely enjoy helping others and contributing
NEO_FACET_1043 I naturally take charge in group situations.
SUBSTANCE_ALCOHOL_2 How many drinks containing alcohol do you have on
NEO_FACET_1010 I enjoy trying new activities and experiencing dif
MANIA_MDQ_2 Did you feel so irritable that you shouted at peop
NEO_FACET_1085 I have trouble resisting cravings and urges.
SUICIDE_SCREEN_1 I have had thoughts about death or dying.
NEO_FACET_1028 I set high standards for myself and work hard to a
NEO_FACET_1064 I prefer to cooperate rather than compete with oth
SUICIDE_SCREEN_5 I have intentionally hurt myself without intending
NEO_FACET_1046 I maintain a fast pace and stay busy throughout th
NDV_GEN_003 I have intense interests that consume most of my t
NEO_FACET_1088 I feel overwhelmed and unable to cope when under p
SUICIDE_SCREEN_2 I have wished that I could fall asleep and not wak
NEO_FACET_1013 I enjoy philosophical discussions and exploring ab
TREATMENT_MOTIVATION_1 I recognize that I have problems or difficulties t
NEO_FACET_1031 I can stick with difficult tasks until they're com
SUICIDE_SCREEN_6 I have attempted to end my life in the past.
[PHASE TRANSITION: deepening → precision]
NEO_FACET_1067 I'm uncomfortable being the center of attention or
NEO_FACET_1016 I often question traditional values and social con
NEO_FACET_1034 I carefully think through decisions before acting.
ENNE_GEN_001 I have a strong inner critic that never stops
NEO_FACET_1070 I'm easily moved by others' needs and feel sympath
NEO_FACET_1049 I love thrilling experiences and taking risks.
SUICIDE_SCREEN_3 I have had thoughts about ways I might hurt or kil
NEO_FACET_1052 I frequently experience joy and enthusiasm.
LEARN_KINESTHETI_001 I learn best by doing rather than reading
SUICIDE_SCREEN_7 I have important reasons for living (such as famil
ENNE_GEN_002 I notice mistakes and imperfections immediately
PROBE_WORRY_1 How often do you find yourself worrying about thin
SUICIDE_SCREEN_4 I have made a specific plan for how I would end my
NDV_HYPER_002 I can talk about my interests for hours without no
LEARN_VISUAL_002 I need visual aids to understand concepts
[PHASE TRANSITION: precision → completion]
IIP_DOMINEERING_1 I am too controlling of other people
VALIDITY_INCONS_1A I remain calm in stressful situations.
RESILIENCE_ADAPT_1 I am able to adapt when changes occur in my life
TREATMENT_SUPPORT_1 There is a special person who is around when I am
JUNG_NI_001 I see patterns and connections others miss`;

const lines = log.split('\n');
let currentPhase = 'warmup';
const phases = { warmup: [], exploration: [], deepening: [], precision: [], completion: [] };

lines.forEach((line, idx) => {
  if (line.includes('PHASE TRANSITION')) {
    currentPhase = line.split('→')[1].trim().replace(']', '');
  } else if (line.trim() && !line.includes('PHASE')) {
    const questionId = line.split(' ')[0];
    phases[currentPhase].push({ num: idx + 1, id: questionId });
  }
});

console.log('═══════════════════════════════════════════════════════════');
console.log('  PHASE PROGRESSION ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

Object.entries(phases).forEach(([phase, questions]) => {
  console.log(`${phase.toUpperCase()} (${questions.length} questions):`);
  console.log(`  Questions ${questions[0]?.num || 0} - ${questions[questions.length-1]?.num || 0}`);
  console.log('');
});
