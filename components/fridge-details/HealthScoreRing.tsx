export function HealthScoreRing({ score }: { score: number }) {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="128" height="128" viewBox="0 0 128 128">
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                />
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 64 64)"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-slate-900">
                    {score}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase">
                    / 100
                </span>
            </div>
        </div>
    )
}
