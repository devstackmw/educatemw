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

    // Get the base URL for callbacks
    const origin = req.headers.get('origin') || process.env.APP_URL || "https://educatemw.vercel.app";
    const baseUrl = origin.replace(/\/$/, ''); // Remove trailing slash if any
    
    // PayChangu API payload
    const payload = {
      amount: Number(amount),
      currency: "MWK",
      email: email,
      first_name: firstName || "Student",
      last_name: lastName || "",
      callback_url: `${baseUrl}/api/paychangu-webhook`,
      return_url: `${baseUrl}/api/paychangu-webhook`,
      tx_ref: tx_ref,
      customization: {
        title: "Educate MW Premium",
        description: "Unlock MSCE Notes"
      }
    };

    // Call PayChangu API to initialize payment
    console.log('Initiating PayChangu payment with payload:', JSON.stringify(payload, null, 2));

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
    console.log('PayChangu API Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('PayChangu API Error:', data);
      return NextResponse.json({ 
        error: data.message || 'Failed to initiate payment with PayChangu',
        details: data 
      }, { status: response.status });
    }

    if (!data.data || !data.data.checkout_url) {
      console.error('PayChangu response missing checkout_url:', data);
      return NextResponse.json({ error: 'Invalid response from payment gateway' }, { status: 500 });
    }

    // Return the checkout URL to the client
    return NextResponse.json({ checkoutUrl: data.data.checkout_url, tx_ref });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
