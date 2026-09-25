import React, { useState, useEffect } from 'react';
import { Activity } from '../../types/trip';
import { Modal } from '../common/Modal';

interface ActivityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  dayNumber: number;
  onSave: (data: Omit<Activity, 'id'>) => void;
}

export const ActivityEditModal: React.FC<ActivityEditModalProps> = ({
  isOpen,
  onClose,
  activity,
  dayNumber,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [category, setCategory] = useState<Activity['category']>('sightseeing');
  const [location, setLocation] = useState('');
  const [costEstimateInr, setCostEstimateInr] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setTime(activity.time);
      setCategory(activity.category);
      setLocation(activity.location);
      setCostEstimateInr(activity.costEstimateInr);
      setNotes(activity.notes || '');
    } else {
      setTitle('');
      setTime('10:00 AM');
      setCategory('sightseeing');
      setLocation('');
      setCostEstimateInr(500);
      setNotes('');
    }
  }, [activity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      time,
      category,
      location: location.trim() || 'Local Area',
      costEstimateInr: costEstimateInr ? Number(costEstimateInr) : undefined,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Timeline Activity' : `Add Activity to Day ${dayNumber}`}
      subtitle="Customize timings, places, and group notes"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Activity Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sunset Camel Safari on Sam Dunes"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scheduled Time
            </label>
            <input
              type="text"
              placeholder="e.g. 04:30 PM"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Activity['category'])}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white"
            >
              <option value="sightseeing">Sightseeing</option>
              <option value="dining">Dining & Food</option>
              <option value="leisure">Leisure & Relax</option>
              <option value="travel">Transit & Drive</option>
              <option value="stay">Hotel & Stay</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Landmark
            </label>
            <input
              type="text"
              placeholder="e.g. Gadisar Lake"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Cost (₹ INR)
            </label>
            <input
              type="number"
              placeholder="e.g. 1200"
              value={costEstimateInr || ''}
              onChange={e => setCostEstimateInr(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Group Notes / Recommendations
          </label>
          <textarea
            rows={2}
            placeholder="Add details, what to wear, or meeting points..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            {activity ? 'Save Changes' : 'Add Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
