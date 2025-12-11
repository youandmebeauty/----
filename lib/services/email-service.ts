import type { Order } from "@/lib/models"

interface EmailPayload {
  to: string
  subject: string
  html: string
  type: "customer" | "admin"
}


export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  try {
    
    // Send both customer and admin emails via a single API call
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("API returned error:", errorData)
      throw new Error(`Failed to send confirmation emails: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error sending order confirmation emails:", error)
    return false
  }
}

function generateCustomerEmailBody(order: Order): string {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 200 ? 0 : 8;
  const discount = order.discount || 0;
  const promoCode = order.promoCode;

  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toFixed(2)} DT</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toFixed(2)} DT</td>
    </tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #45062E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">You & Me Beauty</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2>Merci pour votre commande !</h2>
        <p>Bonjour ${order.customerName},</p>
        <p>Nous avons bien reçu votre commande et nous y travaillons actuellement. Voici un récapitulatif de votre achat :</p>
        
        <div style="margin: 20px 0;">
          <h3>Récapitulatif de la commande</h3>
          <p><strong>Numéro de commande :</strong> #${order.id}</p>
          <p><strong>Date de commande :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
          ${promoCode ? `<p><strong>Code promo utilisé :</strong> <span style="color: #16a34a; font-weight: bold;">${promoCode}</span></p>` : ''}
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 10px; text-align: left;">Produit</th>
                <th style="padding: 10px; text-align: left;">Quantité</th>
                <th style="padding: 10px; text-align: left;">Prix</th>
                <th style="padding: 10px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Sous-total :</strong></td>
                <td style="padding: 10px;">${subtotal.toFixed(2)} DT</td>
              </tr>
              ${discount > 0 ? `
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Réduction (${promoCode}) :</strong></td>
                <td style="padding: 10px; color: #16a34a;"><strong>-${discount.toFixed(2)} DT</strong></td>
              </tr>
              ` : ''}
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Livraison :</strong></td>
                <td style="padding: 10px;">${shippingCost === 0 ? '<span style="color: #16a34a;">Gratuite</span>' : `${shippingCost.toFixed(2)} DT`
    }</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total :</strong></td>
                <td style="padding: 10px;"><strong>${order.total.toFixed(2)} DT</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Adresse de livraison</h3>
          <p>${order.customerName}<br>
          ${order.address}<br>
          ${order.city}, ${order.postalCode}<br>
          ${order.gouvernorat}</p>
        </div>
        
        <p>Nous vous enverrons un autre email lorsque votre commande sera expédiée. Si vous avez des questions, n'hésitez pas à contacter notre service client.</p>
        
        <p>Merci d'avoir choisi You & Me Beauty !</p>
      </div>
      
      <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>© 2025 You & Me Beauty. Tous droits réservés.</p>
        <p>Route Lafrane KM 5.5, Markez Torki, Sfax Sud</p>
      </div>
    </div>
  `;
}

function generateAdminEmailBody(order: Order): string {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 200 ? 0 : 8;
  const discount = order.discount || 0;
  const promoCode = order.promoCode;

  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toFixed(2)} DT</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toFixed(2)} DT</td>
    </tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #45062E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">You & Me Beauty - Nouvelle commande</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2>Nouvelle commande reçue</h2>
        <p><strong>Numéro de commande :</strong> #${order.id}</p>
        <p><strong>Date de commande :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
        <p><strong>Client :</strong> ${order.customerName}</p>
        <p><strong>Email :</strong> ${order.email}</p>
        <p><strong>Téléphone :</strong> ${order.phone || "Non fourni"}</p>
        ${promoCode ? `<p><strong>Code promo utilisé :</strong> <span style="color: #16a34a; font-weight: bold;">${promoCode}</span> ${discount > 0 ? `(-${discount.toFixed(2)} DT)` : ''}</p>` : ''}
        
        <div style="margin: 20px 0;">
          <h3>Détails de la commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 10px; text-align: left;">Produit</th>
                <th style="padding: 10px; text-align: left;">Quantité</th>
                <th style="padding: 10px; text-align: left;">Prix</th>
                <th style="padding: 10px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Sous-total :</strong></td>
                <td style="padding: 10px;">${subtotal.toFixed(2)} DT</td>
              </tr>
              ${discount > 0 ? `
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Réduction (${promoCode}) :</strong></td>
                <td style="padding: 10px; color: #16a34a;"><strong>-${discount.toFixed(2)} DT</strong></td>
              </tr>
              ` : ''}
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Livraison :</strong></td>
                <td style="padding: 10px;">${shippingCost === 0 ? '<span style="color: #16a34a;">Gratuite</span>' : `${shippingCost.toFixed(2)} DT`
    }</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total :</strong></td>
                <td style="padding: 10px;"><strong>${order.total.toFixed(2)} DT</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Adresse de livraison</h3>
          <p>${order.customerName}<br>
          ${order.address}<br>
          ${order.city}, ${order.postalCode}<br>
          ${order.gouvernorat}</p>
        </div>
        
        ${order.notes
      ? `<div style="margin: 20px 0;">
          <h3>Notes du client</h3>
          <p>${order.notes}</p>
        </div>`
      : ""
    }
        
        <p>Veuillez traiter cette commande dans les plus brefs délais.</p>
      </div>
    </div>
  `;
}

// Export the email generation functions so they can be used server-side
export { generateCustomerEmailBody, generateAdminEmailBody }