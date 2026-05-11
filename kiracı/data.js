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
    { name: 'Temizlik', emoji: '🧹', income: 150, energy: 30, unlockLevel: 0, unlockDay: 0 },
    { name: 'Kurye', emoji: '🛵', income: 250, energy: 40, unlockLevel: 0, unlockDay: 5 },
    { name: 'Freelance', emoji: '💻', income: 400, energy: 50, unlockLevel: 1, unlockDay: 0 },
    { name: 'İnşaat', emoji: '🏗️', income: 600, energy: 70, unlockLevel: 2, unlockDay: 0 },
    { name: 'Ofis İşi', emoji: '👔', income: 900, energy: 50, unlockLevel: 3, unlockDay: 0 },
    { name: 'Yönetici', emoji: '💼', income: 1500, energy: 40, unlockLevel: 4, unlockDay: 0 },
    { name: 'Girişimci', emoji: '🎯', income: 2500, energy: 60, unlockLevel: 5, unlockDay: 0 }
];

const SHOP_ITEMS = [
    { id: 'coffee', name: 'Sabah Kahvesi', emoji: '☕', price: 50, desc: 'Günlük enerji +10%', type: 'consumable' },
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
    { id: 'first_evict', name: 'İlk Atılma', desc: 'İlk kez evden atıl', emoji: '🚪', check: s => s.evictionCount >= 1 },
    { id: 'evict_10', name: '10 Kez Atıldın', desc: '10 kez evden atıl', emoji: '🏅', check: s => s.evictionCount >= 10 },
    { id: 'evict_50', name: 'Sokak Kedisi', desc: '50 kez evden atıl', emoji: '🐈', check: s => s.evictionCount >= 50 },
    { id: 'first_pay', name: 'İlk Maaş', desc: 'İlk kez para kazan', emoji: '💵', check: s => s.totalEarned > 0 },
    { id: 'save_10k', name: 'Tasarruf Ustası', desc: '10.000 TL biriktir', emoji: '🏦', check: s => s.money >= 10000 },
    { id: 'save_100k', name: 'Zengin Kiracı', desc: '100.000 TL biriktir', emoji: '💎', check: s => s.money >= 100000 },
    { id: 'upgrade_1', name: 'Terfi!', desc: 'İlk kez ev yükselt', emoji: '⬆️', check: s => s.housingLevel >= 1 },
    { id: 'upgrade_3', name: 'Yükseliş', desc: 'Seviye 3 eve ulaş', emoji: '🏡', check: s => s.housingLevel >= 3 },
    { id: 'win', name: 'Köşk Hayali', desc: 'Köşk sahibi ol!', emoji: '👑', check: s => s.housingLevel >= 6 },
    { id: 'winter', name: 'Kış Savaşçısı', desc: 'Kışı atılmadan geçir', emoji: '⛄', check: s => s.survivedWinter },
    { id: 'rent_10', name: 'Düzenli Kiracı', desc: '10 kez kira öde', emoji: '🏠', check: s => s.totalRentPaid >= 10 },
    { id: 'rent_100', name: 'Ev Sahibi Katili', desc: '100 kez kira öde', emoji: '🔑', check: s => s.totalRentPaid >= 100 },
    { id: 'days_100', name: 'Dayanıklı', desc: '100 gün hayatta kal', emoji: '📅', check: s => s.totalDays >= 100 },
    { id: 'days_365', name: 'Bir Yıl!', desc: '365 gün hayatta kal', emoji: '🗓️', check: s => s.totalDays >= 365 }
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
        items: { coffee: 0, protection: 0, renovationDays: 0, realtor: false, sideapp: false },
        achievements: [],
        log: [],
        lostJobToday: false,
        rentDiscountThisMonth: 0,
        survivedWinter: false,
        winterStartEvictions: 0,
        gameWon: false
    };
}
