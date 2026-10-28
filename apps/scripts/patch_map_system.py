with open('apps/src/app/page/map_system/map-system.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add countryDetailModalCity state right after countryDetailModalName
text = text.replace(
"""    const [countryDetailModalOpen, setCountryDetailModalOpen] = useState(false);
    const [countryDetailModalName, setCountryDetailModalName] = useState<string | null>(null);""",
"""    const [countryDetailModalOpen, setCountryDetailModalOpen] = useState(false);
    const [countryDetailModalName, setCountryDetailModalName] = useState<string | null>(null);
    const [countryDetailModalCity, setCountryDetailModalCity] = useState<string | null>(null);"""
)

# 2. In handleMapClick, extract selected_city and pass to setCountryDetailModalCity
text = text.replace(
"""            if (isPlayer) {
                setPlayerDetailModalOpen(true);
            } else {
                setCountryDetailModalName(countryName);
                setAiConstructionNavigation(null);
                setCountryDetailModalOpen(true);
            }""",
"""            if (isPlayer) {
                setPlayerDetailModalOpen(true);
            } else {
                const clickedCity = clickedCountry?.selected_city || clickedCountry?.capital || null;
                setCountryDetailModalName(countryName);
                setCountryDetailModalCity(clickedCity);
                setAiConstructionNavigation(null);
                setCountryDetailModalOpen(true);
            }"""
)

# 3. Clear countryDetailModalCity on onClose and when resetting
text = text.replace(
"""                onClose={() => {
                    setCountryDetailModalOpen(false);
                    setCountryDetailModalName(null);
                    setAiConstructionNavigation(null);
                    setAutoBuildEmbassyState(false);
                }}""",
"""                selectedCity={countryDetailModalCity}
                onClose={() => {
                    setCountryDetailModalOpen(false);
                    setCountryDetailModalName(null);
                    setCountryDetailModalCity(null);
                    setAiConstructionNavigation(null);
                    setAutoBuildEmbassyState(false);
                }}"""
)

# 4. In reset on other locations where setCountryDetailModalName(null) is called
text = text.replace(
"""                    setCountryDetailModalOpen(false);
                    setCountryDetailModalName(null);""",
"""                    setCountryDetailModalOpen(false);
                    setCountryDetailModalName(null);
                    setCountryDetailModalCity(null);"""
)

with open('apps/src/app/page/map_system/map-system.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated map-system.tsx successfully")

