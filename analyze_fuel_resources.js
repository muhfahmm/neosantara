// Script untuk menganalisis negara yang tidak memiliki batubara, gas alam, dan minyak bumi
const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, 'json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis');
const continents = ['afrika', 'asia', 'eropa', 'north_america', 'oceania', 'south_america'];

// Data struktur untuk menyimpan hasil
const results = {
  noFuels: [], // Negara tanpa ketiga bahan bakar
  partialFuels: {
    onlyCoal: [], // Hanya batubara
    onlyOil: [], // Hanya minyak bumi
    onlyGas: [], // Hanya gas alam
    coalAndOil: [], // Batubara dan minyak bumi
    coalAndGas: [], // Batubara dan gas alam
    oilAndGas: [], // Minyak bumi dan gas alam
  },
  allThreeFuels: [], // Negara dengan ketiga bahan bakar
  total: 0
};

// Fungsi untuk ekstrak nama negara dari nama file
function getCountryName(filename) {
  return filename.replace(/^\d+_/, '').replace(/\.ts$/, '').replace(/_/g, ' ');
}

// Loop melalui setiap continent
continents.forEach(continent => {
  const continentPath = path.join(resourcesDir, continent);
  
  if (!fs.existsSync(continentPath)) {
    console.log(`⚠️  Continent folder tidak ditemukan: ${continent}`);
    return;
  }
  
  const files = fs.readdirSync(continentPath).filter(f => f.endsWith('.ts'));
  
  files.forEach(filename => {
    try {
      const filePath = path.join(continentPath, filename);
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Ekstrak data dari file TypeScript
      const countryName = getCountryName(filename);
      const hasCoal = /batu_bara\s*:\s*([0-9]+)/.test(content);
      const coalValue = /batu_bara\s*:\s*([0-9]+)/.exec(content)?.[1] || 0;
      
      const hasOil = /minyak_bumi\s*:\s*([0-9]+)/.test(content);
      const oilValue = /minyak_bumi\s*:\s*([0-9]+)/.exec(content)?.[1] || 0;
      
      const hasGas = /gas_alam\s*:\s*([0-9]+)/.test(content);
      const gasValue = /gas_alam\s*:\s*([0-9]+)/.exec(content)?.[1] || 0;
      
      const country = {
        name: countryName,
        continent: continent.replace(/_/g, ' '),
        coal: parseInt(coalValue),
        oil: parseInt(oilValue),
        gas: parseInt(gasValue),
        hasFuel: (coalValue > 0 || oilValue > 0 || gasValue > 0)
      };
      
      results.total++;
      
      // Klasifikasi negara
      if (coalValue == 0 && oilValue == 0 && gasValue == 0) {
        results.noFuels.push(country);
      } else if (coalValue > 0 && oilValue == 0 && gasValue == 0) {
        results.partialFuels.onlyCoal.push(country);
      } else if (coalValue == 0 && oilValue > 0 && gasValue == 0) {
        results.partialFuels.onlyOil.push(country);
      } else if (coalValue == 0 && oilValue == 0 && gasValue > 0) {
        results.partialFuels.onlyGas.push(country);
      } else if (coalValue > 0 && oilValue > 0 && gasValue == 0) {
        results.partialFuels.coalAndOil.push(country);
      } else if (coalValue > 0 && oilValue == 0 && gasValue > 0) {
        results.partialFuels.coalAndGas.push(country);
      } else if (coalValue == 0 && oilValue > 0 && gasValue > 0) {
        results.partialFuels.oilAndGas.push(country);
      } else if (coalValue > 0 && oilValue > 0 && gasValue > 0) {
        results.allThreeFuels.push(country);
      }
    } catch (error) {
      console.error(`Error processing ${filename}: ${error.message}`);
    }
  });
});

// Generate report
console.log('\n' + '='.repeat(80));
console.log('ANALISIS MENDALAM: NEGARA DAN BAHAN BAKAR FOSIL');
console.log('='.repeat(80));

console.log(`\n📈 RINGKASAN STATISTIK:`);
console.log(`   Total Negara: ${results.total}`);
console.log(`   Negara dengan Ketiga Bahan Bakar: ${results.allThreeFuels.length}`);
console.log(`   Negara Tanpa Bahan Bakar Sama Sekali: ${results.noFuels.length}`);
console.log(`   Negara dengan Bahan Bakar Parsial: ${
  results.partialFuels.onlyCoal.length + 
  results.partialFuels.onlyOil.length + 
  results.partialFuels.onlyGas.length + 
  results.partialFuels.coalAndOil.length + 
  results.partialFuels.coalAndGas.length + 
  results.partialFuels.oilAndGas.length
}`);

console.log('\n' + '='.repeat(80));
console.log('🔴 NEGARA TANPA BAHAN BAKAR FOSIL SAMA SEKALI');
console.log('='.repeat(80));
if (results.noFuels.length === 0) {
  console.log('✅ Tidak ada negara tanpa bahan bakar fosil');
} else {
  console.log(`Total: ${results.noFuels.length} negara\n`);
  results.noFuels.forEach(c => {
    console.log(`  • ${c.name} (${c.continent})`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('⚠️  NEGARA DENGAN HANYA SATU JENIS BAHAN BAKAR');
console.log('='.repeat(80));

if (results.partialFuels.onlyCoal.length > 0) {
  console.log(`\n🌑 Hanya BATUBARA (${results.partialFuels.onlyCoal.length}):`);
  results.partialFuels.onlyCoal.forEach(c => {
    console.log(`  • ${c.name} (${c.continent}) - Batubara: ${c.coal}`);
  });
}

if (results.partialFuels.onlyOil.length > 0) {
  console.log(`\n⛽ Hanya MINYAK BUMI (${results.partialFuels.onlyOil.length}):`);
  results.partialFuels.onlyOil.forEach(c => {
    console.log(`  • ${c.name} (${c.continent}) - Minyak: ${c.oil}`);
  });
}

if (results.partialFuels.onlyGas.length > 0) {
  console.log(`\n💨 Hanya GAS ALAM (${results.partialFuels.onlyGas.length}):`);
  results.partialFuels.onlyGas.forEach(c => {
    console.log(`  • ${c.name} (${c.continent}) - Gas: ${c.gas}`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('⚠️  NEGARA DENGAN DUA JENIS BAHAN BAKAR');
console.log('='.repeat(80));

if (results.partialFuels.coalAndOil.length > 0) {
  console.log(`\n🌑+⛽ BATUBARA & MINYAK BUMI (${results.partialFuels.coalAndOil.length}):`);
  results.partialFuels.coalAndOil.forEach(c => {
    console.log(`  • ${c.name} (${c.continent}) - Batubara: ${c.coal}, Minyak: ${c.oil}`);
  });
}

if (results.partialFuels.coalAndGas.length > 0) {
  console.log(`\n🌑+💨 BATUBARA & GAS ALAM (${results.partialFuels.coalAndGas.length}):`);
  results.partialFuels.coalAndGas.forEach(c => {
    console.log(`  • ${c.name} (${c.continent}) - Batubara: ${c.coal}, Gas: ${c.gas}`);
  });
}

if (results.partialFuels.oilAndGas.length > 0) {
  console.log(`\n⛽+💨 MINYAK BUMI & GAS ALAM (${results.partialFuels.oilAndGas.length}):`);
  results.partialFuels.oilAndGas.forEach(c => {
    console.log(`  • ${c.name} (${c.continent}) - Minyak: ${c.oil}, Gas: ${c.gas}`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('✅ NEGARA DENGAN KETIGA BAHAN BAKAR FOSIL');
console.log('='.repeat(80));
console.log(`Total: ${results.allThreeFuels.length} negara\n`);
results.allThreeFuels.forEach(c => {
  console.log(`  • ${c.name} (${c.continent}) - Batubara: ${c.coal}, Minyak: ${c.oil}, Gas: ${c.gas}`);
});

console.log('\n' + '='.repeat(80));
console.log('BREAKDOWN BERDASARKAN REGION');
console.log('='.repeat(80));

const continentStats = {};
[...results.noFuels, ...results.partialFuels.onlyCoal, ...results.partialFuels.onlyOil, 
 ...results.partialFuels.onlyGas, ...results.partialFuels.coalAndOil, 
 ...results.partialFuels.coalAndGas, ...results.partialFuels.oilAndGas, 
 ...results.allThreeFuels].forEach(c => {
  if (!continentStats[c.continent]) {
    continentStats[c.continent] = { total: 0, withFuels: 0, withoutFuels: 0, partial: 0, all: 0 };
  }
  continentStats[c.continent].total++;
  if (results.noFuels.includes(c)) {
    continentStats[c.continent].withoutFuels++;
  } else if (results.allThreeFuels.includes(c)) {
    continentStats[c.continent].all++;
  } else {
    continentStats[c.continent].partial++;
    continentStats[c.continent].withFuels++;
  }
  if (c.coal > 0 || c.oil > 0 || c.gas > 0) {
    continentStats[c.continent].withFuels++;
  }
});

Object.entries(continentStats).forEach(([continent, stats]) => {
  console.log(`\n${continent.toUpperCase()}:`);
  console.log(`  Total Negara: ${stats.total}`);
  console.log(`  Tanpa Bahan Bakar: ${stats.withoutFuels}`);
  console.log(`  Bahan Bakar Parsial: ${stats.partial}`);
  console.log(`  Ketiga Bahan Bakar: ${stats.all}`);
});

// Save to file
const report = {
  summary: {
    totalCountries: results.total,
    countriesWithAllThreeFuels: results.allThreeFuels.length,
    countriesWithoutFuels: results.noFuels.length,
    countriesWithPartialFuels: results.partialFuels.onlyCoal.length + 
                              results.partialFuels.onlyOil.length + 
                              results.partialFuels.onlyGas.length + 
                              results.partialFuels.coalAndOil.length + 
                              results.partialFuels.coalAndGas.length + 
                              results.partialFuels.oilAndGas.length
  },
  details: results
};

fs.writeFileSync('fuel_analysis_report.json', JSON.stringify(report, null, 2));
console.log('\n✅ Laporan tersimpan di: fuel_analysis_report.json');
console.log('='.repeat(80));
