import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="font-syncopate text-3xl font-bold text-ocean-deep">
        Registration is closed
      </h1>
      <p className="mt-4 text-sm text-gray-500">
        This event is invite-only. Participants are added to the official list
        by the event team — if you are on it, sign in with your registered
        email.
      </p>
      <Link
        href="/auth/signin"
        className="mt-8 rounded-xl bg-ocean-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-ocean-deep"
      >
        Go to sign in
      </Link>
    </div>
  );
}
