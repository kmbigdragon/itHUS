import { FaFacebook, FaGithub, FaYoutube } from "react-icons/fa";

const socials = [
  { icon: <FaFacebook size={18} />, href: "https://facebook.com", label: "Facebook" },
  { icon: <FaGithub size={18} />, href: "https://github.com", label: "GitHub" },
  { icon: <FaYoutube size={18} />, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="border-t border-primary/10 py-6 px-6 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-primary/40">
          © {new Date().getFullYear()}{" "}
          <span className="text-primary/60 font-medium">itHUS</span>. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-primary/40 hover:text-accent transition"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}