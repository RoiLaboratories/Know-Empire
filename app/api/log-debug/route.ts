"use client"
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log debug information (will show in Vercel logs)
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data
    }, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging debug info:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}