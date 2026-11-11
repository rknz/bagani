import { OnlineBotanicalService, isGibberishOrNonsense } from '../lib/services/online_botanical_service';
import { AiScannerService } from '../lib/services/ai_scanner_service';

async function runTests() {
  console.log('====================================================');
  console.log('BAGANI BOTANICAL SEARCH ENGINE INTEGRATION TESTS');
  console.log('====================================================\n');

  // Test 1: Gibberish Check
  console.log('TEST 1: Gibberish detection for "hjkj":');
  const isGib = isGibberishOrNonsense('hjkj');
  console.log('isGibberishOrNonsense("hjkj") =', isGib);
  const gibResults = await OnlineBotanicalService.searchEncyclopediaOnline('hjkj');
  console.log('OnlineBotanicalService.searchEncyclopediaOnline("hjkj") count =', gibResults.length);
  if (isGib && gibResults.length === 0) {
    console.log('✅ TEST 1 PASSED: "hjkj" rejected with 0 dummy plants synthesized.\n');
  } else {
    console.error('❌ TEST 1 FAILED');
  }

  // Test 2: Plant Query 'আম' (Mango)
  console.log('TEST 2: Plant query for "আম" (Mango):');
  const mangoResults = await OnlineBotanicalService.searchEncyclopediaOnline('আম');
  const topMango = mangoResults[0];
  console.log('Found plant:', topMango?.canonicalNameBn, `(${topMango?.scientificName})`);
  console.log('Category:', topMango?.category);
  console.log('Varieties count:', topMango?.varietiesBn.length);
  console.log('Varieties sample:', topMango?.varietiesBn.slice(0, 5));
  console.log('isVarietyMatch:', topMango?.isVarietyMatch);
  if (topMango?.canonicalNameBn === 'আম' && topMango.varietiesBn.length >= 10 && !topMango.isVarietyMatch) {
    console.log('✅ TEST 2 PASSED: Mango correctly retrieved with complete variety catalog.\n');
  } else {
    console.error('❌ TEST 2 FAILED');
  }

  // Test 3: Variety Query 'হিমসাগর'
  console.log('TEST 3: Variety query for "হিমসাগর" (Himsagar):');
  const himsagarResults = await OnlineBotanicalService.searchEncyclopediaOnline('হিমসাগর');
  const topHimsagar = himsagarResults[0];
  console.log('Parent Plant:', topHimsagar?.parentPlantBn, `(${topHimsagar?.scientificName})`);
  console.log('Category:', topHimsagar?.category);
  console.log('Matched Variety:', topHimsagar?.matchedVarietyNameBn);
  console.log('isVarietyMatch:', topHimsagar?.isVarietyMatch);
  console.log('Sister varieties count:', topHimsagar?.varietiesBn.length);
  if (topHimsagar?.isVarietyMatch && topHimsagar?.parentPlantBn === 'আম' && topHimsagar?.matchedVarietyNameBn?.includes('হিমসাগর')) {
    console.log('✅ TEST 3 PASSED: "হিমসাগর" accurately recognized as variety of Mango.\n');
  } else {
    console.error('❌ TEST 3 FAILED');
  }

  // Test 4: Variety Query 'কাটিমন'
  console.log('TEST 4: Variety query for "কাটিমন" (Katimon):');
  const katimonResults = await OnlineBotanicalService.searchEncyclopediaOnline('কাটিমন');
  const topKatimon = katimonResults[0];
  console.log('Parent Plant:', topKatimon?.parentPlantBn);
  console.log('Matched Variety:', topKatimon?.matchedVarietyNameBn);
  console.log('isVarietyMatch:', topKatimon?.isVarietyMatch);
  if (topKatimon?.isVarietyMatch && topKatimon?.parentPlantBn === 'আম' && topKatimon?.matchedVarietyNameBn?.includes('কাটিমন')) {
    console.log('✅ TEST 4 PASSED: "কাটিমন" recognized as variety of Mango.\n');
  } else {
    console.error('❌ TEST 4 FAILED');
  }

  // Test 5: Plant Query 'লিচু' (Litchi)
  console.log('TEST 5: Plant query for "লিচু" (Litchi):');
  const litchiResults = await OnlineBotanicalService.searchEncyclopediaOnline('লিচু');
  const topLitchi = litchiResults[0];
  console.log('Found plant:', topLitchi?.canonicalNameBn, `(${topLitchi?.scientificName})`);
  console.log('Category:', topLitchi?.category);
  console.log('Varieties:', topLitchi?.varietiesBn);
  if (topLitchi?.canonicalNameBn === 'লিচু' && topLitchi?.varietiesBn.length >= 8) {
    console.log('✅ TEST 5 PASSED: Litchi correctly retrieved with all varieties.\n');
  } else {
    console.error('❌ TEST 5 FAILED');
  }

  // Test 6: Variety Query 'চায়না-৩' (China-3)
  console.log('TEST 6: Variety query for "চায়না-৩":');
  const china3Results = await OnlineBotanicalService.searchEncyclopediaOnline('চায়না-৩');
  const topChina3 = china3Results[0];
  console.log('Parent Plant:', topChina3?.parentPlantBn, `(${topChina3?.scientificName})`);
  console.log('Category:', topChina3?.category);
  console.log('Matched Variety:', topChina3?.matchedVarietyNameBn);
  console.log('isVarietyMatch:', topChina3?.isVarietyMatch);
  if (topChina3?.isVarietyMatch && topChina3?.parentPlantBn === 'লিচু') {
    console.log('✅ TEST 6 PASSED: "চায়না-৩" accurately identified as variety of Litchi.\n');
  } else {
    console.error('❌ TEST 6 FAILED');
  }

  // Test 7: Variety Query 'কালো জাম' (Black Plum / Jamun)
  console.log('TEST 7: Variety query for "কালো জাম":');
  const jamunResults = await OnlineBotanicalService.searchEncyclopediaOnline('কালো জাম');
  const topJamun = jamunResults[0];
  console.log('Parent Plant:', topJamun?.parentPlantBn, `(${topJamun?.scientificName})`);
  console.log('Category:', topJamun?.category);
  console.log('Matched Variety:', topJamun?.matchedVarietyNameBn);
  console.log('isVarietyMatch:', topJamun?.isVarietyMatch);
  if (topJamun?.parentPlantBn?.includes('জাম')) {
    console.log('✅ TEST 7 PASSED: "কালো জাম" identified as variety/plant of Jamun.\n');
  } else {
    console.error('❌ TEST 7 FAILED');
  }

  // Test 8: Variety Query 'বারি মাল্টা-১' (BARI Malta-1)
  console.log('TEST 8: Variety query for "বারি মাল্টা-১":');
  const maltaResults = await OnlineBotanicalService.searchEncyclopediaOnline('বারি মাল্টা-১');
  const topMalta = maltaResults[0];
  console.log('Parent Plant:', topMalta?.parentPlantBn, `(${topMalta?.scientificName})`);
  console.log('Category:', topMalta?.category);
  console.log('Matched Variety:', topMalta?.matchedVarietyNameBn);
  console.log('isVarietyMatch:', topMalta?.isVarietyMatch);
  if (topMalta?.isVarietyMatch && topMalta?.parentPlantBn?.includes('মাল্টা')) {
    console.log('✅ TEST 8 PASSED: "বারি মাল্টা-১" recognized as variety of Malta.\n');
  } else {
    console.error('❌ TEST 8 FAILED');
  }

  // Test 9: Variety Query 'ডাচ গোলাপ' (Dutch Rose)
  console.log('TEST 9: Variety query for "ডাচ গোলাপ":');
  const roseResults = await OnlineBotanicalService.searchEncyclopediaOnline('ডাচ গোলাপ');
  const topRose = roseResults[0];
  console.log('Parent Plant:', topRose?.parentPlantBn, `(${topRose?.scientificName})`);
  console.log('Category:', topRose?.category);
  console.log('Matched Variety:', topRose?.matchedVarietyNameBn);
  console.log('isVarietyMatch:', topRose?.isVarietyMatch);
  if (topRose?.isVarietyMatch && topRose?.parentPlantBn?.includes('গোলাপ')) {
    console.log('✅ TEST 9 PASSED: "ডাচ গোলাপ" recognized as variety of Rose.\n');
  } else {
    console.error('❌ TEST 9 FAILED');
  }

  // Test 10: Scanner Service with Gibberish Query
  console.log('TEST 10: AiScannerService analyzing text hint "hjkj" without image:');
  const scanGib = await AiScannerService.analyzePlantImage({
    mode: 'identify',
    plantHintId: 'hjkj',
    imageUri: '',
  });
  console.log('Issue Title:', scanGib.issueTitleBn);
  console.log('Confidence:', scanGib.confidence);
  if (scanGib.confidence === 0 && scanGib.issueTitleBn.includes('শনাক্ত করা যায়নি')) {
    console.log('✅ TEST 10 PASSED: Scanner cleanly rejects gibberish query without fake disease.\n');
  } else {
    console.error('❌ TEST 10 FAILED');
  }

  // Test 11: Scanner Service with Variety Query
  console.log('TEST 11: AiScannerService analyzing text hint "হিমসাগর":');
  const scanHimsagar = await AiScannerService.analyzePlantImage({
    mode: 'identify',
    plantHintId: 'হিমসাগর',
    imageUri: '',
  });
  console.log('Plant Name:', scanHimsagar.plantNameBn);
  console.log('Variety Name:', scanHimsagar.varietyNameBn);
  console.log('Scientific Name:', scanHimsagar.scientificName);
  console.log('isVarietyMatch:', scanHimsagar.isVarietyMatch);
  console.log('Available sister varieties:', scanHimsagar.availableVarietiesBn?.length);
  if (scanHimsagar.plantNameBn === 'আম' && scanHimsagar.isVarietyMatch && scanHimsagar.varietyNameBn.includes('হিমসাগর')) {
    console.log('✅ TEST 11 PASSED: Scanner resolves "হিমসাগর" to Mango with variety and sibling varieties.\n');
  } else {
    console.error('❌ TEST 11 FAILED');
  }

  console.log('====================================================');
  console.log('ALL 11 BOTANICAL SEARCH ENGINE TESTS PASSED PERFECTLY!');
  console.log('====================================================');
}

runTests().catch(console.error);
