import { ReactNode } from "react";

interface StatCardProps {
  value: string;
  label: string;
  icon?: ReactNode;
}

export const StatCard = ({ value, label, icon }: StatCardProps) => {
  return (
    <div className="text-center group">
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 bg-black/10 rounded-full transform group-hover:scale-110 transition-all duration-300"></div>
        <div className="relative z-10 mx-auto">{icon}</div>
      </div>
      <p className="text-4xl font-bold mb-2">{value}</p>
      <p className="text-lg text-gray-600">{label}</p>
    </div>
  );
};
