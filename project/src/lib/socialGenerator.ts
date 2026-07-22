// Rule-based content generation engine for social media generators.
// Uses predefined templates, word banks, and randomized selection.
// Architected so a future AI provider can replace generateX functions with
// the same input shape (topic, category, language, tone, keywords) and output shape.

export type Tone = 'casual' | 'professional' | 'funny' | 'educational' | 'inspirational' | 'bold';
export type Language = 'english' | 'spanish' | 'french' | 'german' | 'hindi';

export type GeneratorInput = {
  topic: string;
  category: string;
  language: Language;
  tone: Tone;
  keywords: string[];
};

export type GeneratedContent = {
  titles: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  hooks: string[];
  ctas: string[];
  seoKeywords: string[];
  thumbnailText: string[];
  filenames: string[];
};

const TITLE_TEMPLATES: Record<Tone, string[]> = {
  casual: [
    "{topic} — here's what nobody tells you",
    'Just tried {topic} and wow…',
    'My honest take on {topic}',
    '{topic} for beginners (no fluff)',
    "Let's talk about {topic}",
  ],
  professional: [
    'The Complete Guide to {topic}',
    'Mastering {topic}: A Step-by-Step Approach',
    '{topic}: Best Practices and Common Pitfalls',
    'Understanding {topic} in {year}',
    'How to Approach {topic} Professionally',
  ],
  funny: [
    "{topic} but it's a disaster",
    "I tried {topic} so you don't have to",
    'POV: you thought {topic} would be easy',
    '{topic} gone wrong (hilarious)',
    "When {topic} doesn't go as planned",
  ],
  educational: [
    'How {topic} Actually Works (explained simply)',
    '{topic} 101 — everything you need to know',
    '5 things about {topic} you should learn today',
    'The science behind {topic}',
    'Demystifying {topic} in under 10 minutes',
  ],
  inspirational: [
    'How {topic} changed my life',
    'The power of {topic}',
    'Why {topic} matters more than you think',
    'From zero to hero with {topic}',
    '{topic}: a journey worth taking',
  ],
  bold: [
    'The TRUTH about {topic}',
    'STOP doing {topic} wrong',
    "{topic} — what they don't want you to know",
    'The ultimate {topic} hack',
    '{topic}: do this instead',
  ],
};

const HOOK_TEMPLATES = [
  "Stop scrolling if you've ever struggled with {topic}.",
  'I wish someone told me this about {topic} sooner.',
  "Here's the {topic} secret nobody talks about.",
  'Did you know {topic} could be this easy?',
  'Watch this before you try {topic}.',
  'This {topic} tip saved me hours.',
  'Nobody is talking about this {topic} mistake.',
  "The #1 {topic} rule you're breaking.",
];

const CTA_TEMPLATES = [
  'Subscribe for more!',
  'Follow for daily tips.',
  'Like if this helped.',
  'Save this for later.',
  'Share with someone who needs it.',
  'Comment your thoughts below.',
  'Hit the bell so you never miss a video.',
  'Check the description for links.',
];

const DESC_INTROS: Record<Tone, string[]> = {
  casual: ['Hey everyone!', 'So,', 'Quick heads up —'],
  professional: ['In this video,', 'Today we explore', 'This guide covers'],
  funny: ['Okay so', "You won't believe", 'Plot twist —'],
  educational: ['Learn how', 'In this tutorial,', "Here's a breakdown of"],
  inspirational: ['This is the story of', 'Believe it or not,', 'It all started with'],
  bold: ["Let's be real:", "Here's the truth:", 'No fluff, just'],
};

const TAG_BANK = [
  'tutorial', 'guide', 'tips', 'howto', 'explained', 'beginners', '2025',
  'viral', 'trending', 'best', 'top', 'easy', 'simple', 'stepbystep',
  'review', 'honest', 'diy', 'lifehacks', 'motivation', 'learning',
];

const HASHTAG_BANK: Record<string, string[]> = {
  youtube: ['#youtube', '#youtuber', '#youtubecreator', '#video', '#contentcreator', '#viral', '#trending', '#subscribe', '#tutorial', '#howto'],
  tiktok: ['#tiktok', '#fyp', '#foryou', '#viral', '#tiktokmademebuyit', '#trending', '#tiktokdance', '#duet', '#smallcreator', '#creator'],
  instagram: ['#instagram', '#instagood', '#reels', '#explore', '#instadaily', '#photooftheday', '#instamood', '#love', '#follow', '#like4like'],
  facebook: ['#facebook', '#fb', '#facebookpage', '#facebookpost', '#socialmedia', '#community', '#share', '#like', '#comment', '#viral'],
  twitter: ['#twitter', '#tweet', '#thread', '#breaking', '#news', '#trending', '#retweet', '#thoughts', '#daily', '#update'],
};

const SEO_BANK = [
  'best', 'how to', 'what is', 'guide', 'tutorial', 'review',
  'vs', 'comparison', 'examples', 'tips', 'tricks', 'mistakes',
  'for beginners', 'step by step', 'explained',
];

const THUMB_TEMPLATES = [
  '{topic} EXPLAINED',
  'TRY THIS',
  'THE TRUTH',
  'YOU NEED THIS',
  'WATCH BEFORE',
  'TOP 5 TIPS',
  '{topic} 101',
  "DON'T DO THIS",
];

const FILENAME_TEMPLATES = [
  '{slug}-tutorial', '{slug}-guide', '{slug}-tips', '{slug}-explained',
  '{slug}-for-beginners', '{slug}-review', '{slug}-2025', '{slug}-walkthrough',
];

function pick<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < n && used.size < arr.length) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * arr.length);
    if (!used.has(idx)) {
      used.add(idx);
      out.push(arr[idx]);
    }
  }
  return out;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

function fill(tpl: string, input: GeneratorInput): string {
  return tpl
    .replace(/\{topic\}/g, input.topic)
    .replace(/\{year\}/g, '2025')
    .replace(/\{keywords\}/g, input.keywords.slice(0, 3).join(', '));
}

function seedFrom(input: GeneratorInput): number {
  const s = `${input.topic}|${input.category}|${input.tone}|${input.keywords.join(',')}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 233280;
  return h || 1;
}

function buildDescription(input: GeneratorInput, platform: string): string {
  const intro = pick(DESC_INTROS[input.tone], 1, seedFrom(input) + 1)[0];
  const kw = input.keywords.length ? input.keywords : [input.topic];
  const lines = [
    `${intro} ${input.topic}.`,
    '',
    `In this ${platform} post we cover everything about ${input.topic}, including ${kw.slice(0, 3).join(', ')}.`,
    '',
    input.tone === 'educational'
      ? `Perfect for beginners and anyone who wants to level up their ${input.category} skills.`
      : `Whether you're just starting out or already familiar with ${input.topic}, there's something here for you.`,
    '',
    ...pick(HOOK_TEMPLATES, 2, seedFrom(input) + 7).map((h) => `• ${fill(h, input)}`),
    '',
    ...pick(CTA_TEMPLATES, 2, seedFrom(input) + 11).map((c) => `${c}`),
    '',
    `Keywords: ${kw.join(', ')}`,
  ];
  return lines.join('\n');
}

function makeTags(input: GeneratorInput, count: number): string[] {
  const base = input.keywords.length ? input.keywords : [input.topic];
  const all = [...base, ...TAG_BANK.map((t) => `${slugify(input.topic)} ${t}`)];
  return pick(all, count, seedFrom(input) + 3).map((t) => t.toLowerCase());
}

function makeHashtags(platform: keyof typeof HASHTAG_BANK, input: GeneratorInput, count: number): string[] {
  const slug = slugify(input.topic).replace(/-/g, '');
  const custom = input.keywords.map((k) => `#${slugify(k).replace(/-/g, '')}`);
  const all = [...custom, `#${slug}`, ...HASHTAG_BANK[platform]];
  return pick(all, count, seedFrom(input) + 5);
}

function makeTitles(input: GeneratorInput, count: number): string[] {
  const templates = TITLE_TEMPLATES[input.tone];
  return pick(templates, Math.min(count, templates.length), seedFrom(input)).map((t) => fill(t, input));
}

export function generateYouTube(input: GeneratorInput): GeneratedContent {
  return {
    titles: makeTitles(input, 10),
    description: buildDescription(input, 'YouTube'),
    tags: makeTags(input, 30),
    hashtags: makeHashtags('youtube', input, 20),
    hooks: pick(HOOK_TEMPLATES, 5, seedFrom(input) + 7).map((h) => fill(h, input)),
    ctas: pick(CTA_TEMPLATES, 5, seedFrom(input) + 11),
    seoKeywords: SEO_BANK.map((s) => `${s} ${input.topic}`),
    thumbnailText: pick(THUMB_TEMPLATES, 5, seedFrom(input) + 13).map((t) => fill(t, input)),
    filenames: pick(FILENAME_TEMPLATES, 5, seedFrom(input) + 17).map((t) => fill(t, { ...input, topic: slugify(input.topic) })),
  };
}

export function generateTikTok(input: GeneratorInput): GeneratedContent {
  const captions = makeTitles(input, 10).map((t) => t.length > 100 ? t.slice(0, 97) + '…' : t);
  return {
    titles: captions,
    description: `${input.topic} ${pick(HOOK_TEMPLATES, 1, seedFrom(input))[0]}`.replace(/\{topic\}/g, input.topic),
    tags: makeTags(input, 15),
    hashtags: makeHashtags('tiktok', input, 20),
    hooks: pick(HOOK_TEMPLATES, 5, seedFrom(input) + 7).map((h) => fill(h, input)),
    ctas: pick(CTA_TEMPLATES, 3, seedFrom(input) + 11),
    seoKeywords: SEO_BANK.map((s) => `${s} ${input.topic}`).slice(0, 10),
    thumbnailText: pick(THUMB_TEMPLATES, 3, seedFrom(input) + 13).map((t) => fill(t, input)),
    filenames: pick(FILENAME_TEMPLATES, 3, seedFrom(input) + 17).map((t) => fill(t, { ...input, topic: slugify(input.topic) })),
  };
}

export function generateInstagram(input: GeneratorInput): GeneratedContent {
  return {
    titles: makeTitles(input, 10),
    description: buildDescription(input, 'Instagram'),
    tags: makeTags(input, 15),
    hashtags: makeHashtags('instagram', input, 30),
    hooks: pick(HOOK_TEMPLATES, 5, seedFrom(input) + 7).map((h) => fill(h, input)),
    ctas: pick(CTA_TEMPLATES, 3, seedFrom(input) + 11),
    seoKeywords: SEO_BANK.map((s) => `${s} ${input.topic}`).slice(0, 10),
    thumbnailText: [],
    filenames: [],
  };
}

export function generateFacebook(input: GeneratorInput): GeneratedContent {
  return {
    titles: makeTitles(input, 10),
    description: buildDescription(input, 'Facebook'),
    tags: makeTags(input, 15),
    hashtags: makeHashtags('facebook', input, 15),
    hooks: pick(HOOK_TEMPLATES, 5, seedFrom(input) + 7).map((h) => fill(h, input)),
    ctas: pick(CTA_TEMPLATES, 3, seedFrom(input) + 11),
    seoKeywords: SEO_BANK.map((s) => `${s} ${input.topic}`).slice(0, 10),
    thumbnailText: [],
    filenames: [],
  };
}

export function generateTwitter(input: GeneratorInput): GeneratedContent {
  const tweets = makeTitles(input, 10).map((t) => {
    const tags = makeHashtags('twitter', input, 3);
    const body = t.length + tags.join(' ').length > 270 ? t.slice(0, 270 - tags.join(' ').length) : t;
    return `${body} ${tags.join(' ')}`;
  });
  const thread = [`1/ ${input.topic} — a thread 🧵`, ...makeTitles(input, 8).map((t, i) => `${i + 2}/ ${t}`)];
  return {
    titles: tweets,
    description: thread.join('\n\n'),
    tags: makeTags(input, 10),
    hashtags: makeHashtags('twitter', input, 15),
    hooks: pick(HOOK_TEMPLATES, 3, seedFrom(input) + 7).map((h) => fill(h, input)),
    ctas: pick(CTA_TEMPLATES, 3, seedFrom(input) + 11),
    seoKeywords: SEO_BANK.map((s) => `${s} ${input.topic}`).slice(0, 8),
    thumbnailText: [],
    filenames: [],
  };
}

export const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'professional', label: 'Professional' },
  { value: 'funny', label: 'Funny' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'bold', label: 'Bold' },
];

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'hindi', label: 'Hindi' },
];
