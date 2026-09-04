"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  attendanceByWeek,
  formatCrc,
  paymentsByMonth,
  resultsByStroke,
  resultsTrend,
} from "@/lib/mock/analytics";
import { cn } from "@/lib/utils";

const COLORS = {
  teal: "#2e768d",
  navy: "#0f2c3d",
  aqua: "#3ecfc0",
  soft: "#8ebecb",
  warn: "#d4a017",
  muted: "#94a3b8",
};

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #d7e3ea",
  fontSize: 12,
};

export function AttendanceChart() {
  return (
    <Card bubbles bubblePreset="panel">
      <CardHeader>
        <CardTitle>Asistencia semanal</CardTitle>
        <p className="text-xs text-slate-500">Presentes vs ausencias (mock)</p>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={attendanceByWeek} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2eef3" />
            <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="presentes" name="Presentes" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
            <Bar dataKey="ausentes" name="Ausentes" fill={COLORS.warn} radius={[6, 6, 0, 0]} />
            <Bar
              dataKey="justificados"
              name="Justificados"
              fill={COLORS.soft}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ResultsCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card bubbles bubblePreset="card">
        <CardHeader>
          <CardTitle>Tendencia de resultados</CardTitle>
          <p className="text-xs text-slate-500">Marcas y podios por mes</p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={resultsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2eef3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="marcas"
                name="Marcas"
                stroke={COLORS.teal}
                strokeWidth={3}
                dot={{ r: 4, fill: COLORS.aqua }}
              />
              <Line
                type="monotone"
                dataKey="podios"
                name="Podios"
                stroke={COLORS.navy}
                strokeWidth={3}
                dot={{ r: 4, fill: COLORS.navy }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card bubbles bubblePreset="panel">
        <CardHeader>
          <CardTitle>Resultados por estilo</CardTitle>
          <p className="text-xs text-slate-500">Distribución de marcas registradas</p>
        </CardHeader>
        <CardContent className="flex h-72 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={resultsByStroke}
                dataKey="marcas"
                nameKey="estilo"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {resultsByStroke.map((_, index) => (
                  <Cell
                    key={resultsByStroke[index].estilo}
                    fill={[COLORS.teal, COLORS.navy, COLORS.aqua, COLORS.soft, COLORS.muted][index % 5]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentsChart({
  data,
  subtitle = "Montos en colones (CRC) — datos demo",
  compact = false,
  className,
}: {
  data?: { mes: string; cobrado: number; pendiente: number }[];
  subtitle?: string;
  compact?: boolean;
  className?: string;
}) {
  const chartData = data ?? paymentsByMonth;
  return (
    <Card bubbles bubblePreset="header" className={className}>
      <CardHeader className={compact ? "p-3 pb-1" : undefined}>
        <CardTitle className={compact ? "text-sm" : undefined}>
          Pagos cobrados vs pendientes
        </CardTitle>
        <p className={cn("text-xs text-slate-500", !subtitle && "hidden")}>{subtitle}</p>
      </CardHeader>
      <CardContent className={compact ? "h-56 p-3 pt-0 md:h-64" : "h-72"}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="cobradoFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.45} />
                <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="pendienteFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.warn} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS.warn} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2eef3" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => formatCrc(Number(value ?? 0))}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="cobrado"
              name="Cobrado"
              stroke={COLORS.teal}
              fill="url(#cobradoFill)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="pendiente"
              name="Pendiente"
              stroke={COLORS.warn}
              fill="url(#pendienteFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
