"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminAuthGuard } from "@/components/auth/AdminAuthGuard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function AddSubmissionPage() {
  const router = useRouter();
  const teams = useQuery(api.teams.listTeams);
  const createSubmission = useMutation(api.submissions.createSubmission);

  const [formData, setFormData] = useState({
    teamId: "",
    projectName: "",
    tagline: "",
    description: "",
    pitchDeckUrl: "",
    demoVideoUrl: "",
    liveProductUrl: "",
    githubRepoUrl: "",
    credentialsUrl: "",
    readmeUrl: "",
    isPublished: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createSubmission({
        teamId: formData.teamId as Id<"teams">,
        projectName: formData.projectName,
        tagline: formData.tagline || undefined,
        description: formData.description,
        pitchDeckUrl: formData.pitchDeckUrl || undefined,
        demoVideoUrl: formData.demoVideoUrl || undefined,
        liveProductUrl: formData.liveProductUrl || undefined,
        githubRepoUrl: formData.githubRepoUrl || undefined,
        credentialsUrl: formData.credentialsUrl || undefined,
        readmeUrl: formData.readmeUrl || undefined,
        isPublished: formData.isPublished,
      });

      router.push("/admin/judges");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create submission");
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin/judges"
              className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
            >
              ← Back to Judges Portal
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-syncopate">
              Add Team Submission
            </h1>
            <p className="text-gray-600">
              Manually add a team's project submission for judges to review
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Team Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Team *
              </label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a team...</option>
                {teams?.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.code} - {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
                placeholder="e.g., ResumeMate AI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g., Smart resume builder powered by AI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Full project description with key features..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* URLs Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800">Submission Materials</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Deck URL
                </label>
                <input
                  type="url"
                  name="pitchDeckUrl"
                  value={formData.pitchDeckUrl}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/presentation/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo Video URL
                </label>
                <input
                  type="url"
                  name="demoVideoUrl"
                  value={formData.demoVideoUrl}
                  onChange={handleChange}
                  placeholder="https://youtu.be/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Live Product URL
                </label>
                <input
                  type="url"
                  name="liveProductUrl"
                  value={formData.liveProductUrl}
                  onChange={handleChange}
                  placeholder="https://project.vercel.app"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  name="githubRepoUrl"
                  value={formData.githubRepoUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/org/repo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credentials/Instructions URL
                </label>
                <input
                  type="url"
                  name="credentialsUrl"
                  value={formData.credentialsUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/org/repo/blob/main/CREDENTIALS.md"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  README URL
                </label>
                <input
                  type="url"
                  name="readmeUrl"
                  value={formData.readmeUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/org/repo/blob/main/README.md"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-3 border-t pt-6">
              <input
                type="checkbox"
                name="isPublished"
                id="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                Publish immediately (visible to judges)
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create Submission"}
              </button>
              <Link
                href="/admin/judges"
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
