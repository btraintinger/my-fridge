import { ScanLine } from 'lucide-react'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 pb-20 pt-12 items-center min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-emerald-500 text-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] mb-8 sm:mb-10 shadow-xl shadow-emerald-500/30 dark:shadow-emerald-900/40">
                    <ScanLine
                        size={48}
                        strokeWidth={1.5}
                        className="sm:w-14 sm:h-14"
                    />
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-2 sm:mb-3 tracking-tight text-center">
                    {title}
                </h1>
                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-8 sm:mb-10 text-center leading-relaxed font-medium max-w-xs sm:max-w-none">
                    {subtitle}
                </p>

                {children}
            </div>
        </div>
    )
}
