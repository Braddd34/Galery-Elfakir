/**
 * Sanitise une chaîne de texte simple (titres, noms, messages, etc.) pour éviter l'injection XSS.
 * Échappe les caractères spéciaux HTML. N'utilise pas DOMPurify pour éviter de charger jsdom
 * dans les API routes (provoque ENOENT sur Vercel au build).
 */
export function sanitize(text: string): string {
  if (!text || typeof text !== "string") return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

const BLOG_ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "span", "div",
  "hr", "figure", "figcaption",
]

const BLOG_ALLOWED_ATTR = [
  "href", "title", "target", "rel", "src", "alt", "width", "height", "class",
]

/**
 * Sanitise du HTML pour l'affichage dans le blog (évite XSS).
 * DOMPurify est chargé dynamiquement pour ne pas impacter les API qui n'utilisent que sanitize().
 */
export async function sanitizeBlogHtml(html: string): Promise<string> {
  if (!html || typeof html !== "string") return ""
  const DOMPurify = (await import("isomorphic-dompurify")).default
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: BLOG_ALLOWED_TAGS,
    ALLOWED_ATTR: BLOG_ALLOWED_ATTR,
  })
}
