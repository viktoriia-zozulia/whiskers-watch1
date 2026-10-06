// Self-hosted variable fonts, registered through the FontFace API so the
// .woff2 files are emitted as separate cacheable assets (not inlined into CSS)
// and only the subsets a page actually uses get downloaded.
import onestLatin from '@fontsource-variable/onest/files/onest-latin-wght-normal.woff2'
import onestCyrillic from '@fontsource-variable/onest/files/onest-cyrillic-wght-normal.woff2'
import loraLatin from '@fontsource-variable/lora/files/lora-latin-wght-normal.woff2'
import loraCyrillic from '@fontsource-variable/lora/files/lora-cyrillic-wght-normal.woff2'
import loraCyrillicItalic from '@fontsource-variable/lora/files/lora-cyrillic-wght-italic.woff2'

const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
const CYRILLIC = 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116'

const faces: [family: string, url: string, range: string, weight: string, style?: string][] = [
  ['Onest Variable', onestLatin, LATIN, '100 900'],
  ['Onest Variable', onestCyrillic, CYRILLIC, '100 900'],
  ['Lora Variable', loraLatin, LATIN, '400 700'],
  ['Lora Variable', loraCyrillic, CYRILLIC, '400 700'],
  ['Lora Variable', loraCyrillicItalic, CYRILLIC, '400 700', 'italic'],
]

export function registerFonts() {
  if (typeof FontFace === 'undefined') return
  // FontFaceSet is set-like, but TypeScript's DOM typings omit `add`.
  const set = document.fonts as unknown as Set<FontFace>
  for (const [family, url, unicodeRange, weight, style = 'normal'] of faces) {
    set.add(new FontFace(family, `url(${url}) format("woff2")`, { unicodeRange, weight, style, display: 'swap' }))
  }
}
