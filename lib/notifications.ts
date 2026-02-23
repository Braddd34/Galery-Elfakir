import prisma from "@/lib/prisma"

/**
 * Système de création de notifications.
 * 
 * Chaque fonction crée une notification en base de données
 * pour informer l'utilisateur en temps réel via l'UI (cloche).
 * Les emails sont envoyés séparément via lib/emails.ts.
 */

type NotificationType = 
  | "sale"              // Artiste : une œuvre a été vendue
  | "artwork_approved"  // Artiste : œuvre approuvée par admin
  | "artwork_rejected"  // Artiste : œuvre refusée par admin
  | "order_confirmed"   // Acheteur : commande confirmée
  | "order_shipped"     // Acheteur : commande expédiée
  | "order_delivered"   // Acheteur : commande livrée
  | "new_follower"      // Artiste : nouvel abonné
  | "new_message"       // Tous : nouveau message
  | "new_review"        // Artiste : nouvelle critique sur une œuvre
  | "manager_sale"      // Manager : vente d'un artiste géré
  | "manager_stagnant"  // Manager : œuvre invendue depuis longtemps
  | "manager_message"   // Manager : message client pour un artiste géré

/**
 * Créer une notification pour un utilisateur.
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link
      }
    })
  } catch (error) {
    console.error("Erreur création notification:", error)
  }
}

// =====================================================
// FONCTIONS HELPER POUR CHAQUE TYPE D'ÉVÉNEMENT
// =====================================================

/**
 * Notifier l'artiste qu'une de ses œuvres a été vendue.
 */
export async function notifySale(artistUserId: string, artworkTitle: string, amount: number) {
  await createNotification({
    userId: artistUserId,
    type: "sale",
    title: "Œuvre vendue !",
    message: `Votre œuvre "${artworkTitle}" a été vendue pour €${amount.toLocaleString()}`,
    link: "/dashboard/artiste/ventes"
  })
}

/**
 * Notifier l'artiste que son œuvre a été approuvée.
 */
export async function notifyArtworkApproved(artistUserId: string, artworkTitle: string) {
  await createNotification({
    userId: artistUserId,
    type: "artwork_approved",
    title: "Œuvre approuvée",
    message: `Votre œuvre "${artworkTitle}" est maintenant en ligne dans le catalogue`,
    link: "/dashboard/artiste/oeuvres"
  })
}

/**
 * Notifier l'artiste que son œuvre a été refusée.
 */
export async function notifyArtworkRejected(artistUserId: string, artworkTitle: string, reason?: string) {
  await createNotification({
    userId: artistUserId,
    type: "artwork_rejected",
    title: "Œuvre non approuvée",
    message: reason 
      ? `Votre œuvre "${artworkTitle}" n'a pas été approuvée. Raison : ${reason}`
      : `Votre œuvre "${artworkTitle}" n'a pas été approuvée. Veuillez la modifier et la soumettre à nouveau.`,
    link: "/dashboard/artiste/oeuvres"
  })
}

/**
 * Notifier l'acheteur que sa commande est confirmée.
 */
export async function notifyOrderConfirmed(buyerUserId: string, orderNumber: string) {
  await createNotification({
    userId: buyerUserId,
    type: "order_confirmed",
    title: "Commande confirmée",
    message: `Votre commande #${orderNumber} a été confirmée et est en cours de préparation`,
    link: "/dashboard/commandes"
  })
}

/**
 * Notifier l'acheteur que sa commande a été expédiée.
 */
export async function notifyOrderShipped(buyerUserId: string, orderNumber: string, trackingNumber?: string) {
  const trackingInfo = trackingNumber ? ` (Suivi : ${trackingNumber})` : ""
  await createNotification({
    userId: buyerUserId,
    type: "order_shipped",
    title: "Commande expédiée",
    message: `Votre commande #${orderNumber} a été expédiée${trackingInfo}`,
    link: "/dashboard/commandes"
  })
}

/**
 * Notifier l'acheteur que sa commande a été livrée.
 */
export async function notifyOrderDelivered(buyerUserId: string, orderNumber: string) {
  await createNotification({
    userId: buyerUserId,
    type: "order_delivered",
    title: "Commande livrée",
    message: `Votre commande #${orderNumber} a été livrée. Nous espérons que vous apprécierez votre œuvre !`,
    link: "/dashboard/commandes"
  })
}

/**
 * Notifier l'artiste qu'il a un nouvel abonné.
 */
export async function notifyNewFollower(artistUserId: string, followerName: string) {
  await createNotification({
    userId: artistUserId,
    type: "new_follower",
    title: "Nouvel abonné",
    message: `${followerName} suit maintenant votre profil`,
    link: "/dashboard/artiste/ventes"
  })
}

/**
 * Notifier un utilisateur qu'il a un nouveau message.
 */
export async function notifyNewMessage(userId: string, senderName: string, subject?: string) {
  await createNotification({
    userId,
    type: "new_message",
    title: "Nouveau message",
    message: subject 
      ? `${senderName} vous a envoyé un message : "${subject}"`
      : `${senderName} vous a envoyé un message`,
    link: "/dashboard/messages"
  })
}

/**
 * Notifier l'artiste qu'une nouvelle critique a été laissée sur son œuvre.
 */
export async function notifyNewReview(artistUserId: string, artworkTitle: string, rating: number) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating)
  await createNotification({
    userId: artistUserId,
    type: "new_review",
    title: "Nouvel avis",
    message: `Un avis ${stars} a été laissé sur votre œuvre "${artworkTitle}"`,
    link: "/dashboard/artiste/oeuvres"
  })
}

// =====================================================
// FONCTIONS HELPER POUR LES MANAGERS
// =====================================================

/**
 * Notifier le manager qu'une œuvre de l'un de ses artistes a été vendue.
 */
export async function notifyManagerSale(managerId: string, artworkTitle: string, artistName: string, amount: number) {
  return createNotification({
    userId: managerId,
    type: "manager_sale",
    title: "Vente réalisée",
    message: `L'œuvre "${artworkTitle}" de ${artistName} a été vendue pour €${amount.toLocaleString()}`,
    link: "/dashboard/manager"
  })
}

/**
 * Notifier le manager qu'une œuvre d'un de ses artistes est invendue depuis longtemps.
 */
export async function notifyManagerStagnantArtwork(managerId: string, artworkTitle: string, artistName: string, daysSinceAdd: number) {
  return createNotification({
    userId: managerId,
    type: "manager_stagnant",
    title: "Œuvre en attente",
    message: `"${artworkTitle}" de ${artistName} est invendue depuis ${daysSinceAdd} jours`,
    link: "/dashboard/manager/oeuvres"
  })
}

/**
 * Notifier le manager qu'un client a envoyé un message à l'un de ses artistes.
 */
export async function notifyManagerNewMessage(managerId: string, artistName: string) {
  return createNotification({
    userId: managerId,
    type: "manager_message",
    title: "Nouveau message",
    message: `Un client a envoyé un message à ${artistName}`,
    link: "/dashboard/manager/artistes"
  })
}
