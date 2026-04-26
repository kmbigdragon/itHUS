import Image from "next/image";
import { FaLinkedinIn, FaGithub, FaFilePdf, FaFacebookF } from "react-icons/fa";

const SocialButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Row 1 - Buttons lớn */}
      <div className="flex gap-4">
        {/* CV */}
        <a
          href="/Tran_Minh_s_CV.pdf"
          target="_blank"
          title="CV"
          rel="noopener noreferrer"
          className="w-32 h-11 font-semibold flex gap-2 items-center justify-center rounded-full
                  bg-primary/60 border border-base/30 text-base
                  transition-all duration-300
                  hover:bg-accent hover:text-primary
                  hover:shadow-[0_0_15px_var(--color-accent)]
                  hover:scale-105 active:scale-95"
        >
          <FaFilePdf />
          <span>My CV</span>
        </a>

        {/* BIGDRAGON */}
        <a
          href="https://bigdragon.info.vn"
          target="_blank"
          title="Portfolio"
          rel="noopener noreferrer"
          className="w-32 h-11 font-semibold flex items-center justify-center rounded-full
                  bg-primary/60 border border-base/30
                  transition-all duration-300
                  hover:bg-accent
                  hover:shadow-[0_0_15px_var(--color-accent)]
                  hover:scale-105 active:scale-95"
        >
          <Image
            src="/BIGDRAGONLOGO.webp"
            alt="Portfolio"
            width={60}
            height={60}
            className="w-auto"
          />
        </a>
      </div>

      {/* Row 2 - Icon nhỏ */}
      <div className="flex gap-4">
        <a
          href="https://www.facebook.com/ku4nm1N.b1gDr4goN/"
          target="_blank"
          title="Facebook"
          rel="noopener noreferrer"
          className="w-11 h-11 flex items-center justify-center rounded-full
                  bg-primary/60 border border-accent/30
                  transition-all duration-300
                  hover:bg-accent hover:text-primary
                  hover:shadow-[0_0_12px_var(--color-accent)]
                  hover:scale-110 active:scale-95"
        >
          <FaFacebookF />
        </a>

        <a
          href="https://linkedin.com/in/kuanminbigdragon/"
          target="_blank"
          title="LinkedIn"
          rel="noopener noreferrer"
          className="w-11 h-11 flex items-center justify-center rounded-full
                  bg-primary/60 border border-accent/30
                  transition-all duration-300
                  hover:bg-accent hover:text-primary
                  hover:shadow-[0_0_12px_var(--color-accent)]
                  hover:scale-110 active:scale-95"
        >
          <FaLinkedinIn />
        </a>

        <a
          href="https://github.com/kmbigdragon"
          target="_blank"
          title="GitHub"
          rel="noopener noreferrer"
          className="w-11 h-11 flex items-center justify-center rounded-full
                  bg-primary/60 border border-accent/30
                  transition-all duration-300
                  hover:bg-accent hover:text-primary
                  hover:shadow-[0_0_12px_var(--color-accent)]
                  hover:scale-110 active:scale-95"
        >
          <FaGithub />
        </a>
      </div>
    </div>
  );
};

export default SocialButtons;
