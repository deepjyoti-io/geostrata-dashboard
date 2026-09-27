import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Insert the ESP32 data into the Supabase table
    const { error } = await supabase
      .from('telemetry')
      .insert([
        {
          timestamp: data.timestamp || new Date().toISOString(),
          t10: data.t10,
          t30: data.t30,
          t50: data.t50,
          ambient: data.ambient,
          humidity: data.humidity,
          battery: data.battery
        }
      ]);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Data logged' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}