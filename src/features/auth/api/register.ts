import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import {baseURL} from "@/../next.config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await axios.post(
        baseURL+'/register',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    return res.status(statusCode).json({ message });
  }
}