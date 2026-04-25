import { NextResponse } from 'next/server';
import { getUserPosts } from '@lib/user-repo';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const posts = await getUserPosts(id);
    return NextResponse.json({ success: true, posts });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
