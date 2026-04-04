import * as admin from 'firebase-admin';
import config from '@/firebase-applet-config.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: config.projectId,
  });
}

export const adminDb = admin.firestore();
