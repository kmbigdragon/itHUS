import Image from "next/image";
import Link from "next/link";
import { FaXmark } from "react-icons/fa6";
import { SearchBar } from "./SearchBar";
import { FaBars } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-primary/90 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <Image
            src="/itHUS_LOGO.webp"
            alt="itHUS"
            width={120}
            height={60}
            loading="eager"
            className="h-9 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--color-accent)]"
          />

          <div className="flex pl-0.5 text-base/30 justify-center items-center">
            <FaXmark />
          </div>

          <Image
            src="/BIGDRAGONLOGO.webp"
            alt="bigdragon"
            width={120}
            height={60}
            loading="eager"
            className="h-9 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--color-accent)]"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <Link
            href="/"
            className="text-base/80 hover:text-accent hover:scale-110 active:scale-95 hover:cursor-pointer transition duration-300 font-medium"
          >
            Trang chủ
          </Link>

          <div className="h-7 w-px bg-base/30" />

          <Link
            href="/subjects"
            className="text-base/80 hover:text-accent hover:scale-110 active:scale-95 hover:cursor-pointer transition duration-300 font-medium"
          >
            Môn học
          </Link>

          <SearchBar />
        </div>

        {/* Mobile Button */}
        <div className="md:hidden flex flex-row items-center justify-center gap-4">
          <SearchBar />
          <details className="relative">
            <summary className="list-none text-base text-xl cursor-pointer">
              <FaBars />
            </summary>

            <div className="absolute right-0 mt-4 w-40 bg-secondary/95 backdrop-blur-md rounded-lg shadow-lg">
              <div className="flex flex-col p-4 gap-3">
                <Link
                  href="/"
                  className="text-base/80 hover:text-accent transition"
                >
                  Trang chủ
                </Link>
                <Link
                  href="/subjects"
                  className="text-base/80 hover:text-accent transition"
                >
                  Môn học
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
