import fs from "fs";
import path from "path";
import Link from "next/link";
import { toSlug, getDisplayName } from "@/utils/slug";

const CONTENT_PATH = path.join(process.cwd(), "content");

function getSubjects() {
  const entries = fs.readdirSync(CONTENT_PATH);

  return entries
    .filter((entry) => {
      const fullPath = path.join(CONTENT_PATH, entry);
      return fs.statSync(fullPath).isDirectory();
    })
    .map((folder) => ({
      name: getDisplayName(folder),
      slug: toSlug(folder),
    }));
}

export default function SubjectsPage() {
  const subjects = getSubjects();

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      <h1 className="text-3xl font-bold mb-10">
        Môn học
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {subjects.map((s) => (
          <Link
            key={s.slug}
            href={`/subjects/${s.slug}`}
            className="p-6 rounded-xl bg-secondary/20 border border-base/20 hover:bg-accent/20 transition group"
          >
            <h2 className="text-lg font-semibold group-hover:text-accent truncate">
              {s.name}
            </h2>

            <p className="text-sm text-primary/60 mt-2">
              Nhấn để xem nội dung
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}