import type { DeviceData } from '../components/DeviceSlot';

export interface VerdictResult {
  winner: DeviceData | null;
  runnerUp: DeviceData | null;
  explanation: string;
  scores: Record<string, number>;
}

interface ParsedSpecs {
  batteryCapacity: number;
  ram: number;
  cameraMp: number;
  releaseYear: number;
}

export const calculateVerdict = (devices: DeviceData[]): VerdictResult => {
  if (!devices || devices.length < 2) {
    return { winner: null, runnerUp: null, explanation: "Please select at least two devices to compare.", scores: {} };
  }

  const scores: Record<string, number> = {};
  const explanations: Record<string, string[]> = {};
  const parsedData: Record<string, ParsedSpecs> = {};

  // Initialize scores, explanation arrays, and parsed specs
  devices.forEach(d => {
    scores[d.id] = 0;
    explanations[d.id] = [];
    parsedData[d.id] = { batteryCapacity: 0, ram: 0, cameraMp: 0, releaseYear: 0 };
  });

  // --- Scoring Heuristics ---

  // 1. Battery Capacity
  let maxBattery = 0;
  devices.forEach(d => {
    const batteryString = d.specs?.Battery?.Type || d.specs?.Battery?.Size || '';
    const match = batteryString.match(/(\d+)\s*mAh/i);
    if (match) {
      const capacity = parseInt(match[1], 10);
      parsedData[d.id].batteryCapacity = capacity;
      if (capacity > maxBattery) maxBattery = capacity;
    }
  });

  devices.forEach(d => {
    if (parsedData[d.id].batteryCapacity === maxBattery && maxBattery > 0) {
      scores[d.id] += 2;
      explanations[d.id].push("largest battery capacity");
    }
  });

  // 2. RAM (Memory)
  let maxRam = 0;
  devices.forEach(d => {
    const memoryString = d.specs?.Memory?.Internal || '';
    // Look for "XGB RAM" or "X GB RAM"
    const match = memoryString.match(/(\d+)\s*GB\s*RAM/i);
    if (match) {
      const ram = parseInt(match[1], 10);
      parsedData[d.id].ram = ram;
      if (ram > maxRam) maxRam = ram;
    }
  });

  devices.forEach(d => {
    if (parsedData[d.id].ram === maxRam && maxRam > 0) {
      scores[d.id] += 3; // RAM gets slightly higher weight
      explanations[d.id].push("most RAM for multitasking");
    }
  });

  // 3. Main Camera Main Sensor Megapixels
  let maxMp = 0;
  devices.forEach(d => {
    const mainCam = d.specs?.['Main Camera'] || d.specs?.['Camera'];
    if (mainCam) {
      // Look for the first number followed by "MP" in any of the keys (Quad, Triple, Dual, Single, Modules, etc.)
      const camString = Object.values(mainCam).join(" ");
      const match = camString.match(/(\d+)\s*MP/i);
      if (match) {
        const mp = parseInt(match[1], 10);
        parsedData[d.id].cameraMp = mp;
        if (mp > maxMp) maxMp = mp;
      }
    }
  });

  devices.forEach(d => {
    if (parsedData[d.id].cameraMp === maxMp && maxMp > 0) {
      scores[d.id] += 1.5;
      explanations[d.id].push("highest megapixel main camera");
    }
  });

  // 4. Age (Release Year)
  let newestYear = 0;
  devices.forEach(d => {
    const launchString = d.specs?.Launch?.Announced || d.specs?.Launch?.Status || "";
    const match = launchString.match(/\b(20\d{2})\b/);
    if (match) {
      const year = parseInt(match[1], 10);
      parsedData[d.id].releaseYear = year;
      if (year > newestYear) newestYear = year;
    }
  });

  devices.forEach(d => {
    if (parsedData[d.id].releaseYear === newestYear && newestYear > 0) {
      scores[d.id] += 2;
      explanations[d.id].push("more recent release date");
    } else if (parsedData[d.id].releaseYear && parsedData[d.id].releaseYear < newestYear - 2) {
      // Penalty for very old devices compared to the newest in the group
      scores[d.id] -= 1;
    }
  });

  // 5. Processor / Chipset Tiering Heuristic
  // A simplified rule engine for processors. Higher numbers generally are better within a brand.
  // Apple A-Series > Mediatek entry, Snapdragon 8 > Snapdragon 7, etc.
  devices.forEach(d => {
    const chipset = (d.specs?.Platform?.Chipset || "").toLowerCase();
    
    if (chipset.includes('apple a18') || chipset.includes('apple m4')) scores[d.id] += 5;
    else if (chipset.includes('apple a17') || chipset.includes('apple m3') || chipset.includes('snapdragon 8 gen 3')) scores[d.id] += 4;
    else if (chipset.includes('apple a16') || chipset.includes('apple m2') || chipset.includes('snapdragon 8 gen 2')) scores[d.id] += 3;
    else if (chipset.includes('apple a15') || chipset.includes('snapdragon 8+') || chipset.includes('snapdragon 8 gen 1')) scores[d.id] += 2.5;
    else if (chipset.includes('snapdragon 8') || chipset.includes('dimensity 9')) scores[d.id] += 2;
    else if (chipset.includes('snapdragon 7') || chipset.includes('dimensity 8')) scores[d.id] += 1;
    
    if (chipset.includes('bionic')) explanations[d.id].push("Apple's highly optimized silicon architecture");
    if (chipset.includes('snapdragon 8')) explanations[d.id].push("flagship-tier Snapdragon processor");
    if (chipset.includes('dimensity 9')) explanations[d.id].push("premium MediaTek processing power");
  });

  // Calculate winner
  // Create an array to sort devices by score
  const rankedDevices = [...devices].sort((a, b) => scores[b.id] - scores[a.id]);
  
  const winner = rankedDevices[0];
  const runnerUp = rankedDevices.length > 1 ? rankedDevices[1] : null;

  // Generate readable explanation for the winner
  let explanation = "";
  
  if (scores[winner.id] === 0) {
    // Edge case where no metrics were parsed correctly
    explanation = `The ${winner.name} edges out the competition as a solid overall choice, though comparing exact metrics was difficult for these specific models.`;
  } else if (runnerUp && scores[winner.id] === scores[runnerUp.id]) {
    explanation = `It's a dead heat! The ${winner.name} and ${runnerUp.name} are extremely evenly matched based on their core specs. They both offer excellent value in their respective categories.`;
  } else {
    // Generate explanation based on points awarded
    const reasons = explanations[winner.id];
    
    if (reasons.length === 0) {
      explanation = `The ${winner.name} is our recommended choice based on a holistic review of its premium features and specifications.`;
    } else {
      // Format array into a readable comma-separated list with "and"
      const reasonText = reasons.length === 1 
        ? reasons[0] 
        : reasons.slice(0, -1).join(', ') + ', and ' + reasons[reasons.length - 1];
        
      explanation = `The ${winner.name} comes out on top primarily due to having the ${reasonText}.`;
      
      // Add a note about the runner up if there is one and it was close
      if (runnerUp && (scores[winner.id] - scores[runnerUp.id] <= 2)) {
        explanation += ` However, the ${runnerUp.name} is a very close runner-up and remains a fantastic alternative.`;
      }
    }
  }

  // Debug log to console during dev
  console.log("Verdict Calculation:", { scores, winner: winner.name, rankedDevices: rankedDevices.map(d => d.name) });

  let computedRunnerUp = null;
  if (runnerUp) {
    if (scores[winner.id] === scores[runnerUp.id] && rankedDevices.length > 1) {
      computedRunnerUp = rankedDevices[1];
    } else if (scores[runnerUp.id] > 0) {
      computedRunnerUp = runnerUp;
    }
  }

  return {
    winner,
    runnerUp: computedRunnerUp,
    explanation,
    scores
  };
};
