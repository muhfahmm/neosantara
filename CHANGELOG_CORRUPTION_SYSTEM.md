# Changelog - Sistem Korupsi v2.0

## [2.0.0] - 2026-10-18

### 🎯 Major Update: Narasi Korupsi Berbasis Kementerian

#### ✨ Added
- **Ministry Mapping**: Setiap skandal korupsi kini terhubung dengan kementerian/jabatan spesifik (22 kementerian)
- **Detail Descriptions**: 50 skema korupsi memiliki narasi detail yang menjelaskan modus operandi
- **Enhanced Notifications**: Format notifikasi baru dengan emoji, severity level, dan deskripsi lengkap
- **Helper Functions**: 
  - `getCorruptionMinistries()` - List semua kementerian terkait
  - `getSchemesByMinistry(ministry)` - Filter skema per kementerian
  - `getSchemeDescription(schemeId)` - Get deskripsi detail skandal

#### 🔄 Changed
- **Interface CorruptionScheme**: Ditambahkan field `ministry: string` dan `description: string`
- **Notification Format**: 
  - Dari: `"Skandal korupsi terungkap: [Nama]"`
  - Ke: `"🚨 [SEVERITY] [Nama] - [Kementerian]"` dengan deskripsi lengkap
- **50 Corruption Schemes**: Semua updated dengan ministry dan description

#### 📊 Statistics
- Total Skema: **50** (unchanged)
- Total Kementerian: **22** (new)
- Total Kategori: **10** (10 kategori korupsi)
- Severity Levels: **3** (Ringan, Sedang, Berat)

#### 🎮 Gameplay Impact
- **Immersion**: Player tahu persis kementerian mana yang bermasalah
- **Strategic**: Bisa fokus upgrade kementerian dengan risiko tinggi
- **Realism**: Narasi detail membuat skandal terasa nyata
- **Accountability**: Clear feedback loop antara tindakan dan outcome

#### 🔧 Technical
- **Backward Compatible**: ✅ 100% - Semua ID dan struktur data lama tetap bekerja
- **Breaking Changes**: ❌ None
- **Migration Needed**: ❌ No - Automatic upgrade
- **Performance**: No impact - Hanya penambahan string fields

#### 📁 Files Modified
1. `apps/src/app/page/.../corruptionLogic.ts`
   - Extended `CorruptionScheme` interface
   - Updated all 50 schemes
   - Added 4 helper functions

2. `apps/src/app/page/.../scandalLogic.ts`
   - Updated notification generation
   - Uses scheme description in messages

#### 📝 Documentation Added
- `CORRUPTION_NARRATIVE_SYSTEM.md` - Full system documentation
- `README_CORRUPTION_UPDATE.md` - Usage guide
- `corruptionLogic.test.ts` - Test cases

#### ✅ Testing
- All tests pass ✓
- 50/50 schemes validated ✓
- 22 ministries mapped ✓
- Helper functions working ✓
- Notification format verified ✓

---

### Example Notification

**Before:**
```
Skandal korupsi terungkap: Mark-up Alutsista
Skandal Mark-up Alutsista (sedang) terungkap...
```

**After:**
```
🚨 [KASUS SEDANG] Mark-up Alutsista - Kementerian Pertahanan

Pembelian alutsista di-mark-up hingga 300% dari harga pasar oleh 
oknum Kementerian Pertahanan. Kerugian negara diperkirakan 
1.500.000 NEO. Tingkat kepuasan rakyat turun 2 poin akibat 
skandal ini. Segera buka menu Pemberantasan Korupsi untuk 
menyelidiki dan menuntaskan kasus.
```

---

## Future Enhancements (Roadmap)

### v2.1 - Ministry Risk System
- [ ] Level kementerian mempengaruhi probabilitas korupsi
- [ ] Dynamic risk calculation per ministry

### v2.2 - Reputation System
- [ ] Each ministry has reputation score
- [ ] Corruption impacts ministry reputation
- [ ] Low reputation = sector penalties

### v2.3 - Reform Actions
- [ ] Ministry-specific anti-corruption actions
- [ ] Cabinet reshuffle feature
- [ ] Prevention measures

### v2.4 - Investigation Enhancement
- [ ] Investigation clues point to specific ministry
- [ ] Chain of corruption discovery
- [ ] Whistleblower system per ministry

---

**Author**: Kiro AI Assistant  
**Review Status**: ✅ Tested and Verified  
**Production Ready**: ✅ Yes  
**Migration Required**: ❌ No
