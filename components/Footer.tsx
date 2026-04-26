import Link from "next/link";
import { FaFacebook, FaGithub, FaRegCopyright } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

const socials = [
  {
    icon: <FaFacebook size={18} />,
    href: "https://www.facebook.com/ku4nm1N.b1gDr4goN/",
    label: "Facebook",
  },
  {
    icon: <FaGithub size={18} />,
    href: "https://github.com/kmbigdragon",
    label: "GitHub",
  },
  {
    icon: <SiGmail size={18} />,
    href: "mailto:kuanmin.bigdragon.56@gmail.com",
    label: "YouTube",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-primary/10 py-6 px-6 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-primary/40 flex items-center gap-1">
          <FaRegCopyright /> 2025 - {new Date().getFullYear()}{" "}
          <Link href="/" className="text-primary/60 font-medium">
            itHUS
          </Link>
          - All rights reserved.
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
