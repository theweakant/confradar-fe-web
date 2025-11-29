import Image from "next/image";

export const LoginHero = () => {
  return (
    <div className="hidden md:flex md:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center relative overflow-hidden">
      <Image
        src="/images/login/login_conf.jpg"
        alt="Ảnh minh họa"
        fill
        className="object-cover opacity-40"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"></div>

      <div className="relative z-10 text-center text-white px-8 max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 tracking-tight">ConfRadar</h1>
        <p className="text-2xl font-light opacity-90 leading-relaxed">
          Khám Phá Các Hội thảo/Hội Nghị Tuyệt Vời Tại Việt Nam
        </p>
        <div className="mt-12 flex items-center justify-center gap-8 text-sm opacity-75">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Kết nối chuyên gia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Chia sẻ kiến thức</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Phát triển nghề nghiệp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
