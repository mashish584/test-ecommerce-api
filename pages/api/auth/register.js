import prisma from '../../../utils/prisma';
import { generateJWT, hashPhassword } from '../../../utils/auth';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const user = req.body || {};
    user.password = await hashPhassword(user.password);

    const createdUser = await prisma.user.create({ data: user });
    const token = await generateJWT(createdUser.id);

    return res.status(200).json({
      userId: createdUser.id,
      token,
    });
  } catch (err) {
    console.log({ err });

    let message = 'Something went wrong.';
    let status = 400;

    if (err.code === 'P2002') {
      message = 'Account already exist.';
      status = 200;
    }
    return res.status(status).json({ message });
  }
};
