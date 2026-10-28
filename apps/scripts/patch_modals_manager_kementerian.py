with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/ModalsManager.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
"""        case "Dashboard:Kementerian":
          return (
            <KementerianModal
              isOpen={true}
              onClose={onClose}
              countryDetail={countryDetail}
              setCountryDetail={setCountryDetail}
              resetTrigger={resetTrigger}
            />
          );""",
"""        case "Dashboard:Kementerian":
          return (
            <KementerianModal
              isOpen={true}
              onClose={onClose}
              countryDetail={countryDetail}
              setCountryDetail={setCountryDetail}
              resetTrigger={resetTrigger}
              currentDate={currentDate}
            />
          );"""
)

with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/ModalsManager.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated ModalsManager.tsx")

