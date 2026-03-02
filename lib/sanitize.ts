import DOMPurify from "isomorphic-dompurify"

/**
 * Liste de tags et attributs autorisés pour le contenu riche (ex. articles de blog).
 * Réduit le risque XSS tout en gardant le formatage (titres, liens, images).
 */
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
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html || typeof html !== "string") return ""
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: BLOG_ALLOWED_TAGS,
    ALLOWED_ATTR: BLOG_ALLOWED_ATTR,
  })
}
