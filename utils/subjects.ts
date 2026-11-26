// Không dùng fs ở file này để client component cũng import được.

// Mã các môn đã hoàn thành: thêm hoặc bớt mã ở đây để bật/tắt tích xanh.
export const COMPLETED_SUBJECTS = ["MAT2407", "MAT3323", "MAT3562", "MAT3565"];

const CODE_RE = /^([a-z]{2,4}\d{3,4})/i;

/** "MAT3323 – Tối ưu rời rạc" hoặc "mat3323-toi-uu-roi-rac" → "MAT3323" */
export function getSubjectCode(name: string): string | null {
  const match = name.trim().match(CODE_RE);
  return match ? match[1].toUpperCase() : null;
}

/** "MAT3323 – Tối ưu rời rạc" → "Tối ưu rời rạc" */
export function getSubjectTitle(name: string): string {
  return name.replace(/^[a-z]{2,4}\d{3,4}\s*[–—-]\s*/i, "").trim();
}

export function isCompletedSubject(name: string): boolean {
  const code = getSubjectCode(name);
  return code !== null && COMPLETED_SUBJECTS.includes(code);
}

/** "21 bài học · 31 PDF", "Chưa có nội dung" */
export function describeCount(lessons: number, pdfs: number): string {
  const parts: string[] = [];
  if (lessons > 0) parts.push(`${lessons} bài học`);
  if (pdfs > 0) parts.push(`${pdfs} PDF`);
  return parts.length > 0 ? parts.join(" · ") : "Chưa có nội dung";
}
