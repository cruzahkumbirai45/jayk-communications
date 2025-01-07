import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return res.status(200).json(posts)
  } else if (req.method === 'POST') {
    const { title, content } = req.body
    const post = await prisma.post.create({
      data: {
        title,
        content,
        author: { connect: { email: session.user.email } }
      }
    })
    return res.status(201).json(post)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

