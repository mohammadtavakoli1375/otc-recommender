import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { 'content-type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ 
      ok: false, 
      error: e?.message || 'db error' 
    }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' }
    });
  }
}