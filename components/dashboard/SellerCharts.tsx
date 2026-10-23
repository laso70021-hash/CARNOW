"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function SellerTrendLineChart({
  trends,
}: {
  trends: Array<{ month: string; enquiries: number; orders: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trends || []}>
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} />
        <Tooltip />
        <Line type="monotone" dataKey="enquiries" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SellerStatusPieChart({
  statusData,
  colors,
}: {
  statusData: Array<{ name: string; value: number }>;
  colors: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={statusData}
          innerRadius={50}
          outerRadius={70}
          paddingAngle={3}
          dataKey="value"
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
