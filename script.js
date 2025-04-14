document.addEventListener('DOMContentLoaded', function () {
  // 1) Scroll progress, back-to-top, and parallax hero
  window.addEventListener("scroll", () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      document.getElementById("scroll-progress").style.width = progress + "%";
  

    const backToTop = document.getElementById('backToTop');
    backToTop.style.display = window.scrollY > 200 ? 'block' : 'none';

    const hero = document.querySelector('.hero');
    hero.style.transform = `translateY(${window.scrollY * 0.2}px)`;

    // Highlight active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      const section = document.querySelector(link.getAttribute('href'));
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  document.getElementById('backToTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 2) Theme toggle
  const themeToggle = document.getElementById('themeToggle');

  themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  themeToggle.textContent = document.body.classList.contains('light-theme') ? '☀' : '☾';
});


  // 3) Three.js starfield background
  const threeContainer = document.getElementById('three-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor(0x000000, 0); // Ensures transparency
  renderer.setSize(window.innerWidth, window.innerHeight);
  threeContainer.appendChild(renderer.domElement);

  const particlesCount = 1000;
  const particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 6;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.01,
    color: 0x00aaff,
    transparent: true,
    opacity: 1
  });
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  camera.position.z = 3;
  const light = new THREE.PointLight(0x00aaff, 1, 100);
  light.position.set(0, 0, 2);
  scene.add(light);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    light.position.x = mouseX * 2;
    light.position.y = mouseY * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    particlesMesh.rotation.x += 0.001;
    particlesMesh.rotation.y += 0.001;
    particlesMesh.position.x = mouseX * 0.1;
    particlesMesh.position.y = mouseY * 0.1;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 4) Scramble text for "Gautham Balaji"
  function scrambleText(el, finalText, speed = 50) {
    let currentLength = 0;
    const SCRAMBLE_CHARS = "!@#$%^&*()_+[]{}|;:<>,.?/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const scrambledArr = new Array(finalText.length).fill("");
    const interval = setInterval(() => {
      for (let i = 0; i < scrambledArr.length; i++) {
        scrambledArr[i] = i < currentLength 
          ? finalText[i] 
          : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      el.textContent = scrambledArr.join("");
      currentLength++;
      if (currentLength > finalText.length) {
        clearInterval(interval);
        el.textContent = finalText;
      }
    }, speed);
  }
  scrambleText(document.getElementById('myName'), "Gautham Balaji", 115);

  // 5) Auto-scrolling project carousel (faster)
  const slider = document.querySelector('.swiper-wrapper');
  if (slider) {
    slider.innerHTML += slider.innerHTML; // Duplicate items for seamless scroll
    let pos = 0;
    let isPaused=false;
    function autoScrollCarousel() {
      if(!isPaused){
        pos -= 1.50; // Adjust speed as needed
        if (Math.abs(pos) >= slider.scrollWidth / 2) pos = 0;
        slider.style.transform = `translateX(${pos}px)`;
      }
      requestAnimationFrame(autoScrollCarousel);
    }

    autoScrollCarousel();
    
    // Add hover event listeners to pause/resume scrolling
    document.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('mouseenter', function() {
        isPaused = true;
    });

    item.addEventListener('mouseleave', function() {
      // Only resume if modal is not open
      if (modal.style.display !== 'block') {
        isPaused = false;
      }
    });
  });

  }

  // 6) Interactive Project Modal
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.querySelector('.modal-close');

  document.querySelectorAll('.project-item').forEach(item => {
    item.addEventListener('click', function () {
      isPaused=true;
      // Expanded info from data attributes
      const title = this.getAttribute('data-modal-title') || "Project Details";
      const details = this.getAttribute('data-modal-details') || "No additional details provided.";
      const imageHTML = this.querySelector('.project-image').outerHTML; // clone the image block
      const githubUrl = this.getAttribute('data-github-url') || "#";

      // Build the modal content
      modalBody.innerHTML = `
        <h2 style="color: var(--accent-color); margin-bottom: 1rem;">
          <a href="${githubUrl}" target="_blank" style="text-decoration: none; color: inherit;">
            ${title} <span class="github-icon"><i class="fab fa-github"></i></span>
          </a>
        </h2>
        ${imageHTML}
        <p style="margin-top: 1rem;">${details}</p>
        <div style="margin-top: 1.5rem; text-align: center;">
          <a href="${githubUrl}" target="_blank" class="github-button">
            View in GitHub
          </a>
        </div>
      `;

      // Show modal
      modal.style.display = 'block';
    });
  });

  modalClose.addEventListener('click', function (e) {
    e.stopPropagation();
    modal.style.display = 'none';
    isPaused=false;
  });

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
      isPaused=false;
    }
  });
});

const texts = ["AI Enthusiast ", "Full Stack Developer ", "Aspiring Coder "];
const speed = 100; // Typing speed (in ms)
const delayBetweenWords = 1500; // Delay before deleting & switching text

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterText = document.getElementById("typewriter-text");

function typeEffect() {
  const currentText = texts[textIndex];
  if (isDeleting) {
      typewriterText.textContent = currentText.substring(0, charIndex--);
  } else {
      typewriterText.textContent = currentText.substring(0, charIndex++);
  }

  let typingSpeed = isDeleting ? speed / 2 : speed;

  if (!isDeleting && charIndex === currentText.length) {
      typingSpeed = delayBetweenWords;
      isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
  }

  setTimeout(typeEffect, typingSpeed);
}

// Start the typewriter effect on page load
document.addEventListener("DOMContentLoaded", typeEffect);