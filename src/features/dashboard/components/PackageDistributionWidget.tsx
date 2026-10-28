import React from 'react';

interface PackageDistributionWidgetProps {
  distribution: { name: string; count: number; percentage: number }[];
}

export const PackageDistributionWidget: React.FC<PackageDistributionWidgetProps> = ({
  distribution,
}) => {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full">
      <h3 className="font-bold text-lg text-[#2A3547] mb-4">Distribusi Paket</h3>
      <div className="space-y-4">
        {distribution.map((pkg, idx) => (
          <div key={pkg.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#2A3547] font-semibold truncate">{pkg.name}</span>
              <span className="text-[#5A6A85] font-bold">
                {pkg.count} ({pkg.percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-[#F4F6F9] rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-cyan-600'}`}
                style={{ width: `${pkg.percentage}%` }}
              />
            </div>
          </div>
        ))}
        {distribution.length === 0 && (
          <p className="text-center text-sm text-[#5A6A85] py-8">Belum ada data paket.</p>
        )}
      </div>
    </div>
  );
};
