// ===== AUDIO =====
const SFX={ctx:null,
    init(){this.ctx=new(window.AudioContext||window.webkitAudioContext)()},
    p(f,d,t){if(!this.ctx)this.init();const o=this.ctx.createOscillator(),g=this.ctx.createGain();
        o.type=t||'square';o.frequency.value=f;g.gain.setValueAtTime(.12,this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+d);
        o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+d)},
    coin(){this.p(880,.1);setTimeout(()=>this.p(1180,.15),80)},
    bad(){this.p(200,.3,'sawtooth')},
    evict(){this.p(150,.5,'sawtooth');setTimeout(()=>this.p(100,.6,'sawtooth'),300)},
    up(){[0,100,200,300].forEach((d,i)=>setTimeout(()=>this.p(440+i*110,.2),d))},
    click(){this.p(660,.05)},
    win(){[0,150,300,450,600].forEach((d,i)=>setTimeout(()=>this.p(523+i*80,.3,'sine'),d))}
};

// ===== SAVE =====
const SV={k:'evden_cikma_v2',
    save(s){try{localStorage.setItem(this.k,JSON.stringify(s))}catch(e){}},
    load(){try{const d=localStorage.getItem(this.k);return d?JSON.parse(d):null}catch(e){return null}},
    clear(){localStorage.removeItem(this.k)}
};

// ===== STATE =====
let S;
let pendingModal=null;
let lastJob=0;

function initGame(){
    const saved=SV.load();
    S=saved||getDefaultState();
    setupNav();
    R.init();
    renderUI();
    if(!saved)showModal('🏚️','Evden Çıkma!','Hoş geldin! Bodrum katta\nbaşlıyorsun.\n\nÇalış, kira öde, hayatta kal.\nHedef: Köşk sahibi olmak!','','Başla!');
    document.addEventListener('touchstart',()=>{if(!SFX.ctx)SFX.init()},{once:true});
    document.addEventListener('click',()=>{if(!SFX.ctx)SFX.init()},{once:true});
}

// ===== HELPERS =====
function fmt(n){return Math.floor(n).toLocaleString('tr-TR')}
function getSeason(m){return SEASONS[(Math.floor((m-1)/3))%4]}
function getRent(){let r=S.rent;if(S.rentDiscountThisMonth>0)r*=(1-S.rentDiscountThisMonth);return Math.floor(r)}
function jobIncome(j){return Math.floor(j.income*S.permanentBonus.income*S.inflation)}
function jobOpen(j){return S.housingLevel>=j.unlockLevel&&S.totalDays>=j.unlockDay}
function canUp(){if(S.housingLevel>=6)return false;const h=HOUSING[S.housingLevel];
    const cost=S.items.realtor?Math.floor(h.reqSavings*.7):h.reqSavings;
    return S.consecutiveMonths>=h.reqMonths&&S.money>=cost}
function upCost(){if(S.housingLevel>=6)return 0;const c=HOUSING[S.housingLevel].reqSavings;
    return S.items.realtor?Math.floor(c*.7):c}
function addLog(t,tp){S.log.unshift({text:t,type:tp,day:S.day,month:S.month});if(S.log.length>30)S.log.length=30}

// ===== WORK WITH ANIMATION =====
let isWorking=false;
function doWork(idx){
    const j=JOBS[idx];
    if(!jobOpen(j)||S.lostJobToday||S.energy<j.energy||isWorking)return;
    isWorking=true;
    SFX.click();
    // Switch to home tab to show animation
    document.querySelectorAll('.panel').forEach(s=>s.classList.remove('active'));
    document.getElementById('panel-actions').classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
    document.querySelector('.nav-btn[data-panel="actions"]').classList.add('active');
    // Play job animation on canvas
    R.playJob(idx, ()=>{
        // Animation done - apply rewards
        S.energy-=j.energy;
        const e=jobIncome(j);
        S.money+=e;S.totalEarned+=e;
        addLog(`${j.emoji} ${j.name}: +${fmt(e)} TL`,'positive');
        SFX.coin();spawnCoins(4);bumpMoney();
        isWorking=false;
        renderUI();checkAch();SV.save(S);
    });
}

function nextDay(n){
    for(let i=0;i<(n||1);i++){advDay();if(pendingModal)break}
    renderUI();SV.save(S);
}

function advDay(){
    if(S.gameWon)return;
    S.totalDays++;S.day++;S.lostJobToday=false;S.rentDiscountThisMonth=0;
    let mx=S.maxEnergy+S.permanentBonus.energy;
    if(S.items.coffee>0){mx=Math.floor(mx*1.1);S.items.coffee--}
    S.energy=mx;
    if(S.items.sideapp){const p=Math.floor(100*S.inflation);S.money+=p;S.totalEarned+=p}
    if(S.items.renovationDays>0)S.items.renovationDays--;
    if(Math.random()<.25)trigEvt();
    if(S.day>30){
        S.day=1;S.month++;S.season=getSeason(S.month);
        if(S.season==='kış')S.winterStartEvictions=S.evictionCount;
        if(S.season==='ilkbahar'&&S.winterStartEvictions!==undefined)
            if(S.evictionCount===S.winterStartEvictions)S.survivedWinter=true;
        if(S.month%3===0)S.inflation*=1.05;
        payRent();
    }
    checkAch();
}

function payRent(){
    const rent=getRent();
    if(S.money>=rent){
        S.money-=rent;S.totalSpent+=rent;S.totalRentPaid++;S.consecutiveMonths++;
        addLog(`💰 Kira ödendi: -${fmt(rent)} TL`,'info');SFX.click();
        if(canUp()){
            const nx=HOUSING[S.housingLevel+1],c=upCost();
            pendingModal={type:'up'};
            showModal('✨',`${nx.emoji} ${nx.name}`,`Eve yükseltme zamanı!\nÜst kata çıkmak ister misin?`,
                `Maliyet: ${fmt(c)} TL`,'Taşın!','Şimdi Değil',()=>doUp(),null);
        }
    } else {
        if(S.items.protection>0){S.items.protection--;
            addLog('📋 Kira koruması kullanıldı!','positive');SFX.click();
            showToast('📋 Koruma seni kurtardı!','gold');
        } else doEvict();
    }
}

function doEvict(){
    SFX.evict();S.evictionCount++;
    const kept=Math.floor(S.money*.4);S.money=kept;
    S.permanentBonus.income+=.05;S.permanentBonus.energy+=2;S.consecutiveMonths=0;
    S.rent=Math.floor(HOUSING[S.housingLevel].baseRent*S.inflation);
    addLog(`🚪 EVDEN ATILDIN! (${S.evictionCount}. kez)`,'negative');
    document.getElementById('app').classList.add('shake');
    setTimeout(()=>document.getElementById('app').classList.remove('shake'),500);
    pendingModal={type:'evict'};
    showModal('🚪','EVDEN ATILDIN!',
        `Kirayı ödeyemedin!\nAma pes etme, deneyim kazandın!`,
        `💪 Gelir: x${S.permanentBonus.income.toFixed(2)}\n⚡ Enerji: +${S.permanentBonus.energy}\n💰 Kalan: ${fmt(kept)} TL`,
        'Tekrar Dene!',null,null,null,'eviction');
    checkAch();
}

function doUp(){
    if(!canUp())return;
    const c=upCost();S.money-=c;S.totalSpent+=c;S.housingLevel++;S.consecutiveMonths=0;
    S.rent=Math.floor(HOUSING[S.housingLevel].baseRent*S.inflation);
    SFX.up();addLog(`⬆️ ${HOUSING[S.housingLevel].emoji} ${HOUSING[S.housingLevel].name}!`,'positive');
    if(S.housingLevel>=6){S.gameWon=true;SFX.win();
        setTimeout(()=>showModal('👑','TEBRİKLER!','KÖŞK SAHİBİ OLDUN!\nMücadelen sona erdi!',
            `📅 ${S.totalDays} gün\n🚪 ${S.evictionCount} atılma\n💰 ${fmt(S.totalEarned)} TL kazanç`,
            'Harika!',null,null,null,'win'),500)}
    checkAch();renderUI();
}

function trigEvt(){
    let ev;const r=Math.random();
    if(r<.15&&EVENTS_SEASONAL[S.season]&&EVENTS_SEASONAL[S.season].length)
        ev=EVENTS_SEASONAL[S.season][Math.floor(Math.random()*EVENTS_SEASONAL[S.season].length)];
    else if(r<.35)ev=EVENTS_POSITIVE[Math.floor(Math.random()*EVENTS_POSITIVE.length)];
    else ev=EVENTS_NEGATIVE[Math.floor(Math.random()*EVENTS_NEGATIVE.length)];
    applyEvt(ev);
}

function applyEvt(ev){
    let msg=ev.emoji+' '+ev.text,tp='negative';
    if(ev.cost){let c=Math.floor(ev.cost*S.inflation);
        if(S.items.renovationDays>0)c=Math.floor(c*.8);S.money-=c;S.totalSpent+=c;
        msg+=` -${fmt(c)} TL`;SFX.bad()}
    if(ev.rentIncrease){S.rent=Math.floor(S.rent*(1+ev.rentIncrease));msg+=` Kira: ${fmt(S.rent)} TL`;SFX.bad()}
    if(ev.loseJob){S.lostJobToday=true;SFX.bad()}
    if(ev.reward){const r=Math.floor(ev.reward*S.inflation);S.money+=r;S.totalEarned+=r;
        msg+=` +${fmt(r)} TL`;tp='positive';SFX.coin();spawnCoins(3)}
    if(ev.energyBonus){S.energy=Math.min(S.energy+ev.energyBonus,S.maxEnergy+S.permanentBonus.energy);
        msg+=` ⚡+${ev.energyBonus}`;tp='positive';SFX.coin()}
    if(ev.rentDiscount){S.rentDiscountThisMonth=ev.rentDiscount;tp='positive';SFX.coin()}
    addLog(msg,tp);
    // Show event on scene
    const se=document.getElementById('scene-event');
    se.textContent=msg;se.classList.remove('hidden');
    setTimeout(()=>se.classList.add('hidden'),2500);
}

function buyItem(id){
    const it=SHOP_ITEMS.find(i=>i.id===id);if(!it)return;
    const pr=Math.floor(it.price*S.inflation);
    if(S.money<pr){showToast('Paran yetmiyor!','negative');return}
    if(it.type==='permanent'&&S.items[id]){showToast('Zaten sahipsin!','negative');return}
    if(it.type==='permanent')S.items[id]=true;
    else if(id==='coffee')S.items.coffee+=3;
    else if(id==='protection')S.items.protection++;
    else if(id==='renovation')S.items.renovationDays=30;
    S.money-=pr;S.totalSpent+=pr;SFX.coin();
    addLog(`🛒 ${it.emoji} ${it.name} alındı! -${fmt(pr)} TL`,'info');
    showToast(`${it.emoji} ${it.name} alındı!`,'gold');
    renderUI();SV.save(S);
}

function checkAch(){
    ACHIEVEMENTS.forEach(a=>{if(!S.achievements.includes(a.id)&&a.check(S)){
        S.achievements.push(a.id);showToast(`🏆 ${a.name}!`,'gold');SFX.up()}})
}

// ===== UI RENDER =====
function renderUI(){
    const h=HOUSING[S.housingLevel];
    document.getElementById('hud-lv').textContent=S.housingLevel+1;
    document.getElementById('hud-pos').textContent=h.name;
    document.getElementById('hud-money').textContent=fmt(S.money);
    
    const mx=S.maxEnergy+S.permanentBonus.energy;
    const eP=(S.energy/mx)*100;
    const ef=document.getElementById('bar-energy');
    ef.style.width=eP+'%';
    ef.className='bar-fill energy-fill'+(eP<30?' low':'');
    document.getElementById('val-energy').textContent=S.energy+'/'+mx;
    
    const dLeft=30-S.day+1;
    const rP=((S.day-1)/30)*100;
    const rf=document.getElementById('bar-rent');
    rf.style.width=rP+'%';
    rf.className='bar-fill rent-fill'+(rP>70?' danger':'');
    document.getElementById('val-rent').textContent=dLeft+' gün';
    
    const se=SEASON_EMOJI[S.season]||'🌸';
    document.getElementById('hud-season').textContent=se+' '+S.season.charAt(0).toUpperCase()+S.season.slice(1);
    document.getElementById('hud-day').textContent=`Gün ${S.day} • Ay ${S.month}`;
    document.getElementById('hud-inflation').textContent='📈 %'+Math.floor((S.inflation-1)*100);


    // Ticker
    if(S.log.length>0)document.getElementById('ticker-text').textContent=S.log[0].text;

    renderJobs();renderShop();renderStats();renderAch();
}

function renderJobs(){
    const c=document.getElementById('jobs-container');c.innerHTML='';
    JOBS.forEach((j,i)=>{
        const u=jobOpen(j),inc=jobIncome(j),ok=S.energy>=j.energy&&!S.lostJobToday;
        const d=document.createElement('div');
        d.className='job-card'+(!u?' locked':'')+(!ok&&u?' btn-disabled':'');
        d.innerHTML=`<span class="job-emoji">${j.emoji}</span><div class="job-info">
            <div class="job-name">${j.name}</div><div class="job-pay">💰 ${fmt(inc)} TL</div>
            <div class="job-energy">⚡ -${j.energy}</div>
            ${!u?`<div class="job-lock">🔒 ${j.unlockLevel>0?HOUSING[j.unlockLevel].name:j.unlockDay+'. gün'}</div>`:''}</div>`;
        if(u&&ok)d.onclick=()=>doWork(i);
        c.appendChild(d)});
}

function renderShop(){
    const c=document.getElementById('shop-container');c.innerHTML='';
    SHOP_ITEMS.forEach(it=>{
        const pr=Math.floor(it.price*S.inflation),ow=it.type==='permanent'&&S.items[it.id],af=S.money>=pr;
        const d=document.createElement('div');
        d.className='shop-card'+(ow?' owned':'')+(!af&&!ow?' cant-afford':'');
        let st=`💰 ${fmt(pr)} TL`;
        if(ow)st='✅ Sahipsin';
        else if(it.id==='coffee'&&S.items.coffee>0)st+=` (${S.items.coffee} gün)`;
        else if(it.id==='protection')st+=` (${S.items.protection} adet)`;
        else if(it.id==='renovation'&&S.items.renovationDays>0)st+=` (${S.items.renovationDays} gün)`;
        d.innerHTML=`<span class="shop-emoji">${it.emoji}</span><div class="shop-info">
            <div class="shop-name">${it.name}</div><div class="shop-desc">${it.desc}</div>
            <div class="shop-price">${st}</div></div>`;
        if(!ow)d.onclick=()=>buyItem(it.id);
        c.appendChild(d)});
}

function renderStats(){
    const c=document.getElementById('stats-container');
    c.innerHTML=`
        <div class="stats-section-title">📊 Genel</div>
        <div class="stat-row"><span class="label">Toplam Gün</span><span class="value">${S.totalDays}</span></div>
        <div class="stat-row"><span class="label">Ay</span><span class="value">${S.month}</span></div>
        <div class="stat-row"><span class="label">Enflasyon</span><span class="value">%${Math.floor((S.inflation-1)*100)}</span></div>
        <div class="stats-section-title">🏠 Konut</div>
        <div class="stat-row"><span class="label">Ev</span><span class="value">${HOUSING[S.housingLevel].emoji} ${HOUSING[S.housingLevel].name}</span></div>
        <div class="stat-row"><span class="label">Kira</span><span class="value">${fmt(getRent())} TL</span></div>
        <div class="stat-row"><span class="label">Üst Üste</span><span class="value">${S.consecutiveMonths} ay</span></div>
        ${S.housingLevel<6?`<div class="stat-row"><span class="label">Yükseltme</span><span class="value">${HOUSING[S.housingLevel].reqMonths} ay + ${fmt(upCost())} TL</span></div>`:''}
        <div class="stats-section-title">💰 Ekonomi</div>
        <div class="stat-row"><span class="label">Para</span><span class="value">${fmt(S.money)} TL</span></div>
        <div class="stat-row"><span class="label">Kazanç</span><span class="value">${fmt(S.totalEarned)} TL</span></div>
        <div class="stat-row"><span class="label">Harcama</span><span class="value">${fmt(S.totalSpent)} TL</span></div>
        <div class="stat-row"><span class="label">Kira Ödeme</span><span class="value">${S.totalRentPaid}x</span></div>
        <div class="stats-section-title">💪 Bonus</div>
        <div class="stat-row"><span class="label">Gelir</span><span class="value">x${S.permanentBonus.income.toFixed(2)}</span></div>
        <div class="stat-row"><span class="label">Enerji</span><span class="value">+${S.permanentBonus.energy}</span></div>
        <div class="stat-row"><span class="label">Atılma</span><span class="value">${S.evictionCount}x</span></div>
        
        <div class="stats-section-title" style="color:var(--negative)">⚠️ Admin Paneli</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
            <button class="act-btn fast-btn" style="padding:6px;font-size:7px;margin:0" onclick="S.money+=100000;SFX.coin();renderUI();showToast('+100.000 TL','gold')">+100k Para</button>
            <button class="act-btn fast-btn" style="padding:6px;font-size:7px;margin:0" onclick="S.energy=1000;SFX.up();renderUI();showToast('Full Enerji','energy')">+Enerji</button>
            <button class="act-btn fast-btn" style="padding:6px;font-size:7px;margin:0" onclick="if(S.housingLevel<6){S.housingLevel++;S.rent=HOUSING[S.housingLevel].baseRent;SFX.up();renderUI();showToast('Ev Yükseltildi','positive')}">+Seviye</button>
            <button class="act-btn fast-btn" style="padding:6px;font-size:7px;margin:0" onclick="S.day=29;SFX.click();renderUI();showToast('Kira Günü!','negative')">Kira Günü</button>
            <button class="act-btn fast-btn" style="padding:6px;font-size:7px;margin:0" onclick="S.housingLevel=6;doUp()">Kazan!</button>
        </div>

        <button class="act-btn fast-btn" style="width:100%;margin-top:4px" onclick="resetGame()">🗑️ Sıfırla</button>`;
}

function renderAch(){
    const c=document.getElementById('achievements-container');c.innerHTML='';
    ACHIEVEMENTS.forEach(a=>{
        const u=S.achievements.includes(a.id);
        const d=document.createElement('div');
        d.className='achievement-card '+(u?'unlocked':'locked');
        d.innerHTML=`<span class="ach-emoji">${a.emoji}</span><div class="ach-info">
            <div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div>
            </div><span class="ach-status">${u?'✅':'🔒'}</span>`;
        c.appendChild(d)});
}

// ===== MODAL =====
let mCb1=null,mCb2=null;
function showModal(em,ti,bo,ex,b1,b2,c1,c2,cls){
    document.getElementById('modal-emoji').textContent=em;
    document.getElementById('modal-title').textContent=ti;
    document.getElementById('modal-body').textContent=bo;
    document.getElementById('modal-extra').textContent=ex||'';
    document.getElementById('modal-btn').textContent=b1||'Tamam';
    document.getElementById('modal-box').className='modal-box'+(cls?' '+cls:'');
    const bt2=document.getElementById('modal-btn2');
    if(b2){bt2.textContent=b2;bt2.classList.remove('hidden')}else bt2.classList.add('hidden');
    mCb1=c1||null;mCb2=c2||null;
    document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal(ok){
    document.getElementById('modal-overlay').classList.add('hidden');
    if(ok&&mCb1)mCb1();else if(!ok&&mCb2)mCb2();
    pendingModal=null;mCb1=null;mCb2=null;renderUI();
}

// ===== TOAST =====
let tt=null;
function showToast(m,tp){
    const t=document.getElementById('toast');
    document.getElementById('toast-msg').textContent=m;
    t.className='toast toast-'+(tp||'gold');
    if(tt)clearTimeout(tt);tt=setTimeout(()=>t.classList.add('hidden'),2200);
}

// ===== FX =====
function spawnCoins(n){const l=document.getElementById('fx-layer');
    for(let i=0;i<n;i++){const c=document.createElement('div');c.className='coin-particle';
        c.textContent='🪙';c.style.left=(20+Math.random()*60)+'%';
        c.style.top=(10+Math.random()*20)+'%';l.appendChild(c);
        setTimeout(()=>c.remove(),1200)}}
function bumpMoney(){const e=document.getElementById('hud-money');
    e.classList.add('bump');setTimeout(()=>e.classList.remove('bump'),250)}

// ===== NAV =====
function setupNav(){
    document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>{
        const p=b.dataset.panel;
        document.querySelectorAll('.panel').forEach(s=>s.classList.remove('active'));
        document.getElementById('panel-'+p).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');SFX.click()}));
    document.getElementById('modal-btn').addEventListener('click',()=>closeModal(true));
    document.getElementById('modal-btn2').addEventListener('click',()=>closeModal(false));
}

function resetGame(){
    showModal('⚠️','Sıfırla?','Tüm ilerleme silinecek!','','Evet','İptal',
        ()=>{SV.clear();S=getDefaultState();renderUI();showToast('Sıfırlandı!','negative')},null);
}

document.addEventListener('DOMContentLoaded',initGame);
