import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getUserSettingsFromDb,
  updateUserSettings,
  createDefaultSettings,
} from '@/lib/user-settings';

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let settings = getUserSettingsFromDb(session.user.id);

    // Create default settings if they don't exist
    if (!settings) {
      settings = createDefaultSettings(session.user.id);
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { voice_accent, speech_rate, daily_goal } = body;

    const updates: any = {};

    if (voice_accent !== undefined) {
      updates.voice_accent = voice_accent;
    }

    if (speech_rate !== undefined) {
      updates.speech_rate = speech_rate;
    }

    if (daily_goal !== undefined) {
      updates.daily_goal = daily_goal;
    }

    const settings = updateUserSettings(session.user.id, updates);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
