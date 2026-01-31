// ============================================================
// SIMPLE VERSION: Just paste your curriculum data here
// File: scripts/simpleGenerator.js
// ============================================================

/**
 * EASIEST WAY TO USE THIS:
 * 
 * 1. Copy your entire curriculum object
 * 2. Paste it below where it says "PASTE HERE"
 * 3. Run: node scripts/simpleGenerator.js
 * 4. Copy the output and paste into audioLoader.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// PASTE YOUR CURRICULUM HERE (just the object, no export/import)
// ============================================================

const curriculum = null; // PASTE HERE
// ============================================================
// GENERATE THE CODE
// ============================================================

function generate() {
  console.log('🚀 Generating audioLoader.js...\n');
  
  let output = `// ============================================================
// AUTO-GENERATED audioLoader.js
// Generated: ${new Date().toLocaleString()}
// ============================================================

const loadAudioById = (audioId) => {
  const audioMap = {
`;

  let totalCount = 0;
  
  // Loop through each level
  Object.keys(curriculum).forEach(levelKey => {
    const level = curriculum[levelKey];
    
    if (!level.weeks) return;
    
    output += `\n    // ========== ${levelKey.toUpperCase()} ==========\n`;
    
    // Loop through weeks
    level.weeks.forEach(week => {
      if (!week.audios) return;
      
      output += `    // Week ${week.weekNumber}: ${week.title}\n`;
      
      // Loop through audios
      week.audios.forEach(audio => {
        if (!audio.id || !audio.filePath) {
          console.warn(`⚠️  Skipping audio without id or filePath:`, audio.title);
          return;
        }
        
        totalCount++;
        output += `    '${audio.id}': () => require("${audio.filePath}"), // ${audio.title}\n`;
      });
      
      output += '\n';
    });
  });

  output += `  };

  const loader = audioMap[audioId];
  
  if (!loader) {
    console.warn(\`No audio found for ID: \${audioId}\`);
    return null;
  }

  try {
    return loader();
  } catch (error) {
    console.error(\`Error loading audio \${audioId}:\`, error);
    return null;
  }
};

export { loadAudioById };

// Helper to get all IDs
export const getAllAudioIds = () => Object.keys(loadAudioById.audioMap || {});

// Stats
export const audioStats = {
  totalFiles: ${totalCount},
  generatedAt: '${new Date().toISOString()}'
};
`;

  // Write to file or print to console
  const outputPath = path.join(__dirname, '../data/audioLoader.js');
  
  try {
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`✅ Successfully created: ${outputPath}`);
    console.log(`📊 Total audio files: ${totalCount}`);
    console.log(`📦 File size: ${(output.length / 1024).toFixed(2)} KB\n`);
  } catch (error) {
    // If can't write file, just print to console
    console.log('📋 Copy this code into your audioLoader.js:\n');
    console.log('─'.repeat(60));
    console.log(output);
    console.log('─'.repeat(60));
  }
}

// Run it
generate();

// ============================================================
// ALTERNATIVE: Generate from JSON file
// ============================================================

/**
 * If you want to keep your curriculum as JSON:
 * 
 * 1. Export curriculum to curriculum.json
 * 2. Use this function:
 */
function generateFromJSON() {
  const jsonPath = path.join(__dirname, '../src/data/curriculum.json');
  const curriculum = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Same generation logic as above
  generate();
}

// Uncomment to use JSON version:
// generateFromJSON();