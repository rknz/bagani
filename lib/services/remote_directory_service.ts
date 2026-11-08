/**
 * BAGANI — Remotely Updatable Contact/Nursery Database & Gardener Experience Insights Vault
 * Implements:
 * - Requirement 7: Master JSON Data File (`assets/data/remote_master_contacts.json`) + Remote HTTP JSON Sync
 *   so new nurseries, renowned gardeners, and agri contacts can be injected anytime and auto-matched by user district.
 * - Requirement 8: Gardener Experience & Key Insights Collection System for software improvement & community sharing.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import masterContactsData from '../../assets/data/remote_master_contacts.json';

export type MasterContactCategory = 'nursery' | 'gardener' | 'agri_office';

export interface MasterContactEntry {
  id: string;
  category: MasterContactCategory;
  nameBn: string;
  nameEn: string;
  district: string;
  districtEn: string;
  address: string;
  phone: string;
  specialtyBn: string;
  specialtyEn: string;
  isVerified: boolean;
}

export interface GardenerExperienceInsight {
  id: string;
  authorName: string;
  district: string;
  plantName: string;
  varietyName: string;
  containerAndSoilUsed: string;
  keySuccessOrPruningTip: string;
  diseaseOrChallengeSolved?: string;
  yieldResultSummary: string;
  helpfulCount: number;
  createdAtIso: string;
}

const REMOTE_CONTACTS_CACHE_KEY = '@bagani_remote_master_contacts_v1';
const REMOTE_ENDPOINT_URL_KEY = '@bagani_remote_endpoint_url_v1';
const EXPERIENCES_STORAGE_KEY = '@bagani_gardener_experiences_v1';

const INITIAL_EXPERIENCES: GardenerExperienceInsight[] = [
  {
    id: 'exp_1',
    authorName: 'আনোয়ার হোসেন',
    district: 'জামালপুর (ময়মনসিংহ)',
    plantName: 'কাটিমন আম (Katimon Mango)',
    varietyName: 'থাই কাটিমন-১২',
    containerAndSoilUsed:
      '২৪ ইঞ্চি জিও ব্যাগ • ৫০% দোআঁশ মাটি + ৩৫% ভার্মিকম্পোস্ট + হাড়ের গুঁড়ো ৩০০ গ্রাম',
    keySuccessOrPruningTip:
      'সেপ্টেম্বর মাসে ফল তোলার পর বোঁটার নিচে ৪ ইঞ্চি ছেঁটে কপার অক্সিক্লোরাইড লাগিয়েছিলাম। প্রতিটি কাটা ডাল থেকে ৩টি করে নতুন শাখা বের হয়ে পরের মৌসুমে দ্বিগুণ মুকুল এসেছে।',
    diseaseOrChallengeSolved:
      'মুকুল ফোটার আগে ১ বার ম্যানকোজেব + ইমিডাক্লোপ্রিড স্প্রে করায় একটি মুকুলও কালো হয়নি।',
    yieldResultSummary: '১টি ২৪ ইঞ্চি জিও ব্যাগের গাছ থেকে বছরে ৩ বারে মোট ১৮ কেজি মিষ্টি আম পেয়েছি।',
    helpfulCount: 34,
    createdAtIso: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: 'exp_2',
    authorName: 'ডা. ফাতেমা জোহরা',
    district: 'ঢাকা',
    plantName: 'সবেদা (Sapodilla)',
    varietyName: 'থাই লম্বা বারোমাসি সবেদা',
    containerAndSoilUsed:
      '২০ ইঞ্চি জিও ব্যাগ • বেলে-দোআঁশ মাটি + ভার্মিকম্পোস্ট + ৫০ গ্রাম ডলোমাইট চুন',
    keySuccessOrPruningTip:
      'নতুন ডাল ১৮ ইঞ্চি লম্বা হলেই ডগার ১ ইঞ্চি চিমটি দিয়ে পিঞ্চিং করে দেই। এতে গাছ ঝোপালো হয় এবং প্রতি পাতার গোড়ায় সবেদা ধরে।',
    diseaseOrChallengeSolved:
      'কচি পাতায় পাতা-মোড়ানো পোকা হলে নিম তেল ৫ মি.লি./লিটার স্প্রে করে ৩ দিনেই সমাধান পেয়েছি।',
    yieldResultSummary: 'সারা বছর গাছে ৭০–৮০টি করে মিষ্টি সবেদা সবসময় থাকে।',
    helpfulCount: 28,
    createdAtIso: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'exp_3',
    authorName: 'রফিকুল ইসলাম',
    district: 'ময়মনসিংহ',
    plantName: 'লাউ ও শসা (Bottle Gourd)',
    varietyName: 'বারি লাউ-৪',
    containerAndSoilUsed:
      'হাফ-ড্রাম (১০০ লিটার) • ৫০% পচা গোবর ও ভার্মিকম্পোস্ট + ৫০% দোআঁশ মাটি',
    keySuccessOrPruningTip:
      'মূল লতা ৮ ফুট হলে ডগা কেটে 3G Cutting পদ্ধতি প্রয়োগ করেছি এবং প্রতিদিন সকাল ৮টায় হাত দিয়ে কৃত্রিম পরাগায়ন করেছি।',
    diseaseOrChallengeSolved:
      'মাচায় ফেরোমন ট্র্যাপ ঝুলিয়ে দেওয়ায় মাছি পোকার আক্রমণ একদম হয়নি।',
    yieldResultSummary: 'একটি মাত্র হাফ-ড্রামের গাছ থেকে ১ মৌসুমে ৪২টি লাউ সংগ্রহ করেছি!',
    helpfulCount: 41,
    createdAtIso: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export class RemoteDirectoryService {
  /**
   * Load all master contacts (merging bundled JSON file + cached remote/injected entries)
   */
  static async getAllContacts(): Promise<MasterContactEntry[]> {
    const bundled = (masterContactsData.contacts || []) as MasterContactEntry[];
    try {
      const raw = await AsyncStorage.getItem(REMOTE_CONTACTS_CACHE_KEY);
      if (!raw) {
        return bundled;
      }
      const cached = JSON.parse(raw) as MasterContactEntry[];
      const map = new Map<string, MasterContactEntry>();
      for (const item of bundled) map.set(item.id, item);
      for (const item of cached) map.set(item.id, item);
      return Array.from(map.values());
    } catch {
      return bundled;
    }
  }

  /**
   * Filter contacts that match the user's current district (or return all with district matches prioritized first)
   */
  static async getContactsForLocation(userDistrict: string): Promise<{
    matchedDistrictContacts: MasterContactEntry[];
    otherDistrictContacts: MasterContactEntry[];
  }> {
    const all = await this.getAllContacts();
    const normUser = userDistrict.toLowerCase().trim();

    const matched: MasterContactEntry[] = [];
    const others: MasterContactEntry[] = [];

    for (const c of all) {
      const dBn = c.district.toLowerCase();
      const dEn = c.districtEn.toLowerCase();
      if (
        dBn.includes(normUser) ||
        normUser.includes(dBn) ||
        dEn.includes(normUser) ||
        normUser.includes(dEn)
      ) {
        matched.push(c);
      } else {
        others.push(c);
      }
    }

    return {
      matchedDistrictContacts: matched,
      otherDistrictContacts: others,
    };
  }

  /**
   * Fetch and inject updates from a remote JSON file URL (post-release remote database injection)
   */
  static async syncFromRemoteJsonUrl(customUrl?: string): Promise<{
    success: boolean;
    totalCount: number;
    endpointUsed: string;
  }> {
    const endpoint =
      customUrl?.trim() ||
      (await AsyncStorage.getItem(REMOTE_ENDPOINT_URL_KEY)) ||
      masterContactsData.remoteSyncEndpoint;

    if (customUrl?.trim()) {
      await AsyncStorage.setItem(REMOTE_ENDPOINT_URL_KEY, customUrl.trim());
    }

    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const json = await res.json();
        const remoteContacts: MasterContactEntry[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.contacts)
          ? json.contacts
          : [];
        if (remoteContacts.length > 0) {
          const existing = await this.getAllContacts();
          const map = new Map<string, MasterContactEntry>();
          for (const item of existing) map.set(item.id, item);
          for (const item of remoteContacts) map.set(item.id, item);
          const merged = Array.from(map.values());
          await AsyncStorage.setItem(
            REMOTE_CONTACTS_CACHE_KEY,
            JSON.stringify(merged)
          );
          return {
            success: true,
            totalCount: merged.length,
            endpointUsed: endpoint,
          };
        }
      }
    } catch {
      // Fallback to local master file if remote URL is offline
    }

    const current = await this.getAllContacts();
    return {
      success: true,
      totalCount: current.length,
      endpointUsed: 'assets/data/remote_master_contacts.json',
    };
  }

  /**
   * Manually inject a new Nursery / Gardener / Agri Contact entry into the database
   */
  static async injectNewContact(
    entry: Omit<MasterContactEntry, 'id'>
  ): Promise<MasterContactEntry[]> {
    const current = await this.getAllContacts();
    const created: MasterContactEntry = {
      ...entry,
      id: 'rc_custom_' + Date.now().toString(36),
    };
    const updated = [created, ...current];
    await AsyncStorage.setItem(
      REMOTE_CONTACTS_CACHE_KEY,
      JSON.stringify(updated)
    );
    return updated;
  }

  /**
   * Requirement 8: Gardener Experience & Insights Collection Vault
   */
  static async getExperiences(): Promise<GardenerExperienceInsight[]> {
    try {
      const raw = await AsyncStorage.getItem(EXPERIENCES_STORAGE_KEY);
      if (!raw) {
        await AsyncStorage.setItem(
          EXPERIENCES_STORAGE_KEY,
          JSON.stringify(INITIAL_EXPERIENCES)
        );
        return INITIAL_EXPERIENCES;
      }
      return JSON.parse(raw) as GardenerExperienceInsight[];
    } catch {
      return INITIAL_EXPERIENCES;
    }
  }

  static async submitExperience(
    input: Omit<
      GardenerExperienceInsight,
      'id' | 'helpfulCount' | 'createdAtIso'
    >
  ): Promise<GardenerExperienceInsight[]> {
    const current = await this.getExperiences();
    const created: GardenerExperienceInsight = {
      ...input,
      id: 'exp_' + Date.now().toString(36),
      helpfulCount: 1,
      createdAtIso: new Date().toISOString(),
    };
    const updated = [created, ...current];
    await AsyncStorage.setItem(
      EXPERIENCES_STORAGE_KEY,
      JSON.stringify(updated)
    );
    return updated;
  }

  static async markExperienceHelpful(
    id: string
  ): Promise<GardenerExperienceInsight[]> {
    const current = await this.getExperiences();
    const updated = current.map((e) =>
      e.id === id ? { ...e, helpfulCount: e.helpfulCount + 1 } : e
    );
    await AsyncStorage.setItem(
      EXPERIENCES_STORAGE_KEY,
      JSON.stringify(updated)
    );
    return updated;
  }
}

