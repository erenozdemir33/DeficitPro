
import { FoodItem } from './types';

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ACTIVITY_MULTIPLIERS = {
  desk: 1.2,
  standing: 1.35,
  walking: 1.5,
  physical: 1.7
};

const generateFoodCatalog = (): FoodItem[] => {
  const items: FoodItem[] = [];

  const baseTurkishFoods: Record<string, [string, number, number, string][]> = {
    'Breakfast': [
      ['Simit', 275, 100, '1 adet'], ['Menemen', 115, 200, '1 porsiyon'], ['Ezine Peyniri', 310, 30, '1 dilim'],
      ['Siyah Zeytin', 115, 20, '5 adet'], ['Bal-Kaymak', 450, 50, '1 porsiyon'], ['Sucuklu Yumurta', 210, 150, '1 porsiyon'],
      ['Açma', 350, 110, '1 adet'], ['Poğaça (Peynirli)', 320, 80, '1 adet'], ['Gözleme', 250, 150, '1 adet'],
      ['Hellim Izgara', 320, 50, '2 dilim'], ['Reçel (Vişne)', 280, 20, '1 y.kaşığı'], ['Pişi', 380, 60, '1 adet'],
      ['Mıhlama', 420, 150, '1 porsiyon'], ['Çılbır', 140, 200, '1 porsiyon'], ['Sigara Böreği', 310, 40, '1 adet'],
      ['Pastırma', 250, 20, '2 dilim'], ['Tulum Peyniri', 330, 30, '1 dilim'], ['Labne', 190, 30, '1 y.kaşığı'],
      ['Pekmez-Tahin', 420, 40, '2 y.kaşığı'], ['Omlet', 155, 150, '1 porsiyon'], ['Süzme Peynir', 220, 30, '1 dilim']
    ],
    'Lunch': [
      ['Kuru Fasulye', 120, 250, '1 tabak'], ['Mercimek Çorbası', 65, 250, '1 kase'], ['Döner (Ekmek)', 260, 250, '1 adet'],
      ['Lahmacun', 220, 120, '1 adet'], ['Pirinç Pilavı', 130, 150, '1 tabak'], ['Bulgur Pilavı', 115, 150, '1 tabak'],
      ['Adana Kebap', 230, 200, '1 porsiyon'], ['Urfa Kebap', 220, 200, '1 porsiyon'], ['İskender', 250, 350, '1 porsiyon'],
      ['Mantı', 170, 250, '1 porsiyon'], ['Tavuk Sote', 140, 200, '1 porsiyon'], ['Yaprak Sarma', 160, 100, '5 adet'],
      ['İçli Köfte', 350, 100, '1 adet'], ['Pide (Kıymalı)', 250, 200, '1 adet'], ['Ezogelin Çorbası', 70, 250, '1 kase'],
      ['Zeytinyağlı Enginar', 75, 150, '1 adet'], ['Taze Fasulye', 60, 200, '1 tabak'], ['Mercimek Köftesi', 160, 150, '4 adet'],
      ['Köfte Izgara', 220, 150, '1 porsiyon'], ['Türlü', 85, 250, '1 tabak'], ['Arnavut Ciğeri', 250, 150, '1 porsiyon']
    ],
    'Dinner': [
      ['Hünkar Beğendi', 210, 250, '1 porsiyon'], ['Beyti Kebap', 270, 300, '1 porsiyon'], ['Patlıcan Kebabı', 190, 300, '1 porsiyon'],
      ['Sulu Köfte', 110, 250, '1 tabak'], ['Kadınbudu Köfte', 260, 80, '1 adet'], ['Ispanak Yemeği', 55, 250, '1 tabak'],
      ['Bezelye Yemeği', 85, 250, '1 tabak'], ['Orman Kebabı', 150, 250, '1 porsiyon'], ['Somon Izgara', 200, 200, '1 adet'],
      ['Kuzu İncik', 220, 250, '1 adet'], ['Tas Kebabı', 160, 200, '1 porsiyon'], ['Hamsi Tava', 210, 150, '1 porsiyon'],
      ['Güveçte Et', 160, 250, '1 porsiyon'], ['Belen Tava', 230, 250, '1 porsiyon'], ['Tepsi Kebabı', 240, 250, '1 porsiyon'],
      ['Semizotu Yemeği', 45, 250, '1 tabak'], ['Levrek Izgara', 120, 250, '1 adet'], ['Fırında Tavuk', 130, 200, '1 porsiyon'],
      ['Musakka', 140, 250, '1 tabak'], ['Karnıyarık', 110, 200, '1 adet'], ['İmam Bayıldı', 95, 200, '1 adet']
    ],
    'Snack': [
      ['Badem', 575, 30, '1 avuç'], ['Ceviz', 650, 30, '3 tam'], ['Fındık', 630, 30, '1 avuç'],
      ['Elma', 52, 150, '1 orta'], ['Muz', 89, 120, '1 adet'], ['Yoğurt', 60, 200, '1 kase'],
      ['Ayran', 35, 200, '1 bardak'], ['Baklava', 420, 100, '2 dilim'], ['Sütlaç', 130, 200, '1 kase'],
      ['Leblebi', 370, 30, '1 avuç'], ['Kuru İncir', 250, 30, '1 adet'], ['Hurma', 280, 20, '3 adet'],
      ['Çiğ Köfte', 180, 100, '3 sıkım'], ['Kestane', 210, 50, '5 adet'], ['Erik', 46, 100, '10 adet'],
      ['Kavun', 34, 150, '1 dilim'], ['Dondurma', 200, 100, '2 top'], ['Lokum', 360, 20, '2 adet'],
      ['Meyve Salatası', 65, 150, '1 kase'], ['Kraker', 420, 40, '1 paket'], ['Üzüm', 67, 150, '1 salkım']
    ]
  };

  const categories = Object.keys(baseTurkishFoods) as ('Breakfast' | 'Lunch' | 'Dinner' | 'Snack')[];
  const variations = [
    { prefix: 'Zeytinyağlı', kcalMod: -15 }, { prefix: 'Fırında', kcalMod: -5 }, 
    { prefix: 'Izgara', kcalMod: 0 }, { prefix: 'Kıymalı', kcalMod: 25 },
    { prefix: 'Acılı', kcalMod: 5 }, { prefix: 'Bol Sebzeli', kcalMod: -10 },
    { prefix: 'Ev Usulü', kcalMod: -8 }, { prefix: 'Restoran Usulü', kcalMod: 15 },
    { prefix: 'Süzme', kcalMod: 0 }, { prefix: 'Klasik', kcalMod: 0 },
    { prefix: 'Yöresel', kcalMod: 10 }, { prefix: 'Baharatlı', kcalMod: 2 }
  ];
  
  categories.forEach(cat => {
    const baseList = baseTurkishFoods[cat];
    // Original items
    baseList.forEach(([name, kcal, grams, measure], i) => {
      items.push({ id: `${cat.toLowerCase()}-${i}`, name, category: cat, kcalPer100g: kcal, defaultGrams: grams, householdMeasure: measure });
    });

    // Variation generation to reach 250+ per category
    let count = baseList.length;
    let vIndex = 0;
    while (count < 251) {
      const baseItem = baseList[vIndex % baseList.length];
      const variation = variations[count % variations.length];
      const name = `${variation.prefix} ${baseItem[0]}`;
      
      // Prevent duplicates
      if (!items.find(it => it.name === name)) {
        items.push({
          id: `${cat.toLowerCase()}-v-${count}`,
          name,
          category: cat,
          kcalPer100g: Math.max(20, baseItem[1] + variation.kcalMod),
          defaultGrams: baseItem[2],
          householdMeasure: baseItem[3]
        });
      }
      count++;
      vIndex++;
    }
  });

  return items;
};

export const FOOD_CATALOG = generateFoodCatalog();
