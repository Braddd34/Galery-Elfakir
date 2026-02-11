import { resend, FROM_EMAIL, FROM_NAME } from './resend'
import { CONTACT_EMAIL } from './constants'

// Types pour les données d'email
interface OrderData {
  orderNumber: string
  customerName: string
  artworkTitle: string
  artworkArtist: string
  total: number
  trackingNumber?: string
  shippingCarrier?: string
}

interface ArtworkData {
  title: string
  artistName: string
  artistEmail: string
}

// =====================================================
// TEMPLATES HTML
// =====================================================

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ELFAKIR Gallery</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 0; border-bottom: 1px solid #333;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 300; letter-spacing: 0.3em; text-align: center;">
                ELFAKIR
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 0;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 0; border-top: 1px solid #333; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">
                Galerie ELFAKIR — Art Contemporain
              </p>
              <p style="margin: 0; color: #666; font-size: 12px;">
                <a href="https://galeryelfakir.vercel.app" style="color: #b8860b; text-decoration: none;">
                  galeryelfakir.vercel.app
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// =====================================================
// FONCTIONS D'ENVOI D'EMAILS
// =====================================================

/**
 * Email de bienvenue après inscription
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 300;">
      Bienvenue, ${name || 'cher amateur d\'art'} !
    </h2>
    <p style="margin: 0 0 20px 0; color: #999; font-size: 16px; line-height: 1.6;">
      Nous sommes ravis de vous accueillir dans notre galerie d'art contemporain en ligne.
    </p>
    <p style="margin: 0 0 30px 0; color: #999; font-size: 16px; line-height: 1.6;">
      Découvrez notre collection exclusive d'œuvres originales, sélectionnées avec passion auprès d'artistes du monde entier.
    </p>
    <a href="https://galeryelfakir.vercel.app/catalogue" style="display: inline-block; padding: 15px 30px; background-color: #b8860b; color: #000; text-decoration: none; font-size: 14px; letter-spacing: 0.1em;">
      DÉCOUVRIR LE CATALOGUE
    </a>
  `

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Bienvenue chez ELFAKIR Gallery',
      html: baseTemplate(content)
    })
    console.log(`Email de bienvenue envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email bienvenue:', error)
    return { success: false, error }
  }
}

/**
 * Email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(email: string, order: OrderData) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 300;">
      Commande confirmée
    </h2>
    <p style="margin: 0 0 10px 0; color: #999; font-size: 16px;">
      Merci pour votre achat, ${order.customerName} !
    </p>
    <p style="margin: 0 0 30px 0; color: #999; font-size: 14px;">
      Commande #${order.orderNumber}
    </p>
    
    <div style="background-color: #111; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 18px;">
        ${order.artworkTitle}
      </p>
      <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
        par ${order.artworkArtist}
      </p>
      <p style="margin: 0; color: #b8860b; font-size: 24px;">
        €${order.total.toLocaleString()}
      </p>
    </div>
    
    <p style="margin: 0; color: #999; font-size: 14px; line-height: 1.6;">
      Nous préparons votre commande avec le plus grand soin. Vous recevrez un email dès que votre œuvre sera expédiée.
    </p>
  `

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Commande #${order.orderNumber} confirmée — ELFAKIR`,
      html: baseTemplate(content)
    })
    console.log(`Email confirmation envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email confirmation:', error)
    return { success: false, error }
  }
}

/**
 * Email de notification d'expédition
 */
export async function sendShippingNotificationEmail(email: string, order: OrderData) {
  const trackingInfo = order.trackingNumber 
    ? `
      <div style="background-color: #111; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
          Informations de suivi
        </p>
        <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 14px;">
          <strong>Transporteur :</strong> ${order.shippingCarrier || 'Non spécifié'}
        </p>
        <p style="margin: 0; color: #ffffff; font-size: 14px;">
          <strong>N° de suivi :</strong> ${order.trackingNumber}
        </p>
      </div>
    `
    : ''

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 300;">
      Votre commande est en route !
    </h2>
    <p style="margin: 0 0 10px 0; color: #999; font-size: 16px;">
      Bonne nouvelle, ${order.customerName} !
    </p>
    <p style="margin: 0 0 20px 0; color: #999; font-size: 14px;">
      Votre commande #${order.orderNumber} a été expédiée.
    </p>
    
    <div style="background-color: #111; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 16px;">
        ${order.artworkTitle}
      </p>
      <p style="margin: 0; color: #666; font-size: 14px;">
        par ${order.artworkArtist}
      </p>
    </div>
    
    ${trackingInfo}
    
    <p style="margin: 20px 0 0 0; color: #999; font-size: 14px; line-height: 1.6;">
      Votre œuvre a été soigneusement emballée avec une protection professionnelle. 
      Elle sera livrée à l'adresse que vous avez indiquée lors de votre commande.
    </p>
  `

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Votre commande #${order.orderNumber} a été expédiée — ELFAKIR`,
      html: baseTemplate(content)
    })
    console.log(`Email expédition envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email expédition:', error)
    return { success: false, error }
  }
}

/**
 * Email de notification de vente (pour l'artiste)
 */
export async function sendSaleNotificationEmail(artistEmail: string, artwork: ArtworkData, saleAmount: number) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 300;">
      Félicitations, vous avez vendu une œuvre !
    </h2>
    <p style="margin: 0 0 30px 0; color: #999; font-size: 16px;">
      Cher ${artwork.artistName},
    </p>
    
    <div style="background-color: #111; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0; color: #b8860b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
        Œuvre vendue
      </p>
      <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 20px;">
        ${artwork.title}
      </p>
      <p style="margin: 0; color: #ffffff; font-size: 24px;">
        Votre part : €${saleAmount.toLocaleString()}
      </p>
    </div>
    
    <p style="margin: 0; color: #999; font-size: 14px; line-height: 1.6;">
      Le paiement sera transféré sur votre compte dans les prochains jours. 
      Merci de faire partie de la galerie ELFAKIR !
    </p>
  `

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: artistEmail,
      subject: `Votre œuvre "${artwork.title}" a été vendue ! — ELFAKIR`,
      html: baseTemplate(content)
    })
    console.log(`Email vente envoyé à ${artistEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email vente:', error)
    return { success: false, error }
  }
}

/**
 * Email de notification d'approbation d'œuvre (pour l'artiste)
 */
export async function sendArtworkApprovedEmail(artistEmail: string, artwork: ArtworkData) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 300;">
      Votre œuvre est en ligne !
    </h2>
    <p style="margin: 0 0 30px 0; color: #999; font-size: 16px;">
      Cher ${artwork.artistName},
    </p>
    
    <div style="background-color: #111; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0; color: #4ade80; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
        ✓ Approuvée
      </p>
      <p style="margin: 0; color: #ffffff; font-size: 20px;">
        ${artwork.title}
      </p>
    </div>
    
    <p style="margin: 0 0 30px 0; color: #999; font-size: 14px; line-height: 1.6;">
      Votre œuvre a été approuvée et est maintenant visible dans notre catalogue. 
      Elle est désormais disponible à la vente pour nos collectionneurs.
    </p>
    
    <a href="https://galeryelfakir.vercel.app/catalogue" style="display: inline-block; padding: 15px 30px; background-color: #b8860b; color: #000; text-decoration: none; font-size: 14px; letter-spacing: 0.1em;">
      VOIR LE CATALOGUE
    </a>
  `

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: artistEmail,
      subject: `Votre œuvre "${artwork.title}" est en ligne ! — ELFAKIR`,
      html: baseTemplate(content)
    })
    console.log(`Email approbation envoyé à ${artistEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email approbation:', error)
    return { success: false, error }
  }
}

/**
 * Email de formulaire de contact
 */
/**
 * Email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 300;">
      Réinitialisation de votre mot de passe
    </h2>
    <p style="margin: 0 0 20px 0; color: #999; font-size: 16px; line-height: 1.6;">
      Vous avez demandé à réinitialiser votre mot de passe. 
      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
    </p>
    <p style="margin: 0 0 30px 0; color: #999; font-size: 14px; line-height: 1.6;">
      Ce lien expire dans 1 heure.
    </p>
    <a href="${resetUrl}" style="display: inline-block; padding: 15px 30px; background-color: #b8860b; color: #000; text-decoration: none; font-size: 14px; letter-spacing: 0.1em;">
      RÉINITIALISER MON MOT DE PASSE
    </a>
    <p style="margin: 30px 0 0 0; color: #666; font-size: 12px; line-height: 1.6;">
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
      Votre mot de passe ne sera pas modifié.
    </p>
  `

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe — ELFAKIR',
      html: baseTemplate(content)
    })
    console.log(`Email reset password envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email reset password:', error)
    return { success: false, error }
  }
}

/**
 * Email de vérification d'email
 */
export async function sendEmailVerificationEmail(email: string, name: string, verifyUrl: string) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 300;">
      Vérifiez votre adresse email
    </h2>
    <p style="margin: 0 0 20px 0; color: #999; font-size: 16px; line-height: 1.6;">
      Bonjour ${name || 'cher amateur d\'art'},
    </p>
    <p style="margin: 0 0 20px 0; color: #999; font-size: 16px; line-height: 1.6;">
      Pour finaliser votre inscription et accéder à toutes les fonctionnalités de la galerie, 
      veuillez confirmer votre adresse email.
    </p>
    <p style="margin: 0 0 30px 0; color: #999; font-size: 14px; line-height: 1.6;">
      Ce lien expire dans 24 heures.
    </p>
    <a href="${verifyUrl}" style="display: inline-block; padding: 15px 30px; background-color: #b8860b; color: #000; text-decoration: none; font-size: 14px; letter-spacing: 0.1em;">
      VÉRIFIER MON EMAIL
    </a>
  `

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Vérifiez votre adresse email — ELFAKIR',
      html: baseTemplate(content)
    })
    console.log(`Email vérification envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email vérification:', error)
    return { success: false, error }
  }
}

/**
 * Email de formulaire de contact
 */
export async function sendContactEmail(
  name: string, 
  email: string, 
  subject: string, 
  message: string
) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 300;">
      Nouveau message de contact
    </h2>
    
    <div style="background-color: #111; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">De</p>
      <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 16px;">${name}</p>
      <p style="margin: 0; color: #b8860b; font-size: 14px;">${email}</p>
    </div>
    
    <div style="background-color: #111; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">Sujet</p>
      <p style="margin: 0; color: #ffffff; font-size: 16px;">${subject}</p>
    </div>
    
    <div style="background-color: #111; padding: 20px;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">Message</p>
      <p style="margin: 0; color: #999; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
    </div>
  `

  try {
    // Envoyer à l'admin de la galerie
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: CONTACT_EMAIL,
      reply_to: email,
      subject: `[Contact] ${subject}`,
      html: baseTemplate(content)
    })
    console.log(`Email contact reçu de ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email contact:', error)
    return { success: false, error }
  }
}
