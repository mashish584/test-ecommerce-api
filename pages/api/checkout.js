import prisma from '../../utils/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed.',
    });
  }

  const cart = req.body?.cart || {};
  const productIds = Object.keys(cart);

  console.log({ cart });

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  //Cart total
  let total = 0;
  products.forEach(product => {
    total += product.price * cart[product.id].quantity;
  });

  //Payment Intents
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'usd',
  });

  return res.status(200).json({
    publishableKey: process.env.STRIPE_PUBLIC,
    paymentIntent: paymentIntent.client_secret,
  });
};
