import Link from "next/link";
import uxmmLogo from "@/app/assets/uxmm_logo.svg";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0B3342] text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.7fr_0.7fr_0.9fr_1fr] gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-5">
            {/* UX mm logo as in image */}
            <div className="inline-flex flex-col leading-none select-none">
              <Image
                src={uxmmLogo}
                alt="UXMM Logo"
                width={50}
                height={50}
                className="h-full w-12"
              />
            </div>
            <p className="text-[13px] leading-[1.5] text-white/90 max-w-[320px] font-medium">
              Gorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
              vulputate libero et velit interdum, ac aliquet odio mattis. Class
              a
            </p>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-[17px] font-bold text-white mb-4 tracking-tight">Content</h3>
            <ul className="space-y-[14px] text-[14px] font-medium">
              <li>
                <Link href="/" className="text-white hover:text-white/70 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/event" className="text-white hover:text-white/70 transition-colors">
                  Event
                </Link>
              </li>
              <li>
                <Link href="/characters" className="text-white hover:text-white/70 transition-colors">
                  Characters
                </Link>
              </li>
              <li>
                <Link href="/speaker" className="text-white hover:text-white/70 transition-colors">
                  Speaker
                </Link>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className="text-[17px] font-bold text-white mb-4 tracking-tight">Get in Touch</h3>
            <a
              href="mailto:info@uxmm.org"
              className="text-[13px] font-medium text-white hover:text-white/70 transition-colors break-all"
            >
              info@uxmm.org
            </a>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-[17px] font-bold text-white mb-4 tracking-tight">Socials</h3>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white hover:text-[#0B3342] transition-colors"
              >
                <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 8h2V5h-2c-2.21 0-4 1.79-4 4v2H8v3h2v5h3v-5h2l1-3h-3V9c0-.55.45-1 1-1z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white hover:text-[#0B3342] transition-colors"
              >
                <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="p-2 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white hover:text-[#0B3342] transition-colors"
              >
                <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a5.2 5.2 0 01-3.08-1.02 5.2 5.2 0 01-1.76-2.67h-2.9v11.2a3.3 3.3 0 01-3.3 3.3 3.3 3.3 0 01-3.3-3.3 3.3 3.3 0 013.3-3.3c.28 0 .56.04.82.11V10.3a6.2 6.2 0 00-.82-.06 6.2 6.2 0 00-6.2 6.2 6.2 6.2 0 006.2 6.2 6.2 6.2 0 006.2-6.2V8.94a7.9 7.9 0 004.84 1.65V7.7a5.2 5.2 0 01-1 0z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-2 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white hover:text-[#0B3342] transition-colors"
              >
                <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 12s0-3.54-.45-5.24a2.8 2.8 0 00-1.97-1.97C18.88 4.34 12 4.34 12 4.34s-6.88 0-8.58.45A2.8 2.8 0 001.45 6.76C1 8.46 1 12 1 12s0 3.54.45 5.24a2.8 2.8 0 001.97 1.97c1.7.45 8.58.45 8.58.45s6.88 0 8.58-.45a2.8 2.8 0 001.97-1.97C23 15.54 23 12 23 12zm-13.2 3.2V8.8L15.8 12l-6 3.2z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white hover:text-[#0B3342] transition-colors"
              >
                <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.45 20.45h-3.56v-5.6c0-1.33-.48-2.24-1.68-2.24-.92 0-1.46.62-1.7 1.21-.09.21-.11.51-.11.81v5.82H9.84s.05-9.44 0-10.42h3.56v1.48c.47-.73 1.32-1.77 3.22-1.77 2.35 0 4.11 1.53 4.11 4.83v5.88zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V10.03h3.56v10.42z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
