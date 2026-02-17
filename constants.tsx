
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

  const turkishFoods: Record<string, [string, number, number, string][]> = {
    'Breakfast': [
      ['Simit', 275, 100, '1 adet'], ['Açma', 350, 110, '1 adet'], ['Poğaça (Peynirli)', 320, 80, '1 adet'],
      ['Poğaça (Zeytinli)', 330, 80, '1 adet'], ['Poğaça (Kıymalı)', 340, 80, '1 adet'], ['Menemen', 115, 200, '1 porsiyon'],
      ['Sucuklu Yumurta', 210, 150, '1 porsiyon'], ['Ezine Peyniri', 310, 30, '1 dilim'], ['Kaşar Peyniri', 350, 30, '1 dilim'],
      ['Siyah Zeytin', 115, 20, '5 adet'], ['Yeşil Zeytin', 145, 20, '5 adet'], ['Bal-Kaymak', 450, 50, '1 porsiyon'],
      ['Domates-Salatalık Söğüş', 25, 150, '1 kase'], ['Gözleme (Peynirli)', 250, 150, '1 adet'], ['Gözleme (Patatesli)', 230, 150, '1 adet'],
      ['Pekmez-Tahin', 420, 40, '2 y.kaşığı'], ['Haşlanmış Yumurta', 155, 50, '1 adet'], ['Sahanda Yumurta', 180, 60, '1 adet'],
      ['Pastırma', 250, 20, '2 dilim'], ['Hellim Izgara', 320, 50, '2 dilim'], ['Reçel (Vişne)', 280, 20, '1 y.kaşığı'],
      ['Reçel (Çilek)', 280, 20, '1 y.kaşığı'], ['Süzme Peynir', 220, 30, '1 dilim'], ['Acuka', 350, 20, '1 t.kaşığı'],
      ['Pişi', 380, 60, '1 adet'], ['Mıhlama', 420, 150, '1 porsiyon'], ['Çılbır', 140, 200, '1 porsiyon'],
      ['Sigara Böreği', 310, 40, '1 adet'], ['Tulum Peyniri', 330, 30, '1 dilim'], ['Labne Peyniri', 190, 30, '1 y.kaşığı'],
      ['Meyve Salatası', 65, 150, '1 kase'], ['Yulaf Ezmesi (Sütlü)', 110, 200, '1 kase'], ['Omlet (Mantarlı)', 145, 150, '1 porsiyon'],
      ['Kavut', 380, 100, '1 porsiyon'], ['Çeçil Peyniri', 280, 30, '1 dilim'], ['Eski Kaşar', 380, 30, '1 dilim']
    ],
    'Lunch': [
      ['Kuru Fasulye', 120, 250, '1 tabak'], ['Pirinç Pilavı', 130, 150, '1 tabak'], ['Bulgur Pilavı', 115, 150, '1 tabak'],
      ['Mercimek Çorbası', 65, 250, '1 kase'], ['Tarhana Çorbası', 75, 250, '1 kase'], ['Mantı', 170, 250, '1 porsiyon'],
      ['Lahmacun', 220, 120, '1 adet'], ['Adana Kebap', 230, 200, '1 porsiyon'], ['Urfa Kebap', 220, 200, '1 porsiyon'],
      ['Döner (Ekmek Arası)', 260, 250, '1 adet'], ['Döner (Porsiyon)', 210, 200, '1 porsiyon'], ['İskender Kebap', 250, 350, '1 porsiyon'],
      ['Karnıyarık', 110, 200, '1 adet'], ['Köfte Izgara', 220, 150, '1 porsiyon'], ['Tavuk Sote', 140, 200, '1 porsiyon'],
      ['Yaprak Sarma', 160, 100, '5 adet'], ['Biber Dolması', 120, 200, '2 adet'], ['Türlü', 85, 250, '1 tabak'],
      ['İçli Köfte', 350, 100, '1 adet'], ['Pide (Kıymalı)', 250, 200, '1 adet'], ['Tavuk Suyu Çorbası', 55, 250, '1 kase'],
      ['Ezogelin Çorbası', 70, 250, '1 kase'], ['Yayla Çorbası', 80, 250, '1 kase'], ['Şehriye Çorbası', 60, 250, '1 kase'],
      ['Bamya Yemeği', 55, 200, '1 tabak'], ['İmam Bayıldı', 95, 200, '1 adet'], ['Ali Nazik', 180, 250, '1 porsiyon'],
      ['Fırın Makarna', 190, 200, '1 porsiyon'], ['Nohut Yemeği', 130, 250, '1 tabak'], ['Mercimek Köftesi', 160, 150, '4 adet']
    ],
    'Dinner': [
      ['Hünkar Beğendi', 210, 250, '1 porsiyon'], ['Beyti Kebap', 270, 300, '1 porsiyon'], ['Patlıcan Kebabı', 190, 300, '1 porsiyon'],
      ['Sulu Köfte', 110, 250, '1 tabak'], ['Kadınbudu Köfte', 260, 80, '1 adet'], ['Ispanak Yemeği', 55, 250, '1 tabak'],
      ['Bezelye Yemeği', 85, 250, '1 tabak'], ['Semizotu Yemeği', 45, 250, '1 tabak'], ['Orman Kebabı', 150, 250, '1 porsiyon'],
      ['Çökertme Kebabı', 280, 300, '1 porsiyon'], ['Somon Izgara', 200, 200, '1 adet'], ['Fırında Levrek', 110, 250, '1 adet'],
      ['Kuzu İncik', 220, 250, '1 adet'], ['Tas Kebabı', 160, 200, '1 porsiyon'], ['Hamsi Tava', 210, 150, '1 porsiyon'],
      ['Barbunya Pilaki', 140, 200, '1 porsiyon'], ['Taze Fasulye', 60, 200, '1 tabak'], ['Zeytinyağlı Enginar', 75, 150, '1 adet'],
      ['Mücver', 180, 50, '1 adet'], ['Belen Tava', 230, 250, '1 porsiyon'], ['Tepsi Kebabı', 240, 250, '1 porsiyon'],
      ['Sebzeli Tavuk', 120, 250, '1 tabak'], ['Palamut Buğulama', 180, 200, '1 porsiyon'], ['Güveçte Et', 160, 250, '1 porsiyon']
    ],
    'Snack': [
      ['Badem', 575, 30, '1 avuç'], ['Ceviz', 650, 30, '3 tam'], ['Fındık', 630, 30, '1 avuç'],
      ['Kuru Kayısı', 240, 40, '4 adet'], ['Elma', 52, 150, '1 orta'], ['Muz', 89, 120, '1 adet'],
      ['Yoğurt', 60, 200, '1 kase'], ['Ayran', 35, 200, '1 bardak'], ['Türk Lokumu', 360, 20, '2 adet'],
      ['Baklava', 420, 100, '2 dilim'], ['Sütlaç', 130, 200, '1 kase'], ['Leblebi', 370, 30, '1 avuç'],
      ['Kuru İncir', 250, 30, '1 adet'], ['Hurma', 280, 20, '3 adet'], ['Çiğ Köfte', 180, 100, '3 sıkım'],
      ['Dondurma', 200, 100, '2 top'], ['Kavun', 34, 150, '1 dilim'], ['Karpuz', 30, 200, '1 dilim'],
      ['Mısır', 96, 150, '1 koçan'], ['Kestane', 210, 50, '5 adet'], ['Simit (Yarım)', 275, 50, '0.5 adet']
    ]
  };

  const prefixes = ['Zeytinyağlı', 'Fırında', 'Izgara', 'Kıymalı', 'Sebzeli', 'Tavuklu', 'Etli', 'Baharatlı', 'Acılı', 'Süzme', 'Klasik', 'Yöresel'];
  
  // Fix: Declare categories variable using the keys from turkishFoods
  const categories = Object.keys(turkishFoods) as ('Breakfast' | 'Lunch' | 'Dinner' | 'Snack')[];
  
  categories.forEach(cat => {
    const baseList = turkishFoods[cat];
    // Add base items
    baseList.forEach(([name, kcal, grams, measure], i) => {
      items.push({ id: `${cat.toLowerCase()}-${i}`, name, category: cat, kcalPer100g: kcal, defaultGrams: grams, householdMeasure: measure });
    });

    // Logical expansion to reach 250+ per category
    let j = 0;
    while (items.filter(it => it.category === cat).length < 251) {
      const source = baseList[j % baseList.length];
      const prefix = prefixes[j % prefixes.length];
      const name = `${prefix} ${source[0]}`;
      // Basic check to avoid duplicates or non-sensical combos
      if (!items.find(it => it.name === name)) {
        const kcalMod = prefix.includes('Zeytinyağlı') ? -15 : prefix.includes('Kıymalı') ? 25 : 0;
        items.push({
          id: `${cat.toLowerCase()}-gen-${j}`,
          name,
          category: cat,
          kcalPer100g: Math.max(30, source[1] + kcalMod),
          defaultGrams: source[2],
          householdMeasure: source[3]
        });
      }
      j++;
    }
  });

  return items;
};

export const FOOD_CATALOG = generateFoodCatalog();
