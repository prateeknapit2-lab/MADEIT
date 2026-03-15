import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

const state = { mode: 'web' };

const output = document.getElementById('storyOutput');
const imageResult = document.getElementById('imageResult');
const imageNote = document.getElementById('imageNote');
const plansList = document.getElementById('plansList');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.45), 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg3d'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.45);
const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshStandardMaterial({ color: 0x7b9cff, wireframe: true });
const knot = new THREE.Mesh(geometry, material);
scene.add(knot);

const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(30, 20, 20);
scene.add(light);
camera.position.z = 30;

function animate() {
  requestAnimationFrame(animate);
  knot.rotation.x += 0.002;
  knot.rotation.y += 0.005;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight * 0.45);
  camera.aspect = window.innerWidth / (window.innerHeight * 0.45);
  camera.updateProjectionMatrix();
});

document.getElementById('toggleMode').addEventListener('click', (event) => {
  state.mode = state.mode === 'web' ? 'app' : 'web';
  event.target.textContent = state.mode === 'web' ? 'Switch to App Mode Preview' : 'Switch to Web Mode Preview';
});

document.getElementById('storyForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const story = document.getElementById('storyInput').value;
  const language = document.getElementById('language').value;

  const security = await fetch('/api/security/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: story })
  }).then((res) => res.json());

  if (!security.safe) {
    output.textContent = `Security warning: ${security.findings.join(', ')}`;
    return;
  }

  const result = await fetch('/api/story/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story, language, mode: state.mode })
  }).then((res) => res.json());

  output.textContent = JSON.stringify(result, null, 2);
});

document.getElementById('imageForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = document.getElementById('imagePrompt').value;

  const result = await fetch('/api/generate/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, mode: state.mode })
  }).then((res) => res.json());

  imageResult.src = result.resultUrl;
  imageResult.style.display = 'block';
  imageNote.textContent = result.notice;
});

async function loadPlans() {
  const data = await fetch('/api/plans').then((res) => res.json());
  plansList.innerHTML = `
    <li><strong>Launch:</strong> ${data.free.description}</li>
    ${data.premium.map((plan) => `<li>${plan.name}: $${plan.priceUsd}</li>`).join('')}
    <li><strong>Payments:</strong> ${data.paymentMethods.join(', ')}</li>
  `;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {
    // ignored in local previews
  });
}

loadPlans();


const tutorialCards = document.querySelectorAll('.tutorial-card');
const tutorialVideos = document.querySelectorAll('.tutorial-video');

const tutorialObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const card = entry.target;
    const video = card.querySelector('video');

    if (entry.isIntersecting) {
      card.classList.add('in-view');
      if (video) {
        video.play().catch(() => {
          // autoplay can be blocked silently by browser policies
        });
      }
    } else {
      card.classList.remove('in-view');
      if (video) {
        video.pause();
      }
    }
  });
}, { threshold: 0.45 });

tutorialCards.forEach((card) => tutorialObserver.observe(card));

window.addEventListener('beforeunload', () => {
  tutorialVideos.forEach((video) => video.pause());
});
