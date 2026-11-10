import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLanguage } from '../../core/l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../../core/theme/app_theme';
import {
  GardenerExperienceInsight,
  MasterContactCategory,
  MasterContactEntry,
  RemoteDirectoryService,
} from '../../services/remote_directory_service';

interface DirectoryScreenProps {
  theme: AppThemeColors;
  lang: AppLanguage;
  userDistrict: string;
  userName: string;
}

type DirectoryTab = 'agri_office' | 'experts' | 'nurseries' | 'insights' | 'community';

interface CommunityPost {
  id: string;
  author: string;
  district: string;
  message: string;
  timestamp: string;
  tag: string;
}

export const DirectoryScreen: React.FC<DirectoryScreenProps> = ({
  theme,
  lang,
  userDistrict,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<DirectoryTab>('agri_office');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [contacts, setContacts] = useState<MasterContactEntry[]>([]);
  const [matchedDistrictContacts, setMatchedDistrictContacts] = useState<MasterContactEntry[]>([]);
  const [experiences, setExperiences] = useState<GardenerExperienceInsight[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Experience Submission Modal State
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [expPlantName, setExpPlantName] = useState('');
  const [expVariety, setExpVariety] = useState('');
  const [expContainerSoil, setExpContainerSoil] = useState('');
  const [expPruningTip, setExpPruningTip] = useState('');
  const [expDiseaseSolved, setExpDiseaseSolved] = useState('');
  const [expYieldSummary, setExpYieldSummary] = useState('');

  // Community Chat Posts State
  const [newPostText, setNewPostText] = useState('');
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: 'post_1',
      author: 'তানভীর আহমেদ',
      district: 'ঢাকা (Dhaka)',
      message:
        'আমার ছাদের বারোমাসি কাটিমন আম গাছে এবার ২য় বার মুকুল এসেছে! কারো চারা বা সায়ন লাগলে জানাবেন।',
      timestamp: '১০ মিনিট আগে',
      tag: '🌱 চারা বিনিময়',
    },
    {
      id: 'post_2',
      author: 'ফারজানা রহমান',
      district: 'চট্টগ্রাম (Chattogram)',
      message:
        'বর্ষার আগে জিও ব্যাগের মাটিতে ট্রাইকোডার্মা ও নিম খৈল ব্যবহার করে দারুণ ফলাফল পেয়েছি, শেকড় পচা রোগ একদম নেই।',
      timestamp: '১ ঘণ্টা আগে',
      tag: '💡 অভিজ্ঞতা',
    },
  ]);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  // Load remotely updatable contacts and experience vault on mount
  useEffect(() => {
    loadDirectoryData();
  }, [userDistrict]);

  const loadDirectoryData = async () => {
    try {
      const locRes = await RemoteDirectoryService.getContactsForLocation(userDistrict);
      setMatchedDistrictContacts(locRes.matchedDistrictContacts);
      const all = await RemoteDirectoryService.getAllContacts();
      setContacts(all);

      const exps = await RemoteDirectoryService.getExperiences();
      setExperiences(exps);
    } catch {
      // Fallback
    }
  };

  const handleRemoteSync = async () => {
    setIsSyncing(true);
    try {
      const res = await RemoteDirectoryService.syncFromRemoteJsonUrl();
      await loadDirectoryData();
      Alert.alert(
        lang === 'bn' ? 'ডিরেক্টরি আপডেট সম্পন্ন' : 'Directory Synced',
        lang === 'bn'
          ? `রিমোট ডাটাবেজ থেকে সর্বমোট ${res.totalCount}টি নার্সারি/বিশেষজ্ঞ এন্ট্রি সফলভাবে সিঙ্ক হয়েছে।`
          : `Successfully synced ${res.totalCount} verified nurseries & agri contacts.`
      );
    } catch {
      Alert.alert('Sync', 'Using cached master database.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddPost = () => {
    if (!newPostText.trim()) return;
    const post: CommunityPost = {
      id: `post_${Date.now()}`,
      author: userName,
      district: userDistrict,
      message: newPostText.trim(),
      timestamp: lang === 'bn' ? 'এইমাত্র' : 'Just now',
      tag: lang === 'bn' ? '🌿 বাগানী পোস্ট' : '🌿 Gardener Post',
    };
    setCommunityPosts([post, ...communityPosts]);
    setNewPostText('');
  };

  const handleUpvoteExperience = async (expId: string) => {
    const updated = await RemoteDirectoryService.markExperienceHelpful(expId);
    setExperiences(updated);
  };

  const handleSubmitNewExperience = async () => {
    if (!expPlantName.trim() || !expPruningTip.trim() || !expYieldSummary.trim()) {
      Alert.alert(
        lang === 'bn' ? 'তথ্য অসম্পূর্ণ' : 'Incomplete Form',
        lang === 'bn'
          ? 'অনুগ্রহ করে গাছের নাম, সফলতার প্রুনিং টিপস ও ফলনের বিবরণ লিখুন।'
          : 'Please enter Plant Name, Pruning Tip, and Yield Result.'
      );
      return;
    }

    const updated = await RemoteDirectoryService.submitExperience({
      authorName: userName,
      district: userDistrict,
      plantName: expPlantName.trim(),
      varietyName: expVariety.trim() || (lang === 'bn' ? 'উন্নত জাত' : 'Selected Variety'),
      containerAndSoilUsed:
        expContainerSoil.trim() ||
        (lang === 'bn' ? '২০" জিও ব্যাগ ও দোআঁশ-কম্পোস্ট মাটি' : '20" Geo-Bag & Loam-Compost'),
      keySuccessOrPruningTip: expPruningTip.trim(),
      diseaseOrChallengeSolved: expDiseaseSolved.trim(),
      yieldResultSummary: expYieldSummary.trim(),
    });

    setExperiences(updated);
    setShowAddExpModal(false);
    setExpPlantName('');
    setExpVariety('');
    setExpContainerSoil('');
    setExpPruningTip('');
    setExpDiseaseSolved('');
    setExpYieldSummary('');

    Alert.alert(
      lang === 'bn' ? 'অভিজ্ঞতা সংরক্ষিত হয়েছে' : 'Experience Saved',
      lang === 'bn'
        ? 'ধন্যবাদ! আপনার মূল্যবান অভিজ্ঞতা সফটওয়্যারের অভিজ্ঞতা ভল্টে সংরক্ষিত হয়েছে যা অন্যান্য বাগানীদের ফলন বাড়াতে সহায়তা করবে।'
        : 'Thank you! Your rooftop gardening breakthrough has been added to the Gardener Vault.'
    );
  };

  const activeCategoryFilter: MasterContactCategory | null =
    activeTab === 'agri_office'
      ? 'agri_office'
      : activeTab === 'experts'
      ? 'gardener'
      : activeTab === 'nurseries'
      ? 'nursery'
      : null;

  const filteredContacts = useMemo(() => {
    if (!activeCategoryFilter) return [];
    return contacts.filter((c) => {
      const matchCat = c.category === activeCategoryFilter;
      const matchDist =
        selectedDistrict === 'ALL' ||
        c.district.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        c.districtEn.toLowerCase().includes(selectedDistrict.toLowerCase());
      return matchCat && matchDist;
    });
  }, [contacts, activeCategoryFilter, selectedDistrict]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Emergency National Agri Helpline Banner */}
      <View
        style={[
          styles.helplineBanner,
          { backgroundColor: theme.cardBackground, borderColor: theme.primary },
        ]}
      >
        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={[styles.helplineTitle, { color: theme.primary, fontFamily: fontFam }]}>
            📞 {lang === 'bn' ? 'জাতীয় কৃষি কল সেন্টার (১৬১২৩)' : 'National Agri Helpline (16123)'}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18, fontFamily: fontFam }}>
            {lang === 'bn'
              ? 'সরকারি কৃষিবিদদের সাথে সরাসরি কথা বলুন অথবা আপনার জেলার কৃষি অফিস ও নার্সারি খুঁজুন।'
              : 'Connect directly with certified agriculturists, nurseries & local master gardeners.'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:16123')}
            style={[styles.callBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
              📲 16123
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRemoteSync}
            disabled={isSyncing}
            style={[
              styles.syncBtn,
              {
                backgroundColor: theme.selectedSurface,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12, fontFamily: fontFam }}>
              {isSyncing ? '⏳...' : '🔄 ' + (lang === 'bn' ? 'সিঙ্ক' : 'Sync')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5-Sub-Tab Switcher */}
      <View style={styles.tabGrid}>
        {(
          [
            {
              id: 'agri_office',
              icon: '🏛️',
              line1Bn: 'কৃষি',
              line2Bn: 'অফিস',
              line1En: 'Agriculture',
              line2En: 'Office',
            },
            {
              id: 'experts',
              icon: '👨‍🌾',
              line1Bn: 'অভিজ্ঞ',
              line2Bn: 'বাগানী',
              line1En: 'Master',
              line2En: 'Gardeners',
            },
            {
              id: 'nurseries',
              icon: '🪴',
              line1Bn: 'নার্সারি',
              line2Bn: 'ও চারা',
              line1En: 'Nurseries',
              line2En: '',
            },
            {
              id: 'insights',
              icon: '💡',
              line1Bn: 'অভিজ্ঞতা',
              line2Bn: 'ভল্ট',
              line1En: 'Experience',
              line2En: 'Vault',
            },
            {
              id: 'community',
              icon: '💬',
              line1Bn: 'বাগানী',
              line2Bn: 'আড্ডা',
              line1En: 'Community',
              line2En: '',
            },
          ] as {
            id: DirectoryTab;
            icon: string;
            line1Bn: string;
            line2Bn?: string;
            line1En: string;
            line2En?: string;
          }[]
        ).map((tab) => {
          const active = activeTab === tab.id;
          const line2 = lang === 'bn' ? tab.line2Bn : tab.line2En;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.82}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: active
                    ? theme.primary
                    : (theme.cardBackground || theme.surface),
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <View style={styles.tabTextContainer}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabelLine,
                    {
                      color: active ? '#FFFFFF' : theme.textPrimary,
                      fontFamily: fontFam,
                    },
                  ]}
                >
                  {lang === 'bn' ? tab.line1Bn : tab.line1En}
                </Text>
                {line2 ? (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tabLabelLine,
                      {
                        color: active ? '#FFFFFF' : theme.textPrimary,
                        fontFamily: fontFam,
                      },
                    ]}
                  >
                    {line2}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* District Filter Chips for Contact Categories */}
      {activeTab !== 'community' && activeTab !== 'insights' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          {[
            'ALL',
            userDistrict,
            'জামালপুর (Jamalpur)',
            'ঢাকা (Dhaka)',
            'ময়মনসিংহ (Mymensingh)',
            'রাজশাহী (Rajshahi)',
            'চট্টগ্রাম (Chattogram)',
            'সিলেট (Sylhet)',
            'বগুড়া (Bogura)',
          ]
            .filter((val, idx, arr) => arr.indexOf(val) === idx)
            .map((dist) => {
              const active = selectedDistrict === dist;
              return (
                <TouchableOpacity
                  key={dist}
                  onPress={() => setSelectedDistrict(dist)}
                  style={[
                    styles.distChip,
                    {
                      backgroundColor: active
                        ? theme.secondary
                        : theme.cardBackground,
                      borderColor: active ? theme.secondary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : theme.textPrimary,
                      fontSize: 12,
                      fontWeight: '700',
                      fontFamily: fontFam,
                    }}
                  >
                    📍{' '}
                    {dist === 'ALL'
                      ? lang === 'bn'
                        ? 'সকল জেলা (All)'
                        : 'All Districts'
                      : dist}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      )}

      {/* TAB 1, 2, 3: Directory Contacts List (Agri Office / Master Gardeners / Nurseries) */}
      {activeTab === 'agri_office' || activeTab === 'experts' || activeTab === 'nurseries' ? (
        <View style={{ gap: 12 }}>
          {/* Matched User District Contacts Alert Banner */}
          {matchedDistrictContacts.filter((c) => c.category === activeCategoryFilter).length > 0 &&
            selectedDistrict === 'ALL' && (
              <View
                style={[
                  styles.matchedBanner,
                  {
                    backgroundColor: theme.selectedSurface,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontWeight: '800',
                    fontSize: 13,
                    fontFamily: fontFam,
                  }}
                >
                  📍 আপনার জেলা ({userDistrict})-এর ভেরিফাইড পরিচিতি:
                </Text>
              </View>
            )}

          {filteredContacts.map((item) => (
            <View
              key={item.id}
              style={[
                styles.dirCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.dirHeaderRow}>
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 11.5,
                    fontWeight: '800',
                    fontFamily: fontFam,
                  }}
                >
                  📍 {item.district} {item.isVerified ? '• ✅ Verified' : ''}
                </Text>
              </View>

              <Text style={[styles.dirName, { color: theme.textPrimary, fontFamily: fontFam }]}>
                {lang === 'bn' ? item.nameBn : item.nameEn}
              </Text>

              <Text style={{ color: theme.textSecondary, fontSize: 12.5, lineHeight: 18, fontFamily: fontFam }}>
                🌿 {lang === 'bn' ? item.specialtyBn : item.specialtyEn}
              </Text>

              <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>
                🏢 {item.address}
              </Text>

              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${item.phone}`)}
                style={[
                  styles.dirCallBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontWeight: '800',
                    fontSize: 12.5,
                    fontFamily: fontFam,
                  }}
                >
                  📞 {lang === 'bn' ? 'সরাসরি কল করুন:' : 'Call Direct:'} {item.phone}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : activeTab === 'insights' ? (
        /* TAB 4: GARDENER EXPERIENCE & KEY INSIGHTS COLLECTION VAULT (Requirement #8) */
        <View style={{ gap: 14 }}>
          {/* Header Action to Submit Experience */}
          <View
            style={[
              styles.dirCard,
              {
                backgroundColor: theme.selectedSurface,
                borderColor: theme.primary,
                borderWidth: 1.5,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <View style={{ flex: 1, minWidth: 200 }}>
                <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 15, fontFamily: fontFam }}>
                  💡 বাগানীদের বাস্তব অভিজ্ঞতা ও ফলন ভল্ট
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18, fontFamily: fontFam }}>
                  {lang === 'bn'
                    ? 'অন্যান্য সফল ছাদবাগানীদের বাস্তব প্রুনিং কৌশল, কন্টেইনার মিশ্রণ ও অর্জিত ফলনের রেকর্ড।'
                    : 'Real grower breakthroughs, pruning secrets, and verified harvest yield records.'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowAddExpModal(true)}
                style={[styles.postBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13, fontFamily: fontFam }}>
                  + {lang === 'bn' ? 'নিজের অভিজ্ঞতা শেয়ার করুন' : 'Submit My Experience'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List of Real Experiences */}
          {experiences.map((exp) => (
            <View
              key={exp.id}
              style={[
                styles.dirCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.postHeaderRow}>
                <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                  <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 14, fontFamily: fontFam }}>
                    👤 {exp.authorName} • <Text style={{ color: theme.primary }}>{exp.district}</Text>
                  </Text>
                  <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13, marginTop: 2, fontFamily: fontFam }}>
                    🌱 {exp.plantName} ({exp.varietyName})
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleUpvoteExperience(exp.id)}
                  style={[
                    styles.upvoteBtn,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>
                    👍 {exp.helpfulCount}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Container & Soil Used */}
              <View style={[styles.expBlock, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <View style={styles.expBlockLabelRow}>
                  <Text style={{ fontSize: 13 }}>🪴</Text>
                  <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 12, fontFamily: fontFam }}>
                    {lang === 'bn' ? 'টব ও মাটির মিশ্রণ:' : 'Container & Soil Media:'}
                  </Text>
                </View>
                <Text style={[styles.expBlockText, { color: theme.textSecondary, fontFamily: fontFam }]}>
                  {exp.containerAndSoilUsed}
                </Text>
              </View>

              {/* Key Pruning or Success Tip */}
              <View style={[styles.expBlock, { backgroundColor: theme.selectedSurface, borderColor: theme.primary, borderWidth: 1.2 }]}>
                <View style={styles.expBlockLabelRow}>
                  <Text style={{ fontSize: 13 }}>✂️</Text>
                  <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12, fontFamily: fontFam }}>
                    {lang === 'bn' ? 'ফলন বাড়ানোর সিক্রেট কৌশল:' : 'Key Pruning & Yield Secret:'}
                  </Text>
                </View>
                <Text style={[styles.expBlockText, { color: theme.textPrimary, fontFamily: fontFam, fontWeight: '600' }]}>
                  {exp.keySuccessOrPruningTip}
                </Text>
              </View>

              {/* Disease Solved if any */}
              {exp.diseaseOrChallengeSolved ? (
                <View style={[styles.expBlock, { backgroundColor: theme.surfaceElevated, borderColor: theme.warning, borderWidth: 1 }]}>
                  <View style={styles.expBlockLabelRow}>
                    <Text style={{ fontSize: 13 }}>🩺</Text>
                    <Text style={{ color: theme.warning, fontWeight: '700', fontSize: 12, fontFamily: fontFam }}>
                      {lang === 'bn' ? 'রোগ বা সমস্যার সমাধান:' : 'Challenge or Disease Solved:'}
                    </Text>
                  </View>
                  <Text style={[styles.expBlockText, { color: theme.textSecondary, fontFamily: fontFam }]}>
                    {exp.diseaseOrChallengeSolved}
                  </Text>
                </View>
              ) : null}

              {/* Yield Result Summary */}
              <View style={[styles.expBlock, { backgroundColor: theme.surfaceElevated, borderLeftWidth: 3.5, borderLeftColor: theme.secondary }]}>
                <View style={styles.expBlockLabelRow}>
                  <Text style={{ fontSize: 13 }}>🧺</Text>
                  <Text style={{ color: theme.secondary, fontWeight: '800', fontSize: 12, fontFamily: fontFam }}>
                    {lang === 'bn' ? 'বাস্তব ফলনের খতিয়ান:' : 'Harvested Yield Record:'}
                  </Text>
                </View>
                <Text style={[styles.expBlockText, { color: theme.textPrimary, fontFamily: fontFam, fontWeight: '700' }]}>
                  {exp.yieldResultSummary}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        /* TAB 5: Community Chat Feed */
        <View style={{ gap: 12 }}>
          {/* Compose Community Post */}
          <View
            style={[
              styles.dirCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={{
                color: theme.textPrimary,
                fontWeight: '800',
                fontSize: 14,
                fontFamily: fontFam,
              }}
            >
              ✍️{' '}
              {lang === 'bn'
                ? 'স্থানীয় বাগানীদের সাথে প্রশ্ন বা চারার তথ্য শেয়ার করুন'
                : 'Share a Question or Sapling Swap with Local Gardeners'}
            </Text>
            <TextInput
              value={newPostText}
              onChangeText={setNewPostText}
              placeholder={
                lang === 'bn'
                  ? 'আপনার ছাদবাগানের আপডেট বা প্রশ্ন লিখুন...'
                  : 'Write your rooftop garden update or question...'
              }
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[
                styles.postInput,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  fontFamily: fontFam,
                },
              ]}
            />
            <TouchableOpacity
              onPress={handleAddPost}
              style={[styles.postBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13, fontFamily: fontFam }}>
                🚀 {lang === 'bn' ? 'কমিউনিটিতে পোস্ট করুন' : 'Post to Community'}
              </Text>
            </TouchableOpacity>
          </View>

          {communityPosts.map((post) => (
            <View
              key={post.id}
              style={[
                styles.dirCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.postHeaderRow}>
                <Text
                  style={{
                    color: theme.textPrimary,
                    fontWeight: '800',
                    fontSize: 13,
                    fontFamily: fontFam,
                  }}
                >
                  👤 {post.author} •{' '}
                  <Text style={{ color: theme.primary, fontSize: 12 }}>
                    {post.district}
                  </Text>
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                  {post.timestamp}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: fontFam,
                }}
              >
                {post.message}
              </Text>
              <Text
                style={{
                  color: theme.secondary,
                  fontSize: 11,
                  fontWeight: '700',
                  fontFamily: fontFam,
                }}
              >
                {post.tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Modal: Add My Gardener Experience Insight (Requirement #8) */}
      <Modal visible={showAddExpModal} transparent animationType="slide" onRequestClose={() => setShowAddExpModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800', fontFamily: fontFam }}>
                ✍️ {lang === 'bn' ? 'বাগানির বাস্তব অভিজ্ঞতা ও টিপস যুক্ত করুন' : 'Submit Gardener Insight'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddExpModal(false)}>
                <Text style={{ color: theme.textSecondary, fontSize: 16, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 6 }}>
              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '700', fontFamily: fontFam }}>
                  গাছের নাম (Plant Name) *
                </Text>
                <TextInput
                  value={expPlantName}
                  onChangeText={setExpPlantName}
                  placeholder={lang === 'bn' ? 'যেমন: কাটিমন আম, থাই সবেদা, লাউ' : 'e.g., Katimon Mango'}
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.inputField, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '700', fontFamily: fontFam }}>
                  জাত / ভ্যারাইটি (Variety)
                </Text>
                <TextInput
                  value={expVariety}
                  onChangeText={setExpVariety}
                  placeholder={lang === 'bn' ? 'যেমন: থাই কাটিমন-১২, বারি লাউ-৪' : 'e.g., Thai Katimon-12'}
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.inputField, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '700', fontFamily: fontFam }}>
                  ব্যবহৃত টব ও মাটির মিশ্রণ (Container & Soil Mix)
                </Text>
                <TextInput
                  value={expContainerSoil}
                  onChangeText={setExpContainerSoil}
                  placeholder={lang === 'bn' ? 'যেমন: ২৪ ইঞ্চি জিও ব্যাগ, ৫০% দোআঁশ + ভার্মিকম্পোস্ট' : 'e.g., 24" Geo-Bag, Vermicompost'}
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.inputField, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '800', fontFamily: fontFam }}>
                  ফলন বাড়ানোর প্রুনিং বা বিশেষ সার কৌশল * (Success Secret)
                </Text>
                <TextInput
                  value={expPruningTip}
                  onChangeText={setExpPruningTip}
                  multiline
                  placeholder={lang === 'bn' ? 'কীভাবে ডাল কেটেছিলেন বা সার দিয়েছিলেন যার ফলে ফলন দ্বিগুণ হয়েছে?' : 'How did you prune or feed to achieve high yield?'}
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.inputField, { minHeight: 65, backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '700', fontFamily: fontFam }}>
                  কী রোগ বা সমস্যা সমাধান করেছিলেন? (Disease Challenge Solved)
                </Text>
                <TextInput
                  value={expDiseaseSolved}
                  onChangeText={setExpDiseaseSolved}
                  placeholder={lang === 'bn' ? 'যেমন: মিলিবাগ নিম তেল স্প্রে করে সমাধান' : 'e.g., Solved mealybug with neem oil'}
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.inputField, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.secondary, fontSize: 12, fontWeight: '800', fontFamily: fontFam }}>
                  অর্জিত ফলন / ফলাফল * (Harvest Yield Result)
                </Text>
                <TextInput
                  value={expYieldSummary}
                  onChangeText={setExpYieldSummary}
                  placeholder={lang === 'bn' ? 'যেমন: ১টি গাছ থেকে ১৮ কেজি মিষ্টি আম পেয়েছি' : 'e.g., Harvested 18 kg sweet mangoes'}
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.inputField, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmitNewExperience}
                style={[styles.postBtn, { backgroundColor: theme.primary, marginTop: 8 }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13, fontFamily: fontFam }}>
                  ✓ {lang === 'bn' ? 'ভল্টে সংরক্ষণ করুন' : 'Save to Insights Vault'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    padding: 20,
    gap: 14,
    paddingBottom: 90,
  },
  helplineBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    flexWrap: 'wrap',
  },
  helplineTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  callBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    minWidth: 96,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 82,
    gap: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabIcon: {
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
  },
  tabTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tabLabelLine: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
  distChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.2,
  },
  matchedBanner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  dirCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.2,
    gap: 10,
  },
  dirHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dirName: {
    fontSize: 16,
    fontWeight: '800',
  },
  dirCallBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
  postHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  upvoteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  expBlock: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  expBlockLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expBlockText: {
    fontSize: 12.5,
    lineHeight: 19,
    width: '100%',
    flexWrap: 'wrap',
  },
  insightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    borderRadius: 6,
    gap: 6,
    alignItems: 'center',
  },
  postInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    minHeight: 60,
    fontSize: 13,
  },
  postBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 23, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  inputField: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
});
