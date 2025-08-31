import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (featured) params.append('featured', featured);
    params.append('limit', limit);
    params.append('offset', offset);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/educational-content/faqs?${params.toString()}`
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch {
    return NextResponse.json(
      { message: 'خطا در اتصال به سرور' },
      { status: 500 }
    );
  }
}