import { buildTree } from "@/utils/tree";
import { isCompletedSubject } from "@/utils/subjects";
import { CompletedBadge } from "@/components/CompletedBadge";
import {
  SubjectCard,
  EmptySubjectItem,
} from "@/components/subjects/SubjectCard";

export default function SubjectsPage() {
  const subjects = buildTree().filter((n) => !n.isFile);

  const available = subjects.filter((s) => s.lessons + s.pdfs > 0);
  const empty = subjects.filter((s) => s.lessons + s.pdfs === 0);
  const completedCount = subjects.filter((s) =>
    isCompletedSubject(s.name),
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-primary">Môn học</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-primary/60">
          <span>{subjects.length} môn</span>
          <span aria-hidden>·</span>
          <span>{available.length} môn đã có bài</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5">
            <CompletedBadge /> {completedCount} môn đã hoàn thành
          </span>
        </p>
      </header>

      <section aria-labelledby="available-heading">
        <h2
          id="available-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary/50"
        >
          Đã có bài
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((s) => (
            <SubjectCard key={s.path} subject={s} />
          ))}
        </div>
      </section>

      {empty.length > 0 && (
        <section aria-labelledby="empty-heading" className="mt-14">
          <h2
            id="empty-heading"
            className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary/50"
          >
            Đang cập nhật
          </h2>
          <p className="mb-4 text-sm text-primary/50">
            Các môn dưới đây chưa có nội dung.
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {empty.map((s) => (
              <EmptySubjectItem key={s.path} subject={s} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
