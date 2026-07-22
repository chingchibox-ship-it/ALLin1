import { lazy, Suspense, type ComponentType } from 'react';
import { ToolLoading } from '../components/ToolShell';

type ToolProps = { onSignIn: () => void };

// Each tools/* module default-exports a dispatcher: <Default name="X" onSignIn={...} />.
// This keeps code-splitting per category with a single dynamic import per route.
function LazyTool({
  loader,
  name,
  onSignIn,
}: {
  loader: () => Promise<{ default: ComponentType<{ name: string } & ToolProps> }>;
  name: string;
  onSignIn: () => void;
}) {
  const Mod = lazy(loader);
  return (
    <Suspense fallback={<ToolLoading />}>
      <Mod name={name} onSignIn={onSignIn} />
    </Suspense>
  );
}

const img = () => import('../tools/image');
const pdf = () => import('../tools/pdf');
const soc = () => import('../tools/social');
const txt = () => import('../tools/text');
const dev = () => import('../tools/developer');
const devExtra = () => import('../tools/devExtra');
const calc = () => import('../tools/calculators');
const calcExtra = () => import('../tools/calcExtra');
const misc = () => import('../tools/misc');
const code = () => import('../tools/code');

export const TOOL_COMPONENTS: Record<string, ComponentType<ToolProps>> = {
  // Image
  'image-compress': (p) => <LazyTool loader={img} name="ImageCompress" {...p} />,
  'image-resize': (p) => <LazyTool loader={img} name="ImageResize" {...p} />,
  'image-crop': (p) => <LazyTool loader={img} name="ImageCrop" {...p} />,
  'image-rotate': (p) => <LazyTool loader={img} name="ImageRotate" {...p} />,
  'image-flip': (p) => <LazyTool loader={img} name="ImageFlip" {...p} />,
  'image-convert': (p) => <LazyTool loader={img} name="ImageConvert" {...p} />,
  'image-watermark': (p) => <LazyTool loader={img} name="ImageWatermark" {...p} />,
  'image-exif': (p) => <LazyTool loader={img} name="ImageExif" {...p} />,
  'image-color-picker': (p) => <LazyTool loader={img} name="ImageColorPicker" {...p} />,
  'image-split': (p) => <LazyTool loader={img} name="ImageSplit" {...p} />,
  'image-merge': (p) => <LazyTool loader={img} name="ImageMerge" {...p} />,
  'image-collage': (p) => <LazyTool loader={img} name="ImageCollage" {...p} />,

  // PDF
  'pdf-merge': (p) => <LazyTool loader={pdf} name="PdfMerge" {...p} />,
  'pdf-split': (p) => <LazyTool loader={pdf} name="PdfSplit" {...p} />,
  'pdf-compress': (p) => <LazyTool loader={pdf} name="PdfCompress" {...p} />,
  'pdf-rotate': (p) => <LazyTool loader={pdf} name="PdfRotate" {...p} />,
  'pdf-delete-pages': (p) => <LazyTool loader={pdf} name="PdfDeletePages" {...p} />,
  'pdf-extract-pages': (p) => <LazyTool loader={pdf} name="PdfExtractPages" {...p} />,
  'pdf-rearrange': (p) => <LazyTool loader={pdf} name="PdfRearrange" {...p} />,
  'pdf-jpg-to-pdf': (p) => <LazyTool loader={pdf} name="PdfJpgToPdf" {...p} />,
  'pdf-to-jpg': (p) => <LazyTool loader={pdf} name="PdfToJpg" {...p} />,
  'pdf-page-numbers': (p) => <LazyTool loader={pdf} name="PdfPageNumbers" {...p} />,
  'pdf-watermark': (p) => <LazyTool loader={pdf} name="PdfWatermark" {...p} />,

  // Social
  'yt-thumbnail-downloader': (p) => <LazyTool loader={soc} name="YtThumbnailDownloader" {...p} />,
  'yt-thumbnail-preview': (p) => <LazyTool loader={soc} name="YtThumbnailPreview" {...p} />,
  'yt-thumbnail-size': (p) => <LazyTool loader={soc} name="YtThumbnailSize" {...p} />,
  'yt-tag-counter': (p) => <LazyTool loader={soc} name="YtTagCounter" {...p} />,
  'yt-title-counter': (p) => <LazyTool loader={soc} name="YtTitleCounter" {...p} />,
  'yt-description-counter': (p) => <LazyTool loader={soc} name="YtDescriptionCounter" {...p} />,
  'yt-timestamps': (p) => <LazyTool loader={soc} name="YtTimestamps" {...p} />,
  'yt-content-generator': (p) => <LazyTool loader={soc} name="YtContentGenerator" {...p} />,
  'tiktok-caption-checker': (p) => <LazyTool loader={soc} name="TiktokCaptionChecker" {...p} />,
  'tiktok-hashtag-counter': (p) => <LazyTool loader={soc} name="TiktokHashtagCounter" {...p} />,
  'tiktok-username-checker': (p) => <LazyTool loader={soc} name="TiktokUsernameChecker" {...p} />,
  'tiktok-bio-counter': (p) => <LazyTool loader={soc} name="TiktokBioCounter" {...p} />,
  'tiktok-content-generator': (p) => <LazyTool loader={soc} name="TiktokContentGenerator" {...p} />,
  'ig-grid-preview': (p) => <LazyTool loader={soc} name="IgGridPreview" {...p} />,
  'ig-bio-counter': (p) => <LazyTool loader={soc} name="IgBioCounter" {...p} />,
  'ig-hashtag-counter': (p) => <LazyTool loader={soc} name="IgHashtagCounter" {...p} />,
  'ig-content-generator': (p) => <LazyTool loader={soc} name="IgContentGenerator" {...p} />,
  'fb-content-generator': (p) => <LazyTool loader={soc} name="FbContentGenerator" {...p} />,
  'tw-content-generator': (p) => <LazyTool loader={soc} name="TwContentGenerator" {...p} />,

  // Text
  'text-word-counter': (p) => <LazyTool loader={txt} name="TextWordCounter" {...p} />,
  'text-char-counter': (p) => <LazyTool loader={txt} name="TextCharCounter" {...p} />,
  'text-remove-spaces': (p) => <LazyTool loader={txt} name="TextRemoveSpaces" {...p} />,
  'text-case': (p) => <LazyTool loader={txt} name="TextCase" {...p} />,
  'text-sort-lines': (p) => <LazyTool loader={txt} name="TextSortLines" {...p} />,
  'text-duplicate-remover': (p) => <LazyTool loader={txt} name="TextDuplicateRemover" {...p} />,
  'text-compare': (p) => <LazyTool loader={txt} name="TextCompare" {...p} />,
  'text-find-replace': (p) => <LazyTool loader={txt} name="TextFindReplace" {...p} />,
  'text-random': (p) => <LazyTool loader={txt} name="TextRandom" {...p} />,

  // Developer (existing)
  'dev-json-formatter': (p) => <LazyTool loader={dev} name="DevJsonFormatter" {...p} />,
  'dev-json-validator': (p) => <LazyTool loader={dev} name="DevJsonValidator" {...p} />,
  'dev-html-formatter': (p) => <LazyTool loader={dev} name="DevHtmlFormatter" {...p} />,
  'dev-css-minifier': (p) => <LazyTool loader={dev} name="DevCssMinifier" {...p} />,
  'dev-js-minifier': (p) => <LazyTool loader={dev} name="DevJsMinifier" {...p} />,
  'dev-base64': (p) => <LazyTool loader={dev} name="DevBase64" {...p} />,
  'dev-url-encode': (p) => <LazyTool loader={dev} name="DevUrlEncode" {...p} />,
  'dev-uuid': (p) => <LazyTool loader={dev} name="DevUuid" {...p} />,
  'dev-color-converter': (p) => <LazyTool loader={dev} name="DevColorConverter" {...p} />,

  // Developer (new extra tools)
  'dev-jwt-decoder': (p) => <LazyTool loader={devExtra} name="DevJwtDecoder" {...p} />,
  'dev-jwt-generator': (p) => <LazyTool loader={devExtra} name="DevJwtGenerator" {...p} />,
  'dev-regex-tester': (p) => <LazyTool loader={devExtra} name="DevRegexTester" {...p} />,
  'dev-regex-generator': (p) => <LazyTool loader={devExtra} name="DevRegexGenerator" {...p} />,
  'dev-hash-generator': (p) => <LazyTool loader={devExtra} name="DevHashGenerator" {...p} />,
  'dev-css-gradient': (p) => <LazyTool loader={devExtra} name="DevCssGradient" {...p} />,
  'dev-css-box-shadow': (p) => <LazyTool loader={devExtra} name="DevCssBoxShadow" {...p} />,
  'dev-css-border-radius': (p) => <LazyTool loader={devExtra} name="DevCssBorderRadius" {...p} />,
  'dev-css-clip-path': (p) => <LazyTool loader={devExtra} name="DevCssClipPath" {...p} />,
  'dev-css-flexbox': (p) => <LazyTool loader={devExtra} name="DevCssFlexbox" {...p} />,
  'dev-css-grid': (p) => <LazyTool loader={devExtra} name="DevCssGrid" {...p} />,
  'dev-svg-viewer': (p) => <LazyTool loader={devExtra} name="DevSvgViewer" {...p} />,

  // Code Compiler
  'code-compiler': (p) => <LazyTool loader={code} name="CodeCompiler" {...p} />,

  // Calculators (existing)
  'calc-age': (p) => <LazyTool loader={calc} name="CalcAge" {...p} />,
  'calc-bmi': (p) => <LazyTool loader={calc} name="CalcBmi" {...p} />,
  'calc-loan': (p) => <LazyTool loader={calc} name="CalcLoan" {...p} />,
  'calc-emi': (p) => <LazyTool loader={calc} name="CalcEmi" {...p} />,
  'calc-percentage': (p) => <LazyTool loader={calc} name="CalcPercentage" {...p} />,
  'calc-unit': (p) => <LazyTool loader={calc} name="CalcUnit" {...p} />,
  'calc-currency': (p) => <LazyTool loader={calc} name="CalcCurrency" {...p} />,
  'calc-timezone': (p) => <LazyTool loader={calc} name="CalcTimezone" {...p} />,

  // Calculators (new)
  'calc-discount': (p) => <LazyTool loader={calcExtra} name="CalcDiscount" {...p} />,
  'calc-gst': (p) => <LazyTool loader={calcExtra} name="CalcGst" {...p} />,
  'calc-time': (p) => <LazyTool loader={calcExtra} name="CalcTime" {...p} />,

  // Color / URL / Utilities (all in misc)
  'color-picker': (p) => <LazyTool loader={misc} name="ColorImagePicker" {...p} />,
  'color-contrast': (p) => <LazyTool loader={misc} name="ColorContrast" {...p} />,
  'color-palette': (p) => <LazyTool loader={misc} name="ColorPalette" {...p} />,
  'url-encoder': (p) => <LazyTool loader={misc} name="UrlEncoder" {...p} />,
  'url-parser': (p) => <LazyTool loader={misc} name="UrlParser" {...p} />,
  'url-qr': (p) => <LazyTool loader={misc} name="UrlQr" {...p} />,
  'url-barcode': (p) => <LazyTool loader={misc} name="UrlBarcode" {...p} />,
  'url-qr-scanner': (p) => <LazyTool loader={misc} name="UrlQrScanner" {...p} />,
  'util-password': (p) => <LazyTool loader={misc} name="UtilPassword" {...p} />,
  'util-password-strength': (p) => <LazyTool loader={misc} name="UtilPasswordStrength" {...p} />,
  'util-stopwatch': (p) => <LazyTool loader={misc} name="UtilStopwatch" {...p} />,
  'util-countdown': (p) => <LazyTool loader={misc} name="UtilCountdown" {...p} />,
  'util-calendar': (p) => <LazyTool loader={misc} name="UtilCalendar" {...p} />,
};
