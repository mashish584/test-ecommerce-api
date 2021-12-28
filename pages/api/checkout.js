import Stripe from 'stripe';
import prisma from '../../utils/prisma';
import { decodeJWT } from '../../utils/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET);

const getUser = async request => {
  try {
    const decoded = await decodeJWT(request?.headers?.auth);

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
};

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed.',
    });
  }

  const user = await getUser(req);

  if (!user) {
    return res
      .status(401)
      .json({ message: 'You must be signed in to do checkout.' });
  }

  const cart = req.body?.cart || {};
  const productIds = Object.keys(cart);

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
