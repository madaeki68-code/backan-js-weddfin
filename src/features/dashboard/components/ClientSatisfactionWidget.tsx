import React from 'react';
import { ViewType } from '../../../types';
import { StarIcon } from '../../../constants';

interface ClientSatisfactionWidgetProps {
  totalFeedback: number;
  avgRating: number;
  onNavigate: (view: ViewType) => void;
}

const StarRatingDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon
        key={star}
        className={`w-5 h-5 ${
          star <= rating ? 'text-amber-500 fill-current' : 'text-slate-200'
        }`}
      />
    ))}
  </div>
);

export const ClientSatisfactionWidget: React.FC<ClientSatisfactionWidgetProps> = ({
  totalFeedback,
  avgRating,
  onNavigate,
}) => {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg text-[#2A3547] mb-2">Kepuasan Pengantin</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold text-[#2A3547]">{avgRating.toFixed(1)}</p>
          <p className="text-[#5A6A85] font-semibold">/ 5.0</p>
        </div>
        <div className="my-3">
          <StarRatingDisplay rating={avgRating} />
        </div>
        <p className="text-xs text-[#5A6A85]">
          Berdasarkan {totalFeedback} ulasan kepuasan.
        </p>
      </div>
      <button
        type="button"
        onClick={() => onNavigate(ViewType.CLIENT_REPORTS)}
        className="p-2 mt-4 text-sm font-semibold text-brand-accent hover:underline self-start rounded-lg hover:bg-brand-accent/10 cursor-pointer"
      >
        Lihat Laporan &rarr;
      </button>
    </div>
  );
};
