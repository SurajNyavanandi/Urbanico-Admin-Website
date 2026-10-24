import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { IService } from '../../../types';
import { Image as ImageIcon, Sparkles, X, Wrench } from 'lucide-react';

interface AddEditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: IService | null;
  onSave: (data: Partial<IService>, isEdit: boolean, id?: string) => Promise<unknown>;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const SERVICE_IMAGE_PRESETS = [
  { label: 'Mason', url: 'https://res.cloudinary.com/dfr0zghtc/image/upload/v1786705284/mason_nxpwh5.jpg' },
  { label: 'Painter', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80' },
  { label: 'Fabricator', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Electrician', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80' },
  { label: 'Plumber', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80' },
  { label: 'Carpenter', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80' },
];

export const AddEditServiceModal: React.FC<AddEditServiceModalProps> = ({
  isOpen,
  onClose,
  service,
  onSave,
  onShowToast,
}) => {
  const isEdit = Boolean(service);

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('SERVICES');
  const [image, setImage] = useState('');
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      if (service) {
        setName(service.name || '');
        setSubtitle(service.subtitle || '');
        setRate(service.rate || '');
        setDescription(service.description || '');
        setTag(service.tag || 'SERVICES');
        setImage(service.image || '');
      } else {
        setName('');
        setSubtitle('');
        setRate('₹99 Demo Visit');
        setDescription('');
        setTag('SERVICES');
        setImage('https://res.cloudinary.com/dfr0zghtc/image/upload/v1786705284/mason_nxpwh5.jpg');
      }
    });
  }, [service, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('Error', 'Service name is required', 'error');
      return;
    }

    if (!rate.trim()) {
      onShowToast('Error', 'Standard rate is required', 'error');
      return;
    }

    const payload: Partial<IService> = {
      name: name.trim(),
      subtitle: subtitle.trim(),
      rate: rate.trim(),
      description: description.trim(),
      tag: tag.trim().toUpperCase() || 'SERVICES',
      image: image.trim() || undefined,
      active: true,
    };

    try {
      setIsLoading(true);
      await onSave(payload, isEdit, service?._id || service?.id);
      onShowToast(
        isEdit ? 'Service Updated' : 'Service Created',
        `${name} contractor listing saved with image URL.`,
        'success'
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save service';
      onShowToast('Save Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Contractor Trade & Image' : 'Add Trade Service Listing'}
      subtitle="Define contractor team specifications, day-shift rates & image URL"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
            Trade Service Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mason & Bricklaying, Structural Welder"
            className="w-full bg-zinc-800 text-zinc-100 text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all placeholder-zinc-500"
            required
          />
        </div>

        {/* Service Image URL with Live Preview & Quick Presets */}
        <div className="bg-zinc-800/60 rounded-xl p-3.5 border border-zinc-700/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
              Trade Image URL
            </label>
            {image && (
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setImgPreviewError(false);
                }}
                className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear Image
              </button>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0 flex items-center justify-center relative shadow-inner">
              {image && !imgPreviewError ? (
                <img
                  src={image}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setImgPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500 p-1 text-center">
                  <Wrench className="w-5 h-5 mb-0.5 text-yellow-500/60" />
                  <span className="text-[9px] leading-tight text-zinc-400">No Image</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="url"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setImgPreviewError(false);
                }}
                placeholder="https://... service photo URL"
                className="w-full bg-zinc-800 text-zinc-100 text-xs px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 font-mono placeholder-zinc-500"
              />

              {/* Quick Image Presets */}
              <div className="mt-2.5">
                <span className="text-[10px] text-zinc-400 mb-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-400" /> Quick Trade Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {SERVICE_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setImage(preset.url);
                        setImgPreviewError(false);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 hover:text-yellow-400 hover:border-yellow-500/50 border border-zinc-700 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Subtitle / Specialization
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Tile & Brickwork Masters"
              className="w-full bg-zinc-800 text-zinc-100 text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Contractor Rate *
            </label>
            <input
              type="text"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. ₹99 Demo Visit, ₹750/Day"
              className="w-full bg-zinc-800 text-zinc-100 text-sm font-mono px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all placeholder-zinc-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
            Tag Badge
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="SERVICES, FABRICATION, ELECTRICAL"
            className="w-full bg-zinc-800 text-zinc-100 text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
            Scope Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the tasks, tools provided, and site preparation required..."
            className="w-full bg-zinc-800 text-zinc-100 text-sm px-3.5 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all placeholder-zinc-500"
          />
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto py-2.5 px-6 rounded-lg border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-yellow-500 text-zinc-950 text-sm font-semibold hover:bg-yellow-400 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-yellow-500/10"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
