import Link from "next/link";
import { CompletedBadge } from "@/components/CompletedBadge";
import type { TreeNode } from "@/utils/tree";
import {
  describeCount,
  getSubjectCode,
  getSubjectTitle,
  isCompletedSubject,
} from "@/utils/subjects";

export function SubjectCard({ subject }: { subject: TreeNode }) {
  const code = getSubjectCode(subject.name);
  const completed = isCompletedSubject(subject.name);

  return (
    <Link
      href={`/subjects/${subject.path}`}
      className="group flex h-full flex-col rounded-xl border border-primary/10 bg-white p-5 transition-colors hover:border-accent hover:bg-accent/10"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-semibold text-secondary">
          {code}
        </span>
        {completed && <CompletedBadge variant="label" />}
      </div>

      <h3 className="text-lg font-semibold leading-snug text-primary">
        {getSubjectTitle(subject.name)}
      </h3>

      <p className="mt-auto pt-3 text-sm text-primary/60">
        {describeCount(subject.lessons, subject.pdfs)}
      </p>
    </Link>
  );
}

/** Môn chưa có bài: hiện mờ, không bấm được để tránh vào trang trống */
export function EmptySubjectItem({ subject }: { subject: TreeNode }) {
  return (
    <li className="flex items-baseline gap-3 rounded-lg border border-dashed border-primary/15 px-4 py-3 text-sm">
      <span className="font-mono text-xs text-primary/40">
        {getSubjectCode(subject.name)}
      </span>
      <span className="text-primary/60">{getSubjectTitle(subject.name)}</span>
    </li>
  );
}
