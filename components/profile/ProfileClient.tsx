"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  initialProfile: {
    nome: string;
    email: string;
    livello: number;
    punti: number;
    createdAt: string;
  };
}

type StatusMessage = { message: string; type: 'success' | 'error' } | null;

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [nome, setNome] = useState(initialProfile.nome);
  const [nomeStatus, setNomeStatus] = useState<StatusMessage>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<StatusMessage>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleNameUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setNomeStatus(null);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });

    const data = await response.json();
    if (!response.ok) {
      setNomeStatus({
        message: data.error || "Errore nell'aggiornamento",
        type: "error",
      });
      return;
    }

    setProfile((prev) => ({ ...prev, nome: data.nome }));
    setNomeStatus({
      message: "Nome aggiornato con successo",
      type: "success",
    });
    router.refresh();
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordStatus(null);

    const response = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      setPasswordStatus({
        message: data.error || "Errore nell'aggiornamento",
        type: "error",
      });
      return;
    }

    setPasswordStatus({
      message: "Password aggiornata",
      type: "success",
    });
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleDeleteAccount = async () => {
    setDeleteStatus(null);
    if (deleteConfirm !== "ELIMINA") {
      setDeleteStatus("Scrivi ELIMINA per confermare");
      return;
    }

    // Mostra conferma finale
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare l'account? Questa azione è irreversibile e cancellerà tutti i tuoi dati (appunti, quiz, vero/falso)."
    );

    if (!confirmed) {
      return;
    }

    setLoadingDelete(true);
    const response = await fetch("/api/profile", {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      setDeleteStatus(data.error || "Errore durante l'eliminazione");
      setLoadingDelete(false);
      return;
    }

    setDeleteStatus("Account eliminato. Reindirizzamento in corso...");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <section className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Profilo personale
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Ciao, {profile.nome}</h1>
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 text-blue-900 rounded-xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide font-semibold">Livello</p>
              <p className="text-3xl font-bold mt-1">{profile.livello}</p>
            </div>
            <div className="bg-amber-50 text-amber-900 rounded-xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide font-semibold">Punti</p>
              <p className="text-3xl font-bold mt-1">{profile.punti}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow p-6 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Personalizza il profilo</h2>
          <p className="text-sm text-gray-500 mb-4">Aggiorna le tue informazioni personali</p>
          <form onSubmit={handleNameUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nome
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {nomeStatus && (
              <p
                className={`text-sm ${
                  nomeStatus.type === "error" ? "text-red-600" : "text-green-600"
                }`}
              >
                {nomeStatus.message}
              </p>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Salva nome
            </button>
          </form>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sicurezza</h2>
          <p className="text-sm text-gray-500 mb-4">Aggiorna la tua password</p>
          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password attuale
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nuova password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength={6}
                required
              />
            </div>
            {passwordStatus && (
              <p
                className={`text-sm ${
                  passwordStatus.type === "error"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {passwordStatus.message}
              </p>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Aggiorna password
            </button>
          </form>
        </div>
      </section>

      <section className="bg-white border border-red-200 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Zona pericolosa</h2>
        <p className="text-sm text-red-500 mb-4">
          Elimina definitivamente il tuo account e tutti i tuoi dati (appunti, quiz, vero/falso).
        </p>
        <div className="space-y-4 max-w-md">
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Scrivi ELIMINA per confermare"
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          {deleteStatus && (
            <p className="text-sm text-red-600">{deleteStatus}</p>
          )}
          <button
            onClick={handleDeleteAccount}
            disabled={loadingDelete}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loadingDelete ? "Eliminazione..." : "Elimina account"}
          </button>
        </div>
      </section>
    </div>
  );
}

