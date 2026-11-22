import json
import os

BASE_DIR = r"apps\src\app\page\paused_menu\terjemahan_paused_menu"
LANGS = ["id", "en", "zh-CN", "es", "de", "ja", "ko", "ar"]

TEXT_UPDATES = {
    "id": {
        "items": {
            "negara_sejahtera": {
                "title": "Negara Sejahtera",
                "description": "Tingkatkan indeks kesejahteraan nasional sebesar +10 dari target sebelumnya hingga mencapai target puncak 100/100."
            },
            "kebahagiaan_merata": {
                "title": "Kebahagiaan Merata",
                "description": "Tingkatkan indeks kepuasan rakyat sebesar +10 dari target bertahap hingga menyentuh kepuasan maksimal 100%."
            },
            "penduduk_sehat": {
                "title": "Penduduk Sehat",
                "description": "Jaga kesehatan masyarakat dan minimalkan angka kematian akibat wabah atau penyakit hingga di bawah 20%."
            },
            "pertumbuhan_terjaga": {
                "title": "Pertumbuhan Terjaga",
                "description": "Pertahankan laju pertumbuhan populasi agar tetap surplus (+) selama 6 bulan berturut-turut tanpa mengalami defisit (-). Petunjuk: Pastikan pemenuhan pangan, fasilitas hunian, dan stabilitas keamanan selalu tercukupi agar tidak terjadi penurunan populasi."
            },
            "anggaran_sehat": {
                "title": "Anggaran Sehat",
                "description": "Catat surplus anggaran dan pendapatan kas negara yang stabil selama periode {periodText} (target evaluasi: {targetDate})."
            },
            "mitra_dagang_dunia": {
                "title": "Mitra Dagang Dunia",
                "description": "Lakukan transaksi pada Pasar Perdagangan Global dengan menekan Jual, Beli, atau Jual Semua untuk menambah kas negara dan memperluas perdagangan global."
            },
            "daya_beli_terjaga": {
                "title": "Daya Beli Terjaga",
                "description": "Pertahankan Indeks Kepuasan Rakyat atas Harga Barang Pokok di atas target bertahap: 65, 75, dan 80. Klaim hadiah saat ini untuk mengaktifkan target berikutnya!"
            }
        }
    },
    "en": {
        "items": {
            "negara_sejahtera": {
                "title": "Prosperous Nation",
                "description": "Increase the national welfare index by +10 from the previous milestone until reaching the peak target of 100/100."
            },
            "kebahagiaan_merata": {
                "title": "Universal Happiness",
                "description": "Increase overall civil satisfaction by +10 from the previous step until reaching max 100% satisfaction."
            },
            "penduduk_sehat": {
                "title": "Healthy Population",
                "description": "Maintain public health and minimize disease/outbreak mortality rate below 20%."
            },
            "pertumbuhan_terjaga": {
                "title": "Sustained Growth",
                "description": "Maintain positive population growth (+) for 6 consecutive months without experiencing any deficit (-). Hint: Ensure adequate food supplies, housing, and public safety to prevent population decline."
            },
            "anggaran_sehat": {
                "title": "Healthy Budget",
                "description": "Record national budget surplus and treasury stability over a {periodText} period (target evaluation: {targetDate})."
            },
            "mitra_dagang_dunia": {
                "title": "Global Trade Partner",
                "description": "Conduct transactions in the Global Trade Market via Sell, Buy, or Sell All to expand national treasury."
            },
            "daya_beli_terjaga": {
                "title": "Guarded Purchasing Power",
                "description": "Maintain Civil Satisfaction Index for Essential Goods Prices above tiered targets: 65, 75, and 80. Claim each reward to unlock the next level!"
            }
        }
    },
    "zh-CN": {
        "items": {
            "negara_sejahtera": {
                "title": "繁荣国家",
                "description": "将国家福祉指数在前一目标基础上提升+10，直至达到最高目标100/100。"
            },
            "kebahagiaan_merata": {
                "title": "普天同庆",
                "description": "将民众满意度指数在前一目标基础上提升+10，直至达到最高满意度100%。"
            },
            "penduduk_sehat": {
                "title": "健康国民",
                "description": "维护公共卫生，将疫情或疾病死亡率控制在20%以下。"
            },
            "pertumbuhan_terjaga": {
                "title": "持续增长",
                "description": "保持人口连续6个月维持正增长（+）且无赤字（-）。提示：确保充足的粮食供应、住房和安全保障，以防止人口下降。"
            },
            "anggaran_sehat": {
                "title": "稳健预算",
                "description": "在{periodText}期间保持国家预算盈余与国库稳定（评估截止日期：{targetDate}）。"
            },
            "mitra_dagang_dunia": {
                "title": "全球贸易伙伴",
                "description": "通过全球贸易市场执行出售、购买或全部出售交易，充实国家金库。"
            },
            "daya_beli_terjaga": {
                "title": "购买力保障",
                "description": "将基本商品价格民众满意度指数维持在阶梯目标之上：65、75和80。领取当前奖励即可激活下一阶梯目标！"
            }
        }
    },
    "es": {
        "items": {
            "negara_sejahtera": {
                "title": "Nación Próspera",
                "description": "Aumenta el índice de bienestar nacional en +10 respecto al objetivo anterior hasta alcanzar 100/100."
            },
            "kebahagiaan_merata": {
                "title": "Felicidad Compartida",
                "description": "Aumenta la satisfacción ciudadana en +10 respecto al paso anterior hasta alcanzar el 100%."
            },
            "penduduk_sehat": {
                "title": "Población Saludable",
                "description": "Mantén la salud pública y minimiza la tasa de mortalidad por brotes/enfermedades por debajo del 20%."
            },
            "pertumbuhan_terjaga": {
                "title": "Crecimiento Sostenido",
                "description": "Mantén un crecimiento poblacional con superávit (+) durante 6 meses consecutivos sin déficit (-). Consejo: Asegura alimentos, vivienda y seguridad para evitar pérdidas de población."
            },
            "anggaran_sehat": {
                "title": "Presupuesto Saludable",
                "description": "Registra superávit presupuestario y estabilidad fiscal durante {periodText} (evaluación: {targetDate})."
            },
            "mitra_dagang_dunia": {
                "title": "Socio Comercial Global",
                "description": "Realiza transacciones en el Mercado Comercial Global mediante Vender, Comprar o Vender Todo para aumentar las arcas del estado."
            },
            "daya_beli_terjaga": {
                "title": "Poder Adquisitivo Protegido",
                "description": "Mantén el Índice de Satisfacción en Precios Básicos por encima de las metas: 65, 75 y 80. ¡Reclama para activar el siguiente nivel!"
            }
        }
    },
    "de": {
        "items": {
            "negara_sejahtera": {
                "title": "Wohlhabende Nation",
                "description": "Erhöhen Sie den Wohlstandsindex um +10 ausgehend vom vorherigen Meilenstein bis zum Höchstwert 100/100."
            },
            "kebahagiaan_merata": {
                "title": "Universelles Glück",
                "description": "Steigern Sie die Bürgerzufriedenheit um jeweils +10 bis zum Maximum von 100%."
            },
            "penduduk_sehat": {
                "title": "Gesunde Bevölkerung",
                "description": "Schützen Sie die öffentliche Gesundheit und halten Sie die Krankheitsmortalität unter 20%."
            },
            "pertumbuhan_terjaga": {
                "title": "Beständiges Wachstum",
                "description": "Halten Sie das Bevölkerungswachstum 6 aufeinanderfolgende Monate im Überschuss (+) ohne Defizit (-). Hinweis: Sichern Sie Nahrung, Wohnraum und Sicherheit."
            },
            "anggaran_sehat": {
                "title": "Gesunder Haushalt",
                "description": "Halten Sie den Staatshaushalt über {periodText} im Überschuss (Stichtag: {targetDate})."
            },
            "mitra_dagang_dunia": {
                "title": "Globaler Handelspartner",
                "description": "Führen Sie Transaktionen auf dem Weltmarkt via Verkaufen, Kaufen oder Alles Verkaufen durch."
            },
            "daya_beli_terjaga": {
                "title": "Gesicherte Kaufkraft",
                "description": "Halten Sie den Zufriedenheitsindex für Grundpreise über den Stufen 65, 75 und 80. Belohnung einfordern schaltet die nächste Stufe frei!"
            }
        }
    },
    "ja": {
        "items": {
            "negara_sejahtera": {
                "title": "繁栄する国家",
                "description": "国家福利指数を前回の目標から+10ずつ引き上げ、最終目標100/100を目指します。"
            },
            "kebahagiaan_merata": {
                "title": "万民の幸福",
                "description": "国民満足度を段階的に+10ずつ高め、最大100%を目指します。"
            },
            "penduduk_sehat": {
                "title": "健やかな国民",
                "description": "公衆衛生を保ち、感染症や疫病による死亡率を20%未満に抑えます。"
            },
            "pertumbuhan_terjaga": {
                "title": "持続的な成長",
                "description": "人口増加率を6ヶ月連続で黒字（+）に維持してください（赤字不可）。ヒント: 食料、住宅、治安を維持し人口減少を防ぎます。"
            },
            "anggaran_sehat": {
                "title": "健全な財政",
                "description": "{periodText}間にわたり国家予算の黒字と国庫の安定を達成（評価期日: {targetDate}）。"
            },
            "mitra_dagang_dunia": {
                "title": "国際貿易パートナー",
                "description": "世界貿易市場で「売却」「購入」「一括売却」を実行して国庫を潤します。"
            },
            "daya_beli_terjaga": {
                "title": "守られた購買力",
                "description": "必需品価格の国民満足度を段階目標（65、75、80）以上に維持。報酬受取で次の段階が解禁！"
            }
        }
    },
    "ko": {
        "items": {
            "negara_sejahtera": {
                "title": "번영하는 국가",
                "description": "국가 복지 지수를 이전 목표치보다 +10씩 올려 최고 목표치 100/100을 달성하세요."
            },
            "kebahagiaan_merata": {
                "title": "골고루 누리는 행복",
                "description": "시민 만족도를 단계별로 +10씩 높여 최대 100%에 도달하세요."
            },
            "penduduk_sehat": {
                "title": "건강한 국민",
                "description": "공중 보건을 관리하여 질병 및 전염병 사망률을 20% 미만으로 억제하세요."
            },
            "pertumbuhan_terjaga": {
                "title": "안정적인 성장",
                "description": "인구 증가율을 6개월 연속 흑자(+)로 유지하세요 (적자 금지). 힌트: 식량, 주거, 치안을 유지하여 인구 감소를 예방하세요."
            },
            "anggaran_sehat": {
                "title": "건전한 재정",
                "description": "{periodText} 동안 국가 재정 흑자와 국고 안정을 유지하세요 (목표 평가일: {targetDate})."
            },
            "mitra_dagang_dunia": {
                "title": "세계 무역 파트너",
                "description": "글로벌 무역 시장에서 판매, 구매, 전량 판매를 진행하여 국고를 늘리세요."
            },
            "daya_beli_terjaga": {
                "title": "안정된 구매력",
                "description": "필수 생필품 가격에 대한 국민 만족도를 단계별 목표(65, 75, 80) 이상으로 유지하세요. 수령 시 다음 단계 활성화!"
            }
        }
    },
    "ar": {
        "items": {
            "negara_sejahtera": {
                "title": "أمة مزدهرة",
                "description": "ارفع مؤشر الرفاه الوطني بمقدار +10 عن الهدف السابق حتى الوصول إلى 100/100."
            },
            "kebahagiaan_merata": {
                "title": "سعادة متكافئة",
                "description": "ارفع رضا المواطنين تدريجياً بمقدار +10 حتى بلوغ 100% كحد أقصى."
            },
            "penduduk_sehat": {
                "title": "سكان أصحاء",
                "description": "حافظ على الصحة العامة وخفض معدل وفيات الأوبئة إلى أقل من 20%."
            },
            "pertumbuhan_terjaga": {
                "title": "نمو مستدام",
                "description": "حافظ على فائض النمو السكاني (+) لمدة 6 أشهر متتالية دون عجز (-). تلميح: وفر الغذاء والسكن والأمن."
            },
            "anggaran_sehat": {
                "title": "ميزانية سليمة",
                "description": "حقق فائضاً واستقراراً في ميزانية الدولة لمدة {periodText} (تاريخ التقييم: {targetDate})."
            },
            "mitra_dagang_dunia": {
                "title": "شريك تجاري عالمي",
                "description": "قم بعمليات بيع أو شراء أو بيع الكل في سوق التجارة العالمية لزيادة خزينة الدولة."
            },
            "daya_beli_terjaga": {
                "title": "قدرة شرائية مصونة",
                "description": "حافظ على مؤشر رضا أسعار السلع الأساسية فوق المستويات: 65 و75 و80. استلم المكافأة لتفعيل المستوى التالي!"
            }
        }
    }
}

for lang in LANGS:
    p = os.path.join(BASE_DIR, lang, "side_menu", "pencapaian", "pencapaian.json")
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Hapus rantai_produksi_lengkap
        if "items" in data and "rantai_produksi_lengkap" in data["items"]:
            del data["items"]["rantai_produksi_lengkap"]
        
        # Update teks baru
        if lang in TEXT_UPDATES and "items" in TEXT_UPDATES[lang]:
            for key, val in TEXT_UPDATES[lang]["items"].items():
                if key in data.get("items", {}):
                    data["items"][key].update(val)
                elif "items" in data:
                    data["items"][key] = val
        
        with open(p, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated {p}")
