import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    if (!symbol) {
      return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })
    }

    const apiKey = process.env.TWELVE_DATA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfiguration: missing API key' }, { status: 500 })
    }

    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
      symbol
    )}&apikey=${encodeURIComponent(apiKey)}`

    const upstream = await fetch(url, { cache: 'no-store' })
    const data = await upstream.json()
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream error', details: data }, { status: 502 })
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

