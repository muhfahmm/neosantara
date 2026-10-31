import sys

with open('apps/src/app/page/map_system/map-system.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add activeWarAnimationRef
old_anim_def = "    const [activeWarAnimation, setActiveWarAnimation] = useState<any>(null);\n    const [isWarAnalysisActive, setIsWarAnalysisActive] = useState(false);"
new_anim_def = """    const [activeWarAnimation, setActiveWarAnimation] = useState<any>(null);
    const activeWarAnimationRef = useRef<any>(null);
    activeWarAnimationRef.current = activeWarAnimation;
    const [isWarAnalysisActive, setIsWarAnalysisActive] = useState(false);"""

# Normalize CRLF / LF for replacement
content = content.replace("\r\n", "\n")

if old_anim_def not in content:
    print("Error: old_anim_def not found!")
    sys.exit(1)

content = content.replace(old_anim_def, new_anim_def, 1)

# 2. Check if animation already active in handleStartWarAnimation
old_start_war = """        const handleStartWarAnimation = async (event: Event) => {
            const detail = (event as CustomEvent).detail;"""

new_start_war = """        const handleStartWarAnimation = async (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (activeWarAnimationRef.current) {
                // Jangan batalkan animasi perang yang sedang berjalan, masukkan ke antrean!
                setNpcWarQueue(previous => [...previous, detail]);
                return;
            }"""

if old_start_war not in content:
    print("Error: old_start_war not found!")
    sys.exit(1)

content = content.replace(old_start_war, new_start_war, 1)

# 3. Fix onResolve in WarMap to reset npcWarQueueRunningRef.current = false
old_resolve = """                            setIsWarAnalysisActive(false);
                            setActiveWarAnimation(null);
                            resumeGameTimeAfterWar();"""

new_resolve = """                            setIsWarAnalysisActive(false);
                            setActiveWarAnimation(null);
                            npcWarQueueRunningRef.current = false;
                            resumeGameTimeAfterWar();"""

if old_resolve not in content:
    print("Error: old_resolve not found!")
    sys.exit(1)

content = content.replace(old_resolve, new_resolve, 1)

# 4. Fix modalTargetCountry in handleCanvasCountryClick
old_modal_target = """                    // Jika negara telah teraneksasi sepenuhnya, buka langsung atas nama negara penguasa penakluk!
                    const modalTargetCountry = isEntireCountryAnnexed
                        ? capturedCity.ownerCountry
                        : originalCountry;

                    setCountryDetailModalName(modalTargetCountry);"""

new_modal_target = """                    // Buka modal detail negara berdasarkan wilayah aslinya agar sistem mendeteksi identitas wilayah & bendera penguasa
                    const modalTargetCountry = originalCountry;

                    setCountryDetailModalName(modalTargetCountry);"""

if old_modal_target not in content:
    print("Error: old_modal_target not found!")
    sys.exit(1)

content = content.replace(old_modal_target, new_modal_target, 1)

with open('apps/src/app/page/map_system/map-system.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("map-system.tsx successfully updated!")

