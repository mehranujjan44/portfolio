(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pointerFine = window.matchMedia('(pointer: fine)').matches;

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

    initTransitionVeil();
    if(pointerFine && !reduceMotion){ initCursor(); initMagnetic(); }
    initScramble();
    initReveal();
    initCounters();
    initHeroCanvas();
  });

  // ---------------- page transition veil ----------------
  function initTransitionVeil(){
    var veil = document.querySelector('.transition-veil');
    if(!veil) return;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ veil.classList.add('reveal'); });
    });

    document.addEventListener('click', function(e){
      var a = e.target.closest('a[href]');
      if(!a) return;
      var href = a.getAttribute('href');
      if(!href || href.charAt(0) === '#') return;
      if(a.target === '_blank' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      if(href.indexOf('http') === 0 && href.indexOf(window.location.origin) !== 0) return;
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      veil.classList.remove('reveal');
      veil.classList.add('cover');
      setTimeout(function(){ window.location.href = href; }, 480);
    });
  }

  // ---------------- custom cursor ----------------
  function initCursor(){
    document.body.classList.add('pointer-fine');
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if(!dot || !ring) return;
    var mx = window.innerWidth/2, my = window.innerHeight/2, rx = mx, ry = my;

    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });

    function loop(){
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var hoverables = document.querySelectorAll('a, button, .magnetic, .proj-card, .micro-card, .stack-card, .chip, .tag');
    hoverables.forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('hover'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('hover'); });
    });
  }

  // ---------------- magnetic elements ----------------
  function initMagnetic(){
    var els = document.querySelectorAll('.magnetic');
    els.forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width/2);
        var y = e.clientY - (r.top + r.height/2);
        el.style.transform = 'translate(' + (x*0.3) + 'px,' + (y*0.3) + 'px)';
      });
      el.addEventListener('mouseleave', function(){
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  // ---------------- text scramble ----------------
  var SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#$%';
  function scramble(el){
    if(reduceMotion) return;
    var original = el.dataset.text || el.textContent;
    el.dataset.text = original;
    clearInterval(el._scrambleTimer);
    var frame = 0;
    el._scrambleTimer = setInterval(function(){
      var out = '';
      for(var i=0;i<original.length;i++){
        if(i < frame || original[i] === ' '){ out += original[i]; }
        else { out += SCRAMBLE_CHARS[Math.floor(Math.random()*SCRAMBLE_CHARS.length)]; }
      }
      el.textContent = out;
      frame += 1;
      if(frame > original.length){
        clearInterval(el._scrambleTimer);
        el.textContent = original;
      }
    }, 28);
  }

  function initScramble(){
    var els = document.querySelectorAll('[data-scramble]');
    els.forEach(function(el){
      el.dataset.text = el.textContent;
      el.addEventListener('mouseenter', function(){ scramble(el); });
    });
    var onLoad = document.querySelectorAll('[data-scramble-load]');
    onLoad.forEach(function(el){ scramble(el); });
  }

  // ---------------- scroll reveal ----------------
  function initReveal(){
    var els = document.querySelectorAll('.proj-card, .micro-card, .entry, .skill-block, .pub, .tcell, .stack-card');
    var log = document.querySelector('.log');
    if(!els.length && !log) return;
    if(reduceMotion || !('IntersectionObserver' in window)){
      if(log){ log.classList.add('in-view'); }
      return;
    }
    els.forEach(function(el, i){
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 6, 6) * 0.06) + 's';
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
    els.forEach(function(el){ io.observe(el); });

    if(log){
      var logIo = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ log.classList.add('in-view'); logIo.unobserve(log); }
        });
      }, {threshold: 0.05});
      logIo.observe(log);
    }
  }

  // ---------------- animated counters ----------------
  function initCounters(){
    var els = document.querySelectorAll('.counter');
    if(!els.length) return;
    if(reduceMotion || !('IntersectionObserver' in window)){
      els.forEach(function(el){ el.textContent = el.dataset.target; });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.dataset.target, 10) || 0;
        var start = performance.now();
        var duration = 1200;
        function tick(now){
          var p = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if(p < 1){ requestAnimationFrame(tick); }
        }
        requestAnimationFrame(tick);
      });
    }, {threshold: 0.4});
    els.forEach(function(el){ io.observe(el); });
  }

  // ---------------- hero: three.js point cloud + 2d fallback ----------------
  function initHeroCanvas(){
    var canvas = document.getElementById('hero-canvas');
    if(!canvas) return;
    var hero = document.querySelector('.hero');
    if(!hero) return;

    if(window.THREE && !reduceMotion){
      try{ initThreeCloud(canvas, hero); return; }
      catch(err){ /* fall through to 2d */ }
    }
    init2dFallback(canvas, hero);
  }

  function initThreeCloud(canvas, hero){
    var THREE = window.THREE;
    var renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true, antialias: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    var COUNT = 3200;
    var positions = new Float32Array(COUNT * 3);
    var colors = new Float32Array(COUNT * 3);
    var colorA = new THREE.Color(0xddff00);
    var colorB = new THREE.Color(0xff2f78);

    for(var i=0;i<COUNT;i++){
      var r = 3.4 + Math.random() * 0.6;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos((Math.random() * 2) - 1);
      var jitter = (Math.random() - 0.5) * 0.9;
      var x = r * Math.sin(phi) * Math.cos(theta) + jitter;
      var y = r * Math.sin(phi) * Math.sin(theta) * 0.7 + jitter * 0.5;
      var z = r * Math.cos(phi) + jitter;
      positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
      var mixed = colorA.clone().lerp(colorB, Math.random());
      colors[i*3] = mixed.r; colors[i*3+1] = mixed.g; colors[i*3+2] = mixed.b;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var mat = new THREE.PointsMaterial({size: 0.045, vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false});
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function(e){
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    function resize(){
      var w = hero.offsetWidth, h = hero.offsetHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    var hidden = false;
    document.addEventListener('visibilitychange', function(){ hidden = document.hidden; });

    function animate(t){
      if(!hidden){
        points.rotation.y = t * 0.00006;
        points.rotation.x = t * 0.00002;
        camera.position.x += (mouseX * 2.2 - camera.position.x) * 0.03;
        camera.position.y += (-mouseY * 1.4 - camera.position.y) * 0.03;
        camera.lookAt(0,0,0);
        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  function init2dFallback(canvas, hero){
    var ctx = canvas.getContext('2d');
    var dots = [], W, H, DPR, scanY = 0;

    function resize(){
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.offsetWidth; H = hero.offsetHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(DPR,0,0,DPR,0,0);
      buildDots();
    }

    function buildDots(){
      dots = [];
      var cols = Math.floor(W/34), rows = Math.floor(H/34);
      for(var i=0;i<cols;i++){
        for(var j=0;j<rows;j++){
          if(Math.random() > 0.55) continue;
          dots.push({
            x: (i+0.5)*(W/cols) + (Math.random()*10-5),
            y: (j+0.5)*(H/rows) + (Math.random()*10-5),
            r: Math.random()*1.1+0.4,
            base: Math.random()*0.35+0.08
          });
        }
      }
    }

    function draw(t){
      ctx.clearRect(0,0,W,H);
      scanY = (t/9000 % 1) * (H+120) - 60;
      for(var k=0;k<dots.length;k++){
        var d = dots[k];
        var boost = Math.max(0, 1 - Math.abs(d.y-scanY)/90);
        var alpha = d.base + boost*0.6;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r+boost*0.6, 0, Math.PI*2);
        ctx.fillStyle = boost > 0.15 ? 'rgba(221,255,0,'+alpha+')' : 'rgba(141,142,151,'+alpha+')';
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(221,255,0,0.18)';
      ctx.fillRect(0, scanY-1, W, 2);
      if(!reduceMotion){ requestAnimationFrame(draw); }
    }

    window.addEventListener('resize', resize);
    resize();
    if(reduceMotion){ scanY = -1000; draw(0); } else { requestAnimationFrame(draw); }
  }
})();
