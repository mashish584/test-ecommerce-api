import prisma from '../../../utils/prisma';

export default async function (req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const { id } = req.query;

  if (!id) res.status(400).json({ message: 'Product id is missing.' });

  const data = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      image: true,
      price: true,
      description: true,
    },
  });

  if (!data) return res.status(400).json({ message: 'Invalid product id.' });

  return res.status(200).json({ data });
}
