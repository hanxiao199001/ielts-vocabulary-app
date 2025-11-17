import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getUserWordRecords,
  getWordRecord,
  upsertWordRecord,
  getWordRecordStats,
} from '@/lib/word-record';

// GET /api/word-records - Get all word records for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const records = getUserWordRecords(session.user.id);
    const stats = getWordRecordStats(session.user.id);

    return NextResponse.json({
      records,
      stats,
    });
  } catch (error) {
    console.error('Error fetching word records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch word records' },
      { status: 500 }
    );
  }
}

// POST /api/word-records - Create or update word record
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
    const { wordId, status, nextReviewDate } = body;

    if (!wordId || !status) {
      return NextResponse.json(
        { error: 'wordId and status are required' },
        { status: 400 }
      );
    }

    const record = upsertWordRecord(
      session.user.id,
      wordId,
      status,
      nextReviewDate
    );

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Error updating word record:', error);
    return NextResponse.json(
      { error: 'Failed to update word record' },
      { status: 500 }
    );
  }
}
