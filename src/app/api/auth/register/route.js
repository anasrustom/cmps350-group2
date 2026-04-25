import { NextResponse } from 'next/server';
import { createUser } from '@lib/user-repo';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, bio, avatar } = body;
    const user = await createUser({ username, email, password, bio, avatar });
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
