/**
 * Interpersonal Scorer
 *
 * Calculates interpersonal functioning scores based on:
 * - ECR-R (Experiences in Close Relationships - Revised) for attachment
 * - IIP-32 (Inventory of Interpersonal Problems) for circumplex model
 *
 * Dimensions assessed:
 * 1. Attachment Style:
 *    - Anxious Attachment (3 questions)
 *    - Avoidant Attachment (3 questions)
 *    - Overall classification: Secure, Anxious, Avoidant, Fearful-Avoidant
 *
 * 2. Interpersonal Circumplex (IIP-32):
 *    - Domineering/Controlling (2 questions)
 *    - Vindictive/Self-Centered (2 questions)
 *    - Cold/Distant (2 questions)
 *    - Nonassertive/Submissive (2 questions)
 *    - Overly Nurturant (2 questions)
 *
 * 3. Relationship Quality (1 question)
 *
 * Outputs:
 * - Attachment style classification
 * - Interpersonal circumplex octant scores
 * - Relationship quality index
 * - Interpersonal problem areas
 *
 * Research basis:
 * - ECR-R: Fraley et al. (2000), α > .90
 * - IIP-32: Barkham et al. (1996), well-validated circumplex model
 */

const logger = require('../utils/logger');

// Attachment dimension items (ECR-R)
const ATTACHMENT_ITEMS = {
  anxious: ['ATTACHMENT_ANXIOUS_1', 'ATTACHMENT_ANXIOUS_2', 'ATTACHMENT_ANXIOUS_3'],
  avoidant: ['ATTACHMENT_AVOIDANT_1', 'ATTACHMENT_AVOIDANT_2', 'ATTACHMENT_AVOIDANT_3']
};

// Interpersonal Circumplex octants (IIP-32)
const CIRCUMPLEX_OCTANTS = {
  domineering: ['CIRCUMPLEX_DOMINEERING_1', 'CIRCUMPLEX_DOMINEERING_2'],
  vindictive: ['CIRCUMPLEX_VINDICTIVE_1', 'CIRCUMPLEX_VINDICTIVE_2'],
  cold: ['CIRCUMPLEX_COLD_1', 'CIRCUMPLEX_COLD_2'],
  submissive: ['CIRCUMPLEX_SUBMISSIVE_1', 'CIRCUMPLEX_SUBMISSIVE_2'],
  nurturant: ['CIRCUMPLEX_NURTURANT_1', 'CIRCUMPLEX_NURTURANT_2']
};

// Relationship quality item
const RELATIONSHIP_QUALITY_ITEM = 'RELATIONSHIP_QUALITY_1';

class InterpersonalScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      attachment: {
        anxious: { total: 0, average: 0, count: 0, level: 'Unknown' },
        avoidant: { total: 0, average: 0, count: 0, level: 'Unknown' },
        style: 'Unknown',
        description: ''
      },
      circumplex: {
        octants: {
          domineering: { total: 0, average: 0, count: 0, level: 'Unknown' },
          vindictive: { total: 0, average: 0, count: 0, level: 'Unknown' },
          cold: { total: 0, average: 0, count: 0, level: 'Unknown' },
          submissive: { total: 0, average: 0, count: 0, level: 'Unknown' },
          nurturant: { total: 0, average: 0, count: 0, level: 'Unknown' }
        },
        primaryProblems: [],
        agency: 0,  // Dominance-Submission axis
        communion: 0  // Friendliness-Hostility axis
      },
      relationshipQuality: {
        score: 0,
        level: 'Unknown'
      }
    };
  }

  /**
   * Calculate all interpersonal scores
   */
  calculate() {
    this.calculateAttachment();
    this.classifyAttachmentStyle();
    this.calculateCircumplex();
    this.calculateRelationshipQuality();

    return this.getInterpersonalReport();
  }

  /**
   * Calculate attachment dimension scores
   */
  calculateAttachment() {
    for (const [dimension, items] of Object.entries(ATTACHMENT_ITEMS)) {
      let total = 0;
      let count = 0;

      items.forEach(qid => {
        const resp = this.findResponse(qid);

        if (resp) {
          const score = this.getLikertScore(resp);
          total += score;
          count++;
        }
      });

      if (count > 0) {
        this.scores.attachment[dimension].total = total;
        this.scores.attachment[dimension].count = count;
        this.scores.attachment[dimension].average = total / count;
        this.scores.attachment[dimension].level = this.getAttachmentLevel(total / count);

        logger.info(`[Interpersonal] ${dimension} attachment: ${(total / count).toFixed(2)} (${this.scores.attachment[dimension].level})`);
      }
    }
  }

  /**
   * Classify overall attachment style
   */
  classifyAttachmentStyle() {
    const anxiousAvg = this.scores.attachment.anxious.average;
    const avoidantAvg = this.scores.attachment.avoidant.average;

    if (anxiousAvg === 0 && avoidantAvg === 0) {
      this.scores.attachment.style = 'Unknown';
      this.scores.attachment.description = 'Insufficient data to determine attachment style';
      return;
    }

    // Classification based on ECR-R thresholds
    const anxiousHigh = anxiousAvg >= 3.5;
    const avoidantHigh = avoidantAvg >= 3.5;

    if (!anxiousHigh && !avoidantHigh) {
      this.scores.attachment.style = 'Secure';
      this.scores.attachment.description = 'Comfortable with intimacy and autonomy; trusting in relationships';
    } else if (anxiousHigh && !avoidantHigh) {
      this.scores.attachment.style = 'Anxious-Preoccupied';
      this.scores.attachment.description = 'High need for closeness; fear of abandonment; seeks reassurance';
    } else if (!anxiousHigh && avoidantHigh) {
      this.scores.attachment.style = 'Dismissive-Avoidant';
      this.scores.attachment.description = 'Values independence; uncomfortable with emotional closeness; self-reliant';
    } else {
      this.scores.attachment.style = 'Fearful-Avoidant (Disorganized)';
      this.scores.attachment.description = 'Desires closeness but fears rejection; conflicted about relationships';
    }

    logger.info(`[Interpersonal] Attachment style: ${this.scores.attachment.style}`);
  }

  /**
   * Calculate interpersonal circumplex scores
   */
  calculateCircumplex() {
    for (const [octant, items] of Object.entries(CIRCUMPLEX_OCTANTS)) {
      let total = 0;
      let count = 0;

      items.forEach(qid => {
        const resp = this.findResponse(qid);

        if (resp) {
          const score = this.getLikertScore(resp);
          total += score;
          count++;
        }
      });

      if (count > 0) {
        this.scores.circumplex.octants[octant].total = total;
        this.scores.circumplex.octants[octant].count = count;
        this.scores.circumplex.octants[octant].average = total / count;
        this.scores.circumplex.octants[octant].level = this.getProblemLevel(total / count);

        logger.info(`[Interpersonal] ${octant}: ${(total / count).toFixed(2)} (${this.scores.circumplex.octants[octant].level})`);
      }
    }

    // Calculate circumplex axes
    this.calculateCircumplexAxes();

    // Identify primary problems (octants with high scores)
    this.identifyPrimaryProblems();
  }

  /**
   * Calculate circumplex axes (Agency and Communion)
   */
  calculateCircumplexAxes() {
    // Agency axis (Dominance-Submission)
    // Domineering (+), Submissive (-)
    const domAvg = this.scores.circumplex.octants.domineering.average || 0;
    const subAvg = this.scores.circumplex.octants.submissive.average || 0;
    this.scores.circumplex.agency = domAvg - subAvg;

    // Communion axis (Friendliness-Hostility)
    // Nurturant (+), Cold/Vindictive (-)
    const nurtAvg = this.scores.circumplex.octants.nurturant.average || 0;
    const coldAvg = this.scores.circumplex.octants.cold.average || 0;
    const vindAvg = this.scores.circumplex.octants.vindictive.average || 0;
    this.scores.circumplex.communion = nurtAvg - ((coldAvg + vindAvg) / 2);

    logger.info(`[Interpersonal] Agency: ${this.scores.circumplex.agency.toFixed(2)}, Communion: ${this.scores.circumplex.communion.toFixed(2)}`);
  }

  /**
   * Identify primary interpersonal problems
   */
  identifyPrimaryProblems() {
    const problems = [];

    for (const [octant, data] of Object.entries(this.scores.circumplex.octants)) {
      if (data.average >= 3.5) {
        problems.push({
          area: this.formatOctantName(octant),
          severity: data.level,
          score: data.average
        });
      }
    }

    // Sort by score descending
    problems.sort((a, b) => b.score - a.score);

    this.scores.circumplex.primaryProblems = problems;
  }

  /**
   * Calculate relationship quality
   */
  calculateRelationshipQuality() {
    const resp = this.findResponse(RELATIONSHIP_QUALITY_ITEM);

    if (resp) {
      const score = this.getLikertScore(resp);
      this.scores.relationshipQuality.score = score;
      this.scores.relationshipQuality.level = this.getRelationshipQualityLevel(score);

      logger.info(`[Interpersonal] Relationship quality: ${score} (${this.scores.relationshipQuality.level})`);
    }
  }

  /**
   * Get comprehensive interpersonal report
   */
  getInterpersonalReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      attachmentAnalysis: this.getAttachmentAnalysis(),
      interpersonalProblems: this.getInterpersonalProblems(),
      relationshipPatterns: this.getRelationshipPatterns(),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const style = this.scores.attachment.style;
    const anxious = this.scores.attachment.anxious.average;
    const avoidant = this.scores.attachment.avoidant.average;

    let summary = `Attachment Style: ${style}. `;

    if (style !== 'Unknown') {
      summary += `${this.scores.attachment.description}. `;
      summary += `Anxious attachment: ${anxious.toFixed(1)}/5.0. Avoidant attachment: ${avoidant.toFixed(1)}/5.0. `;
    }

    if (this.scores.circumplex.primaryProblems.length > 0) {
      const primaryProblem = this.scores.circumplex.primaryProblems[0];
      summary += `Primary interpersonal problem: ${primaryProblem.area} (${primaryProblem.severity}).`;
    } else {
      summary += `No significant interpersonal problems detected.`;
    }

    return summary;
  }

  /**
   * Get detailed attachment analysis
   */
  getAttachmentAnalysis() {
    const style = this.scores.attachment.style;
    const analysis = {
      style: style,
      description: this.scores.attachment.description,
      characteristics: [],
      relationshipPatterns: [],
      therapeuticFocus: []
    };

    if (style === 'Secure') {
      analysis.characteristics = [
        'Comfortable with emotional closeness',
        'Able to depend on others and have others depend on them',
        'Not overly worried about being abandoned',
        'Can balance independence and intimacy'
      ];
      analysis.relationshipPatterns = [
        'Stable, trusting relationships',
        'Effective communication',
        'Healthy boundaries',
        'Can navigate conflict constructively'
      ];
      analysis.therapeuticFocus = [
        'Maintain healthy relationship patterns',
        'Support others in developing secure attachment'
      ];
    } else if (style === 'Anxious-Preoccupied') {
      analysis.characteristics = [
        'High need for closeness and reassurance',
        'Fear of abandonment or rejection',
        'Preoccupation with relationships',
        'May be overly dependent on partner validation'
      ];
      analysis.relationshipPatterns = [
        'Seeks constant reassurance',
        'May become clingy or demanding',
        'Difficulty trusting partner commitment',
        'Heightened sensitivity to relationship threats'
      ];
      analysis.therapeuticFocus = [
        'Build self-soothing and emotion regulation skills',
        'Develop more secure internal working model',
        'Challenge catastrophic relationship thoughts',
        'Practice independence and self-validation'
      ];
    } else if (style === 'Dismissive-Avoidant') {
      analysis.characteristics = [
        'Values independence and self-sufficiency',
        'Uncomfortable with emotional intimacy',
        'May downplay importance of relationships',
        'Difficulty depending on others or being depended upon'
      ];
      analysis.relationshipPatterns = [
        'Maintains emotional distance',
        'May withdraw during conflict',
        'Prioritizes autonomy over connection',
        'Difficulty with vulnerability'
      ];
      analysis.therapeuticFocus = [
        'Explore fears around intimacy and vulnerability',
        'Practice emotional expression and sharing',
        'Recognize value of close relationships',
        'Build comfort with interdependence'
      ];
    } else if (style === 'Fearful-Avoidant (Disorganized)') {
      analysis.characteristics = [
        'Conflicted desire for closeness paired with fear of rejection',
        'Unpredictable relationship behaviors',
        'High anxiety and high avoidance',
        'May have history of trauma or inconsistent caregiving'
      ];
      analysis.relationshipPatterns = [
        'Push-pull dynamic in relationships',
        'Difficulty trusting others',
        'Approach-avoidance conflict',
        'May recreate chaotic relationship patterns'
      ];
      analysis.therapeuticFocus = [
        'Process past relationship trauma',
        'Develop earned secure attachment',
        'Build distress tolerance and emotion regulation',
        'Practice consistent, predictable relationship behaviors',
        'Consider trauma-focused therapy (EMDR, CPT)'
      ];
    }

    return analysis;
  }

  /**
   * Get interpersonal problems analysis
   */
  getInterpersonalProblems() {
    const problems = {
      identified: this.scores.circumplex.primaryProblems,
      axes: {
        agency: this.getAgencyInterpretation(),
        communion: this.getCommunionInterpretation()
      },
      octantDescriptions: this.getOctantDescriptions()
    };

    return problems;
  }

  /**
   * Get agency axis interpretation
   */
  getAgencyInterpretation() {
    const agency = this.scores.circumplex.agency;

    if (agency > 1.0) {
      return 'Tends toward dominance and control in relationships';
    } else if (agency < -1.0) {
      return 'Tends toward submissiveness and difficulty asserting needs';
    } else {
      return 'Balanced agency in relationships';
    }
  }

  /**
   * Get communion axis interpretation
   */
  getCommunionInterpretation() {
    const communion = this.scores.circumplex.communion;

    if (communion > 1.0) {
      return 'Warm, friendly interpersonal style (may be overly nurturant)';
    } else if (communion < -1.0) {
      return 'Cold, distant interpersonal style with difficulty expressing warmth';
    } else {
      return 'Balanced warmth in relationships';
    }
  }

  /**
   * Get octant descriptions for elevated scores
   */
  getOctantDescriptions() {
    const descriptions = {};

    for (const [octant, data] of Object.entries(this.scores.circumplex.octants)) {
      if (data.average >= 3.0) {
        descriptions[octant] = this.getOctantDescription(octant);
      }
    }

    return descriptions;
  }

  /**
   * Get specific octant description
   */
  getOctantDescription(octant) {
    const descriptions = {
      domineering: 'Difficulty letting others lead; controlling; overly directive',
      vindictive: 'Holds grudges; difficulty trusting; can be hostile or suspicious',
      cold: 'Difficulty expressing affection; emotionally distant; withdrawn',
      submissive: 'Difficulty saying no; overly accommodating; lets others make decisions',
      nurturant: 'Puts others\' needs before own; difficulty setting boundaries; overly responsible'
    };

    return descriptions[octant] || '';
  }

  /**
   * Get relationship patterns analysis
   */
  getRelationshipPatterns() {
    const patterns = [];
    const style = this.scores.attachment.style;
    const primaryProblems = this.scores.circumplex.primaryProblems;

    // Attachment-based patterns
    if (style === 'Anxious-Preoccupied') {
      patterns.push('May seek excessive reassurance from partners');
      patterns.push('Heightened sensitivity to rejection cues');
    } else if (style === 'Dismissive-Avoidant') {
      patterns.push('May maintain emotional distance in relationships');
      patterns.push('Tendency to prioritize independence over connection');
    } else if (style === 'Fearful-Avoidant (Disorganized)') {
      patterns.push('Conflicted approach-avoidance in close relationships');
      patterns.push('Difficulty maintaining consistent relationship boundaries');
    }

    // Circumplex-based patterns
    if (primaryProblems.length > 0) {
      primaryProblems.forEach(problem => {
        patterns.push(`${problem.area} may create relationship friction`);
      });
    }

    return patterns;
  }

  /**
   * Get recommendations
   */
  getRecommendations() {
    const recommendations = [];
    const style = this.scores.attachment.style;
    const anxious = this.scores.attachment.anxious.average;
    const avoidant = this.scores.attachment.avoidant.average;

    // Attachment-based recommendations
    if (style === 'Anxious-Preoccupied') {
      recommendations.push('Work on building self-soothing skills and secure base within yourself');
      recommendations.push('Practice tolerating uncertainty in relationships without seeking constant reassurance');
      recommendations.push('Consider therapy focused on attachment (emotionally-focused therapy, schema therapy)');
    } else if (style === 'Dismissive-Avoidant') {
      recommendations.push('Practice vulnerability and emotional expression with trusted others');
      recommendations.push('Explore the benefits of interdependence and connection');
      recommendations.push('Work on recognizing and expressing emotional needs');
    } else if (style === 'Fearful-Avoidant (Disorganized)') {
      recommendations.push('Consider trauma-focused therapy to address relationship fears');
      recommendations.push('Work on developing a coherent narrative of past relationship experiences');
      recommendations.push('Practice consistent, predictable relationship behaviors');
    }

    // Circumplex-based recommendations
    const problems = this.scores.circumplex.primaryProblems;

    if (problems.some(p => p.area.includes('Domineering'))) {
      recommendations.push('Practice allowing others to take the lead and make decisions');
    }

    if (problems.some(p => p.area.includes('Vindictive'))) {
      recommendations.push('Work on trust-building and letting go of resentments');
    }

    if (problems.some(p => p.area.includes('Cold'))) {
      recommendations.push('Practice expressing warmth and affection verbally and physically');
    }

    if (problems.some(p => p.area.includes('Submissive'))) {
      recommendations.push('Work on assertiveness skills and setting healthy boundaries');
    }

    if (problems.some(p => p.area.includes('Nurturant'))) {
      recommendations.push('Practice saying no and prioritizing your own needs');
    }

    // Relationship quality recommendations
    if (this.scores.relationshipQuality.score <= 2.5) {
      recommendations.push('Current relationship dissatisfaction warrants attention - consider couples therapy');
    }

    return recommendations;
  }

  /**
   * Helper: Get likert score (1-5)
   */
  getLikertScore(response) {
    if (typeof response.score === 'number') {
      return response.score;
    }

    const scoreMap = {
      'Strongly Disagree': 1,
      'Disagree': 2,
      'Neutral': 3,
      'Agree': 4,
      'Strongly Agree': 5
    };

    return scoreMap[response.response] || scoreMap[response.value] || 3;
  }

  /**
   * Get attachment dimension level
   */
  getAttachmentLevel(average) {
    if (average >= 4.0) return 'Very High';
    if (average >= 3.5) return 'High';
    if (average >= 2.5) return 'Moderate';
    if (average >= 2.0) return 'Low';
    return 'Very Low';
  }

  /**
   * Get interpersonal problem level
   */
  getProblemLevel(average) {
    if (average >= 4.0) return 'Severe';
    if (average >= 3.5) return 'Moderate-Severe';
    if (average >= 3.0) return 'Moderate';
    if (average >= 2.5) return 'Mild-Moderate';
    if (average >= 2.0) return 'Mild';
    return 'Minimal';
  }

  /**
   * Get relationship quality level
   */
  getRelationshipQualityLevel(score) {
    if (score >= 4.5) return 'Very High';
    if (score >= 3.5) return 'High';
    if (score >= 2.5) return 'Moderate';
    if (score >= 2.0) return 'Low';
    return 'Very Low';
  }

  /**
   * Format octant name for display
   */
  formatOctantName(octant) {
    const nameMap = {
      domineering: 'Domineering/Controlling',
      vindictive: 'Vindictive/Self-Centered',
      cold: 'Cold/Distant',
      submissive: 'Nonassertive/Submissive',
      nurturant: 'Overly Nurturant'
    };

    return nameMap[octant] || octant;
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }
}

module.exports = InterpersonalScorer;
