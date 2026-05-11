const R={
    c:null, ctx:null, W:240, H:280, frame:0, anim:'idle',
    scene:'room', sceneTimer:0, charX:100, charY:0, onSceneDone:null,
    imgs:{}, imgLoaded:0, totalImgs:2,

    init(){
        this.c=document.getElementById('game-canvas');
        this.ctx=this.c.getContext('2d');
        this.c.width=this.W; this.c.height=this.H;
        this.ctx.imageSmoothingEnabled=false;
        this.loadImages();
    },
    
    loadImages(){
        const sources = {
            'bg_room_0': 'assets/bg_room_0.png',
            'bg_job_office': 'assets/bg_job_office.png',
            'chars': 'assets/chars.png'
        };
        this.totalImgs = Object.keys(sources).length;
        for(let key in sources){
            const img = new Image();
            img.onload = () => { 
                if(key === 'chars') this.processCharsImage(img);
                this.imgLoaded++; 
                if(this.imgLoaded===this.totalImgs) this.loop(); 
            };
            img.onerror = () => { console.error("Image failed:", key); this.imgLoaded++; if(this.imgLoaded===this.totalImgs) this.loop(); };
            img.src = sources[key];
            this.imgs[key] = img;
        }
    },

    processCharsImage(img){
        const oc = document.createElement('canvas');
        oc.width = img.naturalWidth;
        oc.height = img.naturalHeight;
        const octx = oc.getContext('2d', { willReadFrequently: true });
        octx.drawImage(img, 0, 0);
        const idata = octx.getImageData(0, 0, oc.width, oc.height);
        const d = idata.data;
        
        // Use top-left pixel as background color reference
        const bgR = d[0], bgG = d[1], bgB = d[2];
        
        for(let i=0; i<d.length; i+=4) {
            // Tolerance to remove noise
            if(Math.abs(d[i]-bgR) < 15 && Math.abs(d[i+1]-bgG) < 15 && Math.abs(d[i+2]-bgB) < 15) {
                d[i+3] = 0; // Transparent
            }
        }
        octx.putImageData(idata, 0, 0);
        this.charsCanvas = oc;
    },

    loop(){this.frame++; this.draw(); requestAnimationFrame(()=>this.loop())},
    r(x,y,w,h,c){this.ctx.fillStyle=c; this.ctx.fillRect(Math.floor(x),Math.floor(y),w,h)},
    dk(hex,a){let n=parseInt(hex.replace('#',''),16);
        let r=Math.max(0,((n>>16)&255)-a),g=Math.max(0,((n>>8)&255)-a),b=Math.max(0,(n&255)-a);
        return `rgb(${r},${g},${b})`},

    playJob(jobIdx, cb){
        const scenes=['job_clean','job_kurye','job_freelance','job_insaat','job_ofis','job_yonetici','job_girisimci'];
        this.scene=scenes[jobIdx]||'job_clean';
        this.sceneTimer=0; this.charX=-20; this.onSceneDone=cb;
    },

    draw(){
        this.ctx.clearRect(0,0,this.W,this.H);
        if(this.scene==='room'){
            const lv = S ? S.housingLevel : 0;
            this.drawRoom(lv);
            this.drawFurn(lv);
            
            // Dynamic character states based on housing level
            if(lv === 0) {
                // Sleeping properly on the cardboard bed using character index 2 (grey hoodie)
                this.drawSpriteChar(55, 185, 2, 'sleeping');
            } else if (lv === 1) {
                // Standing near desk (Red jacket)
                this.drawSpriteChar(135, 120, 0, 'idle');
            } else if (lv >= 2 && lv <= 3) {
                // Standing in the room (Green hoodie)
                this.drawSpriteChar(120, 115, 1, 'idle');
            } else if (lv === 4) {
                // Standing in the room (Orange jacket)
                this.drawSpriteChar(120, 115, 3, 'idle');
            } else {
                // Boss standing (Purple hat)
                this.drawSpriteChar(120, 115, 4, 'idle');
            }
        }
        else{
            this.sceneTimer++; 
            this.drawJobScene();
            if(this.sceneTimer>420){this.scene='room'; if(this.onSceneDone){this.onSceneDone(); this.onSceneDone=null}}
        }
    },

    drawJobScene(){
        const t=this.sceneTimer;
        switch(this.scene){
            case 'job_clean': this.sceneClean(t); break;
            case 'job_kurye': this.sceneKurye(t); break;
            case 'job_freelance': this.sceneFreelance(t); break;
            case 'job_insaat': this.sceneInsaat(t); break;
            case 'job_ofis': this.sceneOfis(t); break;
            case 'job_yonetici': this.sceneYonetici(t); break;
            case 'job_girisimci': this.sceneGirisimci(t); break;
        }
    },

    // --- Actual Pixel Art Character ---
    drawSpriteChar(x, y, charIndex, state){
        const canvas = this.charsCanvas;
        if(!canvas || canvas.width===0) return;
        
        const ctx = this.ctx;
        
        // Image has 5 characters side by side
        const totalChars = 5;
        const cw = canvas.width / totalChars; // Width of one character frame
        const ch = canvas.height; // Height of the character frame
        
        // Determine source X based on the character index (0 to 4)
        const sx = charIndex * cw;
        const sy = 0;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Define an optimal display scale so they don't look tiny or huge
        // Assuming original image is high res (e.g., 500x200), we want to scale it down to fit the room.
        // A standard character height in our room is around 60-80px.
        const targetHeight = 80;
        const scale = targetHeight / ch;
        const drawWidth = cw * scale;
        
        if (state === 'sleeping') {
            // Lying flat, rotate the image 90 degrees and position correctly
            ctx.rotate(-Math.PI/2);
            ctx.translate(-targetHeight, drawWidth/2);
            // Draw a blanket over the sleeping character
            ctx.drawImage(canvas, sx, sy, cw, ch, 0, 0, drawWidth, targetHeight);
            
            // Blanket over body
            this.r(15, 0, targetHeight-20, drawWidth, '#374151'); 
            
            // Zzz
            if(this.frame%80 < 40) this.r(10, -5, 4, 4, '#fff');
            else this.r(5, -12, 6, 6, '#fff');
            
        } else {
            // Idle or Walk bobbing
            const bob = (state==='idle') ? Math.sin(this.frame*0.04)*1.5 : (state==='walk' ? Math.sin(this.frame*0.2)*3 : 0);
            
            // Draw shadow at bottom
            this.ctx.globalAlpha = 0.3;
            this.r(drawWidth*0.2, targetHeight-4, drawWidth*0.6, 6, '#000');
            this.ctx.globalAlpha = 1;
            
            // Draw character
            ctx.drawImage(canvas, sx, sy, cw, ch, 0, bob, drawWidth, targetHeight);
        }
        
        ctx.restore();
    },

    // ===== SCENES =====
    
    sceneClean(t){
        this.r(0,0,240,280,'#2c2520');
        for(let x=0; x<240; x+=40) this.r(x, 0, 2, 280, '#1a1510'); // wallpaper stripes
        this.r(0, 200, 240, 80, '#4a3b32'); // floor
        
        const cx = t<60 ? t*2-40 : 80;
        const walkState = t<60 ? 'walk' : 'idle';
        
        this.drawSpriteChar(cx, 115, 0, walkState);
        
        // Broom
        if(t>60){
            const sweep = Math.sin(t*0.2)*10;
            this.r(cx-10+sweep, 175, 4, 30, '#8b6914');
            this.r(cx-15+sweep, 205, 14, 6, '#2a2a2a');
        }
        this.drawJobLabel('🧹 Temizlik yapılıyor...', t);
    },

    sceneKurye(t){
        const grad=this.ctx.createLinearGradient(0,0,0,120);
        grad.addColorStop(0,'#1a1a3e');grad.addColorStop(1,'#3a4a6e');
        this.ctx.fillStyle=grad;this.ctx.fillRect(0,0,240,120);
        const blds=[[0,40,30,80,'#2a2a3e'],[25,25,25,95,'#3a3a4e'],[45,50,20,70,'#252538'],
            [60,20,35,100,'#2e2e42'],[90,35,25,85,'#333348'],[110,55,20,65,'#2a2a3e']];
        blds.forEach(b=>{this.r(b[0],b[1],b[2],b[3],b[4])});
        
        this.r(0,120,240,80,'#222'); this.r(0,160,240,4,'#ff0');
        for(let i=0;i<12;i++){const dx=((i*40-t*6)%300+300)%300-30;this.r(dx,160,20,4,'#333')}
        
        const mx = 100;
        const bounce = Math.sin(t*0.4)*2;
        
        // Scooter
        this.r(mx-20, 160+bounce, 40, 15, '#e94560');
        this.r(mx-15, 170+bounce, 12, 12, '#111'); // wheel
        this.r(mx+15, 170+bounce, 12, 12, '#111'); // wheel
        
        // Char on scooter
        this.drawSpriteChar(mx-10, 85+bounce, 0, 'idle');
        
        // Helmet
        this.r(mx-14, 115+bounce, 20, 12, '#e94560');
        
        if(t>20){for(let i=0;i<6;i++){
            this.ctx.globalAlpha=0.4;
            this.r(mx-40-Math.random()*50, 140+i*10+bounce, 20+Math.random()*30, 2, '#fff');
            this.ctx.globalAlpha=1;
        }}
        this.drawJobLabel('🛵 Sipariş teslim ediliyor...', t);
    },

    sceneFreelance(t){
        this.r(0,0,240,280,'#111827');
        this.r(50, 180, 140, 10, '#4b5563'); // desk
        
        // Monitors
        this.r(70, 130, 40, 30, '#1f2937');
        this.r(72, 132, 36, 26, '#3b82f6'); // screen 1
        this.r(120, 130, 40, 30, '#1f2937');
        this.r(122, 132, 36, 26, '#10b981'); // screen 2
        
        // Code scrolling
        for(let i=0;i<4;i++){
            this.r(74, 134+i*6- (t*0.5)%6, 20+Math.random()*10, 2, '#fff');
        }

        this.drawSpriteChar(90, 105, 0, 'idle');
        this.drawJobLabel('💻 Kod yazılıyor...', t);
    },

    sceneInsaat(t){
        this.r(0,0,240,200,'#60a5fa'); // sky
        this.r(0,200,240,80,'#a16207'); // dirt
        // Scaffolding
        for(let x=20; x<220; x+=40){
            this.r(x, 40, 4, 160, '#fcd34d');
            for(let y=60; y<200; y+=40) this.r(x, y, 40, 4, '#fcd34d');
        }
        
        const cx = 100;
        this.drawSpriteChar(cx, 115, 0, t%20<10?'walk':'idle');
        
        // Hard hat
        this.r(cx-10, 150, 22, 8, '#fbbf24');
        
        this.drawJobLabel('🏗️ İnşaatta ter dökülüyor...', t);
    },

    sceneOfis(t){
        if(this.imgs['bg_job_office'] && this.imgs['bg_job_office'].complete && this.imgs['bg_job_office'].naturalWidth>0){
            this.ctx.drawImage(this.imgs['bg_job_office'], 0, 0, 240, 280);
        } else {
            this.r(0,0,240,280,'#e5e7eb');
            this.r(0,180,240,100,'#9ca3af');
        }
        this.drawSpriteChar(80, 115, 4, 'idle');
        this.drawJobLabel('👔 Ofiste rapor hazırlanıyor...', t);
    },

    sceneYonetici(t){
        this.r(0,0,240,280,'#1e1b4b');
        this.r(40,40,160,100,'#312e81'); // window
        for(let i=0;i<5;i++) this.r(40+i*32, 40, 4, 100, '#1e1b4b'); // window bars
        
        this.r(20, 200, 200, 15, '#451a03'); // luxury desk
        
        this.drawSpriteChar(120, 115, 4, 'idle');
        this.drawJobLabel('💼 Yönetim kurulu toplantısı...', t);
    },

    sceneGirisimci(t){
        this.r(0,0,240,280,'#f8fafc');
        this.r(40, 40, 160, 120, '#cbd5e1'); // projector screen
        
        // Graph growing
        const growth = Math.min(t, 100);
        this.r(50, 140-growth, 10, growth, '#10b981');
        this.r(90, 140-growth*1.2, 10, growth*1.2, '#10b981');
        this.r(130, 140-growth*1.5, 10, growth*1.5, '#10b981');
        
        this.drawSpriteChar(170, 115, 4, t%40<20?'walk':'idle');
        this.drawJobLabel('🚀 Yatırımcı sunumu...', t);
    },

    drawJobLabel(txt,t){
        if(t<10)this.ctx.globalAlpha=t/10;
        this.ctx.fillStyle='rgba(0,0,0,0.8)';
        this.ctx.fillRect(10,250,220,24);
        this.ctx.fillStyle='#ffd54f';this.ctx.font='8px "Press Start 2P",monospace';
        this.ctx.textAlign='center';this.ctx.fillText(txt,120,266);
        this.ctx.globalAlpha=1;this.ctx.textAlign='start';
    },

    // ===== ROOM =====
    drawRoom(lv){
        if(lv===0 && this.imgs['bg_room_0'] && this.imgs['bg_room_0'].complete && this.imgs['bg_room_0'].naturalWidth>0){
            this.ctx.drawImage(this.imgs['bg_room_0'], 0, 0, 240, 280);
            return;
        }
        
        const wc=['#5c4033','#6b5344','#8b7355','#a08060','#c4a882','#d4c4a8','#e8dcc8'][lv];
        const fc=['#3d3027','#4a3f35','#6b5f52','#7a6e60','#9a8e7e','#b5a999','#d4c8b5'][lv];
        this.r(0,0,240,50,'#2a2a3e');this.r(0,50,240,150,wc);this.r(0,200,240,80,fc);
        for(let i=0;i<8;i++)this.r(0,205+i*10,240,1,this.dk(fc,20));
        this.r(0,50,4,230,this.dk(wc,30));this.r(236,50,4,230,this.dk(wc,30));
        this.r(0,198,240,3,this.dk(wc,20));
        
        // Window
        if(lv===0){this.r(175,60,30,20,'#87ceeb');this.r(174,59,32,2,'#555');this.r(174,79,32,2,'#555');this.r(188,59,2,22,'#555')}
        else{const ww=35+lv*5,wh=40+lv*4,wx=155,wy=65;
            this.r(wx,wy,ww,wh,'#87ceeb');this.r(wx-2,wy-2,ww+4,3,'#8b7355');
            this.r(wx-2,wy+wh-1,ww+4,3,'#8b7355');this.r(wx-2,wy,3,wh,'#8b7355');
            this.r(wx+ww-1,wy,3,wh,'#8b7355');this.r(wx+ww/2-1,wy,2,wh,'#8b7355');
            if(lv>=3){this.r(wx-4,wy-4,6,wh+8,'#8b3a62');this.r(wx+ww-2,wy-4,6,wh+8,'#8b3a62')}
            this.r(wx+6,wy+6,10,10,'#fff3a0')}
            
        // Door
        const dw=20+lv*2,dh=50+lv*4;
        this.r(20,200-dh,dw,dh,this.dk(wc,40));this.r(22,200-dh+2,dw-4,dh-2,lv>=4?'#6b3a1f':'#4a3020');
        this.r(20+dw-6,200-dh+dh/2-2,3,4,'#c9a000');
    },

    drawFurn(lv){
        if(lv===0) return; // Background image handles furn for level 0
        const beds=[['#664'],['#865'],['#a75'],['#b86'],['#c97'],['#da8'],['#fb9']];
        const bc=beds[lv][0];
        const bw=35+lv*5,bh=35+lv*3;
        this.r(55,198-bh,5,bh,bc);this.r(56,198-bh+5,bw-2,bh-14,'#fff');
        this.r(56,198-bh+5,12,bh-16,'#cde');this.r(55,198-8,bw,8,this.dk(bc,20));
        
        if(lv>=1){this.r(140,170,40,4,'#8b6914');this.r(143,174,4,24,'#8b6914');this.r(175,174,4,24,'#8b6914');
            this.r(150,160,14,10,'#aaa');this.r(155,160,5,4,'#888')}
        if(lv>=2){this.drawPlant(110,178);this.drawTV(80,150)}
        if(lv>=3){this.drawPlant(210,178);this.drawBookshelf(65,110)}
        if(lv>=4){this.drawCouch(168,172)}
        if(lv>=5){this.drawChandelier(120,52)}
        if(lv>=6){this.drawChandelier(60,52);this.drawPainting(95,70)}
    },

    drawPlant(x,y){this.r(x+3,y+8,8,10,'#8b4513');this.r(x+1,y+7,12,3,'#a0522d');
        this.r(x+5,y,4,8,'#2d5016');this.r(x,y-4,14,8,'#3a7a1a');this.r(x+2,y-6,10,4,'#4a9a2a')},
    drawTV(x,y){this.r(x,y,30,20,'#222');this.r(x+2,y+2,26,15,'#1a4a6e');
        this.r(x+13,y+17,4,5,'#333');this.r(x+8,y+21,14,2,'#444');
        if(this.frame%60<30){this.ctx.globalAlpha=.1;this.r(x+2,y+2,26,15,'#4af');this.ctx.globalAlpha=1}},
    drawBookshelf(x,y){this.r(x,y,25,70,'#5a3a1a');
        this.r(x+2,y+2,21,3,'#a33');this.r(x+2,y+7,21,3,'#3a3');this.r(x+2,y+12,21,3,'#33a');
        this.r(x,y+17,25,2,'#4a2a0a');this.r(x+2,y+21,21,3,'#aa3');this.r(x+2,y+26,21,3,'#a3a')},
    drawCouch(x,y){this.r(x,y+4,35,16,'#6a3050');this.r(x-3,y,5,24,'#7a4060');
        this.r(x+33,y,5,24,'#7a4060');this.r(x,y-4,35,6,'#7a4060');
        this.r(x+3,y+6,12,10,'#8a5070');this.r(x+18,y+6,12,10,'#8a5070')},
    drawChandelier(x,y){this.r(x+8,y,4,6,'#c9a000');this.r(x,y+6,20,3,'#dab000');
        this.r(x+2,y+9,3,4,'#ffd54f');this.r(x+15,y+9,3,4,'#ffd54f');
        this.ctx.globalAlpha=.08;this.r(x-8,y+6,36,40,'#ffd54f');this.ctx.globalAlpha=1},
    drawPainting(x,y){this.r(x-1,y-1,28,22,'#c9a000');this.r(x,y,26,20,'#4a8');
        this.r(x,y+12,26,8,'#6a5');this.r(x+8,y+2,10,14,'#fa5')}
};
