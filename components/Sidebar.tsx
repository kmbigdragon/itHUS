"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBook, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { usePathname } from "next/navigation";

type TreeNode = {
  name: string;
  path: string;
  isFile: boolean;
  children?: TreeNode[];
};

export default function Sidebar({ tree }: { tree: TreeNode[] }) {
  return (
    <aside className="hidden xl:block w-72 min-h-[92vh] sticky top-0 overflow-y-auto border-r border-primary/10 bg-primary/5 p-4">
      <h2 className="font-bold text-lg mb-4 text-accent flex items-center gap-3">
        <FaBook /> MÔN HỌC
      </h2>

      <Tree nodes={tree} />
    </aside>
  );
}

function Tree({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <TreeItem key={node.path} node={node} level={0} />
      ))}
    </ul>
  );
}

function TreeItem({ node, level }: { node: TreeNode; level: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = pathname.includes(node.path);

  const padding = level * 12;

  if (node.isFile) {
    return (
      <li>
        <Link
          href={`/subjects/${node.path}`}
          className={`block px-2 py-1 rounded text-sm transition truncate 
            ${
              isActive
                ? "bg-accent text-primary font-semibold"
                : "hover:bg-accent/20"
            }
          `}
          style={{ paddingLeft: padding + 8 }}
        >
          📝 {node.name}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div
        className="w-full flex items-center gap-2 text-left px-2 py-1 font-semibold text-sm hover:text-accent duration:300 transition-all"
        style={{ paddingLeft: padding }}
      >
        <button className="hover:cursor-pointer" onClick={() => setOpen(!open)}>
          {open ? <FaChevronDown /> : <FaChevronRight />}
        </button>
        <Link
          href={"/subjects/" + node.path}
          className="truncate"
        >
          {node.name}
        </Link>
      </div>

      {/* animation nhẹ */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-250" : "max-h-0"
        }`}
      >
        {node.children && (
          <div className="ml-2 border-l border-primary/10 pl-2">
            <Tree nodes={node.children} />
          </div>
        )}
      </div>
    </li>
  );
}
