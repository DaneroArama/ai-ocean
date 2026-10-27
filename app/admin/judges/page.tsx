"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminAuthGuard } from "@/components/auth/AdminAuthGuard";
import { ExternalLink, Play, FileText, Key, RefreshCw, Code, Edit, Save, X, Download } from "lucide-react";
import { useGitHubSync } from "@/lib/hooks/useGitHubSync";
import type { Id } from "@/convex/_generated/dataModel";
import { GitHubFilePicker } from "@/components/admin/GitHubFilePicker";
import * as XLSX from "xlsx";

export default function JudgesPortalPage() {
  const submissions = useQuery(api.submissions.listSubmissions);
  const { syncFromGitHub, loading: syncing, progress, error: syncError } = useGitHubSync();
  const [syncResult, setSyncResult] = useState<{
    imported: number;
    skipped: number;
    total: number;
    errors: string[];
  } | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<string | null>(null);

  const handleSync = async () => {
    setShowSyncModal(true);
    setSyncResult(null);
    const result = await syncFromGitHub();
    setSyncResult(result);
  };

  const handleExportToExcel = () => {
    if (!submissions || submissions.length === 0) return;

    // Prepare data for export
    const exportData = submissions
      .filter(s => s !== null)
      .map((submission) => ({
        "Team Code": submission!.teamCode || "",
        "Team Name": submission!.teamName || "",
        "Project Name": submission!.projectName || "",
        "Tagline": submission!.tagline || "",
        "Description": submission!.description || "",
        "Track": submission!.track === "in_person" ? "In-Person" : "Online",
        "Badge": submission!.badge || "",
        "Team Size": submission!.members?.length || 0,
        "Team Members": submission!.members?.map(m => m.name).join(", ") || "",
        "Member Positions": submission!.members?.map(m => m.position || "").join(", ") || "",
        "Pitch Deck URL": submission!.pitchDeckUrl || "",
        "Demo Video URL": submission!.demoVideoUrl || "",
        "Live Product URL": submission!.liveProductUrl || "",
        "GitHub Repo URL": submission!.githubRepoUrl || "",
        "Credentials URL": submission!.credentialsUrl || "",
        "README URL": submission!.readmeUrl || "",
        "Submitted At": new Date(submission!.submittedAt).toLocaleString(),
      }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

    // Set column widths
    const columnWidths = [
      { wch: 12 },  // Team Code
      { wch: 20 },  // Team Name
      { wch: 25 },  // Project Name
      { wch: 30 },  // Tagline
      { wch: 50 },  // Description
      { wch: 10 },  // Track
      { wch: 12 },  // Badge
      { wch: 10 },  // Team Size
      { wch: 40 },  // Team Members
      { wch: 40 },  // Member Positions
      { wch: 50 },  // Pitch Deck URL
      { wch: 50 },  // Demo Video URL
      { wch: 50 },  // Live Product URL
      { wch: 50 },  // GitHub Repo URL
      { wch: 50 },  // Credentials URL
      { wch: 50 },  // README URL
      { wch: 20 },  // Submitted At
    ];
    worksheet["!cols"] = columnWidths;

    // Generate Excel file
    const fileName = `AI_OCEAN_Submissions_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (submissions === undefined) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </div>
          </div>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-syncopate">
              Judges Portal
            </h1>
            <p className="text-gray-600 text-lg">
              Review team submissions for the AI OCEAN Buildathon
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {submissions?.length || 0} Teams
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportToExcel}
                  disabled={!submissions || submissions.length === 0}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export all submissions to Excel"
                >
                  <Download className="w-4 h-4" />
                  Export to Excel
                </button>
                <a
                  href="/judges"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Public Portal
                </a>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Code className="w-4 h-4" />
                  {syncing ? "Syncing..." : "Sync from GitHub"}
                </button>
                <a
                  href="/admin/judges/add"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                >
                  + Add Submission
                </a>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Public Judges Portal Active
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  Judges can view all published submissions at{" "}
                  <a
                    href="/judges"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium hover:text-blue-900"
                  >
                    /judges
                  </a>
                  {" "}(no login required)
                </p>
                <p className="text-xs text-blue-600">
                  💡 Tip: Use "Sync from GitHub" to discover team repos, then manually add submission links here. Only published submissions appear on the public portal.
                </p>
              </div>
            </div>
          </div>
        </div>

          {/* GitHub Sync Modal */}
          {showSyncModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    GitHub Sync
                  </h2>
                  {!syncing && (
                    <button
                      onClick={() => setShowSyncModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {syncing && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-700">{progress}</span>
                    </div>
                  </div>
                )}

                {syncError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {syncError}
                  </div>
                )}

                {syncResult && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">
                        Sync Complete!
                      </h3>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>✅ Imported: {syncResult.imported}</p>
                        <p>⏭️ Skipped: {syncResult.skipped}</p>
                        <p>📊 Total repos: {syncResult.total}</p>
                      </div>
                    </div>

                    {syncResult.errors.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Issues:
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                          {syncResult.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setShowSyncModal(false);
                        window.location.reload();
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Close & Refresh
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submissions Grid */}
          {submissions && submissions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {submissions.filter(s => s !== null).map((submission) => (
                <SubmissionCard 
                  key={submission!._id} 
                  submission={submission!}
                  onEdit={() => setEditingSubmission(submission!._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 text-lg">
                No submissions available yet.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Submissions will appear here once teams publish their projects.
              </p>
            </div>
          )}
        
        {/* Edit Modal */}
        {editingSubmission && (
          <EditSubmissionModal
            submissionId={editingSubmission}
            onClose={() => setEditingSubmission(null)}
          />
        )}
      </div>
    </AdminAuthGuard>
  );
}

type Submission = {
  _id: string;
  teamCode?: string | null;
  teamName?: string;
  projectName: string;
  tagline?: string;
  description: string;
  pitchDeckUrl?: string;
  demoVideoUrl?: string;
  liveProductUrl?: string;
  githubRepoUrl?: string;
  credentialsUrl?: string;
  readmeUrl?: string;
  badge?: string | null;
  track?: "in_person" | "online" | null;
  members?: Array<{
    name: string;
    email?: string;
    position?: string | null;
  }>;
  submittedAt: number;
  judgeScores?: any[];
};

function SubmissionCard({ submission, onEdit }: { submission: Submission; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-colors"
          title="Edit submission"
        >
          <Edit className="w-4 h-4" />
        </button>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 bg-white/20 rounded-full">
              {submission.teamCode}
            </span>
            {submission.badge && (
              <span className="text-xs font-medium px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full">
                {submission.badge}
              </span>
            )}
          </div>
          {submission.track && (
            <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
              {submission.track === "in_person" ? "In-Person" : "Online"}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold mb-1 font-syncopate">
          {submission.teamName}
        </h2>
        <h3 className="text-lg font-semibold opacity-90">
          {submission.projectName}
        </h3>
        {submission.tagline && (
          <p className="text-sm opacity-80 mt-1 italic">{submission.tagline}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Description */}
        <div>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {submission.description}
          </p>
        </div>

        {/* Team Members */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Team Members ({submission.members?.length || 0})
          </h4>
          <div className="space-y-1">
            {submission.members?.slice(0, 3).map((member, idx: number) => (
              <div key={idx} className="text-sm">
                <span className="font-medium text-gray-800">{member.name}</span>
                {member.position && (
                  <span className="text-gray-500 text-xs ml-2">
                    {member.position}
                  </span>
                )}
              </div>
            ))}
            {(submission.members?.length ?? 0) > 3 && (
              <p className="text-xs text-gray-500">
                +{(submission.members?.length ?? 0) - 3} more
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          {submission.pitchDeckUrl && (
            <ActionButton
              href={submission.pitchDeckUrl}
              icon={<FileText className="w-4 h-4" />}
              label="Pitch Deck"
              color="purple"
            />
          )}
          {submission.demoVideoUrl && (
            <ActionButton
              href={submission.demoVideoUrl}
              icon={<Play className="w-4 h-4" />}
              label="Demo Video"
              color="red"
            />
          )}
          {submission.liveProductUrl && (
            <ActionButton
              href={submission.liveProductUrl}
              icon={<ExternalLink className="w-4 h-4" />}
              label="Live Product"
              color="green"
            />
          )}
          {submission.githubRepoUrl && (
            <ActionButton
              href={submission.githubRepoUrl}
              icon={<Code className="w-4 h-4" />}
              label="GitHub Repo"
              color="gray"
            />
          )}
          {submission.credentialsUrl && (
            <ActionButton
              href={submission.credentialsUrl}
              icon={<Key className="w-4 h-4" />}
              label="Credentials"
              color="yellow"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
      </div>
    </div>
  );
}

function ActionButton({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: "purple" | "red" | "green" | "gray" | "yellow";
}) {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
    red: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
    green: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
    gray: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200",
    yellow: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between w-full px-4 py-2 rounded-lg border transition-all duration-200 ${colorClasses[color]}`}
    >
      <span className="flex items-center gap-2 font-medium text-sm">
        {icon}
        {label}
      </span>
      <ExternalLink className="w-3 h-3 opacity-50" />
    </a>
  );
}


// Edit Submission Modal Component
function EditSubmissionModal({ 
  submissionId, 
  onClose 
}: { 
  submissionId: string; 
  onClose: () => void;
}) {
  const submissions = useQuery(api.submissions.listSubmissions);
  const updateSubmission = useMutation(api.submissions.updateSubmission);
  
  const submission = submissions?.find(s => s?._id === submissionId);
  
  const [formData, setFormData] = useState({
    pitchDeckUrl: "",
    demoVideoUrl: "",
    liveProductUrl: "",
    githubRepoUrl: "",
    credentialsUrl: "",
    readmeUrl: "",
    isPublished: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState<string | null>(null);

  // Load submission data when it's available
  useEffect(() => {
    if (submission) {
      setFormData({
        pitchDeckUrl: submission.pitchDeckUrl || "",
        demoVideoUrl: submission.demoVideoUrl || "",
        liveProductUrl: submission.liveProductUrl || "",
        githubRepoUrl: submission.githubRepoUrl || "",
        credentialsUrl: submission.credentialsUrl || "",
        readmeUrl: submission.readmeUrl || "",
        isPublished: true,
      });
    }
  }, [submission]);

  if (!submission) return null;

  // Extract repo name from GitHub URL
  const getRepoName = () => {
    if (!submission.githubRepoUrl) return null;
    const match = submission.githubRepoUrl.match(/github\.com\/[^/]+\/([^/]+)/);
    return match ? match[1] : null;
  };

  const repoName = getRepoName();

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateSubmission({
        submissionId: submissionId as Id<"buildathonSubmissions">,
        pitchDeckUrl: formData.pitchDeckUrl.trim() || null,
        demoVideoUrl: formData.demoVideoUrl.trim() || null,
        liveProductUrl: formData.liveProductUrl.trim() || null,
        githubRepoUrl: formData.githubRepoUrl.trim() || null,
        credentialsUrl: formData.credentialsUrl.trim() || null,
        readmeUrl: formData.readmeUrl.trim() || null,
        isPublished: formData.isPublished,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-generate GitHub raw URLs
  const autoFillFromGitHub = () => {
    if (submission.githubRepoUrl) {
      const baseUrl = submission.githubRepoUrl.replace(/\/$/, '');
      const rawBaseUrl = `${baseUrl}/raw/refs/heads/main`;
      
      setFormData(prev => ({
        ...prev,
        pitchDeckUrl: prev.pitchDeckUrl || `${rawBaseUrl}/pitch-deck.pdf`,
        demoVideoUrl: prev.demoVideoUrl || `${rawBaseUrl}/demo-video.mp4`,
        credentialsUrl: prev.credentialsUrl || `${baseUrl}/blob/main/CREDENTIALS.md`,
        readmeUrl: prev.readmeUrl || `${baseUrl}/blob/main/README.md`,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Submission</h2>
            <p className="text-sm text-gray-600 mt-1">
              {submission.teamCode} - {submission.teamName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Auto-fill helper */}
          {submission.githubRepoUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Tip:</strong> Files in GitHub repo? Click below to auto-generate URLs:
              </p>
              <button
                type="button"
                onClick={autoFillFromGitHub}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Auto-fill from GitHub
              </button>
              <p className="text-xs text-blue-600 mt-2">
                Expected format: https://github.com/{submission.teamCode}/raw/refs/heads/main/[filename]
              </p>
            </div>
          )}

          <InputField
            label="Pitch Deck URL"
            placeholder="https://github.com/org/Team-17/raw/refs/heads/main/pitch.pdf"
            value={formData.pitchDeckUrl}
            onChange={(v) => handleChange("pitchDeckUrl", v)}
            hint=".pdf or .pptx from GitHub raw or Google Drive"
            onBrowse={repoName ? () => setShowPicker("pitchDeck") : undefined}
          />

          <InputField
            label="Demo Video URL"
            placeholder="https://github.com/org/Team-17/raw/refs/heads/main/demo.mp4"
            value={formData.demoVideoUrl}
            onChange={(v) => handleChange("demoVideoUrl", v)}
            hint=".mp4 or .mov from GitHub raw, YouTube, or Google Drive"
            onBrowse={repoName ? () => setShowPicker("demoVideo") : undefined}
          />

          <InputField
            label="Live Product URL"
            placeholder="https://team17-project.vercel.app"
            value={formData.liveProductUrl}
            onChange={(v) => handleChange("liveProductUrl", v)}
            hint="Deployed website or app URL"
          />

          <InputField
            label="GitHub Repo URL"
            placeholder="https://github.com/AI-Ocean-UXMM-2026/Team-17"
            value={formData.githubRepoUrl}
            onChange={(v) => handleChange("githubRepoUrl", v)}
            hint="Team's GitHub repository"
          />

          <InputField
            label="Credentials URL"
            placeholder="https://github.com/org/Team-17/blob/main/CREDENTIALS.md"
            value={formData.credentialsUrl}
            onChange={(v) => handleChange("credentialsUrl", v)}
            hint="Login info, test accounts, API keys"
            onBrowse={repoName ? () => setShowPicker("credentials") : undefined}
          />

          <InputField
            label="README URL"
            placeholder="https://github.com/org/Team-17/blob/main/README.md"
            value={formData.readmeUrl}
            onChange={(v) => handleChange("readmeUrl", v)}
            hint="Project documentation"
            onBrowse={repoName ? () => setShowPicker("readme") : undefined}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="rounded"
            />
            <span className="text-gray-700">Published (visible to judges)</span>
          </label>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* File Picker Modals */}
        {showPicker && repoName && (
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowPicker(null)}
          >
            <div 
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {showPicker === "pitchDeck" && (
                <GitHubFilePicker
                  repoName={repoName}
                  title="Select Pitch Deck"
                  fileTypes={[".pdf", ".pptx", ".ppt"]}
                  onSelect={(url, filename) => {
                    handleChange("pitchDeckUrl", url);
                    setShowPicker(null);
                  }}
                />
              )}
              {showPicker === "demoVideo" && (
                <GitHubFilePicker
                  repoName={repoName}
                  title="Select Demo Video"
                  fileTypes={[".mp4", ".mov", ".avi", ".webm"]}
                  onSelect={(url, filename) => {
                    handleChange("demoVideoUrl", url);
                    setShowPicker(null);
                  }}
                />
              )}
              {showPicker === "credentials" && (
                <GitHubFilePicker
                  repoName={repoName}
                  title="Select Credentials File"
                  fileTypes={[".md", ".txt", ".pdf"]}
                  onSelect={(url, filename) => {
                    handleChange("credentialsUrl", url);
                    setShowPicker(null);
                  }}
                />
              )}
              {showPicker === "readme" && (
                <GitHubFilePicker
                  repoName={repoName}
                  title="Select README File"
                  fileTypes={[".md", ".txt"]}
                  onSelect={(url, filename) => {
                    handleChange("readmeUrl", url);
                    setShowPicker(null);
                  }}
                />
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowPicker(null)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  hint,
  onBrowse,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  hint: string;
  onBrowse?: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="text-gray-400 text-xs ml-2">(optional)</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium"
            title="Clear field"
          >
            ✕
          </button>
        )}
        {onBrowse && (
          <button
            type="button"
            onClick={onBrowse}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium whitespace-nowrap"
          >
            Browse
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </div>
  );
}
