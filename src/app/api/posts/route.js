import { NextResponse } from 'next/server';
import { getFeedPosts, createPost } from '@lib/post-repo';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab    = searchParams.get('tab') || 'following';
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }
    const posts = await getFeedPosts(Number(userId), tab);
    return NextResponse.json({ success: true, posts });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { authorId, content } = await request.json();
    if (!authorId || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'authorId and content required' },
        { status: 400 }
      );
    }
    const post = await createPost(authorId, content.trim());
    return NextResponse.json({ success: true, post });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
