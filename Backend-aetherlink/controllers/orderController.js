const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order, User, Product } = require('../models');

exports.createCheckoutSession = async (req, res) => {
  const { products } = req.body;

  try {
    // Validate products exist
    if (!products || products.length === 0) {
      return res.status(400).json({ msg: 'No products in cart' });
    }

    const line_items = await Promise.all(products.map(async (item) => {
      const product = await Product.findByPk(item.id);
      if (!product) {
        throw new Error(`Product ${item.id} not found`);
      }
      return {
        price_data: {
          currency: 'usd',
          product_data: { 
            name: product.name,
            description: product.description?.substring(0, 100),
            images: product.imageUrl ? [product.imageUrl] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    }));

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cancel`,
      metadata: { 
        userId: req.user.id.toString(),
        products: JSON.stringify(products.map(p => ({ id: p.id, qty: p.quantity })))
      },
      customer_email: req.user.email,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ msg: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const { total, products } = req.body;

  try {
    const order = await Order.create({
      userId: req.user.id,
      total,
      products,
      status: 'pending',
    });
    res.json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ msg: 'Error creating order' });
  }
};

// Webhook to handle successful payments
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Create order in database
      const products = JSON.parse(session.metadata.products || '[]');
      const total = session.amount_total / 100;
      
      await Order.create({
        userId: parseInt(session.metadata.userId),
        total,
        products,
        status: 'completed',
        stripeSessionId: session.id,
      });
      
      console.log(`✅ Order created for user ${session.metadata.userId}`);
    } catch (err) {
      console.error('Error creating order from webhook:', err);
    }
  }

  res.json({ received: true });
};