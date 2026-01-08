import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { NotesClient } from "@/components/notes/NotesClient";

export default async function AppuntiPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const db = getDatabase();
  const notes = db
    .prepare(
      "SELECT id, studenteId, titolo, contenuto, createdAt, updatedAt FROM appunto WHERE studenteId = ? ORDER BY createdAt DESC"
    )
    .all(user.id) as Array<{
      id: number;
      studenteId: number;
      titolo: string;
      contenuto: string;
      createdAt: string;
      updatedAt: string;
    }>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con pulsante back alla dashboard */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Area Studio
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Appunti</h1>
            <p className="text-gray-600 mt-1">
              Crea, modifica o genera con AI i tuoi appunti in modo semplice.
            </p>
          </div>
          {/* Pulsante per tornare alla dashboard principale */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Dashboard
          </Link>
        </div>

        <NotesClient initialNotes={notes} />
      </div>
    </div>
  );
}
