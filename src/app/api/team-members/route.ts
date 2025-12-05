import { NextRequest, NextResponse } from 'next/server';
import { teamMembersRepository } from '@/lib/db/supabase-repositories';

// GET /api/team-members - Get all team members
export async function GET() {
  try {
    const members = await teamMembersRepository.getAll();
    // Map to frontend format
    return NextResponse.json(members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatarUrl: m.avatar_url,
      invitedAt: m.invited_at,
    })));
  } catch (error) {
    console.error('Error fetching team members:', error);
    // Return empty array if table doesn't exist or other error
    return NextResponse.json([]);
  }
}

// POST /api/team-members - Invite a new team member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if already invited
    const existing = await teamMembersRepository.getByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'This email has already been invited' },
        { status: 409 }
      );
    }

    // Generate name from email
    const name = email.split('@')[0]
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const member = await teamMembersRepository.create({
      name,
      email,
    });

    // TODO: In production, send actual email invitation here

    // Return in frontend format
    return NextResponse.json({
      id: member.id,
      name: member.name,
      email: member.email,
      avatarUrl: member.avatar_url,
      invitedAt: member.invited_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to invite team member' },
      { status: 500 }
    );
  }
}
