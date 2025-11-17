import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getTodayProgress,
  updateCurrentWordIndex,
  updateDailyStats,
  getRecentProgress,
} from '@/lib/daily-progress';

// GET /api/progress - Get today's progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '1');

    if (days === 1) {
      // Get today's progress
      const progress = getTodayProgress(session.user.id);
      return NextResponse.json({ progress });
    } else {
      // Get recent progress
      const progressList = getRecentProgress(session.user.id, days);
      return NextResponse.json({ progressList });
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/progress - Update progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentWordIndex, stats } = body;

    // Update current word index
    if (currentWordIndex !== undefined) {
      updateCurrentWordIndex(session.user.id, currentWordIndex);
    }

    // Update daily stats
    if (stats) {
      updateDailyStats(session.user.id, stats);
    }

    const progress = getTodayProgress(session.user.id);

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
