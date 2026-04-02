import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // PayChangu sends the event details in the body.
    // The exact structure might vary slightly, but typically includes event, data.status, and data.tx_ref
    // We will check for both top-level and nested status/tx_ref just in case.
    const eventData = body.data || body;
    const status = eventData.status;
    const tx_ref = eventData.tx_ref;

    console.log('Webhook received:', { status, tx_ref });

    // Verify it's a successful payment and belongs to our app
    if (status === 'success' && tx_ref && tx_ref.startsWith('EDUMW-')) {
      // Extract userId from tx_ref (format: EDUMW-userId-timestamp)
      const parts = tx_ref.split('-');
      if (parts.length >= 2) {
        const userId = parts[1];
        
        console.log(`Unlocking premium for user: ${userId}`);

        // Update the user's document in Firestore to grant premium access
        await adminDb.collection('users').doc(userId).set({
          isPremium: true,
          premiumUnlockedAt: new Date().toISOString(),
          lastTxRef: tx_ref
        }, { merge: true });

        console.log(`Successfully updated user ${userId} to premium.`);
      }
    }

    // Always return 200 OK to acknowledge receipt of the webhook
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tx_ref = searchParams.get('tx_ref');
    const status = searchParams.get('status');

    console.log('GET redirect received from PayChangu:', { tx_ref, status });

    // If we have a tx_ref, we can try to verify the transaction immediately
    // in case the POST webhook is delayed.
    const PAYCHANGU_SECRET_KEY = process.env.PAYCHANGU_SECRET_KEY;
    if (tx_ref && PAYCHANGU_SECRET_KEY) {
      try {
        const verifyResponse = await fetch(`https://api.paychangu.com/verify-payment/${tx_ref}`, {
          headers: {
            'Authorization': `Bearer ${PAYCHANGU_SECRET_KEY}`,
            'Accept': 'application/json'
          }
        });
        const verifyData = await verifyResponse.json();
        
        if (verifyData.status === 'success' && verifyData.data?.status === 'success') {
          const parts = tx_ref.split('-');
          if (parts.length >= 2) {
            const userId = parts[1];
            console.log(`GET verification successful for user: ${userId}`);
            
            // Update Firestore (same logic as POST webhook)
            await adminDb.collection('users').doc(userId).set({
              isPremium: true,
              premiumUnlockedAt: new Date().toISOString(),
              lastTxRef: tx_ref
            }, { merge: true });
          }
        }
      } catch (verifyError) {
        console.error('GET verification failed:', verifyError);
      }
    }

    // Redirect back to the home page with the payment status
    const origin = new URL(req.url).origin;
    const redirectStatus = status === 'failed' ? 'failed' : 'success';
    return NextResponse.redirect(`${origin}/?payment=${redirectStatus}`);
  } catch (error) {
    console.error('GET redirect error:', error);
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/`);
  }
}
