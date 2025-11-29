"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  ActionResult,
  changePasswordAction,
  updateProfileAction,
} from "@/lib/actions";

const initialState: ActionResult = { success: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function ResultBanner({ state }: { state: ActionResult }) {
  if (state.error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
        {state.error}
      </div>
    );
  }
  if (state.success && state.message) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
        {state.message}
      </div>
    );
  }
  return null;
}

export function ProfileForm({ defaultName }: { defaultName?: string | null }) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-800" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={defaultName ?? ""}
          placeholder="Traveler Name"
          required
          minLength={2}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <p className="text-xs text-slate-500">
          This name appears on tickets and receipts.
        </p>
      </div>

      <ResultBanner state={state} />

      <div className="flex justify-end">
        <SubmitButton label="Update info" />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useFormState(changePasswordAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-800" htmlFor="currentPassword">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-800" htmlFor="newPassword">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <p className="text-xs text-slate-500">
          Minimum 8 characters. Use a unique password for your account.
        </p>
      </div>

      <ResultBanner state={state} />

      <div className="flex justify-end">
        <SubmitButton label="Update password" />
      </div>
    </form>
  );
}
