// Templates d'emails transactionnels (HTML responsive inline).
// Ils reprennent la charte Lokin Energy ; si vous préférez React Email,
// remplacez ces fonctions par un rendu `@react-email/render` — la
// signature (retour : string HTML) reste identique.

const BRAND = {
  bg: "#0e1210",
  card: "#1c2420",
  accent: "#b6f43a",
  text: "#f4f2ec",
  muted: "#9aa39c",
};

function formatEUR(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function layout(title: string, content: string): string {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:${BRAND.bg};font-family:Helvetica,Arial,sans-serif;color:${BRAND.text};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr><td style="padding-bottom:24px;text-align:center;">
            <span style="font-size:22px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:${BRAND.text};">
              Lokin<span style="color:${BRAND.accent};">.</span>Energy
            </span>
          </td></tr>
          <tr><td style="background:${BRAND.card};border-radius:16px;padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND.text};">${title}</h1>
            ${content}
          </td></tr>
          <tr><td style="padding-top:24px;text-align:center;font-size:12px;color:${BRAND.muted};">
            Lokin Energy — lokin-energy.fr<br/>
            La caféine est déconseillée aux femmes enceintes et aux personnes sensibles.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export interface OrderEmailItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export function orderConfirmationEmail(params: {
  orderId: string;
  items: OrderEmailItem[];
  totalCents: number;
}): string {
  const rows = params.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #2c342f;color:${BRAND.text};">${it.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #2c342f;text-align:center;color:${BRAND.muted};">×${it.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #2c342f;text-align:right;color:${BRAND.text};">${formatEUR(it.unitPriceCents * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  return layout(
    "Merci, votre commande est confirmée ⚡",
    `
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      Commande <strong style="color:${BRAND.text};">${params.orderId.slice(0, 8).toUpperCase()}</strong> —
      nous préparons votre colis et vous enverrons le lien de suivi dès son expédition.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${rows}
      <tr>
        <td colspan="2" style="padding:12px 0;font-weight:bold;color:${BRAND.text};">Total payé</td>
        <td style="padding:12px 0;text-align:right;font-weight:bold;color:${BRAND.accent};">${formatEUR(params.totalCents)}</td>
      </tr>
    </table>`,
  );
}

export function shippingNotificationEmail(params: {
  orderId: string;
  trackingUrl: string;
}): string {
  return layout(
    "Votre colis est en route 📦",
    `
    <p style="margin:0 0 20px;color:${BRAND.muted};">
      La commande <strong style="color:${BRAND.text};">${params.orderId.slice(0, 8).toUpperCase()}</strong>
      vient d'être expédiée.
    </p>
    <p style="text-align:center;margin:0;">
      <a href="${params.trackingUrl}"
         style="display:inline-block;background:${BRAND.accent};color:#0e1210;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;">
        Suivre mon colis
      </a>
    </p>`,
  );
}

export function paymentFailedEmail(params: { amountCents: number }): string {
  return layout(
    "Échec de paiement sur votre abonnement",
    `
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      Le prélèvement de <strong style="color:${BRAND.text};">${formatEUR(params.amountCents)}</strong>
      pour votre abonnement Lokin Energy n'a pas abouti.
    </p>
    <p style="margin:0;color:${BRAND.muted};">
      Aucune inquiétude : Stripe retentera automatiquement. Vous pouvez aussi
      mettre à jour votre moyen de paiement depuis le lien du portail client
      envoyé par Stripe.
    </p>`,
  );
}
