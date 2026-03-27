import { Link } from 'react-router-dom';

export default function StatCard({ title, value, icon, subtitle, trend, to }) {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-charcoal/60">{title}</p>
        <p className="mt-1 font-fraunces text-2xl font-semibold text-charcoal">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-charcoal/50">{subtitle}</p>}
        {trend && (
          <p className={`mt-1 text-xs ${trend > 0 ? 'text-primary' : 'text-soft-red'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
          </p>
        )}
      </div>
      {icon && <div className="text-2xl opacity-70">{icon}</div>}
    </div>
  );

  const className = "block rounded-xl border border-charcoal/10 bg-white p-5 shadow-card hover-lift transition-all duration-300";

  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>
      {content}
    </div>
  );
}
