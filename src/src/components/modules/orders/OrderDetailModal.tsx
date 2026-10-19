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
  ) => Promise<any>;
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
    activeColor: 'text-[#B45309]',
    activeBg: 'bg-[#FFF8EB]',
    activeBorder: 'border-[#F59E0B]',
    dotColor: 'bg-[#F59E0B]',
  },
  {
    key: 'in_transit',
    label: 'En-Route to Site',
    sublabel: 'Transit & GPS',
    activeColor: 'text-[#0071E3]',
    activeBg: 'bg-[#EBF5FF]',
    activeBorder: 'border-[#0071E3]',
    dotColor: 'bg-[#0071E3]',
  },
  {
    key: 'unloading',
    label: 'Unloading',
    sublabel: 'Site Destination',
    activeColor: 'text-[#7C3AED]',
    activeBg: 'bg-[#F5F3FF]',
    activeBorder: 'border-[#8B5CF6]',
    dotColor: 'bg-[#8B5CF6]',
  },
  {
    key: 'delivered',
    label: 'Complete',
    sublabel: 'Delivered & Signed',
    activeColor: 'text-[#047857]',
    activeBg: 'bg-[#ECFDF5]',
    activeBorder: 'border-[#10B981]',
    dotColor: 'bg-[#10B981]',
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
      setVehicleNumber(order.vehicleNumber || '');
      setDriverName(order.driverName || '');
      setDriverPhone(order.driverPhone || '');
      setEWayBillNo(order.eWayBillNo || '');
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
      onShowToast('Dispatch Saved', 'Vehicle, driver, and e-Way Bill details synced', 'success');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.orderNumber}`}
      subtitle={`Created on ${formatDate(order.createdAt)}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Fleet Dispatch Status Pills (Apple-style interactive progression) */}
        <div className="bg-[#F5F5F7] rounded-[8px] p-5 border border-[#E5E5EA]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B]">
              Fleet & Dispatch Operations Status
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555555]">Current:</span>
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
                  className={`p-3 rounded-[8px] border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-[72px] ${
                    active
                      ? `${pill.activeBg} ${pill.activeBorder} ${pill.activeColor} shadow-sm ring-1 ring-[#0071E3]/20`
                      : past
                      ? 'bg-[#E8F5E9]/60 border-[#C8E6C9] text-[#2E7D32] hover:bg-[#E8F5E9]'
                      : 'bg-white border-[#E5E5EA] text-[#555555] hover:bg-[#F5F5F7]'
                  }`}
                  title={`Click to update order status to ${pill.label}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active ? pill.dotColor : past ? 'bg-[#4CAF50]' : 'bg-[#D2D2D7]'
                      }`}
                    />
                    {active ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/80 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : past ? (
                      <span className="text-[10px] font-medium text-[#2E7D32] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold truncate leading-tight">
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
          <div className="mt-4 pt-3 border-t border-[#E5E5EA] flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2">
              <span className="text-[#86868B] text-[12px]">Order Gate:</span>
              {order.orderStatus === 'received' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus('confirmed')}
                  disabled={isUpdatingStatus}
                  className="px-2.5 py-1 rounded-[6px] text-[12px] bg-white border border-[#E5E5EA] text-[#0071E3] font-medium hover:bg-[#F5F5F7]"
                >
                  Confirm Order
                </button>
              )}
              {order.orderStatus !== 'received' && order.orderStatus !== 'confirmed' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus('confirmed')}
                  disabled={isUpdatingStatus}
                  className="text-[12px] text-[#86868B] hover:text-[#000000] underline"
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
                className="text-[12px] font-medium text-[#FF3B30] hover:underline"
              >
                Mark as Cancelled
              </button>
            )}
          </div>
        </div>

        {/* Fleet Dispatch & e-Way Bill Assignment Section */}
        <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B] flex items-center gap-2">
              <Truck className="w-[16px] h-[16px] text-[#0071E3]" />
              Fleet Dispatch & e-Way Bill Assignment
            </span>
            <span className="text-[12px] text-[#86868B]">Official Consignment Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle Registration Number */}
            <div>
              <label className="block text-[12px] font-medium text-[#555555] mb-1.5 flex items-center justify-between">
                <span>Vehicle Registration Number</span>
                <span className="text-[11px] text-[#86868B] font-mono">TS / AP Series</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. TS 08 UA 4921"
                  style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace' }}
                  className="w-full h-[44px] bg-[#F5F5F7] text-[14px] font-mono px-4 rounded-[8px] border border-[#E5E5EA] text-[#000000] uppercase placeholder:normal-case placeholder:font-sans focus:bg-white focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* e-Way Bill Number (Consolas Monospace Format) */}
            <div>
              <label className="block text-[12px] font-medium text-[#555555] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#0071E3]" />
                  e-Way Bill Number
                </span>
                <span className="text-[11px] text-[#86868B] font-mono">Consolas Monospace</span>
              </label>
              <input
                type="text"
                value={eWayBillNo}
                onChange={(e) => setEWayBillNo(e.target.value)}
                placeholder="e.g. 361088218892"
                style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace' }}
                className="w-full h-[44px] bg-[#F5F5F7] text-[14px] px-4 rounded-[8px] border border-[#E5E5EA] text-[#000000] tracking-wider placeholder:font-sans focus:bg-white focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] focus:outline-none transition-all"
              />
              <p className="text-[11px] text-[#86868B] mt-1 font-sans">
                Indian GST statutory requirement for consignments exceeding ₹50,000.
              </p>
            </div>

            {/* Driver Name */}
            <div>
              <label className="block text-[12px] font-medium text-[#555555] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#86868B]" />
                <span>Assigned Driver Name</span>
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Ramesh Yadav"
                className="w-full h-[44px] bg-[#F5F5F7] text-[14px] px-4 rounded-[8px] border border-[#E5E5EA] text-[#000000] focus:bg-white focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] focus:outline-none transition-all"
              />
            </div>

            {/* Driver Mobile Number */}
            <div>
              <label className="block text-[12px] font-medium text-[#555555] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#86868B]" />
                <span>Driver Mobile Number</span>
              </label>
              <input
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace' }}
                className="w-full h-[44px] bg-[#F5F5F7] text-[14px] px-4 rounded-[8px] border border-[#E5E5EA] text-[#000000] focus:bg-white focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[12px] text-[#86868B]">
              Syncs directly with <span className="font-mono">PATCH /api/orders/:id/status</span>
            </div>
            <button
              type="button"
              onClick={handleSaveDispatchInfo}
              disabled={isUpdatingStatus}
              className="py-[10px] px-6 rounded-[8px] bg-[#0071E3] text-white text-[14px] font-medium hover:bg-blue-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              {isUpdatingStatus ? 'Saving Dispatch...' : 'Save Dispatch Details'}
            </button>
          </div>
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
              <span>Tax / GST (18%):</span>
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-[8px] border border-[#E5E5EA] text-[14px] font-medium text-[#000000] hover:bg-[#F5F5F7] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Send className="w-[16px] h-[16px] text-[#0071E3]" />
            <span>{isSendingInvoice ? 'Dispatching...' : 'Email Official 18% Tax Invoice'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-8 bg-[#0071E3] text-white text-[14px] font-medium rounded-[8px] hover:bg-blue-600 active:scale-[0.98] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
