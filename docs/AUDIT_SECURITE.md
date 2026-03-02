# Audit de sécurité — Galery ELFAKIR

*Date : Février 2026*

Cet document liste les points de sécurité analysés, les bonnes pratiques déjà en place et les corrections recommandées pour renforcer la protection contre les attaques (piratage, injection, vol de données, etc.).

---

## 1. Ce qui est déjà bien en place

### 1.1 Authentification (NextAuth)

- **Session** : NextAuth avec JWT/session, secret `NEXTAUTH_SECRET` requis.
- **Rôles** : Vérification systématique `getServerSession(authOptions)` sur les routes sensibles (admin, manager, artiste, messages, commandes, etc.).
- **Mot de passe** : Hash bcrypt (facteur 12) à l’inscription et à la réinitialisation.
- **Anti brute-force login** : Verrouillage après 5 tentatives échouées (15 minutes) par email, en mémoire.
- **Reset password** : Token unique, expiration 1 h, suppression après usage ; message générique pour éviter l’énumération d’emails.

### 1.2 Autorisation (middleware + API)

- **Middleware** : Protection des routes `/admin`, `/dashboard/manager`, `/dashboard/artiste` selon le rôle (ADMIN, MANAGER, ARTIST).
- **API** : Chaque route protégée vérifie la session et le rôle (ex. certificate : propriétaire / artiste / admin ; virtual-exhibitions : créateur / admin ou statut PUBLISHED).
- **Exposition virtuelle** : Les expos non publiées ne sont accessibles qu’aux créateurs / admins (et managers assignés).

### 1.3 Rate limiting

- **Auth** : 5 tentatives / min (register, reset).
- **Upload** : 10 uploads / min par utilisateur.
- **Contact / formulaires** : 3–5 requêtes / min par IP.
- **IP** : Utilisation de `x-forwarded-for` / `x-real-ip` pour l’identification.

### 1.4 Upload (S3)

- **Contrôle d’accès** : Seuls ARTIST et ADMIN peuvent obtenir une URL signée.
- **Validation** : Types MIME et extensions autorisés (JPEG, PNG, WebP, GIF), taille max 10 Mo, nom de fichier nettoyé (caractères spéciaux remplacés).

### 1.5 En-têtes de sécurité (next.config.mjs)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation désactivés)
- `Strict-Transport-Security` (HSTS 1 an)
- **CSP** : default-src 'self', connect-src inclut S3, img-src liste blanche (S3, Unsplash, etc.), pas de chargement de script depuis des domaines externes non autorisés.
- `poweredByHeader: false`

### 1.6 Base de données (Prisma)

- Pas de requêtes SQL brutes avec concaténation de chaînes (pas de risque d’injection SQL classique).
- Données utilisateur passées via les paramètres Prisma.

### 1.7 Variables d’environnement

- **Validation au démarrage** (`lib/env.ts`) : `DATABASE_URL` et `NEXTAUTH_SECRET` obligatoires en production.
- Recommandations pour `RESEND_API_KEY`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`.

### 1.8 Setup initial

- Route `/api/setup` protégée par `SETUP_SECRET` (comparaison stricte). À désactiver ou restreindre après la première utilisation.

---

## 2. Vulnérabilités et risques identifiés

### 2.1 Critique / priorité haute

#### A. Path traversal sur le proxy d’images (`/api/image-proxy`)

- **Risque** : Un attaquant peut envoyer une URL du type  
  `?url=https://votre-bucket.s3.region.amazonaws.com/artworks/../../../autre-prefix/fichier`  
  et tenter d’accéder à des clés S3 en dehors du préfixe prévu.
- **Cause** : `getKeyFromUrl` retourne `pathname.slice(1)` sans rejeter les séquences `..`.
- **Action** : Dans `lib/s3.ts`, normaliser la clé (résoudre `..`) et n’accepter que les clés dont le préfixe est autorisé (ex. `artworks/`, ou un préfixe dédié aux photos de profil). Rejeter toute clé contenant `..` avant l’appel à S3.

#### B. XSS via le contenu du blog

- **Risque** : Le champ `post.content` est affiché avec `dangerouslySetInnerHTML` dans `app/blog/[slug]/page.tsx`. Si un admin est compromis ou fait une erreur, du HTML/JS malveillant peut s’exécuter dans le navigateur des visiteurs.
- **Action** : Sanitiser le HTML du blog côté serveur (ex. avec une librairie comme `dompurify` + `isomorphic-dompurify`) avant de l’enregistrer ou avant de l’afficher, et continuer à l’injecter via `dangerouslySetInnerHTML` uniquement après sanitization.

### 2.2 Priorité moyenne

#### C. Route `/api/setup` toujours exposée

- **Risque** : Si `SETUP_SECRET` est deviné ou fuite, un attaquant peut recréer un admin par défaut ou réinitialiser des comptes de test.
- **Action** : Désactiver l’exécution de la création d’admin/comptes de test après la première initialisation réussie (ex. flag en base ou variable d’env), ou protéger par une condition stricte (env uniquement en premier déploiement).

#### D. Content-Security-Policy : `connect-src` et upload S3

- **Constat** : La CSP autorise déjà `connect-src` vers le bucket S3. Si des erreurs 503 ou “Refused to connect” apparaissent encore pour l’upload, vérifier que l’URL exacte utilisée par le SDK (avec paramètres de signature) est bien couverte par la directive (ou par le host S3 autorisé).
- **Action** : Confirmer dans la doc ou les tests que les requêtes PUT signées vers S3 sont bien autorisées (souvent le host seul suffit).

#### E. Rate limiting en mémoire

- **Risque** : Sur Vercel (serverless), chaque instance peut avoir son propre cache. Le rate limiting par IP ou par user n’est pas partagé entre instances, donc un attaquant peut dépasser les limites en déclenchant plusieurs instances.
- **Action** : À moyen terme, utiliser un store partagé (Redis, Vercel KV) pour les compteurs de rate limit en production.

### 2.3 Priorité basse / bonnes pratiques

#### F. Tokens de reset password non invalidés côté session

- **Constat** : Après réinitialisation du mot de passe, le token est supprimé. Les sessions existantes (JWT) restent valides jusqu’à expiration.
- **Recommandation** : Documenter que les utilisateurs doivent se reconnecter après un reset ; optionnellement, invalider les sessions côté serveur si vous utilisez des sessions en base.

#### G. Mots de passe par défaut dans `/api/setup`

- **Constat** : Les mots de passe de test (Admin123!, Artiste123!, Acheteur123!) sont codés en dur.
- **Recommandation** : Après premier déploiement, désactiver la route ou exiger un secret très fort et unique ; rappeler de changer ces mots de passe immédiatement (déjà indiqué dans la réponse de l’API).

#### H. Logs et messages d’erreur

- **Constat** : Certaines routes loguent des infos (ex. `[Favorites] User ${session.user.id}`). En production, `removeConsole` supprime les `console.log` mais pas `console.error` / `console.warn`.
- **Recommandation** : Éviter de logger des données personnelles ou des tokens ; garder des messages génériques pour les erreurs renvoyées au client.

---

## 3. Synthèse des actions recommandées

| Priorité | Action |
|----------|--------|
| Haute    | Bloquer le path traversal dans `image-proxy` (validation de la clé S3 dans `lib/s3.ts`). |
| Haute    | Sanitiser le HTML du blog (DOMPurify ou équivalent) avant affichage. |
| Moyenne  | Désactiver ou restreindre `/api/setup` après première initialisation. |
| Moyenne  | Vérifier / ajuster la CSP pour les uploads S3 si nécessaire. |
| Moyenne  | Prévoir un rate limiting partagé (Redis/KV) pour la production. |
| Basse    | Documentation / processus : changement des mots de passe par défaut, gestion des sessions après reset. |

---

## 4. Vérifications rapides à faire régulièrement

- **Dépendances** : `npm audit` et mise à jour des paquets critiques.
- **Secrets** : Aucun secret (AWS, NEXTAUTH_SECRET, SETUP_SECRET) dans le code ou le dépôt.
- **Vercel** : Variables d’environnement définies dans le projet (pas de valeurs par défaut sensibles en dur pour la prod).
- **Rôles** : Vérifier que toute nouvelle route admin/manager/artiste vérifie bien la session et le rôle.

---

## 5. Corrections appliquées (post-audit)

- **Path traversal (image-proxy)** : Validation des clés S3 dans `lib/s3.ts` (`validateS3Key`) ; seuls les préfixes `artworks/` et `profile/` sont acceptés. L’API `/api/image-proxy` rejette toute URL dont la clé est invalide.
- **XSS blog** : Le contenu des articles est sanitisé avec `isomorphic-dompurify` dans `lib/sanitize.ts` avant affichage dans `app/blog/[slug]/page.tsx`.
- **Route /api/setup** : Après la première initialisation réussie (ou si un admin existe déjà), un enregistrement `Setting` avec la clé `setup_completed` est créé. Les appels suivants à `/api/setup` renvoient 403, même avec le bon secret.

---

## 6. Conclusion

La base est solide : authentification, autorisation par rôle, rate limiting, en-têtes de sécurité, validation des uploads et protection des routes sensibles sont en place. Les deux points à traiter en priorité sont le **path traversal sur le proxy d’images** et la **sanitization du contenu du blog** pour éviter toute exploitation en cas de compromission ou d’erreur de contenu. Ensuite, renforcer la route de setup et le rate limiting partagé améliorera encore la résistance aux abus et aux attaques automatisées.
