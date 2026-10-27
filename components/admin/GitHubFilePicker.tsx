"use client";

import { useState, useEffect } from "react";
import { Folder, File, ChevronRight, Loader2, Download, ExternalLink } from "lucide-react";

type GitHubFile = {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  downloadUrl: string | null;
  rawUrl: string | null;
  htmlUrl: string;
};

type GitHubFilePickerProps = {
  repoName: string;
  onSelect: (url: string, filename: string) => void;
  fileTypes?: string[]; // e.g., ['.pdf', '.pptx', '.mp4', '.mov']
  title?: string;
};

export function GitHubFilePicker({ 
  repoName, 
  onSelect, 
  fileTypes,
  title = "Select a file from GitHub"
}: GitHubFilePickerProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [items, setItems] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/github/files?repo=${encodeURIComponent(repoName)}&path=${encodeURIComponent(path)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch files");
      }

      setItems(data.items);
      
      // Update breadcrumbs
      if (path) {
        setBreadcrumbs(path.split("/"));
      } else {
        setBreadcrumbs([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: GitHubFile) => {
    if (item.type === "dir") {
      setCurrentPath(item.path);
    } else if (item.rawUrl) {
      onSelect(item.rawUrl, item.name);
    }
  };

  const goToPath = (index: number) => {
    if (index === -1) {
      setCurrentPath("");
    } else {
      const newPath = breadcrumbs.slice(0, index + 1).join("/");
      setCurrentPath(newPath);
    }
  };

  const matchesFileType = (filename: string) => {
    if (!fileTypes || fileTypes.length === 0) return true;
    return fileTypes.some(type => filename.toLowerCase().endsWith(type.toLowerCase()));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => goToPath(-1)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {repoName}
          </button>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => goToPath(index)}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {crumb}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading files...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={() => fetchFiles(currentPath)}
              className="text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No files in this folder
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => {
              const isSelectable = item.type === "file" && matchesFileType(item.name);
              const isFolder = item.type === "dir";

              return (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item)}
                  disabled={item.type === "file" && !isSelectable}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition-colors ${
                    item.type === "file" && !isSelectable
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {isFolder ? (
                    <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {item.name}
                    </div>
                    {item.type === "file" && (
                      <div className="text-xs text-gray-500">
                        {formatFileSize(item.size)}
                      </div>
                    )}
                  </div>

                  {isFolder && (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  
                  {isSelectable && (
                    <div className="flex gap-2">
                      <Download className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      {fileTypes && fileTypes.length > 0 && (
        <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
          <strong>Supported files:</strong> {fileTypes.join(", ")}
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
