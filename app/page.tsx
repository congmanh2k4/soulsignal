import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 md:py-24">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">SoulSignal</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Blind Dating, Letters First. Reveal when you both agree.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Viết thư chậm rãi, mở chat khi cả hai đồng ý, và chỉ reveal IG khi bạn sẵn sàng.
            Privacy-first, bảo mật IG trong két sắt dữ liệu.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Bắt đầu miễn phí
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Quy tắc cộng đồng
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <Card title="Viết thư trước" body="Giai đoạn Blind Mail giúp bạn tập trung vào suy nghĩ, không vội vã." />
          <Card title="Unlock chat" body="Khi cả hai đồng ý, mở chat realtime để tương tác nhanh hơn." />
          <Card title="Reveal IG khi sẵn sàng" body="IG chỉ hiển thị khi cả hai cùng bấm Reveal, bảo vệ quyền riêng tư." />
        </section>
      </div>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{body}</p>
    </div>
  );
}
