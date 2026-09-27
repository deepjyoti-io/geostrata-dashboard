import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const { timestamp, t10, t30, t50, ambient, humidity, battery, csq, lat, lon } = body;

    const payload = {
      t10: parseFloat(t10),
      t30: parseFloat(t30),
      t50: parseFloat(t50),
      ambient: parseFloat(ambient),
      humidity: parseFloat(humidity),
      battery: parseFloat(battery),
      csq: csq !== undefined ? parseInt(csq) : 0,
      lat: lat !== undefined ? parseFloat(lat) : 0.0,
      lon: lon !== undefined ? parseFloat(lon) : 0.0,
    };

    if (timestamp) {
      payload.timestamp = timestamp;
    }

    const { data, error } = await supabase.from('telemetry').insert([payload]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Telemetry data saved successfully', data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}[]