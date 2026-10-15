"use client";

import { FormEvent, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

function messageFrom(error: unknown, fallback: string) {
  const raw = (error instanceof Error ? error.message : "")
    .replace(/^Error:\s*/i, "")
    .replace(/^(Uncaught Error:\s*)+/i, "")
    .trim();
  return raw || fallback;
}

export function ChangePasswordCard() {
  const changePassword = useAction(api.participants.changePassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(
    null,
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (newPassword !== confirmPassword) {
      setMessage({ text: "The new passwords do not match.", error: true });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await changePassword({ currentPassword, newPassword });
      setMessage({
        text: "Password updated. Other devices have been signed out.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({
        text: messageFrom(error, "Could not change your password."),
        error: true,
      });
    } finally {
      setBusy(false);
    }
  };

  const input =
    "mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ocean-primary/30";

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2 lg:col-span-2">
      <h3 className="font-semibold text-ocean-deep">Change password</h3>
      <p className="mt-1 text-sm text-gray-500">
        If you activated your account with the shared event password, set a
        personal one now. Google sign-in is unaffected.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label className="text-sm font-medium text-ocean-deep" htmlFor="current-password">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            className={input}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ocean-deep" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ocean-deep" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        {message && (
          <p
            role={message.error ? "alert" : "status"}
            className={`rounded-lg px-3 py-2 text-sm ${message.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-ocean-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ocean-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
