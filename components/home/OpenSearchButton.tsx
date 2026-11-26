"use client";

import { LuSearch } from "react-icons/lu";
import { OPEN_SEARCH_EVENT } from "@/components/SearchBar";

export default function OpenSearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      className="flex items-center gap-3 rounded-xl border border-base/30 px-6 py-3.5 font-semibold text-base transition-colors hover:border-accent hover:text-accent"
    >
      <LuSearch aria-hidden /> Tìm bài học
    </button>
  );
}
