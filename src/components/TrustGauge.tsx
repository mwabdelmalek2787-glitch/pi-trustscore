import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts";

export const scoreColor = (score: number) => {
  if (score < 300) return "hsl(var(--destructive))";
  if (score > 700) return "hsl(var(--success))";
  return "hsl(var(--primary))";
};

export const TrustGauge = ({ score, label }: { score: number; label?: string }) => {
  const color = scoreColor(score);
  const data = [{ name: "score", value: score, fill: color }];
  return (
    <div className="relative h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={220}
          endAngle={-40}
        >
          <defs>
            <linearGradient id="trustGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
            </linearGradient>
          </defs>
          <PolarAngleAxis type="number" domain={[0, 1000]} tick={false} />
          <RadialBar
            background={{ fill: "hsl(var(--muted))" }}
            dataKey="value"
            cornerRadius={20}
            fill="url(#trustGradient)"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-extrabold tabular-nums sm:text-7xl" style={{ color }}>
          {score}
        </span>
        {label && <span className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
};
