document.addEventListener('DOMContentLoaded', function(){
  var yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  var progress = document.getElementById('progress');
  if(progress){
    window.addEventListener('scroll', function(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      progress.style.width = p + '%';
    });
  }

  var canvas = document.getElementById('hero-canvas');
  if(!canvas) return;

  var ctx = canvas.getContext('2d');
  var hero = document.querySelector('.hero');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dots = [];
  var W, H, DPR, scanY = 0;

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    buildDots();
  }

  function buildDots(){
    dots = [];
    var cols = Math.floor(W / 34);
    var rows = Math.floor(H / 34);
    for(var i=0;i<cols;i++){
      for(var j=0;j<rows;j++){
        if(Math.random() > 0.55) continue;
        dots.push({
          x: (i + 0.5) * (W/cols) + (Math.random()*10-5),
          y: (j + 0.5) * (H/rows) + (Math.random()*10-5),
          r: Math.random() * 1.1 + 0.4,
          base: Math.random() * 0.35 + 0.08
        });
      }
    }
  }

  function draw(t){
    ctx.clearRect(0,0,W,H);
    scanY = (t/9000 % 1) * (H + 120) - 60;

    for(var k=0;k<dots.length;k++){
      var d = dots[k];
      var dist = Math.abs(d.y - scanY);
      var boost = Math.max(0, 1 - dist/90);
      var alpha = d.base + boost * 0.6;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r + boost*0.6, 0, Math.PI*2);
      ctx.fillStyle = boost > 0.15 ? 'rgba(94,168,255,' + alpha + ')' : 'rgba(154,161,166,' + alpha + ')';
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(94,168,255,0.18)';
    ctx.fillRect(0, scanY-1, W, 2);

    if(!reduceMotion){ requestAnimationFrame(draw); }
  }

  window.addEventListener('resize', resize);
  resize();
  if(reduceMotion){
    scanY = -1000;
    draw(0);
  } else {
    requestAnimationFrame(draw);
  }
});
