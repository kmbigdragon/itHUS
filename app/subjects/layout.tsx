import Sidebar from "@/components/Sidebar";
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

      <main className="flex-1 min-h-[90vh]">{children}</main>
    </div>
  );
}
