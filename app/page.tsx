import Link from "next/link";
import Image from "next/image";
import { FaBook } from "react-icons/fa";
import SocialButtons from "@/components/home/SocialButtons";
export const dynamic = "force-static";
export default function Home() {
  return (
    <main className="bg-base text-primary min-h-screen">
      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32 bg-primary text-base">
        <Image
          src="/itHUS_LOGO.webp"
          alt="itHUS"
          width={1200}
          height={600}
          loading="eager"
          className="w-80 h-auto mb-16 transition-all duration-300 drop-shadow-[0_0_8px_var(--color-accent)]"
        />

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Chào mừng bạn đến với itHUS
        </h1>

        <p className="max-w-2xl text-base/80 mb-8">
          Nơi tổng hợp các kiến thức về Toán, Lập trình và nhiều lĩnh vực khác
        </p>

        {/* CTA */}
        <Link
          href="/subjects"
          className="flex items-center gap-3 bg-accent text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
        >
          <FaBook /> Khám phá các Môn học
        </Link>
      </section>

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

      {/* EXTRA SECTION (FEATURE / PREVIEW) */}
      <section className="bg-secondary/10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">
            itHUS có những gì?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur shadow-sm hover:scale-105 hover:cursor-pointer duration-300">
              <h3 className="font-semibold mb-2">📖 Kiến thức có hệ thống</h3>
              <p className="text-sm text-primary/70">
                Mỗi chủ đề đều được hệ thống hóa theo từng phần, có liên kết rõ
                ràng.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/60 backdrop-blur shadow-sm hover:scale-105 hover:cursor-pointer duration-300">
              <h3 className="font-semibold mb-2">🔍 Dễ tra cứu</h3>
              <p className="text-sm text-primary/70">
                Bạn có thể tìm kiếm nhanh chóng các khái niệm và nội dung cần
                thiết.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/60 backdrop-blur shadow-sm hover:scale-105 hover:cursor-pointer duration-300">
              <h3 className="font-semibold mb-2">🚀 Luôn cập nhật</h3>
              <p className="text-sm text-primary/70">
                Nội dung được bổ sung liên tục trong quá trình học tập và làm
                việc.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
