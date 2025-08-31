import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    if (!query) {
      return NextResponse.json({ message: 'پارامتر جستجو الزامی است' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit);
    params.append('offset', offset);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/educational-content/articles/search?${params.toString()}`
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