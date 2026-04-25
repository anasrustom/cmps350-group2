import { NextResponse } from 'next/server';
import { deletePost } from '@lib/post-repo';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }
    await deletePost(id, userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const status = err.message === 'not authorized' ? 403 : err.message === 'post not found' ? 404 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
