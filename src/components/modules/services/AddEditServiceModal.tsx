import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { IService } from '../../../types';
import { Image as ImageIcon, Sparkles, X, Wrench } from 'lucide-react';

interface AddEditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: IService | null;
  onSave: (data: Partial<IService>, isEdit: boolean, id?: string) => Promise<any>;
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
    setImgPreviewError(false);
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
    } catch (err: any) {
      onShowToast('Save Error', err.message || 'Failed to save service', 'error');
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
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Trade Service Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mason & Bricklaying, Structural Welder"
            className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            required
          />
        </div>

        {/* Service Image URL with Live Preview & Quick Presets */}
        <div className="bg-[#F9F9FB] rounded-xl p-3 border border-[#E5E5EA]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#1D1D1F] uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#007AFF]" />
              Trade Image URL
            </label>
            {image && (
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setImgPreviewError(false);
                }}
                className="text-[11px] text-[#86868B] hover:text-[#FF3B30] flex items-center gap-0.5"
              >
                <X className="w-3 h-3" /> Clear Image
              </button>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#E5E5EA] shrink-0 flex items-center justify-center relative shadow-sm">
              {image && !imgPreviewError ? (
                <img
                  src={image}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setImgPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#86868B] p-1 text-center">
                  <Wrench className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] leading-tight">No Image</span>
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
                placeholder="https://... service photo URL (Cloudinary, Unsplash)"
                className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#E5E5EA] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 font-mono"
              />

              {/* Quick Image Presets */}
              <div className="mt-2">
                <span className="text-[10px] text-[#86868B] mb-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-2.5 h-2.5 text-[#007AFF]" /> Quick Trade Presets:
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
                      className="px-2 py-0.5 rounded text-[10px] bg-white text-[#555558] hover:text-[#007AFF] hover:border-[#007AFF] border border-[#E5E5EA] transition-colors"
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
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              Subtitle / Specialization
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Tile & Brickwork Masters"
              className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              Contractor Rate *
            </label>
            <input
              type="text"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. ₹99 Demo Visit, ₹750/Day"
              className="w-full bg-[#F5F5F7] text-sm font-mono px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Tag Badge
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="SERVICES, FABRICATION, ELECTRICAL"
            className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Scope Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the tasks, tools provided, and site preparation required..."
            className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#E5E5EA]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto py-[10px] px-6 rounded-[8px] border border-[#E5E5EA] text-[14px] font-medium text-[#000000] hover:bg-[#F5F5F7] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto py-[10px] px-6 rounded-[8px] bg-[#0071E3] text-white text-[14px] font-medium hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
