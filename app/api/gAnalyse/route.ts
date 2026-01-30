import type { NextApiRequest, NextApiResponse } from 'next';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

type Data = {
  data?: any;
  error?: string;
};

export default async function handler(
  res: NextApiResponse<Data>
) {
  try {
    if (!process.env.FIREBASE_ADMIN_KEY) {
      return res.status(500).json({ error: 'Missing FIREBASE_ADMIN_KEY env variable' });
    }

    // Parse the service account JSON from env variable
    const credentials = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials,
    });

    const [response] = await analyticsDataClient.runReport({
      property: 'properties/514862251',
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'date' }],
    });

    res.status(200).json({ data: response.rows });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
}
