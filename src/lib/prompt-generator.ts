/* ── Presentation Prompt Generator ── */

export interface PresentationFormData {
  topic: string;
  slideCount: number;
  slideStructure: string;
  audience: string;
  customAudience: string;
  language: string;
  customLanguage: string;
  purpose: string;
  visualStyle: string;
  customVisualStyle: string;
  contentDetail: string;
  specialRequirements: string;
  outputFormat: string;
}

export const DEFAULT_FORM_DATA: PresentationFormData = {
  topic: '',
  slideCount: 12,
  slideStructure: '',
  audience: 'university',
  customAudience: '',
  language: 'indonesian',
  customLanguage: '',
  purpose: 'academic',
  visualStyle: 'clean-premium',
  customVisualStyle: '',
  contentDetail: 'balanced',
  specialRequirements: '',
  outputFormat: 'single-html',
};

export const AUDIENCE_OPTIONS = [
  { value: 'university', label: 'University Students' },
  { value: 'academic', label: 'Lecturer / Academic' },
  { value: 'business', label: 'Business' },
  { value: 'public', label: 'General Public' },
  { value: 'technical', label: 'Technical Audience' },
  { value: 'custom', label: 'Custom…' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'indonesian', label: 'Indonesian' },
  { value: 'english', label: 'English' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'custom', label: 'Other / Custom…' },
];

export const PURPOSE_OPTIONS = [
  { value: 'academic', label: 'Academic Assignment' },
  { value: 'business', label: 'Business Presentation' },
  { value: 'project', label: 'Project Presentation' },
  { value: 'pitch', label: 'Pitch' },
  { value: 'educational', label: 'Educational' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'general', label: 'General' },
];

export const VISUAL_STYLE_OPTIONS = [
  { value: 'clean-premium', label: 'Clean Premium Editorial' },
  { value: 'swiss-minimal', label: 'Swiss / Minimal' },
  { value: 'modern-tech', label: 'Modern Technology' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'academic', label: 'Academic' },
  { value: 'creative', label: 'Creative' },
  { value: 'custom', label: 'Custom…' },
];

export const CONTENT_DETAIL_OPTIONS = [
  { value: 'concise', label: 'Concise' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'deep', label: 'Deep / Insight-driven' },
];

export const OUTPUT_FORMAT_OPTIONS = [
  { value: 'single-html', label: 'Single self-contained HTML file' },
];

/* ── Helpers ── */

function resolveLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function resolveAudience(data: PresentationFormData): string {
  if (data.audience === 'custom' && data.customAudience.trim()) return data.customAudience.trim();
  return resolveLabel(AUDIENCE_OPTIONS, data.audience);
}

function resolveLanguage(data: PresentationFormData): string {
  if (data.language === 'custom' && data.customLanguage.trim()) return data.customLanguage.trim();
  return resolveLabel(LANGUAGE_OPTIONS, data.language);
}

function resolveVisualStyle(data: PresentationFormData): string {
  if (data.visualStyle === 'custom' && data.customVisualStyle.trim()) return data.customVisualStyle.trim();
  return resolveLabel(VISUAL_STYLE_OPTIONS, data.visualStyle);
}

function describeContentDepth(detail: string): string {
  switch (detail) {
    case 'concise':
      return 'Keep each slide focused and concise — short headlines, minimal body text, and high-impact phrasing. Favor visual clarity over exhaustive explanation.';
    case 'balanced':
      return 'Strike a balance between depth and readability. Each slide should have a clear headline, a brief supporting narrative, and well-structured key points.';
    case 'detailed':
      return 'Provide substantive content on each slide. Include supporting explanations, examples, and context so the presentation stands on its own without heavy speaker notes.';
    case 'deep':
      return 'Go deep with insight-driven content. Each slide should surface underlying reasoning, evidence, nuance, and strategic implications — not just surface-level summaries.';
    default:
      return 'Provide well-structured, balanced content appropriate for the topic and audience.';
  }
}

/* ── Main Generator ── */

export function generatePresentationPrompt(data: PresentationFormData): string {
  const topic = data.topic.trim() || 'the given topic';
  const audience = resolveAudience(data);
  const language = resolveLanguage(data);
  const purpose = resolveLabel(PURPOSE_OPTIONS, data.purpose).toLowerCase();
  const visualStyle = resolveVisualStyle(data);
  const contentDepth = describeContentDepth(data.contentDetail);
  const slideCount = data.slideCount > 0 ? data.slideCount : 12;

  const structureSection = data.slideStructure.trim()
    ? `The intended structure is: ${data.slideStructure.trim()}. Follow this structure as a guide while ensuring the overall flow feels natural and deliberate.`
    : `Distribute the ${slideCount} slides logically — begin with an opening that sets the context, develop the core ideas across the content slides, and close with a meaningful conclusion or call-to-action.`;

  const specialSection = data.specialRequirements.trim()
    ? `\nAdditionally, respect these specific requirements from the presenter:\n${data.specialRequirements.trim()}`
    : '';

  return `You are an expert presentation designer and content strategist specializing in creating polished, insight-driven slide decks. Your task is to generate a complete HTML presentation.

Create a presentation on the topic of "**${topic}**".

The presentation should contain ${slideCount} slides. ${structureSection}

The target audience is ${audience}. The presentation is intended as a ${purpose}. Use **${language}** as the primary language for all content, labels, and text.

For the visual direction, adopt a **${visualStyle}** aesthetic. The design should feel intentionally crafted — not templated or generic.${specialSection}

Content depth and narrative quality:
${contentDepth}

Quality constraints — apply these principles throughout the presentation:
- Do not merely summarize or list surface-level points. Understand the context, underlying concepts, evidence, and implications.
- Build a logical narrative where each slide advances the argument or story.
- Each slide should communicate one primary idea through an insight-driven headline — not a generic label.
- Prioritize information hierarchy: lead with the most important idea, support it with structured evidence.
- Avoid unnecessary repetition across slides.
- Never invent facts, statistics, or references not supported by the source material.
- Select visual layouts based on the nature of the information — avoid using the same layout repeatedly.
- Maintain visual consistency without making every slide look identical.

Design constraints — strictly follow these:
- Avoid excessive gradients, glassmorphism, glowing effects, random decorative icons, excessive card components, heavy shadows, and ornamentation without purpose.
- Prioritize typography, grid alignment, whitespace, hierarchy, contrast, and readability.
- Use motion or transitions sparingly and only when they serve a communicative purpose.
- The final result should feel intentionally designed by a professional — not generated by AI.

Technical requirements:
- Output a single self-contained HTML file with all CSS and content inline.
- The HTML must be renderable in any modern browser without external dependencies.
- Ensure the presentation is responsive and works on both projected screens and standard monitors.
- Structure the HTML cleanly with semantic markup.`;
}
