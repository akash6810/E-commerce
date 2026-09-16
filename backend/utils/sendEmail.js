const nodemailer = require('nodemailer');

const sendOrderConfirmationEmail = async (userEmail, order) => {
  try {
    // FIX: createTransport, not createTransporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const deliveryDate = new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const itemsHtml = order.items
      .map(
        (item) => `
        <div style="display:flex; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" width="60" height="60" style="object-fit:cover; border-radius:6px; margin-right:15px;" />` : ''}
          <div>
            <h4 style="margin:0; color:#333;">${item.name}</h4>
            <p style="margin:4px 0; color:#666; font-size:14px;">Qty: ${item.quantity} | Price: $${item.price}</p>
          </div>
        </div>`
      )
      .join('');

    const mailOptions = {
      from: `"ShopHub" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - #${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #244e5a; text-align: center;">Order Confirmed!</h2>
          <p>Hi there, thank you for shopping with us. Your payment has been verified.</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">
              🚚 Estimated Delivery Window: ${orderDate} to ${deliveryDate} (within 1 week)
            </p>
          </div>

          <h3>Order Details</h3>
          ${itemsHtml}

          <p style="font-size: 16px; font-weight: bold; text-align: right; margin-top: 15px;">
            Total Paid: ₹${order.totalAmount.toFixed(2)}
          </p>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h4>Shipping Address</h4>
          <p style="color: #555; line-height: 1.5; margin: 0;">
            ${order.shippingAddress.address}<br/>
            ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}<br/>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
  } catch (emailErr) {
    console.error('Nodemailer error (order still saved):', emailErr.message);
  }
};

module.exports = sendOrderConfirmationEmail;