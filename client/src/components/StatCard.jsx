export default function StatCard({ title, value, icon: Icon, bgClass = 'bg-[#1F2937]', textClass = 'text-white', borderClass = 'border-white/5', subtitle }) {
  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${bgClass} ${borderClass} shadow-md`}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className={`text-xs font-extrabold uppercase tracking-wider opacity-80 ${textClass}`}>{title}</span>
        {Icon && <Icon className="w-4 h-4 shrink-0 opacity-90" />}
      </div>
      <div>
        <div className={`text-3xl font-black tracking-tight leading-tight ${textClass}`}>{value}</div>
        {subtitle && <p className={`text-[10px] font-bold mt-1.5 opacity-60 ${textClass}`}>{subtitle}</p>}
      </div>
    </div>
  );
}
