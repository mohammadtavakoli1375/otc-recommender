import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Prisma/نشان روی Edge نباشد

const NESHAN_URL = 'https://api.neshan.org/v1/search';

export async function GET(req: NextRequest) {
  const apiKey = process.env.NESHAN_API_KEY;
  if (!apiKey) {
    // سریع و واضح خطا بده، تا 300s timeout نخوری
    return NextResponse.json(
      { error: 'Neshan API key not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const term = searchParams.get('q') ?? '';
  const lat = searchParams.get('lat') ?? '35.6892';
  const lng = searchParams.get('lng') ?? '51.3890';

  // 15s timeout برای upstream
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15_000);

  try {
    const url = `${NESHAN_URL}?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&term=${encodeURIComponent(term)}`;
    const r = await fetch(url, {
      headers: { 'Api-Key': apiKey },
      signal: controller.signal,
      // اگر نمی‌خواهی cache شود:
      cache: 'no-store',
    });

    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    const msg = err?.name === 'AbortError' ? 'Upstream timeout' : (err?.message || 'fetch failed');
    return NextResponse.json(
      { error: msg },
      { status: 502 }
    );
  } finally {
    clearTimeout(t);
  }
}