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

    // Reviews / Avis
    "reviews.title": "Avis clients",
    "reviews.writeReview": "Donner mon avis",
    "reviews.yourRating": "Votre note",
    "reviews.titleOptional": "Titre (optionnel)",
    "reviews.titlePlaceholder": "Résumez votre avis...",
    "reviews.commentOptional": "Commentaire (optionnel)",
    "reviews.commentPlaceholder": "Décrivez votre expérience...",
    "reviews.submit": "Publier mon avis",
    "reviews.sending": "Envoi...",
    "reviews.noReviews": "Aucun avis pour le moment. Soyez le premier à donner votre avis !",
    "reviews.verifiedPurchase": "Achat vérifié",
    "reviews.ratingRequired": "Veuillez donner une note",
    "reviews.review": "avis",
    "reviews.reviews": "avis",

    // Checkout
    "checkout.title": "Commander",
    "checkout.stepAddress": "Adresse",
    "checkout.stepSummary": "Récapitulatif",
    "checkout.stepPayment": "Paiement",
    "checkout.shippingAddress": "Adresse de livraison",
    "checkout.firstName": "Prénom",
    "checkout.lastName": "Nom",
    "checkout.email": "Email",
    "checkout.phone": "Téléphone",
    "checkout.address": "Adresse",
    "checkout.postalCode": "Code postal",
    "checkout.city": "Ville",
    "checkout.country": "Pays",
    "checkout.continueToSummary": "Continuer vers le récapitulatif",
    "checkout.orderSummary": "Récapitulatif de commande",
    "checkout.deliverTo": "Livraison à",
    "checkout.modify": "Modifier",
    "checkout.subtotal": "Sous-total",
    "checkout.shipping": "Livraison",
    "checkout.total": "Total",
    "checkout.vatIncluded": "TVA incluse",
    "checkout.proceedPayment": "Procéder au paiement",
    "checkout.emptyCart": "Votre panier est vide",
    "checkout.emptyCartDesc": "Ajoutez des œuvres à votre panier pour passer commande.",
    "checkout.certificate": "Certificat d'authenticité inclus",
    "checkout.packaging": "Emballage professionnel sécurisé",
    "checkout.insurance": "Assurance transport incluse",
    "checkout.yourCart": "Votre panier",

    // FAQ
    "faq.title": "Questions fréquentes",
    "faq.subtitle": "Trouvez rapidement les réponses à vos questions sur l'achat d'œuvres, la livraison, l'authenticité et bien plus.",
    "faq.notFound": "Vous n'avez pas trouvé votre réponse ?",
    "faq.contactUs": "Nous contacter",

    // À propos
    "about.title": "À propos",
    "about.ourMission": "Notre Mission",
    "about.ourApproach": "Notre approche",
    "about.ourValues": "Nos Valeurs",
    "about.joinUs": "Rejoignez notre communauté",
    "about.becomeArtist": "Devenir artiste",
    "about.learnMore": "En savoir plus",
    "about.question": "Une question ?",

    // Expositions
    "exhibitions.title": "Mes expositions",
    "exhibitions.subtitle": "Gérez vos expositions passées et actuelles",
    "exhibitions.add": "Ajouter",
    "exhibitions.new": "Nouvelle exposition",
    "exhibitions.none": "Aucune exposition enregistrée",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.markAllRead": "Tout marquer comme lu",
    "notifications.none": "Aucune notification",
    "notifications.justNow": "À l'instant",

    // Réseau
    "network.offline": "Connexion perdue — Vérifiez votre connexion internet",
    "network.online": "Connexion rétablie",
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

    // Reviews
    "reviews.title": "Customer reviews",
    "reviews.writeReview": "Write a review",
    "reviews.yourRating": "Your rating",
    "reviews.titleOptional": "Title (optional)",
    "reviews.titlePlaceholder": "Summarize your review...",
    "reviews.commentOptional": "Comment (optional)",
    "reviews.commentPlaceholder": "Describe your experience...",
    "reviews.submit": "Submit my review",
    "reviews.sending": "Sending...",
    "reviews.noReviews": "No reviews yet. Be the first to share your opinion!",
    "reviews.verifiedPurchase": "Verified purchase",
    "reviews.ratingRequired": "Please give a rating",
    "reviews.review": "review",
    "reviews.reviews": "reviews",

    // Checkout
    "checkout.title": "Checkout",
    "checkout.stepAddress": "Address",
    "checkout.stepSummary": "Summary",
    "checkout.stepPayment": "Payment",
    "checkout.shippingAddress": "Shipping address",
    "checkout.firstName": "First name",
    "checkout.lastName": "Last name",
    "checkout.email": "Email",
    "checkout.phone": "Phone",
    "checkout.address": "Address",
    "checkout.postalCode": "Postal code",
    "checkout.city": "City",
    "checkout.country": "Country",
    "checkout.continueToSummary": "Continue to summary",
    "checkout.orderSummary": "Order summary",
    "checkout.deliverTo": "Deliver to",
    "checkout.modify": "Edit",
    "checkout.subtotal": "Subtotal",
    "checkout.shipping": "Shipping",
    "checkout.total": "Total",
    "checkout.vatIncluded": "VAT included",
    "checkout.proceedPayment": "Proceed to payment",
    "checkout.emptyCart": "Your cart is empty",
    "checkout.emptyCartDesc": "Add artworks to your cart to place an order.",
    "checkout.certificate": "Certificate of authenticity included",
    "checkout.packaging": "Professional secure packaging",
    "checkout.insurance": "Transport insurance included",
    "checkout.yourCart": "Your cart",

    // FAQ
    "faq.title": "Frequently asked questions",
    "faq.subtitle": "Quickly find answers to your questions about buying artworks, shipping, authenticity and more.",
    "faq.notFound": "Didn't find your answer?",
    "faq.contactUs": "Contact us",

    // About
    "about.title": "About",
    "about.ourMission": "Our Mission",
    "about.ourApproach": "Our approach",
    "about.ourValues": "Our Values",
    "about.joinUs": "Join our community",
    "about.becomeArtist": "Become an artist",
    "about.learnMore": "Learn more",
    "about.question": "Have a question?",

    // Exhibitions
    "exhibitions.title": "My exhibitions",
    "exhibitions.subtitle": "Manage your past and current exhibitions",
    "exhibitions.add": "Add",
    "exhibitions.new": "New exhibition",
    "exhibitions.none": "No exhibitions recorded",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.markAllRead": "Mark all as read",
    "notifications.none": "No notifications",
    "notifications.justNow": "Just now",

    // Network
    "network.offline": "Connection lost — Check your internet connection",
    "network.online": "Connection restored",
  }
}
