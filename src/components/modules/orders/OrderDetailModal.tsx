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
  FileText,
  User,
  CheckCircle2,
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
  ) => Promise<unknown>;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

interface FleetStatusPill {
  key: OrderStatus;
  label: string;
  sublabel: string;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  dotColor: string;
}

const FLEET_STATUS_PILLS: FleetStatusPill[] = [
  {
    key: 'processing',
    label: 'Loading at Quarry',
    sublabel: 'Quarry Loading',
    activeColor: 'text-yellow-400',
    activeBg: 'bg-yellow-500/20',
    activeBorder: 'border-yellow-500',
    dotColor: 'bg-yellow-400',
  },
  {
    key: 'in_transit',
    label: 'En-Route to Site',
    sublabel: 'Transit & GPS',
    activeColor: 'text-purple-400',
    activeBg: 'bg-purple-500/20',
    activeBorder: 'border-purple-500',
    dotColor: 'bg-purple-400',
  },
  {
    key: 'unloading',
    label: 'Unloading',
    sublabel: 'Site Destination',
    activeColor: 'text-purple-400',
    activeBg: 'bg-purple-500/20',
    activeBorder: 'border-purple-500',
    dotColor: 'bg-purple-400',
  },
  {
    key: 'delivered',
    label: 'Complete',
    sublabel: 'Delivered & Signed',
    activeColor: 'text-emerald-400',
    activeBg: 'bg-emerald-500/20',
    activeBorder: 'border-emerald-500',
    dotColor: 'bg-emerald-400',
  },
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
      queueMicrotask(() => {
        setVehicleNumber(order.vehicleNumber || '');
        setDriverName(order.driverName || '');
        setDriverPhone(order.driverPhone || '');
        setEWayBillNo(order.eWayBillNo || '');
      });
    }
  }, [order]);

  if (!order) return null;

  // Determine which fleet pill is currently active
  const isPillActive = (pillKey: OrderStatus) => {
    if (order.orderStatus === pillKey) return true;
    if (pillKey === 'in_transit' && order.orderStatus === 'dispatched') return true;
    return false;
  };

  // Check if a fleet stage is past (already completed)
  const isPillPast = (pillKey: OrderStatus) => {
    const orderHierarchy: Record<string, number> = {
      received: 0,
      confirmed: 1,
      processing: 2,
      dispatched: 3,
      in_transit: 3,
      unloading: 4,
      delivered: 5,
      cancelled: -1,
    };
    const currentRank = orderHierarchy[order.orderStatus] ?? 0;
    const pillRank = orderHierarchy[pillKey] ?? 0;
    return currentRank > pillRank;
  };

  const handleAdvanceStatus = async (newStatus: OrderStatus) => {
    try {
      setIsUpdatingStatus(true);
      await onUpdateStatus(order._id, newStatus, {
        vehicleNumber: vehicleNumber.trim() || undefined,
        driverName: driverName.trim() || undefined,
        driverPhone: driverPhone.trim() || undefined,
        eWayBillNo: eWayBillNo.trim() || undefined,
      });

      const pillMatch = FLEET_STATUS_PILLS.find((p) => p.key === newStatus);
      const label = pillMatch ? pillMatch.label : newStatus.toUpperCase();
      onShowToast('Fleet Status Synchronized', `Order transitioned to ${label}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update status';
      onShowToast('Update Failed', msg, 'error');
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
      onShowToast('Dispatch Saved', 'Vehicle, driver, and e-Way Bill details synced', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save dispatch details';
      onShowToast('Error', msg, 'error');
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to email invoice';
      onShowToast('Invoice Failed', msg, 'error');
    } finally {
      setIsSendingInvoice(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.orderNumber}`}
      subtitle={`Created on ${formatDate(order.createdAt)}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-zinc-50">
        {/* Fleet Dispatch Status Pills */}
        <div className="bg-[#18181B] rounded-xl p-5 border border-[#3F3F46]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Fleet & Dispatch Operations Status
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Current:</span>
              <StatusBadge status={order.orderStatus} type="order" />
            </div>
          </div>

          {/* 4 Core Fleet Status Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FLEET_STATUS_PILLS.map((pill) => {
              const active = isPillActive(pill.key);
              const past = isPillPast(pill.key);

              return (
                <button
                  key={pill.key}
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleAdvanceStatus(pill.key)}
                  className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-[76px] ${
                    active
                      ? `${pill.activeBg} ${pill.activeBorder} ${pill.activeColor} shadow-md`
                      : past
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-[#27272A] border-[#3F3F46] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  }`}
                  title={`Click to update order status to ${pill.label}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active ? pill.dotColor : past ? 'bg-emerald-400' : 'bg-zinc-600'
                      }`}
                    />
                    {active ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-950/80 px-1.5 py-0.5 rounded text-yellow-400 border border-yellow-500/30">
                        Active
                      </span>
                    ) : past ? (
                      <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <div className="text-xs font-bold truncate leading-tight">
                      {pill.label}
                    </div>
                    <div className="text-[11px] opacity-75 truncate mt-0.5">
                      {pill.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secondary Workflow Status Options */}
          <div className="mt-4 pt-3 border-t border-[#3F3F46] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs">Order Gate:</span>
              {order.orderStatus === 'received' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus('confirmed')}
                  disabled={isUpdatingStatus}
                  className="px-2.5 py-1 rounded-md text-xs bg-yellow-500 text-zinc-950 font-bold hover:bg-yellow-400 cursor-pointer"
                >
                  Confirm Order
                </button>
              )}
              {order.orderStatus !== 'received' && order.orderStatus !== 'confirmed' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus('confirmed')}
                  disabled={isUpdatingStatus}
                  className="text-xs text-zinc-400 hover:text-yellow-400 underline cursor-pointer"
                >
                  Reset to Confirmed
                </button>
              )}
            </div>

            {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus('cancelled')}
                disabled={isUpdatingStatus}
                className="text-xs font-semibold text-red-400 hover:underline cursor-pointer"
              >
                Mark as Cancelled
              </button>
            )}
          </div>
        </div>

        {/* Fleet Dispatch & e-Way Bill Assignment Section */}
        <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Truck className="w-4 h-4 text-yellow-400" />
              Fleet Dispatch & e-Way Bill Assignment
            </span>
            <span className="text-xs text-zinc-400">Official Consignment Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle Registration Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Vehicle Registration Number</span>
                <span className="text-[11px] text-zinc-500 font-mono">TS / AP Series</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. TS 08 UA 4921"
                  className="w-full h-10 bg-[#27272A] text-xs font-mono px-4 rounded-lg border border-[#3F3F46] text-zinc-100 uppercase placeholder:normal-case placeholder:font-sans focus:border-yellow-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* e-Way Bill Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-yellow-400" />
                  e-Way Bill Number
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Monospace</span>
              </label>
              <input
                type="text"
                value={eWayBillNo}
                onChange={(e) => setEWayBillNo(e.target.value)}
                placeholder="e.g. 361088218892"
                className="w-full h-10 bg-[#27272A] text-xs font-mono px-4 rounded-lg border border-[#3F3F46] text-zinc-100 tracking-wider placeholder:font-sans focus:border-yellow-500 focus:outline-none transition-all"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Indian GST statutory requirement for consignments exceeding ₹50,000.
              </p>
            </div>

            {/* Driver Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Assigned Driver Name</span>
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Ramesh Yadav"
                className="w-full h-10 bg-[#27272A] text-xs px-4 rounded-lg border border-[#3F3F46] text-zinc-100 focus:border-yellow-500 focus:outline-none transition-all"
              />
            </div>

            {/* Driver Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Driver Mobile Number</span>
              </label>
              <input
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full h-10 bg-[#27272A] text-xs px-4 rounded-lg border border-[#3F3F46] text-zinc-100 focus:border-yellow-500 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-zinc-500 font-mono">
              PATCH /api/orders/:id/status
            </div>
            <button
              type="button"
              onClick={handleSaveDispatchInfo}
              disabled={isUpdatingStatus}
              className="py-2 px-5 rounded-lg bg-yellow-500 text-zinc-950 text-xs font-bold hover:bg-yellow-400 active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              {isUpdatingStatus ? 'Saving Dispatch...' : 'Save Dispatch Details'}
            </button>
          </div>
        </div>

        {/* Customer & Site Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Customer Profile
            </span>
            <div className="text-base font-bold text-zinc-100">{order.customerName}</div>
            <div className="flex items-center gap-2 text-xs text-zinc-200 font-mono">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <a href={`tel:${order.customerPhone}`} className="hover:text-yellow-400 transition-colors">
                +91 {order.customerPhone}
              </a>
            </div>
            {order.customerEmail && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>{order.customerEmail}</span>
              </div>
            )}
            {order.gstin && (
              <div className="text-xs text-zinc-400 pt-1">
                GSTIN: <span className="font-mono font-bold text-zinc-100">{order.gstin}</span>
              </div>
            )}
          </div>

          <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Delivery Site Destination
            </span>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-zinc-100">
                  {order.siteAddress?.siteName || 'Construction Site'}
                </div>
                <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {order.siteAddress?.street}, {order.siteAddress?.city}, {order.siteAddress?.state} -{' '}
                  <span className="font-mono font-bold text-zinc-200">{order.siteAddress?.pincode}</span>
                </div>
                {order.siteAddress?.landmark && (
                  <div className="text-xs text-zinc-400 mt-1.5">
                    Landmark: {order.siteAddress.landmark}
                  </div>
                )}
              </div>
            </div>
            {order.deliveryOtp && (
              <div className="pt-3 mt-3 border-t border-[#3F3F46] flex items-center justify-between text-xs">
                <span className="text-zinc-400">Delivery OTP:</span>
                <span className="font-mono font-bold bg-[#27272A] px-2.5 py-1 rounded-md border border-[#3F3F46] text-yellow-400">
                  {order.deliveryOtp}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ordered Material Line Items */}
        <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#3F3F46] bg-[#27272A] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Ordered Materials ({order.items.length})
            </span>
            <span className="text-xs font-mono text-zinc-400">HSN & Rate Breakdown</span>
          </div>
          <div className="divide-y divide-[#3F3F46]">
            {order.items.map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-zinc-100">{item.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Category: {item.category} {item.hsnCode ? `• HSN: ${item.hsnCode}` : ''}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-zinc-100">
                    {formatCurrency(item.totalPrice)}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    {item.quantity} {item.unit} @ {formatCurrency(item.unitPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Math Summary */}
          <div className="p-5 bg-[#27272A] border-t border-[#3F3F46] space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-zinc-200">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Tax / GST (18%):</span>
              <span className="font-mono font-semibold text-zinc-200">{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Freight / Delivery Charges:</span>
              <span className="font-mono font-semibold text-zinc-200">{formatCurrency(order.deliveryCharges)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Unloading Charges:</span>
              <span className="font-mono font-semibold text-zinc-200">{formatCurrency(order.unloadingCharges)}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-[#3F3F46] flex justify-between text-sm font-bold text-zinc-50">
              <span>Grand Total:</span>
              <span className="font-mono text-lg text-yellow-400">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 text-xs">
              <span className="text-zinc-400">Payment Method: {order.paymentMethod}</span>
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>
        </div>

        {/* Site Delivery Notes if any */}
        {order.notes && (
          <div className="bg-[#18181B] rounded-xl p-4 border border-[#3F3F46] text-xs">
            <span className="font-bold text-zinc-100 block mb-1">Site Delivery Instructions:</span>
            <p className="text-zinc-400 leading-relaxed">{order.notes}</p>
          </div>
        )}

        {/* Action CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#3F3F46]">
          <button
            type="button"
            onClick={handleEmailInvoice}
            disabled={isSendingInvoice}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg border border-[#3F3F46] bg-[#27272A] text-xs font-bold text-zinc-100 hover:bg-zinc-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-yellow-400" />
            <span>{isSendingInvoice ? 'Dispatching...' : 'Email Official 18% Tax Invoice'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-8 bg-yellow-500 text-zinc-950 text-xs font-bold rounded-lg hover:bg-yellow-400 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

