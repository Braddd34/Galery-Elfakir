/**
 * Système d'internationalisation (i18n) simple.
 * Gère les traductions FR/EN pour les textes de l'interface.
 * 
 * Utilisation :
 * const { t } = useLanguage()
 * t("nav.allArtworks") → "Toutes les œuvres" (FR) ou "All artworks" (EN)
 */

export type Locale = "fr" | "en"

export const translations: Record<Locale, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.allArtworks": "Toutes les œuvres",
    "nav.painting": "Peinture",
    "nav.sculpture": "Sculpture",
    "nav.photography": "Photographie",
    "nav.drawing": "Dessin",
    "nav.digitalArt": "Art numérique",
    "nav.artists": "Artistes",
    "nav.contact": "Contact",
    "nav.login": "Connexion",
    "nav.myAccount": "Mon compte",
    "nav.myFavorites": "Mes favoris",
    "nav.logout": "Déconnexion",
    "nav.search": "Rechercher une œuvre, un artiste...",

    // Page d'accueil
    "home.hero.subtitle": "Galerie d'Art Contemporain",
    "home.hero.cta": "Découvrir la collection",
    "home.featured": "Sélection",
    "home.featuredTitle": "Œuvres à la une",
    "home.viewAll": "Voir tout",
    "home.artists": "Artistes",
    "home.artistsTitle": "Artistes en vedette",
    "home.newsletter": "Newsletter",
    "home.newsletterTitle": "Restez informé",
    "home.newsletterDesc": "Recevez nos dernières nouveautés et actualités artistiques.",
    "home.newsletterPlaceholder": "Votre adresse email",
    "home.newsletterBtn": "S'inscrire",

    // Catalogue
    "catalogue.title": "Collection",
    "catalogue.filters": "Filtres",
    "catalogue.sort": "Trier par",
    "catalogue.sortRecent": "Plus récent",
    "catalogue.sortPriceAsc": "Prix croissant",
    "catalogue.sortPriceDesc": "Prix décroissant",
    "catalogue.sortPopular": "Popularité",
    "catalogue.noResults": "Aucune œuvre trouvée",
    "catalogue.loadMore": "Charger plus",

    // Œuvre
    "artwork.about": "À propos",
    "artwork.details": "Détails",
    "artwork.dimensions": "Dimensions",
    "artwork.year": "Année",
    "artwork.technique": "Technique",
    "artwork.edition": "Édition",
    "artwork.uniqueWork": "Œuvre unique",
    "artwork.price": "Prix",
    "artwork.vatIncluded": "TVA incluse",
    "artwork.addToCart": "Ajouter au panier",
    "artwork.certificate": "Certificat d'authenticité inclus",
    "artwork.shipping": "Livraison mondiale assurée",
    "artwork.contactArtist": "Contacter l'artiste",
    "artwork.similar": "Œuvres similaires",
    "artwork.recommendations": "Vous aimerez aussi",
    "artwork.recommendationsPopular": "Œuvres populaires",
    "artwork.recommendationsPersonalized": "Basé sur vos favoris et vos goûts",
    "artwork.explore": "Explorer",
    "artwork.forYou": "Pour vous",
    "artwork.reviews": "Avis",
    "artwork.zoom": "Cliquer pour zoomer",

    // Artiste
    "artist.works": "Œuvres",
    "artist.exhibitions": "Expositions",
    "artist.follow": "Suivre",
    "artist.following": "Suivi",
    "artist.followers": "abonnés",
    "artist.bio": "Biographie",
    "artist.contactBtn": "Contacter",

    // Panier
    "cart.title": "Panier",
    "cart.empty": "Votre panier est vide",
    "cart.total": "Total",
    "cart.checkout": "Commander",
    "cart.remove": "Retirer",
    "cart.continueShopping": "Continuer vos achats",

    // Dashboard
    "dashboard.title": "Mon espace",
    "dashboard.orders": "Mes commandes",
    "dashboard.favorites": "Mes favoris",
    "dashboard.messages": "Mes messages",
    "dashboard.settings": "Paramètres",
    "dashboard.stats": "Statistiques & Ventes",

    // Commun
    "common.loading": "Chargement...",
    "common.error": "Une erreur est survenue",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.send": "Envoyer",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.close": "Fermer",
    "common.share": "Partager",
    "common.download": "Télécharger",

    // Footer
    "footer.gallery": "La galerie",
    "footer.aboutUs": "À propos",
    "footer.contact": "Contact",
    "footer.faq": "FAQ",
    "footer.help": "Aide",
    "footer.legal": "Mentions légales",
    "footer.privacy": "Confidentialité",
    "footer.terms": "CGV",
    "footer.follow": "Suivez-nous",
    "footer.rights": "Tous droits réservés",

    // Auth
    "auth.login": "Connexion",
    "auth.register": "Créer un compte",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.forgotPassword": "Mot de passe oublié ?",
    "auth.noAccount": "Pas encore de compte ?",
    "auth.hasAccount": "Déjà un compte ?",

    // Thème
    "theme.light": "Mode clair",
    "theme.dark": "Mode sombre",
  },
  en: {
    // Navigation
    "nav.allArtworks": "All artworks",
    "nav.painting": "Painting",
    "nav.sculpture": "Sculpture",
    "nav.photography": "Photography",
    "nav.drawing": "Drawing",
    "nav.digitalArt": "Digital Art",
    "nav.artists": "Artists",
    "nav.contact": "Contact",
    "nav.login": "Sign in",
    "nav.myAccount": "My account",
    "nav.myFavorites": "My favorites",
    "nav.logout": "Sign out",
    "nav.search": "Search an artwork, an artist...",

    // Homepage
    "home.hero.subtitle": "Contemporary Art Gallery",
    "home.hero.cta": "Discover the collection",
    "home.featured": "Selection",
    "home.featuredTitle": "Featured works",
    "home.viewAll": "View all",
    "home.artists": "Artists",
    "home.artistsTitle": "Featured artists",
    "home.newsletter": "Newsletter",
    "home.newsletterTitle": "Stay informed",
    "home.newsletterDesc": "Receive our latest news and artistic updates.",
    "home.newsletterPlaceholder": "Your email address",
    "home.newsletterBtn": "Subscribe",

    // Catalogue
    "catalogue.title": "Collection",
    "catalogue.filters": "Filters",
    "catalogue.sort": "Sort by",
    "catalogue.sortRecent": "Most recent",
    "catalogue.sortPriceAsc": "Price: low to high",
    "catalogue.sortPriceDesc": "Price: high to low",
    "catalogue.sortPopular": "Popularity",
    "catalogue.noResults": "No artworks found",
    "catalogue.loadMore": "Load more",

    // Artwork
    "artwork.about": "About",
    "artwork.details": "Details",
    "artwork.dimensions": "Dimensions",
    "artwork.year": "Year",
    "artwork.technique": "Technique",
    "artwork.edition": "Edition",
    "artwork.uniqueWork": "Unique work",
    "artwork.price": "Price",
    "artwork.vatIncluded": "VAT included",
    "artwork.addToCart": "Add to cart",
    "artwork.certificate": "Certificate of authenticity included",
    "artwork.shipping": "Worldwide insured shipping",
    "artwork.contactArtist": "Contact the artist",
    "artwork.similar": "Similar artworks",
    "artwork.recommendations": "You may also like",
    "artwork.recommendationsPopular": "Popular artworks",
    "artwork.recommendationsPersonalized": "Based on your favorites and tastes",
    "artwork.explore": "Explore",
    "artwork.forYou": "For you",
    "artwork.reviews": "Reviews",
    "artwork.zoom": "Click to zoom",

    // Artist
    "artist.works": "Works",
    "artist.exhibitions": "Exhibitions",
    "artist.follow": "Follow",
    "artist.following": "Following",
    "artist.followers": "followers",
    "artist.bio": "Biography",
    "artist.contactBtn": "Contact",

    // Cart
    "cart.title": "Cart",
    "cart.empty": "Your cart is empty",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "cart.remove": "Remove",
    "cart.continueShopping": "Continue shopping",

    // Dashboard
    "dashboard.title": "My space",
    "dashboard.orders": "My orders",
    "dashboard.favorites": "My favorites",
    "dashboard.messages": "My messages",
    "dashboard.settings": "Settings",
    "dashboard.stats": "Statistics & Sales",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.send": "Send",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.close": "Close",
    "common.share": "Share",
    "common.download": "Download",

    // Footer
    "footer.gallery": "The gallery",
    "footer.aboutUs": "About us",
    "footer.contact": "Contact",
    "footer.faq": "FAQ",
    "footer.help": "Help",
    "footer.legal": "Legal notice",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms & Conditions",
    "footer.follow": "Follow us",
    "footer.rights": "All rights reserved",

    // Auth
    "auth.login": "Sign in",
    "auth.register": "Create account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",

    // Theme
    "theme.light": "Light mode",
    "theme.dark": "Dark mode",
  }
}
