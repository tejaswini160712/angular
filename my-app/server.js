
require('dotenv').config();

const crypto = require('node:crypto');
const cors = require('cors');
const express = require('express');
const Razorpay = require('razorpay');

const app = express();
const port = Number(process.env.PORT) || 3000;
const productPrices = {
  'iPhone 15 Pro': 999,
  'AirPods Max': 499,
  'Nike Air Max': 159,
  'Gaming Headset': 89,
  'Samsung Galaxy S24': 879,
  'Bluetooth Speaker': 119,
};
const deliveryCharge = 25;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured.');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

app.post('/api/payments/orders', async (req, res) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    let subtotal = 0;
    for (const item of items) {
      if (
        typeof item?.name !== 'string' ||
        !Object.hasOwn(productPrices, item.name) ||
        !Number.isInteger(item.qty) ||
        item.qty < 1 ||
        item.qty > 20
      ) {
        return res.status(400).json({ error: 'Your cart contains an invalid item.' });
      }

      subtotal += productPrices[item.name] * item.qty;
    }

    const totalInRupees = subtotal + deliveryCharge;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const order = await getRazorpayClient().orders.create({
      amount: totalInRupees * 100,
      currency: 'INR',
      receipt: `cart_${Date.now()}`,
    });

    return res.json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Unable to create Razorpay order:', error.message);
    return res.status(500).json({ error: 'Unable to start payment. Check the payment server configuration.' });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  const { orderId, paymentId, signature } = req.body ?? {};
  if ([orderId, paymentId, signature].some((value) => typeof value !== 'string' || value.length === 0)) {
    return res.status(400).json({ error: 'Payment verification details are incomplete.' });
  }

  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('Razorpay credentials are not configured.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(signature, 'hex');
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      return res.status(400).json({ error: 'Payment signature could not be verified.' });
    }

    const razorpay = getRazorpayClient();
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ]);
    if (
      payment.order_id !== orderId ||
      payment.status !== 'captured' ||
      order.currency !== 'INR' ||
      payment.currency !== 'INR' ||
      payment.amount !== order.amount
    ) {
      return res.status(400).json({ error: 'Payment has not been captured.' });
    }

    return res.json({ verified: true });
  } catch (error) {
    console.error('Unable to verify Razorpay payment:', error.message);
    return res.status(500).json({ error: 'Unable to verify payment.' });
  }
});

app.listen(port, () => {
  console.log(`Payment API is running on http://localhost:${port}`);
});