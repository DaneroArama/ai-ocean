"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ExternalLink, Play, FileText, Key, Code, Award, Users, X, Lock } from "lucide-react";
import Image from "next/image";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PublicJudgesPage() {
  const submissions = useQuery(api.submissions.listPublicSubmissions);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  // Check if already authenticated in session storage
  useEffect(() => {
    const authStatus = sessionStorage.getItem("judgesPortalAuth");
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  // GSAP animations - must be called before any conditional returns (Rules of Hooks)
  useLayoutEffect(() => {
    if (!isAuthenticated || !submissions) return; // Skip if not authenticated or no data
    
    const root = rootRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      // Animate header
      gsap.fromTo(
        "[data-header]",
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Animate submission cards
      const cards = gsap.utils.toArray<HTMLElement>(".submission-card");
      if (cards.length && cardsRef.current) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, scale: 0.85, rotation: -3 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // Hover micro-interactions for cards
      cards.forEach((card) => {
        const onEnter = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(24, 203, 188, 0.25)",
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        const onLeave = () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            boxShadow: "0 6px 18px rgba(24, 203, 188, 0.15)",
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        card.addEventListener("pointerenter", onEnter);
        card.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("pointerenter", onEnter);
          card.removeEventListener("pointerleave", onLeave);
        });
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [submissions, isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check against environment variable (will be set in .env.local)
    const correctPassword = process.env.NEXT_PUBLIC_JUDGES_PASSWORD || "aiocean2026";
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("judgesPortalAuth", "authenticated");
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B8EBFF] via-[#E8FAFF] to-white flex items-center justify-center p-4">
        <div className="bg-[#18CBBC33] backdrop-blur-sm rounded-4xl shadow-[0_6px_18px_rgba(24,203,188,0.15)] max-w-md w-full p-8 relative">
          <div className="pointer-events-none absolute inset-[3px] rounded-[29px] border-[1.5px] border-dashed border-white/60" />
          
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-[#18CBBC] to-[#0B5D7D] p-4 rounded-full">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="font-dela-gothic-one text-2xl md:text-3xl text-[#0B5D7D] text-center mb-2">
              Judges Portal
            </h1>
            <p className="font-quicksand text-sm text-[#0B5D7D]/70 text-center mb-6 font-semibold">
              This page is password protected
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="font-syne text-sm font-semibold text-[#0B5D7D] block mb-2">
                  Enter Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-dashed text-ocean-deep border-[#18CBBC]/30 bg-white/60 backdrop-blur-sm focus:border-[#18CBBC] focus:outline-none font-quicksand"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-100/80 border-2 border-dashed border-red-300 text-red-700 px-4 py-3 rounded-xl font-quicksand text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#18CBBC] to-[#0B5D7D] text-white py-3 rounded-xl font-syne font-bold hover:shadow-[0_4px_12px_rgba(24,203,188,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Access Portal
              </button>
            </form>

            <p className="font-quicksand text-xs text-[#0B5D7D]/50 text-center mt-6">
              For judges only. Contact admin for access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submissions === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B8EBFF] via-[#E8FAFF] to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#18CBBC] mx-auto"></div>
            <p className="mt-6 text-[#0B5D7D] text-lg font-syne font-semibold">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="min-h-screen bg-gradient-to-br from-[#B8EBFF] via-[#E8FAFF] to-white">
      {/* Header */}
      <header
        data-header
        className="bg-[#18CBBC]/20 backdrop-blur-md border-b-2 border-dashed border-white/30 sticky top-0 z-50 shadow-[inset_0_2px_8px_rgba(255,255,255,0.6)]"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-dela-gothic-one text-2xl sm:text-3xl md:text-4xl text-[#0B5D7D] flex items-center gap-3 tracking-wide">
                <Award className="w-7 h-7 md:w-9 md:h-9 text-[#18CBBC]" />
                AI OCEAN Buildathon
              </h1>
              <p className="font-quicksand text-[#0B5D7D]/70 mt-1 text-sm md:text-base font-semibold">
                Judges Portal · Team Submissions
              </p>
            </div>
            <div className="text-right bg-white/40 backdrop-blur-sm rounded-2xl px-4 py-3 border-2 border-dashed border-[#18CBBC]/30">
              <div className="font-quicksand text-xs md:text-sm text-[#0B5D7D]/60 font-semibold">Total Teams</div>
              <div className="font-dela-gothic-one text-2xl md:text-4xl text-[#18CBBC]">
                {submissions?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {submissions && submissions.length > 0 ? (
          <div ref={cardsRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {submissions.filter(s => s !== null).map((submission) => (
              <SubmissionCard 
                key={submission!._id} 
                submission={submission!}
                onClick={() => setSelectedSubmission(submission!._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#18CBBC33] backdrop-blur-sm rounded-4xl border-2 border-dashed border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.6)]">
            <Award className="w-20 h-20 text-[#18CBBC]/40 mx-auto mb-4" />
            <h2 className="font-dela-gothic-one text-2xl md:text-3xl text-[#0B5D7D] mb-2">
              No Submissions Yet
            </h2>
            <p className="font-quicksand text-[#0B5D7D]/70 text-base md:text-lg font-semibold">
              Team submissions will appear here once published.
            </p>
          </div>
        )}
      </main>

      {/* Full Details Modal */}
      {selectedSubmission && submissions && (
        <SubmissionModal
          submission={submissions.find(s => s?._id === selectedSubmission)!}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#18CBBC]/10 backdrop-blur-md border-t-2 border-dashed border-white/30 mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="font-quicksand text-sm text-[#0B5D7D]/60 font-semibold">
            © {new Date().getFullYear()} AI OCEAN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
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
    position?: string | null;
  }>;
};

function SubmissionCard({ submission, onClick }: { submission: Submission; onClick: () => void }) {
  // Count available resources
  const resourceCount = [
    submission.pitchDeckUrl,
    submission.demoVideoUrl,
    submission.liveProductUrl,
    submission.githubRepoUrl,
    submission.credentialsUrl,
  ].filter(Boolean).length;

  return (
    <div 
      className="submission-card relative bg-[#18CBBC33] backdrop-blur-sm rounded-4xl overflow-hidden transition-all duration-300 shadow-[0_6px_18px_rgba(24,203,188,0.15)] flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      {/* Glass morphism border effect */}
      <div className="pointer-events-none absolute inset-[3px] rounded-[29px] border-[1.5px] border-dashed border-white/60" />
      
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-br from-[#18CBBC] via-[#2FA0E8] to-[#0B5D7D] p-5 md:p-6 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2 gap-2">
            <span className="font-syne text-xs md:text-sm font-bold px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-full shadow-[inset_0_0_5px_2px_rgba(255,255,255,0.4)]">
              {submission.teamCode}
            </span>
            {submission.badge && (
              <span className="font-quicksand text-xs font-semibold px-2 py-1 bg-[#FFAE14] text-white rounded-full shadow-md">
                {submission.badge}
              </span>
            )}
          </div>

          <h2 className="font-dela-gothic-one text-lg md:text-xl mb-1 leading-tight tracking-wide">
            {submission.teamName}
          </h2>
          <h3 className="font-syne text-sm md:text-base font-bold opacity-95">
            {submission.projectName}
          </h3>
        </div>
      </div>

      {/* Condensed Content */}
      <div className="flex-1 p-4 md:p-5 space-y-4 bg-white/60 backdrop-blur-sm">
        {/* Tagline */}
        {submission.tagline && (
          <p className="font-quicksand text-xs md:text-sm text-[#0B5D7D] italic leading-relaxed line-clamp-2">
            {submission.tagline}
          </p>
        )}

        {/* Quick Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#0B5D7D]">
            <Users className="w-4 h-4 text-[#18CBBC]" />
            <span className="font-syne font-semibold">{submission.members?.length || 0} Members</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#0B5D7D]">
            <FileText className="w-4 h-4 text-[#18CBBC]" />
            <span className="font-syne font-semibold">{resourceCount} Resources</span>
          </div>
        </div>

        {/* Click to view more */}
        <div className="pt-3 border-t-2 border-dashed border-[#18CBBC]/20">
          <button className="w-full bg-gradient-to-r from-[#18CBBC] to-[#2FA0E8] text-white py-2.5 rounded-xl font-syne font-bold hover:shadow-[0_4px_12px_rgba(24,203,188,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]">
            View Full Details
          </button>
        </div>
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
    purple: "bg-purple-100/80 text-purple-700 hover:bg-purple-200/80 border-purple-300 hover:shadow-[0_4px_12px_rgba(168,85,247,0.25)]",
    red: "bg-red-100/80 text-red-700 hover:bg-red-200/80 border-red-300 hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)]",
    green: "bg-green-100/80 text-green-700 hover:bg-green-200/80 border-green-300 hover:shadow-[0_4px_12px_rgba(34,197,94,0.25)]",
    gray: "bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 border-gray-300 hover:shadow-[0_4px_12px_rgba(107,114,128,0.25)]",
    yellow: "bg-yellow-100/80 text-yellow-700 hover:bg-yellow-200/80 border-yellow-300 hover:shadow-[0_4px_12px_rgba(234,179,8,0.25)]",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border-2 border-dashed transition-all duration-200 font-syne font-semibold text-sm backdrop-blur-sm ${colorClasses[color]} hover:scale-[1.02] active:scale-[0.98]`}
    >
      <span className="flex items-center gap-2.5">
        {icon}
        {label}
      </span>
      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
    </a>
  );
}

// Full Details Modal
function SubmissionModal({ submission, onClose }: { submission: Submission; onClose: () => void }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-4xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-[#18CBBC] via-[#2FA0E8] to-[#0B5D7D] p-6 md:p-8 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="font-syne text-sm font-bold px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-full">
                {submission.teamCode}
              </span>
              {submission.badge && (
                <span className="font-quicksand text-xs font-semibold px-3 py-1 bg-[#FFAE14] text-white rounded-full">
                  {submission.badge}
                </span>
              )}
              {submission.track && (
                <span className="font-quicksand text-xs px-3 py-1 bg-white/25 backdrop-blur-sm rounded-full">
                  {submission.track === "in_person" ? "In-Person" : "Online"}
                </span>
              )}
            </div>

            <h2 className="font-dela-gothic-one text-2xl md:text-3xl mb-2 leading-tight tracking-wide">
              {submission.teamName}
            </h2>
            <h3 className="font-syne text-lg md:text-xl font-bold opacity-95 mb-2">
              {submission.projectName}
            </h3>
            {submission.tagline && (
              <p className="font-quicksand text-sm md:text-base opacity-90 italic leading-relaxed">
                {submission.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Description */}
          <div>
            <h4 className="font-dela-gothic-one text-lg text-[#0B5D7D] mb-3">About the Project</h4>
            <p className="font-quicksand text-base text-[#0B5D7D] leading-relaxed">
              {submission.description}
            </p>
          </div>

          {/* Team Members */}
          {submission.members && submission.members.length > 0 && (
            <div className="border-t-2 border-dashed border-[#18CBBC]/20 pt-6">
              <h4 className="font-dela-gothic-one text-lg text-[#0B5D7D] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#18CBBC]" />
                Team Members ({submission.members.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {submission.members.map((member, idx: number) => (
                  <div key={idx} className="bg-[#18CBBC]/10 backdrop-blur-sm rounded-xl p-4 border-2 border-dashed border-[#18CBBC]/20">
                    <div className="font-syne font-bold text-[#0B5D7D] text-base">
                      {member.name}
                    </div>
                    {member.position && (
                      <div className="font-quicksand text-sm text-[#0B5D7D]/70 mt-1">
                        {member.position}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          <div className="border-t-2 border-dashed border-[#18CBBC]/20 pt-6">
            <h4 className="font-dela-gothic-one text-lg text-[#0B5D7D] mb-4">
              Project Resources
            </h4>
            <div className="space-y-3">
              {submission.pitchDeckUrl && (
                <ActionButton
                  href={submission.pitchDeckUrl}
                  icon={<FileText className="w-5 h-5" />}
                  label="View Pitch Deck"
                  color="purple"
                />
              )}
              {submission.demoVideoUrl && (
                <ActionButton
                  href={submission.demoVideoUrl}
                  icon={<Play className="w-5 h-5" />}
                  label="Watch Demo Video"
                  color="red"
                />
              )}
              {submission.liveProductUrl && (
                <ActionButton
                  href={submission.liveProductUrl}
                  icon={<ExternalLink className="w-5 h-5" />}
                  label="Try Live Demo"
                  color="green"
                />
              )}
              {submission.githubRepoUrl && (
                <ActionButton
                  href={submission.githubRepoUrl}
                  icon={<Code className="w-5 h-5" />}
                  label="View Source Code"
                  color="gray"
                />
              )}
              {submission.credentialsUrl && (
                <ActionButton
                  href={submission.credentialsUrl}
                  icon={<Key className="w-5 h-5" />}
                  label="Access Credentials"
                  color="yellow"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-dashed border-[#18CBBC]/20 p-6 bg-[#18CBBC]/5">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#18CBBC] to-[#2FA0E8] text-white py-3 rounded-xl font-syne font-bold hover:shadow-[0_4px_12px_rgba(24,203,188,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
