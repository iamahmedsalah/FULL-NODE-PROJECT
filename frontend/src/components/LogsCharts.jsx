import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useMemo } from "react";

const COLORS = { INFO: "#22d3ee", WARN: "#f59e0b", ERROR: "#f43f5e" };

const TooltipBox = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg2 border border-bdr2 rounded-lg px-3.5 py-2.5 text-[12px] font-mono
                    shadow-[0_8px_24px_rgba(0,0,0,.5)]">
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const PiePct = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontFamily="inherit">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function LogsCharts({ logs }) {
  const pieData = useMemo(() => {
    const c = { INFO: 0, WARN: 0, ERROR: 0 };
    logs.forEach(l => {
      const lv = (l.level || "").toUpperCase();
      if (c[lv] !== undefined) c[lv] += l.count || 1;
    });
    return Object.entries(c).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const lineData = useMemo(() => {
    const days = {};
    logs.forEach(l => {
      const d = new Date(l.lastOccurrence || l.last_occurrence || l.createdAt || l.created_at);
      if (isNaN(d)) return;
      const k = d.toISOString().slice(0, 10);
      if (!days[k]) days[k] = { date: k, INFO: 0, WARN: 0, ERROR: 0 };
      const lv = (l.level || "").toUpperCase();
      if (days[k][lv] !== undefined) days[k][lv] += l.count || 1;
    });
    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  }, [logs]);

  const cardCls = "bg-bg1 border border-bdr rounded-2xl p-6";
  const titleCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-5";
  const emptyCls = "h-[220px] flex items-center justify-center text-muted text-[13px]";
  const legendFmt = v => <span style={{ color: "#566880", fontSize: 12 }}>{v}</span>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
      <div className={cardCls}>
        <h3 className={titleCls}>Level Distribution</h3>
        {pieData.length === 0 ? <div className={emptyCls}>No data yet</div> : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={85}
                dataKey="value" labelLine={false} label={PiePct}>
                {pieData.map(e => <Cell key={e.name} fill={COLORS[e.name] || "#888"} />)}
              </Pie>
              <Tooltip content={<TooltipBox />} />
              <Legend formatter={legendFmt} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className={cardCls}>
        <h3 className={titleCls}>Logs Over Time</h3>
        {lineData.length === 0 ? <div className={emptyCls}>No timeline data</div> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
              <XAxis dataKey="date" tick={{ fill: "#566880", fontSize: 10 }}
                tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: "#566880", fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<TooltipBox />} />
              <Legend formatter={legendFmt} />
              <Line type="monotone" dataKey="INFO" stroke="#22d3ee" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="WARN" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ERROR" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
