import React from 'react';
import { Client, Profile } from '../types';
import { PencilIcon, Share2Icon } from '../../../constants';
import { customizeUiText, useUiTextOverrides } from '../../../utils/uiTextCustomization';

interface ClientDetailHeroProps {
  client: Client;
  profile: Profile;
  totalProjects: number;
  onEditClient: (client: Client) => void;
  onSharePortal: (client: Client) => void;
}

export const ClientDetailHero: React.FC<ClientDetailHeroProps> = ({
  client,
  profile,
  totalProjects,
  onEditClient,
  onSharePortal,
}) => {
  const uiTextOverrides = useUiTextOverrides();

  const initials = client.name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-3 sm:mb-5 shadow-lg shadow-blue-500/20 bg-cover bg-center"
      style={
        profile.publicPageConfig?.backgroundImages?.clientDetail
          ? { backgroundImage: `url(${profile.publicPageConfig.backgroundImages.clientDetail})` }
          : undefined
      }
    >
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* decorative rings */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-2.5 p-2.5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
        {/* Avatar */}
        <div className="w-16 h-16 sm:w-48 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-inner border border-white/30">
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              alt={`${client.name} avatar`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="text-white font-black text-base sm:text-2xl tracking-tight select-none">
              {initials}
            </span>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-2 sm:gap-3 text-center sm:items-start sm:text-left">
          <div className="w-full">
            <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-white/80 mb-0.5">
              {customizeUiText('client.detail.title', 'Detail Pengantin', uiTextOverrides)}
            </p>
            <h2 className="text-sm sm:text-2xl font-black text-white leading-tight break-words">
              {client.name}
            </h2>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5 sm:justify-start sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/15 text-white text-[9px] sm:text-[10px] font-semibold border border-white/20">
                Terdaftar{' '}
                {new Date(client.since).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {totalProjects > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/15 text-white text-[9px] sm:text-[10px] font-semibold border border-white/20">
                  {totalProjects} Acara
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => onEditClient(client)}
              className="h-7 sm:h-9 px-2 inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[9px] sm:text-xs font-semibold whitespace-nowrap transition-all active:scale-90 cursor-pointer"
              title={customizeUiText('client.detail.action.edit', 'Edit Pengantin', uiTextOverrides)}
            >
              <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{customizeUiText('client.detail.action.edit', 'Edit Pengantin', uiTextOverrides)}</span>
            </button>
            <button
              type="button"
              onClick={() => onSharePortal(client)}
              className="h-7 sm:h-9 px-2 inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl solid-green border border-green-700 text-white text-[9px] sm:text-xs font-semibold whitespace-nowrap transition-all active:scale-90 cursor-pointer"
              title={customizeUiText('client.detail.action.share', 'Bagikan Portal', uiTextOverrides)}
            >
              <Share2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{customizeUiText('client.detail.action.share', 'Bagikan Portal', uiTextOverrides)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailHero;
