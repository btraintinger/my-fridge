import Link from 'next/link'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-6 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_38%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
            <div className="max-w-lg rounded-[2rem] border border-white/70 bg-white/90 p-8 text-center shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <WifiOff size={30} />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                    Du bist offline
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                    MyFridge kann bereits gecachte Fridge-Daten und gespeicherte Produkte anzeigen. Wenn du wieder verbunden bist, werden Änderungen automatisch synchronisiert.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/fridges"
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-600"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Erneut versuchen
                    </Link>
                    <Link
                        href="/scanner"
                        className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                        Scanner öffnen
                    </Link>
                </div>
            </div>
        </div>
    )
}
