/**
 * Question Pool Cache
 *
 * Performance optimization: Cache active questions to avoid repeated database queries
 * during adaptive question selection. This significantly reduces latency during
 * multi-stage assessment flow.
 *
 * Cache Strategy:
 * - In-memory cache with 1-hour TTL
 * - Automatic invalidation on TTL expiry
 * - Manual invalidation method for question bank updates
 * - Categorized sub-caches for targeted queries
 */

const QuestionBank = require('../models/QuestionBank');

class QuestionPoolCache {
  constructor() {
    this.cache = null;
    this.lastUpdated = null;
    this.TTL = 3600000; // 1 hour in milliseconds

    // Categorized caches for faster lookups
    this.categorizedCache = {
      personality: null,
      clinical_psychopathology: null,
      neurodiversity: null,
      attachment: null,
      trauma_screening: null,
      cognitive: null,
      validity_scales: null
    };

    this.instrumentCache = new Map(); // Cache by instrument name
    this.traitCache = new Map();      // Cache by trait

    console.log('[QuestionPoolCache] Initialized with TTL:', this.TTL / 1000, 'seconds');
  }

  /**
   * Get all active questions (with caching)
   * @returns {Promise<Array>} All active questions
   */
  async getQuestions() {
    if (this.isCacheValid()) {
      console.log('[QuestionPoolCache] Cache hit - returning cached questions');
      return this.cache;
    }

    console.log('[QuestionPoolCache] Cache miss - fetching from database');
    await this.refreshCache();
    return this.cache;
  }

  /**
   * Get questions by category
   * @param {String} category - Question category
   * @returns {Promise<Array>} Questions in category
   */
  async getQuestionsByCategory(category) {
    // Ensure main cache is populated
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }

    if (this.categorizedCache[category]) {
      console.log(`[QuestionPoolCache] Category cache hit: ${category}`);
      return this.categorizedCache[category];
    }

    // Filter from main cache
    const questions = this.cache.filter(q => q.category === category);
    this.categorizedCache[category] = questions;

    console.log(`[QuestionPoolCache] Cached ${questions.length} questions for category: ${category}`);
    return questions;
  }

  /**
   * Get questions by instrument
   * @param {String} instrument - Instrument name (e.g., 'PHQ-9', 'GAD-7')
   * @returns {Promise<Array>} Questions for instrument
   */
  async getQuestionsByInstrument(instrument) {
    // Ensure main cache is populated
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }

    if (this.instrumentCache.has(instrument)) {
      console.log(`[QuestionPoolCache] Instrument cache hit: ${instrument}`);
      return this.instrumentCache.get(instrument);
    }

    // Filter from main cache
    const questions = this.cache.filter(q => q.instrument === instrument);
    this.instrumentCache.set(instrument, questions);

    console.log(`[QuestionPoolCache] Cached ${questions.length} questions for instrument: ${instrument}`);
    return questions;
  }

  /**
   * Get questions by trait
   * @param {String} trait - Big Five trait
   * @returns {Promise<Array>} Questions for trait
   */
  async getQuestionsByTrait(trait) {
    // Ensure main cache is populated
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }

    if (this.traitCache.has(trait)) {
      console.log(`[QuestionPoolCache] Trait cache hit: ${trait}`);
      return this.traitCache.get(trait);
    }

    // Filter from main cache
    const questions = this.cache.filter(q => q.trait === trait);
    this.traitCache.set(trait, questions);

    console.log(`[QuestionPoolCache] Cached ${questions.length} questions for trait: ${trait}`);
    return questions;
  }

  /**
   * Get questions by trait AND facet
   * @param {String} trait - Big Five trait
   * @param {String} facet - NEO-PI-R facet
   * @returns {Promise<Array>} Questions for trait/facet
   */
  async getQuestionsByTraitFacet(trait, facet) {
    // Ensure main cache is populated
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }

    const cacheKey = `${trait}_${facet}`;
    if (this.traitCache.has(cacheKey)) {
      console.log(`[QuestionPoolCache] Trait/facet cache hit: ${cacheKey}`);
      return this.traitCache.get(cacheKey);
    }

    // Filter from main cache
    const questions = this.cache.filter(q => q.trait === trait && q.facet === facet);
    this.traitCache.set(cacheKey, questions);

    console.log(`[QuestionPoolCache] Cached ${questions.length} questions for ${cacheKey}`);
    return questions;
  }

  /**
   * Check if cache is valid (not expired)
   * @returns {Boolean} True if cache is valid
   */
  isCacheValid() {
    if (!this.cache || !this.lastUpdated) {
      return false;
    }

    const age = Date.now() - this.lastUpdated;
    const isValid = age < this.TTL;

    if (!isValid) {
      console.log('[QuestionPoolCache] Cache expired, age:', Math.round(age / 1000), 'seconds');
    }

    return isValid;
  }

  /**
   * Refresh cache from database
   * @returns {Promise<void>}
   */
  async refreshCache() {
    const startTime = Date.now();

    try {
      // Fetch all active questions using lean() for better performance
      this.cache = await QuestionBank.find({ active: true })
        .lean()
        .exec();

      this.lastUpdated = Date.now();

      // Clear sub-caches to force rebuild
      this.clearSubCaches();

      const duration = Date.now() - startTime;
      console.log(`[QuestionPoolCache] Cache refreshed: ${this.cache.length} questions in ${duration}ms`);

      // Pre-populate category caches for faster access
      this.prepopulateCategoryCaches();

    } catch (error) {
      console.error('[QuestionPoolCache] Failed to refresh cache:', error);
      throw error;
    }
  }

  /**
   * Pre-populate category caches
   */
  prepopulateCategoryCaches() {
    const categories = [
      'personality',
      'clinical_psychopathology',
      'neurodiversity',
      'attachment',
      'trauma_screening',
      'cognitive',
      'validity_scales'
    ];

    for (const category of categories) {
      const questions = this.cache.filter(q => q.category === category);
      this.categorizedCache[category] = questions;
    }

    console.log('[QuestionPoolCache] Pre-populated category caches');
  }

  /**
   * Clear all sub-caches
   */
  clearSubCaches() {
    // Reset categorized cache
    for (const key in this.categorizedCache) {
      this.categorizedCache[key] = null;
    }

    // Clear maps
    this.instrumentCache.clear();
    this.traitCache.clear();

    console.log('[QuestionPoolCache] Sub-caches cleared');
  }

  /**
   * Manually invalidate cache
   * Call this after question bank updates
   */
  invalidate() {
    this.cache = null;
    this.lastUpdated = null;
    this.clearSubCaches();
    console.log('[QuestionPoolCache] Cache invalidated');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      isCached: !!this.cache,
      questionCount: this.cache ? this.cache.length : 0,
      lastUpdated: this.lastUpdated ? new Date(this.lastUpdated).toISOString() : null,
      age: this.lastUpdated ? Date.now() - this.lastUpdated : null,
      ageSeconds: this.lastUpdated ? Math.round((Date.now() - this.lastUpdated) / 1000) : null,
      ttlSeconds: this.TTL / 1000,
      isValid: this.isCacheValid(),
      categoryCacheSize: Object.values(this.categorizedCache).filter(c => c !== null).length,
      instrumentCacheSize: this.instrumentCache.size,
      traitCacheSize: this.traitCache.size
    };
  }

  /**
   * Warm up cache on server start
   * Call this during application initialization
   */
  async warmup() {
    console.log('[QuestionPoolCache] Warming up cache...');
    await this.refreshCache();
    console.log('[QuestionPoolCache] Cache warmup complete');
  }
}

// Singleton instance
const questionPoolCache = new QuestionPoolCache();

// Warm up cache on module load (optional - comment out if you want manual warmup)
// questionPoolCache.warmup().catch(err => {
//   console.error('[QuestionPoolCache] Warmup failed:', err);
// });

module.exports = questionPoolCache;
