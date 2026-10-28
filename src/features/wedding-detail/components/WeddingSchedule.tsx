import React, { useState } from 'react';
import { Project } from '../../../types';
import { ProjectMeeting, ProjectMeetingKind } from '../../../services/calendarEvents';
import { CalendarIcon, ClockIcon } from '../../../constants';
import {
  CalendarClock,
  Plus,
  Trash2,
  MapPin,
  Video,
  FileText,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

interface WeddingScheduleProps {
  activeProject: Project | null;
  meetings: ProjectMeeting[];
  loadingMeetings: boolean;
  onAddMeeting: (meeting: any) => Promise<void>;
  onDeleteMeeting: (meetingId: string) => Promise<void>;
}

export const WeddingSchedule: React.FC<WeddingScheduleProps> = ({
  activeProject,
  meetings,
  loadingMeetings,
  onAddMeeting,
  onDeleteMeeting,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [kind, setKind] = useState<ProjectMeetingKind>('regular');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      await onAddMeeting({
        title: title.trim(),
        date,
        time,
        kind,
        location: location.trim(),
        agenda: agenda.trim(),
      });
      setShowAddModal(false);
      setTitle('');
      setLocation('');
      setAgenda('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Main Wedding Day Schedule Card ──────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-brand-accent" />
            Hari H Pelaksanaan Acara
          </h3>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent">
            Jadwal Utama
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
              Tanggal Acara
            </span>
            <span className="text-sm font-bold text-brand-text-primary">
              {activeProject?.date
                ? new Date(activeProject.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Belum diatur'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
              Lokasi / Venue
            </span>
            <span className="text-sm font-bold text-brand-text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {activeProject?.location || 'Lokasi belum diisi'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Meetings List Card ─────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-brand-accent" />
              Jadwal Pertemuan / Technical Meeting ({meetings.length})
            </h3>
            <p className="text-[11px] text-brand-text-secondary mt-0.5">
              Koordinasi teknis dengan pengantin sebelum hari pelaksanaan
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Meeting</span>
          </button>
        </div>

        {loadingMeetings ? (
          <div className="py-8 text-center text-xs text-brand-text-secondary">
            Memuat jadwal meeting...
          </div>
        ) : meetings.length === 0 ? (
          <div className="py-10 text-center text-xs text-brand-text-secondary bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CalendarClock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-brand-text-primary">Belum ada agenda meeting</p>
            <p className="mt-1">
              Tambahkan jadwal technical meeting atau konsultasi konsep bersama pengantin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {meetings.map(m => {
              const meetingDate = m.event.date || m.event.startAt.split('T')[0];
              const meetingTime = m.event.startAt.includes('T') ? m.event.startAt.split('T')[1].substring(0, 5) : '';
              const isZoom = m.metadata.kind === 'zoom';
              const meetingLocation = m.metadata.location || m.event.location;
              const meetingNotes = m.metadata.resultNotes || m.event.notes;

              return (
                <div
                  key={m.event.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-accent/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                          isZoom
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isZoom ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {isZoom ? 'Online Meeting' : 'Offline'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onDeleteMeeting(m.event.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Hapus meeting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-brand-text-primary mb-1">{m.event.title}</h4>

                    <div className="text-xs text-brand-text-secondary space-y-1 mb-2">
                      <div className="flex items-center gap-1.5 font-medium">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(meetingDate).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          {meetingTime && `• ${meetingTime}`}
                        </span>
                      </div>

                      {meetingLocation && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{meetingLocation}</span>
                        </div>
                      )}
                    </div>

                    {meetingNotes && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-brand-text-primary whitespace-pre-line">
                        <span className="font-bold text-[10px] text-slate-500 block mb-0.5 uppercase tracking-wider">
                          Agenda / Hasil:
                        </span>
                        {meetingNotes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Meeting Modal ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-brand-border">
            <h3 className="text-base font-bold text-brand-text-primary mb-3">Tambah Jadwal Pertemuan / Meeting</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">Judul / Jenis Pertemuan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Technical Meeting / Review Moodboard"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-text-secondary mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-text-secondary mb-1">Waktu</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">Jenis Pertemuan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKind('regular')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      kind === 'regular'
                        ? 'bg-brand-accent text-white border-brand-accent'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Tatap Muka (Offline)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind('zoom')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      kind === 'zoom'
                        ? 'bg-brand-accent text-white border-brand-accent'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Online (Zoom / Meet)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">Lokasi / Tautan Zoom</label>
                <input
                  type="text"
                  placeholder={kind === 'zoom' ? 'https://zoom.us/j/...' : 'Contoh: Resto / Cafe / Studio'}
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">Agenda / Catatan Pembahasan</label>
                <textarea
                  rows={3}
                  placeholder="Pembahasan mengenai susunan acara, rundown, dan request foto khusus..."
                  value={agenda}
                  onChange={e => setAgenda(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Simpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeddingSchedule;
