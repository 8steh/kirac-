// ===== GAME DATA =====
const HOUSING = [
    { name: 'Bodrum Kat', emoji: '🏚️', baseRent: 1500, reqMonths: 3, reqSavings: 5000 },
    { name: 'Paylaşımlı Daire', emoji: '🏠', baseRent: 3000, reqMonths: 3, reqSavings: 15000 },
    { name: 'Stüdyo', emoji: '🏢', baseRent: 6000, reqMonths: 4, reqSavings: 35000 },
    { name: '1+1 Daire', emoji: '🏡', baseRent: 12000, reqMonths: 4, reqSavings: 80000 },
    { name: '2+1 Daire', emoji: '🏘️', baseRent: 25000, reqMonths: 5, reqSavings: 200000 },
    { name: 'Villa', emoji: '🏰', baseRent: 60000, reqMonths: 5, reqSavings: 500000 },
    { name: 'Köşk', emoji: '🏛️', baseRent: 150000, reqMonths: 0, reqSavings: 0 }
];

const JOBS = [
    { name: 'Temizlik', emoji: '🧹', income: 120, energy: 40, unlockLevel: 0, unlockDay: 0 },
    { name: 'Kurye', emoji: '🛵', income: 200, energy: 50, unlockLevel: 0, unlockDay: 5 },
    { name: 'Freelance', emoji: '💻', income: 350, energy: 60, unlockLevel: 1, unlockDay: 0 },
    { name: 'İnşaat', emoji: '🏗️', income: 650, energy: 80, unlockLevel: 2, unlockDay: 0 },
    { name: 'Ofis İşi', emoji: '👔', income: 1000, energy: 60, unlockLevel: 3, unlockDay: 0 },
    { name: 'Yönetici', emoji: '💼', income: 1800, energy: 50, unlockLevel: 4, unlockDay: 0 },
    { name: 'Girişimci', emoji: '🎯', income: 3500, energy: 70, unlockLevel: 5, unlockDay: 0 }
];

const SHOP_ITEMS = [
    { id: 'coffee', name: 'Sabah Kahvesi', emoji: '☕', price: 50, desc: '3 gün boyunca uyanınca +%10 enerji', type: 'consumable' },
    { id: 'energy_drink', name: 'Enerji İçeceği', emoji: '🥫', price: 150, desc: 'Anında +50 Enerji (Günde max 2)', type: 'instant' },
    { id: 'fruit_plate', name: 'Meyve Tabağı', emoji: '🍎', price: 250, desc: 'Anında +100 Enerji (Günde max 2)', type: 'instant' },
    { id: 'gym_sub', name: 'Spor Salonu Üyeliği', emoji: '🏋️', price: 2500, desc: 'Maksimum Enerji +20 (Kalıcı)', type: 'permanent' },
    { id: 'protection', name: 'Kira Sözleşmesi Koruması', emoji: '📋', price: 5000, desc: '1 kez atılmayı engeller', type: 'consumable' },
    { id: 'renovation', name: 'Tadilat Paketi', emoji: '🔧', price: 3000, desc: 'Masrafları %20 azaltır (30 gün)', type: 'timed' },
    { id: 'realtor', name: 'Emlakçı Tanıdığı', emoji: '🗣️', price: 2000, desc: 'Ev geçişinde %30 indirim', type: 'permanent' },
    { id: 'sideapp', name: 'Yan Gelir Uygulaması', emoji: '📱', price: 4000, desc: 'Günlük +100 TL pasif gelir', type: 'permanent' }
];

const EVENTS_NEGATIVE = [
    { text: 'Kombi patladı!', emoji: '🔥', cost: 2000 },
    { text: 'Su faturası 3 katına çıktı!', emoji: '💧', cost: 1500 },
    { text: 'Komşu şikâyet etti, ceza geldi!', emoji: '👮', cost: 500 },
    { text: 'Ev sahibi kira artırdı!', emoji: '📈', rentIncrease: 0.2 },
    { text: 'İşten çıkarıldın! Bugün kazanç yok.', emoji: '🏭', loseJob: true },
    { text: 'Böcek istilası! İlaçlama lazım.', emoji: '🐛', cost: 1000 },
    { text: 'Tavan aktı! Tamir masrafı.', emoji: '🌧️', cost: 1500 },
    { text: 'Kapıcıya bahşiş zamanı!', emoji: '🧑‍🔧', cost: 300 },
    { text: 'Asansör bozuldu, taşıma masrafı!', emoji: '🛗', cost: 700 },
    { text: 'Çamaşır makinesi patladı!', emoji: '🫧', cost: 1200 }
];

const EVENTS_POSITIVE = [
    { text: 'Kazı kazan kazandın!', emoji: '🎰', reward: 1000 },
    { text: 'Eski borç geri ödendi!', emoji: '📦', reward: 1500 },
    { text: 'Ev sahibi 1 ay kira indirimi yaptı!', emoji: '🤝', rentDiscount: 0.5 },
    { text: 'Yan iş fırsatı! Ekstra kazanç.', emoji: '💡', reward: 800 },
    { text: 'Komşu pasta getirdi, moral yükseldi!', emoji: '🍰', energyBonus: 30 },
    { text: 'Vergi iadesi geldi!', emoji: '🏦', reward: 2000 }
];

const EVENTS_SEASONAL = {
    kış: [
        { text: 'Doğalgaz faturası patladı!', emoji: '❄️', cost: 2500 },
        { text: 'Kalorifer bozuldu!', emoji: '🥶', cost: 1800 }
    ],
    yaz: [
        { text: 'Klima faturası çok yüksek!', emoji: '☀️', cost: 2000 },
        { text: 'Su kesintisi! Damacana masrafı.', emoji: '🏜️', cost: 600 }
    ],
    ilkbahar: [
        { text: 'Taşınma sezonu! Kira artış riski.', emoji: '🌸', rentIncrease: 0.1 }
    ],
    sonbahar: [
        { text: 'Okul masrafları çıktı!', emoji: '🍂', cost: 1500 }
    ]
};

const SEASONS = ['ilkbahar', 'yaz', 'sonbahar', 'kış'];
const SEASON_EMOJI = { ilkbahar: '🌸', yaz: '☀️', sonbahar: '🍂', kış: '❄️' };

const ACHIEVEMENTS = [
    // --- Günler / Hayatta Kalma ---
    { id: 'days_7', name: 'İlk Hafta', desc: '7 gün hayatta kal', emoji: '🌱', check: s => s.totalDays >= 7 },
    { id: 'days_30', name: 'İlk Ay', desc: '30 gün hayatta kal', emoji: '🌙', check: s => s.totalDays >= 30 },
    { id: 'days_100', name: 'Dayanıklı', desc: '100 gün hayatta kal', emoji: '📅', check: s => s.totalDays >= 100 },
    { id: 'days_365', name: 'Bir Yıl!', desc: '365 gün hayatta kal', emoji: '🗓️', check: s => s.totalDays >= 365 },
    { id: 'winter', name: 'Kış Savaşçısı', desc: 'Kışı atılmadan geçir', emoji: '⛄', check: s => s.survivedWinter },
    
    // --- Para / Ekonomi ---
    { id: 'first_pay', name: 'İlk Maaş', desc: 'İlk kez para kazan', emoji: '💵', check: s => s.totalEarned > 0 },
    { id: 'earned_50k', name: 'İşkolik', desc: 'Toplam 50.000 TL kazan', emoji: '💼', check: s => s.totalEarned >= 50000 },
    { id: 'save_10k', name: 'Tasarruf Ustası', desc: '10.000 TL biriktir', emoji: '🏦', check: s => s.money >= 10000 },
    { id: 'save_100k', name: 'Zengin Kiracı', desc: '100.000 TL biriktir', emoji: '💎', check: s => s.money >= 100000 },
    { id: 'save_500k', name: 'Milyoner', desc: '500.000 TL biriktir', emoji: '💰', check: s => s.money >= 500000 },
    { id: 'broke', name: 'Meteliksiz', desc: 'Cebinde 10 TL\'den az kalsın', emoji: '🪰', check: s => s.money <= 10 && s.totalDays > 5 },
    
    // --- Kiracı ve Ev ---
    { id: 'first_evict', name: 'İlk Atılma', desc: 'İlk kez evden atıl', emoji: '🚪', check: s => s.evictionCount >= 1 },
    { id: 'evict_5', name: 'Alışma Evresi', desc: '5 kez evden atıl', emoji: '📦', check: s => s.evictionCount >= 5 },
    { id: 'evict_10', name: '10 Kez Atıldın', desc: '10 kez evden atıl', emoji: '🏅', check: s => s.evictionCount >= 10 },
    { id: 'evict_50', name: 'Sokak Kedisi', desc: '50 kez evden atıl', emoji: '🐈', check: s => s.evictionCount >= 50 },
    { id: 'rent_10', name: 'Düzenli Kiracı', desc: '10 kez kira öde', emoji: '🏠', check: s => s.totalRentPaid >= 10 },
    { id: 'rent_50', name: 'Sadık Kiracı', desc: '50 kez kira öde', emoji: '🤝', check: s => s.totalRentPaid >= 50 },
    { id: 'rent_100', name: 'Ev Sahibi Katili', desc: '100 kez kira öde', emoji: '🔑', check: s => s.totalRentPaid >= 100 },
    
    // --- Yükseltmeler ---
    { id: 'upgrade_1', name: 'Terfi!', desc: 'İlk kez ev yükselt', emoji: '⬆️', check: s => s.housingLevel >= 1 },
    { id: 'upgrade_3', name: 'Yükseliş', desc: 'Seviye 3 eve ulaş', emoji: '🏡', check: s => s.housingLevel >= 3 },
    { id: 'upgrade_5', name: 'Lüks Hayat', desc: 'Villa sahibi ol!', emoji: '🏰', check: s => s.housingLevel >= 5 },
    { id: 'win', name: 'Köşk Hayali', desc: 'Köşk sahibi ol!', emoji: '👑', check: s => s.housingLevel >= 6 },
    
    // --- Eşya ve Durumlar ---
    { id: 'tired', name: 'Tükenmişlik', desc: 'Enerjin 5 veya altına düşsün', emoji: '🪫', check: s => s.energy <= 5 },
    { id: 'caffeine', name: 'Kafein Bağımlısı', desc: '10 günlük kahve stokla', emoji: '☕', check: s => s.items.coffee >= 10 },
    { id: 'gym_rat', name: 'Sporcu', desc: 'Spor salonuna üye ol', emoji: '🏋️', check: s => s.items.gym_sub === true },
    { id: 'networker', name: 'Çevre Yaptın', desc: 'Emlakçı tanıdığı bul', emoji: '🗣️', check: s => s.items.realtor === true },
    { id: 'side_hustle', name: 'Ek İş', desc: 'Yan gelir uygulaması al', emoji: '📱', check: s => s.items.sideapp === true },
    { id: 'lucky_rent', name: 'Şanslı Kiracı', desc: 'Ev sahibi kira indirimi yapsın', emoji: '🍀', check: s => s.rentDiscountThisMonth > 0 },
    { id: 'fired', name: 'İşsizlik', desc: 'İşten çıkarıl', emoji: '📉', check: s => s.lostJobToday === true }
];

function getDefaultState() {
    return {
        money: 500,
        energy: 100,
        maxEnergy: 100,
        day: 1,
        month: 1,
        year: 1,
        season: 'ilkbahar',
        housingLevel: 0,
        rent: 1500,
        consecutiveMonths: 0,
        evictionCount: 0,
        totalDays: 0,
        totalEarned: 0,
        totalRentPaid: 0,
        totalSpent: 0,
        inflation: 1.0,
        permanentBonus: { income: 1.0, energy: 0 },
        items: { coffee: 0, protection: 0, renovationDays: 0, realtor: false, sideapp: false, gym_sub: false },
        achievements: [],
        log: [],
        lostJobToday: false,
        rentDiscountThisMonth: 0,
        survivedWinter: false,
        winterStartEvictions: 0,
        gameWon: false,
        dailyEnergyBuys: 0
    };
}

const FUNNY_NEWS = [
    "SON DAKİKA: Putin bugün şişeye oturdu, kremlin'den 'yanlışlıkla oldu' açıklaması geldi!",
    "EKONOMİ: Kripto paralara yatırım yapan genç, böbreğini satıp dogecoin aldı.",
    "BİLİM: Uzmanlar açıkladı: Haftada 3 gün çalışmak insan doğasına aykırıymış, en az 6 gün şart!",
    "MAGAZİN: Ünlü popçu 7. kez boşandı, 'bu sefer kesin doğru insanı buldum' dedi.",
    "GÜNDEM: UFO'lar İstanbul'a indi, trafikten sıkılıp kendi gezegenlerine geri döndüler.",
    "SAĞLIK: Günde 5 litre kahve içen adam zamanı bükmeyi başardı.",
    "TEKNOLOJİ: Yeni çıkan akıllı telefon o kadar akıllı ki, sahibinin yerine işe gidiyor.",
    "SPOR: Halı saha maçında rövaşata deneyen amca 3 aydır fizik tedavi görüyor.",
    "ASTROLOJİ: Merkür retrosu bitiyor, artık tüm beceriksizliklerinizi kendi üstünüze alabilirsiniz.",
    "EĞİTİM: Sınavdan 100 alan öğrenci 'hiç çalışmadım' diyerek arkadaşlarını çıldırttı.",
    "EKONOMİ: Simit fiyatları altınla yarışıyor, çeyrek simit satışları başladı.",
    "GÜNDEM: Kedi lobisi dünyayı ele geçirmeye çok yakın, ilk hedef bedava mama.",
    "TEKNOLOJİ: Yapay zeka ilk defa 'Ben bu işten sıkıldım' diyerek istifa etti.",
    "SAĞLIK: Sadece su ve güneşle beslenen adam gizlice lahmacun yerken yakalandı.",
    "BİLİM: Işınlanma icat edildi ama sadece pazartesi sendromu olmayanlar kullanabiliyor."
];
