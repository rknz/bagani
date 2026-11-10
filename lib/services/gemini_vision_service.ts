/**
 * BAGANI — Gemini 1.5 Flash Vision AI Botanical Diagnostic Engine
 * Developer: ProFix - Web & Soft
 *
 * Integrates Google Gemini 1.5 Flash Vision API for real visual ML inference on
 * captured plant and leaf photos. Detects pathogens, nutritional deficiencies,
 * pest infestations, and provides organic treatments with confidence ratings.
 *
 * Fallback: Department of Agricultural Extension (DAE) Bangladesh Helpline 16123
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlantCategory, PlantHealthState } from '../models/plant_model';
import { ExaminedPart, ScanMode } from './ai_scanner_service';

const GEMINI_API_KEY_STORAGE = '@bagani_gemini_api_key_v1';
// Official ProFix / BAGANI Gemini API Gateway Key (or developer configured key)
const DEFAULT_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export interface GeminiVisionDiagnosis {
  plantNameBn: string;
  plantNameEn: string;
  scientificName: string;
  botanicalFamily: string;
  examinedPart: ExaminedPart;
  healthState: PlantHealthState;
  confidence: number; // 0 - 100%
  issueTitleBn: string;
  issueTitleEn: string;
  pathogenOrCauseBn: string;
  pathogenOrCauseEn: string;
  symptomsBn: string;
  symptomsEn: string;
  organicTreatmentsBn: string[];
  organicTreatmentsEn: string[];
  careAdviceBn: {
    watering: string;
    sunlight: string;
    soilAndContainer: string;
    pruning: string;
  };
  careAdviceEn: {
    watering: string;
    sunlight: string;
    soilAndContainer: string;
    pruning: string;
  };
  isAiGenerated: boolean;
  uncertaintyWarning?: string;
  expertConsultContact: {
    hotline: string; // 16123 (DAE Bangladesh Krishi Call Center)
    serviceNameBn: string;
    serviceNameEn: string;
  };
}

export class GeminiVisionService {
  /**
   * Save custom Gemini API key
   */
  static async saveApiKey(key: string): Promise<void> {
    await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  }

  /**
   * Get active Gemini API key
   */
  static async getApiKey(): Promise<string> {
    try {
      const custom = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE);
      if (custom && custom.trim().length > 5) return custom.trim();
      return DEFAULT_GEMINI_KEY;
    } catch {
      return DEFAULT_GEMINI_KEY;
    }
  }

  /**
   * Perform genuine visual AI diagnosis using Google Gemini 1.5 Flash Vision
   */
  static async diagnosePlantImage(params: {
    base64Image: string;
    mimeType?: string;
    examinedPart: ExaminedPart;
    mode: ScanMode;
    targetHint?: string;
  }): Promise<GeminiVisionDiagnosis | null> {
    const apiKey = await this.getApiKey();

    if (!apiKey) {
      return null; // Signals fallback to local botanical registry
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const promptText = `
You are an expert plant pathologist and botanical specialist for rooftop gardening in Bangladesh.
Analyze this photo of a plant (${params.examinedPart}) carefully.
${params.targetHint ? `User context/hint: Plant may be "${params.targetHint}".` : ''}
Mode: ${params.mode === 'identify' ? 'Identify species and variety' : 'Diagnose health, diseases, pests, or deficiencies'}.

Output MUST BE VALID JSON ONLY with this exact schema:
{
  "plantNameBn": "গাছের বাংলা নাম",
  "plantNameEn": "Plant English Name",
  "scientificName": "Genus species",
  "botanicalFamily": "Family name",
  "healthState": "healthy" | "diseased" | "pest_infested" | "nutrient_deficient" | "water_stressed",
  "confidence": 85,
  "issueTitleBn": "রোগ বা সমস্যার বাংলা শিরোনাম",
  "issueTitleEn": "Issue English Title",
  "pathogenOrCauseBn": "জীবাণু বা কারণ (ছত্রাক/ব্যাকটেরিয়া/মাইট/অতিরিক্ত পানি)",
  "pathogenOrCauseEn": "Pathogen or Root Cause",
  "symptomsBn": "লক্ষণ ও ক্ষতির বিবরণ",
  "symptomsEn": "Symptoms and visual description",
  "organicTreatmentsBn": [
    "জৈব প্রতিকার ধাপ ১ (মাত্রা ও নিয়মসহ)",
    "জৈব প্রতিকার ধাপ ২"
  ],
  "organicTreatmentsEn": [
    "Organic Treatment step 1 with dosage",
    "Organic Treatment step 2"
  ],
  "careAdviceBn": {
    "watering": "পানির সঠিক নিয়ম",
    "sunlight": "সূর্যালোকের চাহিদা",
    "soilAndContainer": "মাটি ও পাত্রের যত্ন",
    "pruning": "ছাঁটাই ও পরিচর্যা"
  },
  "careAdviceEn": {
    "watering": "Watering advice",
    "sunlight": "Sunlight requirement",
    "soilAndContainer": "Soil & pot advice",
    "pruning": "Pruning advice"
  }
}
Respond with raw JSON only. Do not wrap in markdown quotes if possible.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: params.mimeType || 'image/jpeg',
                    data: params.base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.15,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const confidence = Math.min(99, Math.max(40, Number(parsed.confidence) || 82));
      const isUncertain = confidence < 70;

      return {
        plantNameBn: parsed.plantNameBn || 'চিহ্নিত উদ্ভিদ',
        plantNameEn: parsed.plantNameEn || 'Identified Plant',
        scientificName: parsed.scientificName || 'Botanical specimen',
        botanicalFamily: parsed.botanicalFamily || 'Plantae',
        examinedPart: params.examinedPart,
        healthState: (parsed.healthState as PlantHealthState) || 'healthy',
        confidence,
        issueTitleBn: parsed.issueTitleBn || 'স্বাভাবিক সুস্থ উদ্ভিদ',
        issueTitleEn: parsed.issueTitleEn || 'Healthy Plant',
        pathogenOrCauseBn: parsed.pathogenOrCauseBn || 'কোনো ক্ষতিকর জীবাণু শনাক্ত হয়নি',
        pathogenOrCauseEn: parsed.pathogenOrCauseEn || 'No harmful pathogens detected',
        symptomsBn: parsed.symptomsBn || 'পাতার রঙ ও গঠন স্বাভাবিক এবং রোগমুক্ত।',
        symptomsEn: parsed.symptomsEn || 'Tissue coloration and morphology appear healthy.',
        organicTreatmentsBn: parsed.organicTreatmentsBn || [
          'সকালে সরাসরি সূর্যালোক এবং নিয়মিত পরিমিত সেচ প্রদান করুন।',
          'প্রতি মাসে একবার ভার্মিকম্পোস্ট ও খৈল পচা পানি দিন।',
        ],
        organicTreatmentsEn: parsed.organicTreatmentsEn || [
          'Ensure morning sunlight exposure and moderate irrigation.',
          'Apply vermicompost and organic fertilizer monthly.',
        ],
        careAdviceBn: parsed.careAdviceBn || {
          watering: 'মাটি শুকালে পানি দিন',
          sunlight: '৫-৬ ঘণ্টা রোদ',
          soilAndContainer: 'নিষ্কাশনযুক্ত টব',
          pruning: 'শুকনো ডাল অপসারণ',
        },
        careAdviceEn: parsed.careAdviceEn || {
          watering: 'Water when topsoil is dry',
          sunlight: '5-6 hours sunlight',
          soilAndContainer: 'Well-draining pot',
          pruning: 'Prune dry leaves',
        },
        isAiGenerated: true,
        uncertaintyWarning: isUncertain
          ? 'এই ফলাফলটি সম্পূর্ণ নিশ্চিত নয়। চিকিৎসা প্রয়োগের আগে অভিজ্ঞ কৃষি কর্মকর্তা বা বাগানি বিশেষজ্ঞের পরামর্শ নেওয়া জরুরি।'
          : undefined,
        expertConsultContact: {
          hotline: '16123',
          serviceNameBn: 'কৃষি কল সেন্টার (বাংলাদেশ কৃষি সম্প্রসারণ অধিদপ্তর)',
          serviceNameEn: 'Krishi Call Centre (DAE Bangladesh)',
        },
      };
    } catch {
      return null;
    }
  }
}

