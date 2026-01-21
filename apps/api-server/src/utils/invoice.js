const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoice = (order, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });

        doc.pipe(fs.createWriteStream(filePath));

        // Header
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();

        // Order Info
        doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.text(`Status: ${order.status}`);
        doc.moveDown();

        // Shipping Address
        doc.fontSize(14).text('Shipping Address', { underline: true });
        doc.fontSize(10).text(order.shippingAddress.street);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`);
        doc.text(order.shippingAddress.country);
        doc.moveDown();

        // Items Table
        doc.fontSize(14).text('Items', { underline: true });
        doc.moveDown();

        let y = doc.y;
        doc.fontSize(10).text('Item', 50, y);
        doc.text('Qty', 300, y);
        doc.text('Price', 400, y);
        doc.text('Total', 500, y);
        doc.moveDown();

        order.items.forEach(item => {
            y = doc.y;
            doc.text(item.name, 50, y);
            doc.text(item.quantity.toString(), 300, y);
            doc.text(`INR ${item.price}`, 400, y);
            doc.text(`INR ${item.price * item.quantity}`, 500, y);
            doc.moveDown();
        });

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Totals
        doc.fontSize(12).text(`Total Amount: INR ${order.totalAmount}`, { align: 'right' });
        doc.text(`Discount: INR ${order.discountAmount}`, { align: 'right' });
        doc.fontSize(16).text(`Final Amount: INR ${order.finalAmount}`, { align: 'right', bold: true });

        doc.end();
        doc.on('end', () => resolve());
        doc.on('error', (err) => reject(err));
    });
};
