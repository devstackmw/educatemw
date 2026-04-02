import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, amount, userId } = body;

    if (!email || !amount || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const PAYCHANGU_SECRET_KEY = process.env.PAYCHANGU_SECRET_KEY;
    
    if (!PAYCHANGU_SECRET_KEY) {
      return NextResponse.json({ error: 'PayChangu secret key not configured' }, { status: 500 });
    }

    // Generate a unique transaction reference starting with EDUMW-
    const tx_ref = `EDUMW-${userId}-${Date.now()}`;

    const origin = req.headers.get('origin') || "https://educatemw.vercel.app";
    
    // PayChangu API payload
    const payload = {
      amount: amount,
      currency: "MWK",
      email: email,
      first_name: firstName || "Student",
      last_name: lastName || "",
      callback_url: `${origin}/api/paychangu-webhook`,
      return_url: `${origin}/?payment=success`,
      tx_ref: tx_ref,
      customization: {
        title: "Educate MW Premium",
        description: "Unlock MSCE Notes"
      }
    };

    // Call PayChangu API to initialize payment
    const response = await fetch('https://api.paychangu.com/payment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYCHANGU_SECRET_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayChangu API Error:', data);
      return NextResponse.json({ error: 'Failed to initiate payment with PayChangu' }, { status: response.status });
    }

    // Return the checkout URL to the client
    return NextResponse.json({ checkoutUrl: data.data.checkout_url, tx_ref });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
