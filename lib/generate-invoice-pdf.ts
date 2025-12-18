import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// Type augmentation to add autoTable to jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

export interface InvoiceProduct {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
}

export interface InvoiceCustomer {
  name: string
  email: string
  phone: string
  address?: {
    addressLine: string
    district: string
    delegation: string
    governorate: string
  }
}

export interface InvoiceDetails {
  orderId: string
  date: Date | string // Allow string for ISO dates
  products: InvoiceProduct[]
  customer: InvoiceCustomer
  subtotal: number
  tax: number
  shipping: number
  total: number
  paymentMethod: string
  promoCode?: string
  discount?: number
}

export function generateInvoicePDF(order: InvoiceDetails): Blob {
  try {
    const doc = new jsPDF()

    // Add company logo and header
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("You & Me Beauty", 20, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("The Beauty for You and Me", 20, 27)
    doc.text("youandme.tn", 20, 32)

    // Add invoice title and details
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("FACTURE", 180, 20, { align: "right" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Facture n° : ${order.orderId}`, 180, 27, { align: "right" })
    
    // Handle date as Date or ISO string
    const formattedDate = order.date instanceof Date
      ? order.date.toLocaleDateString("fr-FR")
      : order.date
        ? new Date(order.date).toLocaleDateString("fr-FR")
        : "N/A"
    doc.text(`Date : ${formattedDate}`, 180, 32, { align: "right" })

    // Add customer information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Facturé à :", 20, 50)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(order.customer.name, 20, 57)
    doc.text(order.customer.email, 20, 62)
    doc.text(order.customer.phone, 20, 67)

    if (order.customer.address) {
      doc.text(order.customer.address.addressLine, 20, 72)
      doc.text(`${order.customer.address.district}, ${order.customer.address.delegation}`, 20, 77)
      doc.text(order.customer.address.governorate, 20, 82)
    }

    // Add payment method
    doc.text(`Mode de paiement : ${order.paymentMethod}`, 180, 50, { align: "right" })

    // Add product table
    autoTable(doc, {
      startY: 95,
      head: [["Article", "Description", "Qté", "Prix unitaire", "Total"]],
      body: order.products.map((product) => [
        product.id.substring(0, 8), 
        `${product.name}${product.size ? ` - Size: ${product.size}` : ""}${product.color ? ` - Color: ${product.color}` : ""}`,
        product.quantity.toString(),
        `${product.price.toFixed(2)} TND`,
        `${(product.price * product.quantity).toFixed(2)} TND`,
      ]),
      foot: [
        ["", "", "", "Sous-total", `${order.subtotal.toFixed(2)} TND`],
        ...(order.discount && order.promoCode ? [["", "", "", `Réduction (${order.promoCode})`, `-${order.discount.toFixed(2)} TND`]] : []),
        ["", "", "", "Livraison", order.shipping === 0 ? "GRATUIT" : `${order.shipping.toFixed(2)} TND`],
        ["", "", "", "Total", `${order.total.toFixed(2)} TND`],
      ],
      theme: "grid",
      headStyles: { 
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      footStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: "bold" 
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249]
      }
    })

    // Add notes and terms
    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Notes :", 20, finalY)
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("• Livraison gratuite à partir de 200 TND", 20, finalY + 7)
    doc.text("• Paiement à la livraison", 20, finalY + 14)
    doc.text("• Pour toute question : youmebeauty282@gmail.com", 20, finalY + 21)

    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text("Merci pour votre achat chez You & Me Beauty.", 20, doc.internal.pageSize.height - 10)
      doc.text(`Page ${i} sur ${pageCount}`, 180, doc.internal.pageSize.height - 10, { align: "right" })
    }

    return doc.output("blob")
  } catch (error) {
    console.error("Error generating invoice PDF:", error)
    throw new Error("Failed to generate invoice PDF")
  }
}
