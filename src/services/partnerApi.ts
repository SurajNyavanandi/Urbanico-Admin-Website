import { request } from './api';
import { IPartner, type KycStatus, IApiResponse } from '../types';

export async function fetchPartnersApi(): Promise<IPartner[]> {
  try {
    const res = await request<IApiResponse & { partners?: IPartner[]; data?: IPartner[] | { partners?: IPartner[] } }>('/api/partners');
    let list: IPartner[] = [];
    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (res.data?.partners && Array.isArray(res.data.partners)) {
      list = res.data.partners;
    } else if (res.partners && Array.isArray(res.partners)) {
      list = res.partners;
    }
    return list;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Urbanico] Partners API query:', msg);
    return [];
  }
}

export async function updatePartnerKycApi(
  partnerId: string,
  kycStatus: KycStatus
): Promise<{ success: boolean; partnerId: string; kycStatus: KycStatus }> {
  const res = await request<{ success: boolean; message: string }>(`/api/partners/${partnerId}/kyc`, {
    method: 'PATCH',
    body: JSON.stringify({ kycStatus }),
  });
  return { success: res.success ?? true, partnerId, kycStatus };
}
