import { NextResponse } from 'next/server';
import { toggleFollow } from '@lib/follow-repo';

export async function POST(request) {
  try {
    const { followerId, followingId } = await request.json();
    if (!followerId || !followingId) {
      return NextResponse.json(
        { success: false, error: 'followerId and followingId are required' },
        { status: 400 }
      );
    }
    const result = await toggleFollow(followerId, followingId);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
