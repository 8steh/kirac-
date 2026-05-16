const R={
    c:null, ctx:null, W:360, H:240, frame:0,
    scene:'room', sceneTimer:0, onSceneDone:null,
    imgs:{}, imgLoaded:0, totalImgs:0,

    // Sprite frame counts per character index
    FRAMES:{
        0:{Idle:6,Walk:8,Run:8,Attack_1:5,Dead:4},
        1:{Idle:7,Walk:8,Run:8,Attack_1:10,Dead:4},
        2:{Idle:6,Walk:8,Run:8,Attack_1:5,Dead:4}
    },

    init(){
        this.c=document.getElementById('game-canvas');
        this.ctx=this.c.getContext('2d');
        this.c.width=this.W; this.c.height=this.H;
        this.ctx.imageSmoothingEnabled=false;
        this.loadImages();
        this.loop();
    },

    loadImages(){
        const sources={};
        const charDirs=['Homeless_1','Homeless_2','Homeless_3'];
        const states=['Idle','Walk','Dead','Attack_1','Run','Hurt'];
        charDirs.forEach((dir,i)=>{
            states.forEach(state=>{
                sources[`char_${i}_${state}`]=`../karakter/${dir}/${state}.png`;
            });
        });
        
        // Maps
        const maps = [
            { id: 0, dir: 'City1', mood: 'Pale', file: 'City1.png' },
            { id: 1, dir: 'City2', mood: 'Pale', file: 'City2_pale.png' },
            { id: 2, dir: 'City3', mood: 'Bright', file: 'City3.png' },
            { id: 3, dir: 'City4', mood: 'Bright', file: 'City4.png' }
        ];
        maps.forEach(m => {
            sources[`map_${m.id}`] = `../map/PNG/${m.dir}/${m.mood}/${m.file}`;
        });
        
        sources['motor_cycle'] = '../karakter/retro-vechicle-sprites-64x64/motor-cycle-male.png';

        this.totalImgs=Object.keys(sources).length;
        for(let key in sources){
            const img=new Image();
            img.onload=()=>{this.imgLoaded++;};
            img.onerror=()=>{this.imgLoaded++;};
            img.src=sources[key];
            this.imgs[key]=img;
        }
    },

    loop(){
        this.frame++;
        try{this.draw();}catch(e){console.error('Draw error:',e);}
        requestAnimationFrame(()=>this.loop());
    },

    r(x,y,w,h,c){this.ctx.fillStyle=c;this.ctx.fillRect(Math.floor(x),Math.floor(y),Math.ceil(w),Math.ceil(h));},

    playJob(jobIdx,cb){
        const scenes=['job_clean','job_kurye','job_freelance','job_insaat','job_ofis','job_yonetici','job_girisimci'];
        this.scene=scenes[jobIdx]||'job_clean';
        this.sceneTimer=0; this.onSceneDone=cb;
    },

    // Which char sprite index for housing level
    charIdx(){
        const lv=S?S.housingLevel:0;
        if(lv<=2) return 0;
        if(lv<=4) return 1;
        return 2;
    },

    drawSprite(x,y,cIdx,state,scale){
        scale=scale||1;
        const imgKey=`char_${cIdx}_${state}`;
        const img=this.imgs[imgKey];
        if(!img||!img.complete||!img.naturalWidth) return false;
        const fw=128, fh=128;
        const fc=this.FRAMES[cIdx]?.[state]||6;
        const spd=state==='Walk'||state==='Run'?0.2:state==='Attack_1'?0.18:0.1;
        let fr=Math.floor(this.frame*spd)%fc;
        if(state==='Dead') fr=Math.min(Math.floor(this.frame*0.06),fc-1);
        const dw=fw*scale, dh=fh*scale;
        this.ctx.drawImage(img,fr*fw,0,fw,fh,x-dw/2,y-dh,dw,dh);
        return true;
    },

    draw(){
        const ctx=this.ctx;
        ctx.clearRect(0,0,this.W,this.H);
        if(this.scene==='room'){
            this.drawCity();
        } else {
            this.sceneTimer++;
            this.drawJobScene();
            if(this.sceneTimer>420){
                this.scene='room';
                if(this.onSceneDone){this.onSceneDone();this.onSceneDone=null;}
            }
        }
    },

    // ===== NEW MAP-based City =====
    drawCity(){
        const lv=S?S.housingLevel:0;
        const W=this.W, H=this.H;

        let mapIdx = 0;
        if(lv<=1) mapIdx = 0;
        else if(lv<=3) mapIdx = 1;
        else if(lv<=5) mapIdx = 2;
        else mapIdx = 3;

        const bgImg = this.imgs[`map_${mapIdx}`];
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
            // Scale height to fit canvas, map is 1920x1080
            const scale = H / 1080;
            const drawW = 1920 * scale; // 426.6
            const dx = (W - drawW) / 2; // Center horizontally
            this.ctx.drawImage(bgImg, dx, 0, drawW, H);
        } else {
            // Fallback dark gradient
            const grd=this.ctx.createLinearGradient(0,0,0,H);
            grd.addColorStop(0,'#1a1a2e');
            grd.addColorStop(1,'#0f0f1a');
            this.ctx.fillStyle=grd;
            this.ctx.fillRect(0,0,W,H);
        }

        const groundY = H * 0.85; 

        // Character standing on the ground
        const ci=this.charIdx();
        const charX=W*0.35;
        if(!this.drawSprite(charX,groundY,ci,'Idle',1.1)){
            this.r(charX-8,groundY-40,16,40,'#e94560');
        }

        // Night time overlay for low levels if the map is too bright
        if (lv <= 1) {
            this.ctx.fillStyle='rgba(10, 10, 30, 0.4)';
            this.ctx.fillRect(0,0,W,H);
        }

        // Lamppost light on character
        if(lv<=2){
            const ctx=this.ctx;
            ctx.save();
            const rg=ctx.createRadialGradient(charX,H*0.5,2,charX,H*0.5,90);
            rg.addColorStop(0,'rgba(255,220,100,0.3)');
            rg.addColorStop(1,'rgba(255,220,100,0)');
            ctx.fillStyle=rg;
            ctx.fillRect(charX-90,H*0.2,180,H*0.6);
            ctx.restore();
        }

        if(lv<=1) this.drawRain();

        this.drawVignette();

        const labels=['😴 Sokakta uyuyor...','🏚️ Kiralık bodrum','🏠 Şehirde yaşıyor','🏢 Orta mahalle','🏡 İyi semt','🏰 Lüks bölge','👑 Köşk'];
        this.drawLabel(labels[lv]||'');
    },

    drawRain(){
        const ctx=this.ctx;
        ctx.strokeStyle='rgba(120,160,220,0.35)';
        ctx.lineWidth=1;
        ctx.beginPath();
        for(let i=0;i<30;i++){
            const rx=((i*97+this.frame*3)%this.W);
            const ry=((i*61+this.frame*5)%this.H);
            ctx.moveTo(rx,ry);
            ctx.lineTo(rx-2,ry+8);
        }
        ctx.stroke();
    },

    drawVignette(){
        const ctx=this.ctx;
        const vg=ctx.createRadialGradient(this.W/2,this.H/2,this.H*0.25,this.W/2,this.H/2,this.H*0.85);
        vg.addColorStop(0,'rgba(0,0,0,0)');
        vg.addColorStop(1,'rgba(0,0,0,0.6)');
        ctx.fillStyle=vg;
        ctx.fillRect(0,0,this.W,this.H);
    },

    drawLabel(txt){
        if(!txt) return;
        const ctx=this.ctx;
        ctx.fillStyle='rgba(0,0,0,0.6)';
        ctx.fillRect(8,this.H-22,this.W-16,16);
        ctx.fillStyle='#f5c518';
        ctx.font='7px "Press Start 2P",monospace';
        ctx.textAlign='center';
        ctx.fillText(txt,this.W/2,this.H-10);
        ctx.textAlign='start';
    },

    // ===== JOB SCENES =====
    drawJobScene(){
        const t=this.sceneTimer;
        switch(this.scene){
            case 'job_clean':     this.sceneClean(t); break;
            case 'job_kurye':     this.sceneKurye(t); break;
            case 'job_freelance': this.sceneJob(t,'💻 Kod yazılıyor...',1,'#0d1117','#1a2030'); break;
            case 'job_insaat':    this.sceneJob(t,'🏗️ İnşaatta çalışıyor...',0,'#1a1008','#2a1a08'); break;
            case 'job_ofis':      this.sceneJob(t,'👔 Ofiste rapor...',1,'#1a1a2e','#16213e'); break;
            case 'job_yonetici':  this.sceneJob(t,'💼 Yönetim toplantısı...',2,'#0d0d1a','#1a1a3e'); break;
            case 'job_girisimci': this.sceneJob(t,'🚀 Yatırımcı sunumu...',2,'#f8fafc','#e8f0f8'); break;
        }
    },

    // ===== TEMIZLIK SAHNESI =====
    sceneClean(t){
        const W=this.W, H=this.H, ctx=this.ctx;
        const groundY=H*0.85;

        // Sky gradient (warm morning)
        const sky=ctx.createLinearGradient(0,0,0,groundY);
        sky.addColorStop(0,'#87CEEB');
        sky.addColorStop(0.7,'#B0E0E6');
        sky.addColorStop(1,'#E0F0E0');
        ctx.fillStyle=sky;
        ctx.fillRect(0,0,W,groundY);

        // Sun
        ctx.fillStyle='#FFD700';
        ctx.beginPath();
        ctx.arc(W*0.85,H*0.12,18,0,Math.PI*2);
        ctx.fill();
        // Sun glow
        ctx.save();
        const sg=ctx.createRadialGradient(W*0.85,H*0.12,8,W*0.85,H*0.12,40);
        sg.addColorStop(0,'rgba(255,220,80,0.3)');
        sg.addColorStop(1,'rgba(255,220,80,0)');
        ctx.fillStyle=sg;
        ctx.fillRect(W*0.65,0,W*0.4,H*0.3);
        ctx.restore();

        // Grass ground
        ctx.fillStyle='#4a8c3f';
        ctx.fillRect(0,groundY,W,H-groundY);
        // Grass detail
        ctx.fillStyle='#3d7a34';
        for(let i=0;i<W;i+=6){
            ctx.fillRect(i,groundY,3,2);
        }

        // === PIXEL ART HOUSE (right side) ===
        const hx=W*0.55, hy=groundY;
        // Foundation
        this.r(hx,hy-8,120,8,'#8B7355');
        // Main walls
        this.r(hx+4,hy-70,112,62,'#DEB887');
        // Wall detail lines
        this.r(hx+4,hy-50,112,2,'#C8A070');
        this.r(hx+4,hy-30,112,2,'#C8A070');
        // Door
        this.r(hx+20,hy-42,22,34,'#6B3A2A');
        this.r(hx+20,hy-42,22,3,'#8B5A3A');
        // Door handle
        this.r(hx+37,hy-25,3,3,'#FFD700');
        // Windows
        this.r(hx+55,hy-58,20,18,'#87CEEB');
        this.r(hx+55,hy-58,20,2,'#5A4A3A');
        this.r(hx+64,hy-58,2,18,'#5A4A3A');
        this.r(hx+55,hy-49,20,2,'#5A4A3A');
        // Window 2
        this.r(hx+85,hy-58,20,18,'#87CEEB');
        this.r(hx+85,hy-58,20,2,'#5A4A3A');
        this.r(hx+94,hy-58,2,18,'#5A4A3A');
        this.r(hx+85,hy-49,20,2,'#5A4A3A');
        // Roof
        ctx.fillStyle='#B22222';
        ctx.beginPath();
        ctx.moveTo(hx-4,hy-70);
        ctx.lineTo(hx+60,hy-105);
        ctx.lineTo(hx+124,hy-70);
        ctx.closePath();
        ctx.fill();
        // Roof outline
        ctx.strokeStyle='#8B1A1A';
        ctx.lineWidth=2;
        ctx.stroke();
        // Chimney
        this.r(hx+90,hy-105,14,25,'#8B7355');
        this.r(hx+88,hy-107,18,5,'#6B5335');
        // Smoke
        const smokeOff=Math.sin(t*0.05)*3;
        ctx.globalAlpha=0.3;
        ctx.fillStyle='#ccc';
        ctx.beginPath();
        ctx.arc(hx+97+smokeOff,hy-115-Math.abs(smokeOff),4,0,Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx+95-smokeOff,hy-125,3,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha=1;

        // Fence
        for(let i=0;i<5;i++){
            this.r(hx-20+i*10,hy-18,3,18,'#DEB887');
            this.r(hx-22+i*10,hy-20,7,3,'#C8A070');
        }

        // Small flower pots
        this.r(hx+50,hy-12,8,12,'#8B4513');
        this.r(hx+48,hy-16,12,4,'#FF6B6B');
        this.r(hx+112,hy-12,8,12,'#8B4513');
        this.r(hx+110,hy-16,12,4,'#FFD700');

        // === CHARACTER WITH BROOM ===
        const walkIn=t<60;
        const ci=this.charIdx();
        let cx;
        if(walkIn){
            cx=(t/60)*(W*0.35);
        } else {
            cx=W*0.35;
        }

        // Draw character
        const charState=walkIn?'Walk':'Attack_1';
        if(!this.drawSprite(cx,groundY,ci,charState,1.1)){
            this.r(cx-8,groundY-40,16,40,'#e94560');
        }

        // Draw broom in character's hand (when working, not walking in)
        if(!walkIn){
            const broomX=cx+15;
            const broomY=groundY;
            const sweep=Math.sin(t*0.15)*8; // sweeping motion
            ctx.save();
            ctx.translate(broomX,broomY-50);
            ctx.rotate(0.3+Math.sin(t*0.15)*0.15);
            // Broom handle
            this.r(-2,0,4,45,'#8B6914');
            // Broom head
            this.r(-8,42,16,8,'#D2691E');
            this.r(-10,48,20,4,'#A0522D');
            // Bristles
            for(let i=-9;i<11;i+=3){
                this.r(i,50,2,6,'#DAA520');
            }
            ctx.restore();

            // Dust particles when sweeping
            ctx.globalAlpha=0.4;
            for(let i=0;i<5;i++){
                const dx=cx+20+sweep+Math.sin(t*0.1+i*2)*15;
                const dy=groundY-5+Math.cos(t*0.08+i)*8;
                const sz=2+Math.sin(t*0.05+i)*1;
                ctx.fillStyle=i%2===0?'#D2B48C':'#C8A070';
                ctx.fillRect(dx,dy,sz,sz);
            }
            ctx.globalAlpha=1;
        }

        // Path/sidewalk in front of house
        this.r(hx-10,groundY,140,4,'#AAA');

        this.drawJobLabel('🧹 Temizlik yapılıyor...',t);
        this.drawVignette();
    },

    sceneJob(t, label, ci, bgTop, bgBot){
        const W=this.W, H=this.H;
        
        // Use current map as background
        const lv=S?S.housingLevel:0;
        let mapIdx = lv<=1?0:lv<=3?1:lv<=5?2:3;
        const bgImg = this.imgs[`map_${mapIdx}`];
        
        if (bgImg && bgImg.complete) {
            const scale = H / 1080;
            const drawW = 1920 * scale;
            this.ctx.drawImage(bgImg, (W-drawW)/2, 0, drawW, H);
        } else {
            const bg=this.ctx.createLinearGradient(0,0,0,H);
            bg.addColorStop(0,bgTop); bg.addColorStop(1,bgBot);
            this.ctx.fillStyle=bg; this.ctx.fillRect(0,0,W,H);
        }
        
        const walkIn=t<50;
        const cx=walkIn? (t/50)*(W*0.45) : W*0.45;
        const state=walkIn?'Walk':'Attack_1';
        if(!this.drawSprite(cx,H*0.85,ci,state,1.1)){
            this.r(cx-8,H*0.85-40,16,40,'#e94560');
        }
        this.drawJobLabel(label,t);
        this.drawVignette();
    },

    sceneKurye(t){
        const W=this.W, H=this.H, ctx=this.ctx;

        // Use City3 Bright for a different city feel
        const bgImg = this.imgs['map_2'];
        if (bgImg && bgImg.complete) {
            // Fill entire canvas with the map
            const imgRatio = 1920/1080;
            const canvasRatio = W/H;
            let sw, sh, sx, sy;
            if(canvasRatio > imgRatio){
                sw=1920; sh=1920/canvasRatio;
                sx=0; sy=(1080-sh)/2;
            } else {
                sh=1080; sw=1080*canvasRatio;
                sx=(1920-sw)/2; sy=0;
            }
            ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, W, H);
        } else {
            this.r(0,0,W,H,'#1a2a3a');
        }

        // Road at bottom
        const roadTop = H*0.78;
        const roadGrd=ctx.createLinearGradient(0,roadTop,0,H);
        roadGrd.addColorStop(0,'#444');
        roadGrd.addColorStop(0.1,'#333');
        roadGrd.addColorStop(1,'#222');
        ctx.fillStyle=roadGrd;
        ctx.fillRect(0,roadTop,W,H-roadTop);

        // Curb
        this.r(0,roadTop,W,3,'#666');
        this.r(0,roadTop+3,W,2,'#555');

        // Moving road dashes
        for(let i=0;i<10;i++){
            const rx=((i*70-t*5)%(W+70)+W+70)%(W+70)-35;
            this.r(rx, roadTop + (H-roadTop)*0.55, 30, 3, '#f0c040');
        }

        // Motor Cycle
        const mx=W*0.45;
        const bounce=Math.sin(t*0.5)*1.5;
        const motorImg = this.imgs['motor_cycle'];
        if (motorImg && motorImg.complete) {
            const ms=2.5;
            const mw=64*ms, mh=64*ms;
            const dx=mx-mw/2;
            const dy=roadTop-mh*0.55+bounce;

            ctx.save();
            ctx.translate(dx+mw/2, dy+mh/2);
            ctx.rotate(Math.sin(t*0.3)*0.015);
            ctx.drawImage(motorImg, -mw/2, -mh/2, mw, mh);
            ctx.restore();

            // Speed lines
            ctx.save();
            ctx.globalAlpha=0.25;
            ctx.strokeStyle='#ddd';
            ctx.lineWidth=1;
            for(let i=0;i<5;i++){
                const lx=dx-8-i*18;
                const ly=dy+mh*0.4+i*7;
                ctx.beginPath();
                ctx.moveTo(lx,ly);
                ctx.lineTo(lx-25,ly);
                ctx.stroke();
            }
            ctx.restore();
        } else {
            this.drawSprite(mx,roadTop+bounce,0,'Walk',1.1);
        }

        this.drawJobLabel('🛵 Sipariş teslim ediliyor...',t);
        this.drawVignette();
    },

    drawJobLabel(txt,t){
        if(t<10) this.ctx.globalAlpha=t/10;
        this.ctx.fillStyle='rgba(0,0,0,0.75)';
        this.ctx.fillRect(8,this.H-22,this.W-16,16);
        this.ctx.fillStyle='#f5c518';
        this.ctx.font='7px "Press Start 2P",monospace';
        this.ctx.textAlign='center';
        this.ctx.fillText(txt,this.W/2,this.H-10);
        this.ctx.globalAlpha=1;
        this.ctx.textAlign='start';
    }
};
