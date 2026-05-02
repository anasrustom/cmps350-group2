import { NextResponse } from 'next/server';
import { loginUser } from '@lib/user-repo';
import { getFollowingIds } from '@lib/follow-repo';

export async function POST(request) {
  try {
    const body = await request.json();
    const user = await loginUser(body);
    // Include following IDs so the browser can cache them in x_current_user
    // for backward compatibility with feed.js which reads me.following synchronously.
    const following = await getFollowingIds(user.id);
    return NextResponse.json({ success: true, user: { ...user, following } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
} 
