import Link from "next/link";
import Image from "next/image";
import { FaBook } from "react-icons/fa";
import { LuArrowRight } from "react-icons/lu";
import SocialButtons from "@/components/home/SocialButtons";
import OpenSearchButton from "@/components/home/OpenSearchButton";
import { ContributeSection } from "@/components/home/ContributeSection";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { buildTree } from "@/utils/tree";
import { isCompletedSubject } from "@/utils/subjects";

export const dynamic = "force-static";

export default function Home() {
  const subjects = buildTree().filter((n) => !n.isFile);
  const completed = subjects.filter((s) => isCompletedSubject(s.name));

  return (
    <div className="bg-base text-primary min-h-screen">
      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 md:py-28 bg-primary text-base">
        <Image
          src="/itHUS_LOGO.webp"
          alt="itHUS"
          width={1200}
          height={600}
          loading="eager"
          className="w-64 md:w-80 h-auto mb-10 md:mb-14 transition-all duration-300 drop-shadow-[0_0_8px_var(--color-accent)]"
        />

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Chào mừng bạn đến với itHUS
        </h1>

        <p className="max-w-2xl text-base/80 mb-8">
          Nơi tổng hợp các kiến thức về Toán, Lập trình và nhiều lĩnh vực khác
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/subjects"
            className="flex items-center gap-3 bg-accent text-primary px-6 py-3.5 rounded-xl font-semibold hover:bg-accent/85 transition-colors shadow-lg"
          >
            <FaBook /> Khám phá các Môn học
          </Link>
          <OpenSearchButton />
        </div>
      </section>

      {/* MÔN ĐÃ HOÀN THÀNH */}
      {completed.length > 0 && (
        <section className="bg-secondary/10 py-14 md:py-20 px-5 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <h2 className="text-2xl font-bold">Môn đã hoàn thành</h2>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
              >
                Xem tất cả {subjects.length} môn <LuArrowRight aria-hidden />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {completed.map((s) => (
                <SubjectCard key={s.path} subject={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT ME */}
      <section
        className="max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-24 
                    flex flex-col md:flex-row gap-10 md:gap-16 items-center"
      >
        {/* RIGHT (Avatar lên trước trên mobile) */}
        <div className="flex-1 flex justify-center order-1 md:order-2">
          <div
            className="w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 
                    rounded-2xl bg-secondary/20 backdrop-blur 
                    overflow-hidden"
          >
            <Image
              src="/minh.jpg"
              alt="Big DragoN"
              width={400}
              height={400}
              loading="eager"
              className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* LEFT */}
        <div className="flex-1 space-y-4 text-left md:text-justify order-2 md:order-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-accent">
              Trần Đăng Quang Minh
            </h2>
            <h3 className="text-xl sm:text-2xl font-bold text-secondary">
              Big DragoN
            </h3>
            <p className="text-accent mt-1 text-sm">
              Lập trình viên • Toán tin
            </p>
          </div>

          <p className="text-primary/80 leading-relaxed text-sm">
            Mình đang theo đuổi Software Engineering, tập trung vào Web
            Development và các hệ thống xử lý dữ liệu.
          </p>

          <p className="text-primary/80 leading-relaxed text-sm">
            Website này không phải blog, mà là nơi mình xây dựng một hệ thống
            kiến thức cá nhân — nơi mọi thứ được ghi chép, liên kết và tối ưu để
            tra cứu nhanh nhất.
          </p>

          <p className="text-primary/80 leading-relaxed text-sm">
            Nếu bạn cũng đang học Giải tích, Đại số, OOP, DSA,... hy vọng bạn sẽ
            tìm được thứ gì đó hữu ích ở đây.
          </p>

          {/* Socials */}
          <div className="pt-2">
            <SocialButtons />
          </div>
        </div>
      </section>

      {/* ĐÓNG GÓP */}
      <ContributeSection />
    </div>
  );
}
