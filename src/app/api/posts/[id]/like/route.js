import { NextResponse } from 'next/server';
import { toggleLike } from '@lib/post-repo';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }
    const likes = await toggleLike(id, userId);
    return NextResponse.json({ success: true, likes });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
