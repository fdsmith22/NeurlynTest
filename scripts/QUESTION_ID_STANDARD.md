# Question ID Standardization Documentation

## Overview

Date: 2025-09-28T13:07:46.770Z
Questions Updated: 194
Pattern Reduction: 116 → 37

## ID Format

Standard format: `CATEGORY_SUBCODE_###`

## Category Prefixes

- BFI: Personality (Big Five Inventory)
- NDV: Neurodiversity
- COG: Cognitive
- JUNG: Jungian Cognitive Functions
- ENNE: Enneagram
- ATT: Attachment
- TRA: Trauma Screening
- LRN: Learning Style

## Common Subcategory Codes

### Personality (BFI)

- OPEN: Openness
- CONSC: Conscientiousness
- EXTRA: Extraversion
- AGREE: Agreeableness
- NEURO: Neuroticism
- BEHAV: Behavioral
- SITUA: Situational
- PREF: Preferences

### Neurodiversity (NDV)

- EXEC: Executive Function
- SENS: Sensory Processing
- SOCIAL: Social Communication
- MASK: Masking
- ADHD: ADHD Indicators
- ASD: Autism Spectrum

### Executive Function Details

- TASK: Task Initiation
- PROC: Procrastination
- TIME: Time Management
- WMEM: Working Memory
- ORG: Organization
- PLAN: Planning
- IMPUL: Impulse Control

### Sensory Processing

- TACT: Tactile
- AUD: Auditory
- VIS: Visual
- PROP: Proprioception

## Examples

- BFI_OPEN_001: Personality question about openness
- NDV_EXEC_001: Neurodiversity executive function question
- COG_SPAT_001: Cognitive spatial reasoning question
- JUNG_NI_001: Introverted intuition question
- ATT_SEC_001: Secure attachment question

## Implementation Notes

- All questions now follow this standard
- Maximum 37 unique patterns
- Consistent numbering within subcategories
- Easy to add new questions following the pattern

## Adding New Questions

When adding new questions:

1. Use the appropriate category prefix
2. Choose or create a subcategory code (max 6 characters)
3. Number sequentially within the subcategory
4. Example: NDV_EXEC_021 for the 21st executive function question
