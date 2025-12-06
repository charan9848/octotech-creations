import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request) {
  try {
    const { phone, template } = await request.json();

    // Basic validation
    if (!phone) {
      return NextResponse.json({ message: 'Phone number required' }, { status: 400 });
    }

    // Send the message
    // Default template is 'hello_world' (Meta provides this for testing)
    const result = await sendWhatsAppMessage(phone, template || 'hello_world');

    if (!result.success) {
      return NextResponse.json({ message: 'Failed to send', error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sent successfully!' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}
