
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
      ['Simit', 275, 100, '1 adet'],
      ['Menemen', 115, 200, '1 porsiyon'],
      ['Sucuklu Yumurta', 210, 150, '1 porsiyon'],
      ['Ezine Peyniri', 310, 30, '1 dilim'],
      ['Kaşar Peyniri', 350, 30, '1 dilim'],
      ['Siyah Zeytin', 115, 20, '5 adet'],
      ['Yeşil Zeytin', 145, 20, '5 adet'],
      ['Bal-Kaymak', 450, 50, '1 porsiyon'],
      ['Domates-Salatalık Söğüş', 25, 150, '1 kase'],
      ['Poğaça (Peynirli)', 320, 80, '1 adet'],
      ['Gözleme (Peynirli)', 250, 150, '1 adet'],
      ['Pekmez-Tahin', 420, 40, '2 y.kaşığı'],
      ['Haşlanmış Yumurta', 155, 50, '1 adet'],
      ['Sahanda Yumurta', 180, 60, '1 adet'],
      ['Pastırma', 250, 20, '2 dilim'],
      ['Hellim Izgara', 320, 50, '2 dilim'],
      ['Reçel (Vişne)', 280, 20, '1 y.kaşığı'],
      ['Süzme Peynir', 220, 30, '1 dilim'],
      ['Acuka', 350, 20, '1 t.kaşığı'],
      ['Pişi', 380, 60, '1 adet'],
      ['Mıhlama', 420, 150, '1 porsiyon'],
      ['Çılbır', 140, 200, '1 porsiyon'],
      ['Sigara Böreği', 310, 40, '1 adet'],
      ['Tulum Peyniri', 330, 30, '1 dilim'],
      ['Labne Peyniri', 190, 30, '1 y.kaşığı'],
      ['Örgü Peyniri', 290, 30, '1 dilim'],
      ['Dana Jambon', 110, 20, '1 dilim'],
      ['Hindi Füme', 100, 20, '1 dilim'],
      ['Kuşburnu Marmelatı', 260, 20, '1 y.kaşığı'],
      ['Tereyağı', 717, 10, '1 t.kaşığı'],
    ],
    'Lunch': [
      ['Kuru Fasulye', 120, 250, '1 tabak'],
      ['Pirinç Pilavı', 130, 150, '1 tabak'],
      ['Bulgur Pilavı', 115, 150, '1 tabak'],
      ['Mercimek Çorbası', 65, 250, '1 kase'],
      ['Tarhana Çorbası', 75, 250, '1 kase'],
      ['Mantı', 170, 250, '1 porsiyon'],
      ['Lahmacun', 220, 120, '1 adet'],
      ['Adana Kebap', 230, 200, '1 porsiyon'],
      ['Döner (Ekmek Arası)', 260, 250, '1 adet'],
      ['İskender Kebap', 250, 350, '1 porsiyon'],
      ['Karnıyarık', 110, 200, '1 adet'],
      ['Köfte Izgara', 220, 150, '1 porsiyon'],
      ['Tavuk Sote', 140, 200, '1 porsiyon'],
      ['Yaprak Sarma', 160, 100, '5 adet'],
      ['Biber Dolması', 120, 200, '2 adet'],
      ['Türlü', 85, 250, '1 tabak'],
      ['Kuzu Tandır', 280, 150, '1 porsiyon'],
      ['Levrek Izgara', 120, 250, '1 adet'],
      ['İçli Köfte', 350, 100, '1 adet'],
      ['Pide (Kıymalı)', 250, 200, '1 adet'],
      ['Patlıcan Musakka', 130, 250, '1 tabak'],
      ['İzmir Köfte', 150, 250, '1 porsiyon'],
      ['Tavuklu Nohutlu Pilav', 160, 250, '1 tabak'],
      ['Barbunya Pilaki', 140, 200, '1 porsiyon'],
      ['Tavuk Suyu Çorbası', 55, 250, '1 kase'],
      ['Ezogelin Çorbası', 70, 250, '1 kase'],
      ['Yayla Çorbası', 80, 250, '1 kase'],
      ['Domates Çorbası', 45, 250, '1 kase'],
      ['Palamut Buğulama', 180, 200, '1 porsiyon'],
      ['Kağıt Kebabı', 210, 200, '1 porsiyon'],
    ],
    'Dinner': [
      ['Kuzu İncik', 220, 250, '1 adet'],
      ['Tas Kebabı', 160, 200, '1 porsiyon'],
      ['Hamsi Tava', 210, 150, '1 porsiyon'],
      ['Mücver', 180, 50, '1 adet'],
      ['Ispanak Yemeği', 55, 250, '1 tabak'],
      ['Bezelye Yemeği', 85, 250, '1 tabak'],
      ['Ali Nazik', 240, 250, '1 porsiyon'],
      ['Beyti Kebap', 270, 300, '1 porsiyon'],
      ['Patlıcan Kebabı', 190, 300, '1 porsiyon'],
      ['Sulu Köfte', 110, 250, '1 tabak'],
      ['Kadınbudu Köfte', 260, 80, '1 adet'],
      ['İmam Bayıldı', 95, 200, '1 adet'],
      ['Kabak Kalye', 60, 250, '1 tabak'],
      ['Enginar Zeytinyağlı', 75, 150, '1 adet'],
      ['Bamya Yemeği', 50, 250, '1 tabak'],
      ['Semizotu Yemeği', 45, 250, '1 tabak'],
      ['Terbiyeli Köfte', 130, 250, '1 tabak'],
      ['Orman Kebabı', 150, 250, '1 porsiyon'],
      ['Hünkar Beğendi', 210, 250, '1 porsiyon'],
      ['Çökertme Kebabı', 280, 300, '1 porsiyon'],
      ['Tavuk Kanat Izgara', 230, 200, '1 porsiyon'],
      ['Somon Izgara', 200, 200, '1 adet'],
      ['Fırında Levrek', 110, 250, '1 adet'],
      ['Tavuk Pirzola', 180, 150, '2 adet'],
      ['Patates Oturtma', 140, 250, '1 tabak'],
    ],
    'Snack': [
      ['Badem', 575, 30, '1 avuç'],
      ['Ceviz', 650, 30, '3 tam'],
      ['Kuru Üzüm', 300, 30, '1 avuç'],
      ['Kuru Kayısı', 240, 40, '4 adet'],
      ['Elma', 52, 150, '1 orta'],
      ['Muz', 89, 120, '1 adet'],
      ['Yoğurt', 60, 200, '1 kase'],
      ['Ayran', 35, 200, '1 bardak'],
      ['Türk Lokumu', 360, 20, '2 adet'],
      ['Baklava', 420, 100, '2 dilim'],
      ['Sütlaç', 130, 200, '1 kase'],
      ['Kazandibi', 160, 150, '1 porsiyon'],
      ['Leblebi', 370, 30, '1 avuç'],
      ['Fındık', 630, 30, '1 avuç'],
      ['Antep Fıstığı', 560, 30, '1 avuç'],
      ['Kabak Çekirdeği', 560, 30, '1 avuç'],
      ['Erik', 45, 100, '10 adet'],
      ['Şeftali', 40, 150, '1 orta'],
      ['Kavun', 35, 200, '1 dilim'],
      ['Karpuz', 30, 300, '1 dilim'],
      ['İncir', 75, 60, '1 adet'],
      ['Meyveli Yoğurt', 90, 150, '1 kutu'],
      ['Tuzlu Çubuk', 400, 30, '1 paket küçük'],
      ['Kraker', 420, 40, '1 paket'],
      ['Bisküvi (Tam Tahıllı)', 450, 30, '3 adet'],
      ['Kek (Ev Yapımı)', 350, 60, '1 dilim'],
      ['Supangle', 150, 150, '1 kase'],
      ['Aşure', 180, 200, '1 kase'],
    ]
  };

  Object.entries(turkishFoods).forEach(([category, foods]) => {
    foods.forEach(([name, kcal, grams, measure], i) => {
      items.push({
        id: `${category.toLowerCase()}-${i}`,
        name,
        category: category as any,
        kcalPer100g: kcal,
        defaultGrams: grams,
        householdMeasure: measure,
      });
    });
  });

  // Grow dataset with realistic items instead of "(Variation X)"
  const expandedItems = [
    ['Pilaki', 140, 200, '1 tabak'],
    ['Kısır', 180, 150, '1 tabak'],
    ['Mercimek Köftesi', 160, 150, '1 porsiyon'],
    ['Haydari', 130, 100, '1 kase'],
    ['Humus', 170, 100, '1 kase'],
    ['Şakşuka', 110, 150, '1 tabak'],
    ['Arnavut Ciğeri', 220, 150, '1 porsiyon'],
    ['İç Pilav', 180, 150, '1 tabak'],
    ['Sultan Reşat Çorbası', 90, 250, '1 kase'],
    ['Analı Kızlı', 140, 250, '1 tabak'],
  ];

  expandedItems.forEach((f, i) => {
    items.push({
      id: `extra-${i}`,
      name: f[0] as string,
      category: 'Lunch',
      kcalPer100g: f[1] as number,
      defaultGrams: f[2] as number,
      householdMeasure: f[3] as string,
    });
  });

  return items;
};

export const FOOD_CATALOG = generateFoodCatalog();
