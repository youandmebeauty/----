import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.FIREBASE_ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Missing FIREBASE_ADMIN_KEY env variable' },
        { status: 500 }
      );
    }

    // Parse the service account JSON from env variable
    const credentials = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials,
    });

    // Fetch historical data (last 30 days)
    const [response] = await analyticsDataClient.runReport({
      property: 'properties/514862251',
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'date' }],
    });

    // Fetch realtime data (active users in last 30 minutes)
    let realtimeUsers = 0;
    try {
      const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
        property: 'properties/514862251',
        metrics: [{ name: 'activeUsers' }],
      });
      
      if (realtimeResponse.rows && realtimeResponse.rows.length > 0) {
        realtimeUsers = parseInt(realtimeResponse.rows[0].metricValues?.[0]?.value || '0', 10);
      }
    } catch (realtimeError) {
      console.error('Realtime data error:', realtimeError);
      // Continue without realtime data if it fails
    }

    return NextResponse.json({ 
      data: response.rows,
      realtimeUsers 
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}