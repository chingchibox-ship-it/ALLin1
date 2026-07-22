import {
  Image as ImageIcon,
  FileText,
  Youtube,
  Type,
  Code2,
  Calculator,
  Hash,
  Link2,
  Smartphone,
  Wrench,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type CategoryId =
  | 'image'
  | 'pdf'
  | 'social'
  | 'text'
  | 'developer'
  | 'calculators'
  | 'color'
  | 'url'
  | 'utilities'
  | 'code';

export type ToolCategory = {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  color: string;
  tags: string[];
};

export const CATEGORIES: ToolCategory[] = [
  {
    id: 'image',
    name: 'Image Tools',
    shortName: 'Image',
    description: 'Compress, resize, convert, crop, and edit images right in your browser.',
    icon: ImageIcon,
    color: 'from-sky-500 to-blue-600',
    tags: ['Popular'],
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    shortName: 'PDF',
    description: 'Merge, split, compress, rotate and transform PDF documents easily.',
    icon: FileText,
    color: 'from-rose-500 to-red-600',
    tags: ['Popular'],
  },
  {
    id: 'social',
    name: 'Social Tools',
    shortName: 'Social',
    description: 'Creator toolkit for YouTube, TikTok, Instagram, Facebook and Twitter.',
    icon: Youtube,
    color: 'from-fuchsia-500 to-pink-600',
    tags: ['New'],
  },
  {
    id: 'text',
    name: 'Text Tools',
    shortName: 'Text',
    description: 'Count, clean, transform, compare and generate text in seconds.',
    icon: Type,
    color: 'from-amber-500 to-orange-600',
    tags: ['Popular'],
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    shortName: 'Developer',
    description: 'Format JSON, decode JWT, test regex, generate CSS, encode strings.',
    icon: Code2,
    color: 'from-violet-500 to-indigo-600',
    tags: ['Popular'],
  },
  {
    id: 'code',
    name: 'Code Compiler',
    shortName: 'Compiler',
    description: 'Online code editor with live preview for HTML, CSS and JavaScript.',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-600',
    tags: ['New'],
  },
  {
    id: 'calculators',
    name: 'Calculators',
    shortName: 'Calculators',
    description: 'Age, BMI, loan, EMI, percentage, discount, GST and unit calculators.',
    icon: Calculator,
    color: 'from-emerald-500 to-teal-600',
    tags: ['Popular'],
  },
  {
    id: 'color',
    name: 'Color Tools',
    shortName: 'Color',
    description: 'Pick colors from images and convert between color formats.',
    icon: Hash,
    color: 'from-cyan-500 to-sky-600',
    tags: [],
  },
  {
    id: 'url',
    name: 'URL Tools',
    shortName: 'URL',
    description: 'Encode, decode and inspect URLs and query strings.',
    icon: Link2,
    color: 'from-lime-500 to-green-600',
    tags: [],
  },
  {
    id: 'utilities',
    name: 'Daily Utilities',
    shortName: 'Utilities',
    description: 'QR codes, passwords, timers, converters and more everyday tools.',
    icon: Wrench,
    color: 'from-slate-600 to-slate-800',
    tags: ['Popular'],
  },
];

export const CATEGORY_MAP: Record<CategoryId, ToolCategory> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<CategoryId, ToolCategory>
);

export type Tool = {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  badge?: 'new' | 'trending' | 'popular';
  keywords?: string[];
};

export const TOOLS: Tool[] = [
  // ---------- Image ----------
  { id: 'image-compress', name: 'Compress Image', description: 'Shrink image file size while keeping quality.', category: 'image', badge: 'popular', keywords: ['reduce', 'optimize', 'size'] },
  { id: 'image-resize', name: 'Resize Image', description: 'Scale images to exact width or height.', category: 'image', badge: 'popular' },
  { id: 'image-crop', name: 'Crop Image', description: 'Trim and crop images to any aspect ratio.', category: 'image' },
  { id: 'image-rotate', name: 'Rotate Image', description: 'Rotate images by 90, 180 or 270 degrees.', category: 'image' },
  { id: 'image-flip', name: 'Flip Image', description: 'Mirror images horizontally or vertically.', category: 'image' },
  { id: 'image-convert', name: 'Convert Image', description: 'Convert between JPG, PNG and WebP formats.', category: 'image', badge: 'popular' },
  { id: 'image-watermark', name: 'Add Watermark', description: 'Overlay text or logo watermarks on images.', category: 'image' },
  { id: 'image-exif', name: 'Remove EXIF Metadata', description: 'Strip hidden EXIF metadata from photos.', category: 'image' },
  { id: 'image-color-picker', name: 'Color Picker', description: 'Pick exact colors from any image pixel.', category: 'image', badge: 'trending' },
  { id: 'image-split', name: 'Image Splitter', description: 'Slice an image into rows and columns.', category: 'image' },
  { id: 'image-merge', name: 'Image Merger', description: 'Combine multiple images into one.', category: 'image' },
  { id: 'image-collage', name: 'Collage Maker', description: 'Build photo collages with grid layouts.', category: 'image', badge: 'new' },

  // ---------- PDF ----------
  { id: 'pdf-merge', name: 'Merge PDF', description: 'Combine multiple PDFs into one document.', category: 'pdf', badge: 'popular' },
  { id: 'pdf-split', name: 'Split PDF', description: 'Split a PDF by page ranges or into individual pages.', category: 'pdf' },
  { id: 'pdf-compress', name: 'Compress PDF', description: 'Reduce PDF size by lowering image quality.', category: 'pdf' },
  { id: 'pdf-rotate', name: 'Rotate PDF', description: 'Rotate all or selected pages of a PDF.', category: 'pdf' },
  { id: 'pdf-delete-pages', name: 'Delete Pages', description: 'Remove unwanted pages from a PDF.', category: 'pdf' },
  { id: 'pdf-extract-pages', name: 'Extract Pages', description: 'Pull selected pages into a new PDF.', category: 'pdf' },
  { id: 'pdf-rearrange', name: 'Rearrange Pages', description: 'Drag to reorder pages in a PDF.', category: 'pdf' },
  { id: 'pdf-jpg-to-pdf', name: 'JPG to PDF', description: 'Convert images into a single PDF.', category: 'pdf' },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Render every PDF page as a JPG image.', category: 'pdf' },
  { id: 'pdf-page-numbers', name: 'Add Page Numbers', description: 'Stamp page numbers onto a PDF.', category: 'pdf' },
  { id: 'pdf-watermark', name: 'Add PDF Watermark', description: 'Overlay text watermarks on every page.', category: 'pdf' },

  // ---------- Social (Creator Toolkit) ----------
  { id: 'yt-thumbnail-downloader', name: 'YouTube Thumbnail Downloader', description: "Grab a video's thumbnail in every resolution.", category: 'social', badge: 'popular', keywords: ['youtube', 'yt'] },
  { id: 'yt-thumbnail-preview', name: 'Thumbnail Preview', description: 'Preview how a thumbnail looks on YouTube.', category: 'social', keywords: ['youtube', 'yt'] },
  { id: 'yt-thumbnail-size', name: 'Thumbnail Size Checker', description: 'Check if a thumbnail meets 1280x720 spec.', category: 'social', keywords: ['youtube', 'yt'] },
  { id: 'yt-tag-counter', name: 'YouTube Tag Counter', description: 'Count tags and characters for video tags.', category: 'social', keywords: ['youtube', 'yt'] },
  { id: 'yt-title-counter', name: 'YouTube Title Counter', description: 'Check title length against the 100-char limit.', category: 'social', keywords: ['youtube', 'yt'] },
  { id: 'yt-description-counter', name: 'YouTube Description Counter', description: 'Count characters for video descriptions.', category: 'social', keywords: ['youtube', 'yt'] },
  { id: 'yt-timestamps', name: 'Timestamp Generator', description: 'Turn a list of times into YouTube chapters.', category: 'social', keywords: ['youtube', 'yt', 'chapters'] },
  { id: 'yt-content-generator', name: 'YouTube Content Generator', description: 'Auto-generate titles, descriptions, tags and hashtags from a topic.', category: 'social', badge: 'new', keywords: ['youtube', 'yt', 'generator', 'ai'] },
  { id: 'tiktok-caption-checker', name: 'TikTok Caption Checker', description: 'Check caption length against TikTok limits.', category: 'social', keywords: ['tiktok'] },
  { id: 'tiktok-hashtag-counter', name: 'TikTok Hashtag Counter', description: 'Count hashtags in your TikTok caption.', category: 'social', keywords: ['tiktok'] },
  { id: 'tiktok-username-checker', name: 'TikTok Username Checker', description: 'Validate a TikTok username format & length.', category: 'social', keywords: ['tiktok'] },
  { id: 'tiktok-bio-counter', name: 'TikTok Bio Counter', description: 'Check bio length against the 80-char limit.', category: 'social', keywords: ['tiktok'] },
  { id: 'tiktok-content-generator', name: 'TikTok Content Generator', description: 'Generate captions, hashtags and hooks from a topic.', category: 'social', badge: 'new', keywords: ['tiktok', 'generator'] },
  { id: 'ig-grid-preview', name: 'Instagram Grid Preview', description: 'Preview how posts look in a 3-col grid.', category: 'social', badge: 'new', keywords: ['instagram', 'ig'] },
  { id: 'ig-bio-counter', name: 'Instagram Bio Counter', description: 'Check bio length against the 150-char limit.', category: 'social', keywords: ['instagram', 'ig'] },
  { id: 'ig-hashtag-counter', name: 'Instagram Hashtag Counter', description: 'Count hashtags against the 30-hashtag limit.', category: 'social', keywords: ['instagram', 'ig'] },
  { id: 'ig-content-generator', name: 'Instagram Content Generator', description: 'Generate captions, hashtags and bio ideas from a topic.', category: 'social', badge: 'new', keywords: ['instagram', 'ig', 'generator'] },
  { id: 'fb-content-generator', name: 'Facebook Content Generator', description: 'Generate post text, headlines and hashtags from a topic.', category: 'social', badge: 'new', keywords: ['facebook', 'fb', 'generator'] },
  { id: 'tw-content-generator', name: 'Twitter Content Generator', description: 'Generate tweets, threads and hashtags from a topic.', category: 'social', badge: 'new', keywords: ['twitter', 'x', 'tweet', 'generator'] },

  // ---------- Text ----------
  { id: 'text-word-counter', name: 'Word Counter', description: 'Count words, sentences and paragraphs instantly.', category: 'text', badge: 'popular' },
  { id: 'text-char-counter', name: 'Character Counter', description: 'Live character, word and line counts.', category: 'text' },
  { id: 'text-remove-spaces', name: 'Remove Extra Spaces', description: 'Collapse extra spaces and blank lines.', category: 'text' },
  { id: 'text-case', name: 'Case Converter', description: 'Convert to UPPER, lower, Title, camelCase and more.', category: 'text' },
  { id: 'text-sort-lines', name: 'Sort Lines', description: 'Sort lines alphabetically, numerically or reversed.', category: 'text' },
  { id: 'text-duplicate-remover', name: 'Duplicate Line Remover', description: 'Remove duplicate lines from any text.', category: 'text' },
  { id: 'text-compare', name: 'Text Compare', description: 'Diff two pieces of text line by line.', category: 'text' },
  { id: 'text-find-replace', name: 'Find & Replace', description: 'Replace text with regex support.', category: 'text' },
  { id: 'text-random', name: 'Random Text Generator', description: 'Generate lorem ipsum placeholder text.', category: 'text' },

  // ---------- Developer ----------
  { id: 'dev-json-formatter', name: 'JSON Formatter', description: 'Pretty-print and indent JSON.', category: 'developer', badge: 'popular' },
  { id: 'dev-json-validator', name: 'JSON Validator', description: 'Validate JSON and highlight errors.', category: 'developer' },
  { id: 'dev-html-formatter', name: 'HTML Formatter', description: 'Pretty-print and indent HTML.', category: 'developer' },
  { id: 'dev-css-minifier', name: 'CSS Minifier', description: 'Compress CSS by removing whitespace.', category: 'developer' },
  { id: 'dev-js-minifier', name: 'JavaScript Minifier', description: 'Strip comments and whitespace from JS.', category: 'developer' },
  { id: 'dev-base64', name: 'Base64 Encode / Decode', description: 'Convert text to and from Base64.', category: 'developer' },
  { id: 'dev-url-encode', name: 'URL Encode / Decode', description: 'Percent-encode and decode URL strings.', category: 'developer' },
  { id: 'dev-uuid', name: 'UUID Generator', description: 'Generate v4 UUIDs in bulk.', category: 'developer', badge: 'trending' },
  { id: 'dev-color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, HSL.', category: 'developer' },
  { id: 'dev-jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Token headers and payloads.', category: 'developer', badge: 'new', keywords: ['jwt', 'token', 'auth'] },
  { id: 'dev-jwt-generator', name: 'JWT Generator', description: 'Generate signed JWT tokens with custom payloads.', category: 'developer', badge: 'new', keywords: ['jwt', 'token'] },
  { id: 'dev-regex-tester', name: 'Regex Tester', description: 'Test regular expressions with live matches and capture groups.', category: 'developer', badge: 'popular', keywords: ['regex', 'regexp', 'pattern'] },
  { id: 'dev-regex-generator', name: 'Regex Generator', description: 'Build common regex patterns from simple inputs.', category: 'developer', badge: 'new', keywords: ['regex', 'generator'] },
  { id: 'dev-hash-generator', name: 'Hash Generator', description: 'Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes.', category: 'developer', badge: 'new', keywords: ['hash', 'sha', 'crypto'] },
  { id: 'dev-css-gradient', name: 'CSS Gradient Generator', description: 'Design CSS gradients with a visual picker and copy the code.', category: 'developer', badge: 'trending', keywords: ['css', 'gradient'] },
  { id: 'dev-css-box-shadow', name: 'CSS Box Shadow Generator', description: 'Visually craft box-shadow CSS and copy it.', category: 'developer', badge: 'new', keywords: ['css', 'shadow'] },
  { id: 'dev-css-border-radius', name: 'CSS Border Radius Generator', description: 'Generate rounded corner CSS with per-corner control.', category: 'developer', keywords: ['css', 'border', 'radius'] },
  { id: 'dev-css-clip-path', name: 'CSS Clip-Path Generator', description: 'Create clip-path shapes visually and copy the CSS.', category: 'developer', badge: 'new', keywords: ['css', 'clip', 'path', 'shape'] },
  { id: 'dev-css-flexbox', name: 'Flexbox Generator', description: 'Visually configure flexbox layouts and copy the CSS.', category: 'developer', keywords: ['css', 'flexbox', 'flex'] },
  { id: 'dev-css-grid', name: 'CSS Grid Generator', description: 'Build CSS grid layouts visually and copy the code.', category: 'developer', keywords: ['css', 'grid'] },
  { id: 'dev-svg-viewer', name: 'SVG Viewer & Optimizer', description: 'Preview, clean and optimize SVG markup.', category: 'developer', badge: 'new', keywords: ['svg', 'optimizer'] },

  // ---------- Code Compiler ----------
  { id: 'code-compiler', name: 'Code Compiler', description: 'Online code editor with live preview. Write HTML, CSS and JS side by side.', category: 'code', badge: 'new', keywords: ['editor', 'monaco', 'ide', 'compiler', 'html', 'css', 'javascript', 'preview'] },

  // ---------- Calculators ----------
  { id: 'calc-age', name: 'Age Calculator', description: 'Calculate exact age in years, months and days.', category: 'calculators' },
  { id: 'calc-bmi', name: 'BMI Calculator', description: 'Compute Body Mass Index and category.', category: 'calculators', badge: 'popular' },
  { id: 'calc-loan', name: 'Loan Calculator', description: 'Calculate total loan payment and interest.', category: 'calculators' },
  { id: 'calc-emi', name: 'EMI Calculator', description: 'Compute monthly EMI for any loan.', category: 'calculators' },
  { id: 'calc-percentage', name: 'Percentage Calculator', description: 'Work out percentages, change and ratios.', category: 'calculators', badge: 'popular' },
  { id: 'calc-unit', name: 'Unit Converter', description: 'Convert length, weight and temperature units.', category: 'calculators' },
  { id: 'calc-currency', name: 'Currency Converter', description: 'Convert currencies with live exchange rates.', category: 'calculators', badge: 'trending' },
  { id: 'calc-timezone', name: 'Time Zone Converter', description: 'Convert times across world time zones.', category: 'calculators' },
  { id: 'calc-discount', name: 'Discount Calculator', description: 'Calculate sale price and savings from a discount.', category: 'calculators', badge: 'new' },
  { id: 'calc-gst', name: 'GST Calculator', description: 'Add or remove GST/VAT from any amount.', category: 'calculators', badge: 'new' },
  { id: 'calc-time', name: 'Time Calculator', description: 'Add or subtract hours, minutes and seconds.', category: 'calculators', badge: 'new' },

  // ---------- Color ----------
  { id: 'color-picker', name: 'Image Color Picker', description: 'Upload an image and pick any pixel color.', category: 'color' },
  { id: 'color-contrast', name: 'Contrast Checker', description: 'Check WCAG contrast between two colors.', category: 'color', badge: 'new' },
  { id: 'color-palette', name: 'Palette Generator', description: 'Generate a palette from a base color.', category: 'color' },

  // ---------- URL ----------
  { id: 'url-encoder', name: 'URL Encoder / Decoder', description: 'Percent-encode or decode any URL string.', category: 'url' },
  { id: 'url-parser', name: 'URL Parser', description: 'Break a URL into protocol, host, path and query.', category: 'url', badge: 'new' },
  { id: 'url-qr', name: 'QR Code Generator', description: 'Generate QR codes for any URL or text.', category: 'url', badge: 'popular' },
  { id: 'url-barcode', name: 'Barcode Generator', description: 'Generate barcodes in many formats.', category: 'url', badge: 'trending' },
  { id: 'url-qr-scanner', name: 'QR Code Scanner', description: 'Scan QR codes with your camera or upload an image.', category: 'url', badge: 'new', keywords: ['qr', 'scanner', 'camera'] },

  // ---------- Utilities ----------
  { id: 'util-password', name: 'Password Generator', description: 'Generate strong, random passwords.', category: 'utilities', badge: 'popular' },
  { id: 'util-password-strength', name: 'Password Strength Checker', description: 'Test how strong a password is.', category: 'utilities' },
  { id: 'util-stopwatch', name: 'Stopwatch', description: 'Precision stopwatch with lap times.', category: 'utilities' },
  { id: 'util-countdown', name: 'Countdown Timer', description: 'Set a countdown with sound alert.', category: 'utilities' },
  { id: 'util-calendar', name: 'Calendar', description: 'View any month and jump to any date.', category: 'utilities' },
];

export const TOOL_MAP: Record<string, Tool> = TOOLS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<string, Tool>
);

export function toolsByCategory(cat: CategoryId): Tool[] {
  return TOOLS.filter((t) => t.category === cat);
}

export function featuredTools(): Tool[] {
  const ids = [
    'code-compiler',
    'image-compress',
    'pdf-merge',
    'yt-content-generator',
    'dev-jwt-decoder',
    'dev-css-gradient',
    'url-qr',
    'dev-json-formatter',
    'util-password',
    'calc-bmi',
    'text-word-counter',
    'calc-percentage',
  ];
  return ids.map((id) => TOOL_MAP[id]).filter(Boolean);
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return TOOLS.filter((t) => {
    const hay = [t.name, t.description, t.category, ...(t.keywords ?? [])].join(' ').toLowerCase();
    return hay.includes(q);
  });
}
