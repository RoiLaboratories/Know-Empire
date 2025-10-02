"use client"
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log the error details to console (will show in Vercel logs)
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data
    }, null, 2));

    // You could also store errors in your database or send them to an error tracking service

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}