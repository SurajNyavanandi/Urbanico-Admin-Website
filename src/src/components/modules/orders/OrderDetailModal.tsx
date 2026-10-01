import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { StatusBadge } from '../../common/StatusBadge';
import { IOrder, OrderStatus } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { emailTaxInvoiceApi } from '../../../services/orderApi';
import {
  MapPin,
  Phone,
  Mail,
  Truck,
  Send,
} from 'lucide-react';

interface OrderDetailModalProps {
  order: IOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    status: OrderStatus,
    extraFields?: {
      vehicleNumber?: string;
      driverName?: string;
      driverPhone?: string;
      eWayBillNo?: string;
    }
  ) => Promise<any>;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const LIFECYCLE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'received', label: 'Received' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onShowToast,
}) => {
  const [vehicleNumber, setVehicleNumber] = useState(order?.vehicleNumber || '');
  const [driverName, setDriverName] = useState(order?.driverName || '');
  const [driverPhone, setDriverPhone] = useState(order?.driverPhone || '');
  const [eWayBillNo, setEWayBillNo] = useState(order?.eWayBillNo || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  useEffect(() => {
    if (order) {
      setVehicleNumber(order.vehicleNumber || '');
      setDriverName(order.driverName || '');
      setDriverPhone(order.driverPhone || '');
      setEWayBillNo(order.eWayBillNo || '');
    }
  }, [order]);

  if (!order) return null;

  const handleAdvanceStatus = async (newStatus: OrderStatus) => {
    try {
      setIsUpdatingStatus(true);
      await onUpdateStatus(order._id, newStatus, {
        vehicleNumber: vehicleNumber.trim() || undefined,
        driverName: driverName.trim() || undefined,
        driverPhone: driverPhone.trim() || undefined,
        eWayBillNo: eWayBillNo.trim() || undefined,
      });
      onShowToast(
        'Order Updated',
        `Status successfully transitioned to ${newStatus.toUpperCase()}`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Update Failed', err.message || 'Could not update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveDispatchInfo = async () => {
    try {
      setIsUpdatingStatus(true);
      await onUpdateStatus(order._id, order.orderStatus, {
        vehicleNumber: vehicleNumber.trim(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        eWayBillNo: eWayBillNo.trim(),
      });
      onShowToast('Dispatch Saved', 'Vehicle and driver details updated', 'success');
    } catch (err: any) {
      onShowToast('Error', err.message || 'Failed to save dispatch details', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEmailInvoice = async () => {
    try {
      setIsSendingInvoice(true);
      const recipient = order.customerEmail || 'client@example.com';
      const res = await emailTaxInvoiceApi({
        orderNumber: order.orderNumber,
        invoiceNumber: `URB/2026/${order.orderNumber.replace(/[^0-9]/g, '')}`,
        recipientEmail: recipient,
        recipientName: order.customerName,
        recipientBusinessName: order.customerName,
        recipientGstin: order.gstin,
        totalAmount: order.totalAmount,
      });
      onShowToast('Tax Invoice Sent', `${res.message} (Tracking: ${res.trackingId})`, 'success');
    } catch (err: any) {
      onShowToast('Invoice Failed', err.message || 'Failed to email invoice', 'error');
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.orderNumber}`}
      subtitle={`Created on ${formatDate(order.createdAt)}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Status Stepper Pipeline */}
        <div className="bg-[#F5F5F7] rounded-[8px] p-5 border border-[#E5E5EA]">
          <div className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B] mb-4">
            Order Lifecycle Pipeline
          </div>
          <div className="flex items-stretch gap-2 overflow-x-auto pb-2 scrollbar-none">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={step.key}
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleAdvanceStatus(step.key)}
                  className={`flex-1 shrink-0 min-w-[110px] py-3 px-2 rounded-[8px] text-[13px] font-medium transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#0071E3] text-white shadow-md'
                      : isPast
                      ? 'bg-[#34C759]/10 text-[#34C759]'
                      : 'bg-white text-[#555555] hover:bg-[#E5E5EA] border border-[#E5E5EA]'
                  }`}
                  title={`Click to set status to ${step.label}`}
                >
                  <div className="truncate">{step.label}</div>
                  {isCurrent && <div className="text-[10px] opacity-90 font-normal mt-1">Active</div>}
                  {isPast && <div className="text-[10px] text-[#34C759] font-normal mt-1">✓ Done</div>}
                </button>
              );
            })}
          </div>

          {/* Quick status cancel button */}
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleAdvanceStatus('cancelled')}
                disabled={isUpdatingStatus}
                className="text-[13px] font-medium text-[#FF3B30] hover:underline"
              >
                Mark Order as Cancelled
              </button>
            </div>
          )}
        </div>

        {/* Customer & Site Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 space-y-3">
            <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B] block">
              Customer Profile
            </span>
            <div className="text-[15px] font-semibold text-[#000000]">{order.customerName}</div>
            <div className="flex items-center gap-2 text-[14px] text-[#000000] font-mono">
              <Phone className="w-[14px] h-[14px] text-[#86868B]" />
              <a href={`tel:${order.customerPhone}`} className="hover:text-[#0071E3] transition-colors">
                +91 {order.customerPhone}
              </a>
            </div>
            {order.customerEmail && (
              <div className="flex items-center gap-2 text-[13px] text-[#555555]">
                <Mail className="w-[14px] h-[14px]" />
                <span>{order.customerEmail}</span>
              </div>
            )}
            {order.gstin && (
              <div className="text-[13px] text-[#555555] pt-1">
                GSTIN: <span className="font-mono font-medium text-[#000000]">{order.gstin}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 space-y-3">
            <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B] block">
              Delivery Site Destination
            </span>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-[16px] h-[16px] text-[#0071E3] shrink-0 mt-0.5" />
              <div>
                <div className="text-[14px] font-semibold text-[#000000]">
                  {order.siteAddress?.siteName || 'Construction Site'}
                </div>
                <div className="text-[13px] text-[#555555] mt-1 leading-relaxed">
                  {order.siteAddress?.street}, {order.siteAddress?.city}, {order.siteAddress?.state} -{' '}
                  <span className="font-mono font-medium">{order.siteAddress?.pincode}</span>
                </div>
                {order.siteAddress?.landmark && (
                  <div className="text-[12px] text-[#555555] mt-1.5 font-normal">
                    Landmark: {order.siteAddress.landmark}
                  </div>
                )}
              </div>
            </div>
            {order.deliveryOtp && (
              <div className="pt-3 mt-3 border-t border-[#E5E5EA] flex items-center justify-between text-[13px]">
                <span className="text-[#555555]">Delivery Verification OTP:</span>
                <span className="font-mono font-medium bg-[#F5F5F7] px-2.5 py-1 rounded-[6px] border border-[#E5E5EA] text-[#000000]">
                  {order.deliveryOtp}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ordered Material Line Items */}
        <div className="bg-white rounded-[8px] border border-[#E5E5EA] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E5EA] bg-[#F5F5F7] flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B]">
              Ordered Materials ({order.items.length})
            </span>
            <span className="text-[12px] font-mono text-[#86868B]">HSN & Rate Breakdown</span>
          </div>
          <div className="divide-y divide-[#E5E5EA]">
            {order.items.map((item, i) => (
              <div key={i} className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-[#000000]">{item.name}</div>
                  <div className="text-[13px] text-[#555555] mt-1">
                    Category: {item.category} {item.hsnCode ? `• HSN: ${item.hsnCode}` : ''}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[15px] font-semibold font-mono text-[#000000]">
                    {formatCurrency(item.totalPrice)}
                  </div>
                  <div className="text-[12px] text-[#86868B] font-mono mt-1">
                    {item.quantity} {item.unit} @ {formatCurrency(item.unitPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Math Summary */}
          <div className="p-5 bg-[#F5F5F7] border-t border-[#E5E5EA] space-y-2 text-[13px]">
            <div className="flex justify-between text-[#555555]">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#555555]">
              <span>Tax / GST:</span>
              <span className="font-mono font-medium">{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-[#555555]">
              <span>Freight / Delivery Charges:</span>
              <span className="font-mono font-medium">{formatCurrency(order.deliveryCharges)}</span>
            </div>
            <div className="flex justify-between text-[#555555]">
              <span>Unloading Charges:</span>
              <span className="font-mono font-medium">{formatCurrency(order.unloadingCharges)}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-[#E5E5EA] flex justify-between text-[15px] font-semibold text-[#000000]">
              <span>Grand Total:</span>
              <span className="font-mono text-[18px] text-[#0071E3]">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 text-[13px]">
              <span className="text-[#555555]">Payment Method: {order.paymentMethod}</span>
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>
        </div>

        {/* Vehicle & Driver Dispatch Assignment (Zero telemetry, pure simple inputs) */}
        <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B] flex items-center gap-2">
              <Truck className="w-[16px] h-[16px] text-[#000000]" />
              Vehicle Dispatch Assignment
            </span>
            <span className="text-[12px] text-[#86868B]">Official Driver Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#555555] mb-1.5">
                Vehicle Plate Number
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. TS 07 UA 4821"
                className="w-full bg-[#F5F5F7] text-[14px] font-mono px-4 py-2.5 rounded-[8px] border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0071E3] transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#555555] mb-1.5">
                eWay Bill Number
              </label>
              <input
                type="text"
                value={eWayBillNo}
                onChange={(e) => setEWayBillNo(e.target.value)}
                placeholder="e.g. 361088218892"
                className="w-full bg-[#F5F5F7] text-[14px] font-mono px-4 py-2.5 rounded-[8px] border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0071E3] transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#555555] mb-1.5">
                Assigned Driver Name
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Ramesh Yadav"
                className="w-full bg-[#F5F5F7] text-[14px] px-4 py-2.5 rounded-[8px] border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0071E3] transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#555555] mb-1.5">
                Driver Phone
              </label>
              <input
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-[#F5F5F7] text-[14px] font-mono px-4 py-2.5 rounded-[8px] border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0071E3] transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={handleSaveDispatchInfo}
              disabled={isUpdatingStatus}
              className="w-full sm:w-auto py-[10px] px-6 rounded-[8px] bg-[#000000] text-white text-[14px] font-medium hover:bg-[#333333] active:scale-[0.98] transition-all"
            >
              Save Dispatch Details
            </button>
          </div>
        </div>

        {/* Site Delivery Notes if any */}
        {order.notes && (
          <div className="bg-[#F5F5F7] rounded-[8px] p-5 border border-[#E5E5EA] text-[13px]">
            <span className="font-semibold text-[#000000] block mb-2">Site Delivery Instructions:</span>
            <p className="text-[#555555] leading-relaxed">{order.notes}</p>
          </div>
        )}

        {/* Action CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E5EA]">
          <button
            type="button"
            onClick={handleEmailInvoice}
            disabled={isSendingInvoice}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-[8px] border border-[#E5E5EA] text-[14px] font-medium text-[#000000] hover:bg-[#F5F5F7] active:scale-[0.98] transition-all"
          >
            <Send className="w-[16px] h-[16px] text-[#0071E3]" />
            <span>{isSendingInvoice ? 'Dispatching...' : 'Email Official Tax Invoice'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-8 bg-[#0071E3] text-white text-[14px] font-medium rounded-[8px] hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
