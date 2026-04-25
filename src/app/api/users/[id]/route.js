import { NextResponse } from 'next/server';
import { getUserProfile, updateUser } from '@lib/user-repo';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getUserProfile(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'user not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { bio, avatar } = body;
    const user = await updateUser(id, { bio, avatar });
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
