// Provide localStorage mock for Node.js environment
const memoryStore: Record<string, string> = {};
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    localStorage: {
      getItem: (key: string) => memoryStore[key] || null,
      setItem: (key: string, val: string) => {
        memoryStore[key] = String(val);
      },
      removeItem: (key: string) => {
        delete memoryStore[key];
      },
      clear: () => {
        for (const k of Object.keys(memoryStore)) delete memoryStore[k];
      },
    },
  };
}

import { LocalDbService } from '../lib/services/local_db_service';
import { PlantModel } from '../lib/models/plant_model';
import { PlantTimelineLog } from '../lib/models/plant_log_model';
import { GranularCareTask } from '../lib/models/care_schedule_model';

async function testPlantDeletion() {
  console.log('====================================================');
  console.log('BAGANI PLANT DELETION FEATURE INTEGRATION TEST');
  console.log('====================================================\n');

  // 1. Create a dummy plant
  const testPlantId = 'plt_test_' + Date.now().toString(36);
  const dummyPlant: PlantModel = {
    id: testPlantId,
    qrCodeId: 'BAGANI-QR-TEST-99',
    nameBengali: 'পরীক্ষামূলক আম গাছ',
    nameEnglish: 'Experimental Mango Tree',
    variety: 'হিমসাগর পরীক্ষামূলক জাত',
    category: 'fruit',
    isAllSeason: false,
    plantedDateIso: new Date().toISOString(),
    containerSizeInches: 20,
    rooftopZone: 'উত্তর কর্নার',
    healthState: 'healthy',
    lastHealthDiagnosisSummary: 'টেস্ট গাছ সুস্থ আছে',
    lastWateredIso: new Date().toISOString(),
    lastFertilizedIso: new Date().toISOString(),
    estimatedMoisturePercent: 80,
    qrTagConfig: {
      qrCodeValue: 'BAGANI-QR-TEST-99',
      tagSize: 'medium',
      plantName: 'পরীক্ষামূলক আম গাছ',
      varietyName: 'হিমসাগর',
      isAllSeason: false,
      customQuoteBengali: 'টেস্ট ছাদবাগান',
      ownerName: 'টেস্ট ইউজার',
    },
  };

  console.log('1. Adding dummy plant to local database...');
  await LocalDbService.addPlant(dummyPlant);
  const initialPlants = await LocalDbService.getPlants();
  const foundPlantBefore = initialPlants.find((p) => p.id === testPlantId);
  console.log('Plant added successfully? ->', !!foundPlantBefore);

  // 2. Add dummy timeline log
  console.log('2. Adding timeline log for the plant...');
  const dummyLog: PlantTimelineLog = {
    id: 'log_test_' + Date.now().toString(36),
    plantId: testPlantId,
    actionType: 'watering',
    titleBengali: 'পানি দেওয়া হয়েছে',
    titleEnglish: 'Watered plant',
    detailsNotes: 'পরীক্ষামূলক লগ',
    waterLitersApplied: 2,
    timestampIso: new Date().toISOString(),
    completedViaCheckbox: true,
  };
  await LocalDbService.addTimelineLog(dummyLog);
  const logsBefore = await LocalDbService.getTimelineLogs(testPlantId);
  console.log('Logs count for test plant before deletion ->', logsBefore.length);

  // 3. Add dummy care task
  console.log('3. Adding care task for the plant...');
  const dummyTask: GranularCareTask = {
    id: 'task_test_' + Date.now().toString(36),
    plantId: testPlantId,
    plantNameBengali: dummyPlant.nameBengali,
    plantNameEnglish: dummyPlant.nameEnglish,
    dueDateIso: new Date().toISOString(),
    isUrgentNext3Days: false,
    recommendedTimeSlot: 'morning',
    taskType: 'watering',
    titleBengali: 'পানি দেওয়ার টেস্ট শিডিউল',
    titleEnglish: 'Watering test schedule',
    actionDetailsBengali: 'টেস্ট বিবরণ',
    actionDetailsEnglish: 'Test description',
    isCompleted: false,
    status: 'pending',
  };
  await LocalDbService.addCareTask(dummyTask);
  const tasksBefore = (await LocalDbService.getCareTasks()).filter((t) => t.plantId === testPlantId);
  console.log('Tasks count for test plant before deletion ->', tasksBefore.length);

  // 4. Perform Deletion
  console.log('\n4. Executing LocalDbService.deletePlant(testPlantId)...');
  const remainingPlants = await LocalDbService.deletePlant(testPlantId);
  const foundPlantAfter = remainingPlants.find((p) => p.id === testPlantId);
  console.log('Is test plant still in remaining plants? ->', !!foundPlantAfter);

  const logsAfter = await LocalDbService.getTimelineLogs(testPlantId);
  console.log('Logs count for test plant after deletion ->', logsAfter.length);

  const tasksAfter = (await LocalDbService.getCareTasks()).filter((t) => t.plantId === testPlantId);
  console.log('Tasks count for test plant after deletion ->', tasksAfter.length);

  if (!foundPlantAfter && logsAfter.length === 0 && tasksAfter.length === 0) {
    console.log('\n✅ TEST PASSED: Plant, logs, and tasks were completely deleted without residue!');
  } else {
    console.error('\n❌ TEST FAILED');
    process.exit(1);
  }
}

testPlantDeletion().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
