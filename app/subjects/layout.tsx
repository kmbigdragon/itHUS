import Sidebar, { MobileSubjectBar } from "@/components/Sidebar";
import { buildTree } from "@/utils/tree";

export default function SubjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = buildTree();

  return (
    <div className="flex">
      <Sidebar tree={tree} />

      <div className="min-w-0 flex-1">
        <MobileSubjectBar tree={tree} />
        {children}
      </div>
    </div>
  );
}
