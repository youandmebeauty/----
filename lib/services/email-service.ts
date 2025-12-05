import type { Order } from "@/lib/models"

interface EmailPayload {
  to: string
  subject: string
  html: string
  type: "customer" | "admin"
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  try {
    // Send email to customer
    const customerEmailSent = await sendEmail({
      to: order.email,
      subject: "Confirmation de votre commande",
      html: generateCustomerEmailBody(order),
      type: "customer",
    })

    // Send notification to admin
    const adminEmailSent = await sendEmail({
      to: process.env.GMAIL_USER || "",
      subject: `Nouvelle commande #${order.id}`,
      html: generateAdminEmailBody(order),
      type: "admin",
    })

    return customerEmailSent && adminEmailSent
  } catch (error) {
    console.error("Error sending order confirmation emails:", error)
    return false
  }
}

function generateCustomerEmailBody(order: Order): string {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 100 ? 0 : 8;

  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toFixed(2)} TND</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toFixed(2)} TND</td>
    </tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #45062E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">You&me Beauty</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2>Thank you for your order!</h2>
        <p>Hello ${order.customerName},</p>
        <p>We've received your order and are working on it now. Here's a summary of your purchase:</p>
        
        <div style="margin: 20px 0;">
          <h3>Order Summary</h3>
          <p><strong>Order ID:</strong> #${order.id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Quantity</th>
                <th style="padding: 10px; text-align: left;">Price</th>
                <th style="padding: 10px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px;">${subtotal.toFixed(2)} TND</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 10px;">${shippingCost === 0 ? '<span style="color: #16a34a;">Free</span>' : `${shippingCost.toFixed(2)} TND`
    }</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px;"><strong>${order.total.toFixed(2)} TND</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${order.customerName}<br>
          ${order.address}<br>
          ${order.city}, ${order.postalCode}<br>
          ${order.country}</p>
        </div>
        
        <p>We'll send you another email when your order ships. If you have any questions, please contact our customer service team.</p>
        
        <p>Thank you for shopping with You&me Beauty!</p>
      </div>
      
      <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>© 2024 You&me Beauty. All rights reserved.</p>
        <p>123 Beauty Street, New York, NY 10001</p>
      </div>
    </div>
  `;
}

function generateAdminEmailBody(order: Order): string {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 100 ? 0 : 8;

  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toFixed(2)} TND</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toFixed(2)} TND</td>
    </tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #45062E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">You&me Beauty - New Order</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Phone:</strong> ${order.phone || "Not provided"}</p>
        
        <div style="margin: 20px 0;">
          <h3>Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Quantity</th>
                <th style="padding: 10px; text-align: left;">Price</th>
                <th style="padding: 10px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px;">${subtotal.toFixed(2)} TND</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 10px;">${shippingCost === 0 ? '<span style="color: #16a34a;">Free</span>' : `${shippingCost.toFixed(2)} TND`
    }</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px;"><strong>${order.total.toFixed(2)} TND</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${order.customerName}<br>
          ${order.address}<br>
          ${order.city}, ${order.postalCode}<br>
          ${order.country}</p>
        </div>
        
        ${order.notes
      ? `<div style="margin: 20px 0;">
          <h3>Customer Notes</h3>
          <p>${order.notes}</p>
        </div>`
      : ""
    }
        
        <p>Please process this order as soon as possible.</p>
      </div>
    </div>
  `;
}
