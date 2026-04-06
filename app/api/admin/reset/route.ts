import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { adminEmail } = await req.json();

    // Verify admin email
    if (adminEmail !== 'devstackmw@gmail.com' && adminEmail !== 'mscepreparation@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('Admin Reset initiated by:', adminEmail);

    // Collections to clear
    const collections = ['users', 'userStats', 'publicProfiles', 'payments', 'posts', 'comments', 'studyPlan'];

    for (const collectionName of collections) {
      const snapshot = await adminDb.collection(collectionName).get();
      const batch = adminDb.batch();
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Cleared collection: ${collectionName}`);
    }

    return NextResponse.json({ success: true, message: 'All trial data cleared successfully. Leaderboard reset.' });

  } catch (error) {
    console.error('Admin reset error:', error);
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
  }
}
