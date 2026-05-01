import { NextResponse } from 'next/server';
import { getPostComments, addComment } from '@lib/post-repo';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const comments = await getPostComments(id);
    return NextResponse.json({ success: true, comments });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { userId, text } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }
    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'comment cannot be empty' }, { status: 400 });
    }
    const comment = await addComment(id, userId, text);
    return NextResponse.json({ success: true, comment });
  } catch (err) {
    const status = err.message === 'post not found' ? 404 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
