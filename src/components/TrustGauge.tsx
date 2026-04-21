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
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="78%"
          outerRadius="100%"
          data={data}
          startAngle={220}
          endAngle={-40}
        >
          <PolarAngleAxis type="number" domain={[0, 1000]} tick={false} />
          <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={20} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold tabular-nums" style={{ color }}>
          {score}
        </span>
        {label && <span className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
};
