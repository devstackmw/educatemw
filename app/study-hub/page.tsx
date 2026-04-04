import { adminDb } from "@/lib/firebase-admin";
import StudyHubView from "@/components/StudyHubView";

export default async function StudyHubPage() {
  let notes: any[] = [];
  try {
    const notesSnapshot = await adminDb.collection("notes").get();
    notes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching notes:", error);
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-black text-slate-900 mb-2">Public Study Hub</h1>
      <p className="text-slate-500 mb-8">Access high-quality study notes and summaries.</p>
      <StudyHubView initialNotes={notes} />
    </div>
  );
}
