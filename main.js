// --- État global du parcours -------------------------------------------------
// Ces déclarations restent en tête, au top-level, et rien au-dessus d'elles ne
// doit pouvoir lever : une exception plus haut avorterait le corps du script et
// les laisserait en zone morte (TDZ), ce qui fige toute la navigation.
let currentStep = 0;
let selectedPath = "";
let imgUrl = "";
let our_creation = "";
let our_creation_id = null;
let stepHistory = ["step0"];
const galleryGrid = document.querySelector('.gallery-grid');
let images_carousel = galleryGrid ? Array.from(galleryGrid.querySelectorAll('.img_carousel')) : [];
const selectedName = document.getElementById("selected-name");
let selectedJewel = "";
let currentGalleryPage = 1;
let imagesPerPage = 8;
let activeCategory = ""; // filtre de catégorie actif dans la galerie (step 13)

// --- Supabase ----------------------------------------------------------------
// La clé "anon" est publique par conception : c'est la RLS qui protège les
// données. Ne jamais mettre la clé "service_role" ici.
const SUPABASE_URL = "https://byyfxmdjqoxncjziubne.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5eWZ4bWRqcW94bmNqeml1Ym5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTgxMjYsImV4cCI6MjA5OTY3NDEyNn0.I2KGgR1g4U6S6d0UZUMoEJF2oLpt28VDRVEY6y3mEDQ";

let supabaseClient = null;

// Le HTML envoie value="model" ; la colonne `path` attend 'collection'.
const PATH_MAP = { custom: "custom", upload: "upload", model: "collection" };

// Catégorie : slug neutre en base (creations.category), hébreu à l'affichage.
// Le slug est aussi converti en valeur hébraïque pour selectedJewel, afin que
// l'étape "taille" (step 10) et submissions.jewel restent cohérents avec le
// parcours custom (qui utilise déjà l'hébreu).
const CATEGORY_HE = {
  ring: "טבעת",
  bracelet: "צמיד",
  necklace: "שרשרת",
  earrings: "עגילים",
};

// --- Photo d'inspiration (parcours 'upload') ---------------------------------
const INSPIRATION_BUCKET = "inspirations";
const MAX_IMAGE_DIM = 1600; // px sur le plus grand côté
const UPLOAD_IDLE_TEXT = "📎 אין קובץ שנשלח";

// Par ordre de préférence : le WebP pèse ~30 % de moins que le JPEG à qualité
// égale. Mais un navigateur qui ne sait pas encoder le type demandé renvoie du
// PNG sans prévenir — et un PNG de photo est plus lourd que le JPEG d'origine.
// On vérifie donc le type réellement produit et on retombe sur le JPEG.
const IMAGE_FORMATS = [
  { type: "image/webp", ext: "webp", quality: 0.8 },
  { type: "image/jpeg", ext: "jpg", quality: 0.82 },
];

// Init paresseuse. Le SDK arrive par CDN : il peut manquer (réseau coupé,
// bloqueur de pub, CDN injoignable). On ne l'exige donc qu'au moment où on s'en
// sert réellement, et jamais au chargement du script.
function getSupabase() {
  if (supabaseClient) return supabaseClient;
  try {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      console.error(
        "[Supabase] SDK indisponible : assets/js/supabase.js n'a pas été chargé."
      );
      return null;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }, // le formulaire public n'a pas de session
    });
    return supabaseClient;
  } catch (err) {
    console.error("[Supabase] Initialisation impossible :", err);
    return null;
  }
}

// "" → null : Postgres préfère NULL à la chaîne vide.
function nn(value) {
  const v = (value ?? "").toString().trim();
  return v === "" ? null : v;
}

function computeImagesPerPage() {
  const w = window.innerWidth;
  if (w >= 1200) return 16;
  if (w >= 900) return 12;
  if (w >= 600) return 9;
  return 12;
}

function showGalleryPage(page) {
  imagesPerPage = computeImagesPerPage();
  const total = images_carousel.length;
  const totalPages = Math.max(1, Math.ceil(total / imagesPerPage));
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentGalleryPage = page;
  const start = (page - 1) * imagesPerPage;
  const end = start + imagesPerPage;
  images_carousel.forEach((img, i) => {
    img.style.display = (i >= start && i < end) ? 'block' : 'none';
  });
  const indicator = document.getElementById('pageIndicator');
  if (indicator) indicator.textContent = `${page} / ${totalPages}`;
}

function initGalleryPagination() {
  images_carousel = galleryGrid ? Array.from(galleryGrid.querySelectorAll('.img_carousel')) : [];
  images_carousel.forEach(img => img.style.display = 'none');
  showGalleryPage(1);

  
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  images_carousel.forEach(img => {
    if (!isTouch) {
      img.addEventListener('dblclick', function () {
        openImageModal(this.src);
      });
    }
    img.addEventListener('click', () => {
      const wasSelected = img.classList.contains('selected');
      images_carousel.forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');
      our_creation = img.dataset.name;
      our_creation_id = img.dataset.id ? Number(img.dataset.id) : null;
      // La catégorie (slug) de l'image pilote l'étape "taille" (step 10).
      if (img.dataset.category) {
        selectedJewel = CATEGORY_HE[img.dataset.category] || img.dataset.category;
      }
      selectedName.innerHTML = `<div style="text-align:center"><span style="color:#666;display:block;margin-bottom:6px">יצירה נבחרת</span><span style="font-weight:700;font-size:1.05rem;color:#111;display:block">${our_creation}</span></div>`;
      const confirm = document.getElementById('confirmImageBtn');
      if (confirm) confirm.style.display = 'inline-block';
     
      if (isTouch && wasSelected) {
        openImageModal(img.src);
      }
    });
  });

  const prev = document.getElementById('gridPrev');
  const next = document.getElementById('gridNext');
  if (prev) prev.onclick = () => showGalleryPage(currentGalleryPage - 1);
  if (next) next.onclick = () => showGalleryPage(currentGalleryPage + 1);

  window.addEventListener('resize', () => showGalleryPage(currentGalleryPage));

  // Réappliquer le filtre courant : loadCreations() peut rappeler cette
  // fonction après avoir injecté des images du catalogue.
  setupGalleryFilter();
  if (activeCategory) filterGallery(activeCategory);
}

// Filtre la galerie (step 13) par catégorie et repagine le sous-ensemble.
function filterGallery(cat) {
  activeCategory = cat || "";
  const all = galleryGrid ? Array.from(galleryGrid.querySelectorAll('.img_carousel')) : [];
  images_carousel = activeCategory
    ? all.filter(img => (img.dataset.category || "") === activeCategory)
    : all;
  all.forEach(img => { img.style.display = 'none'; });
  showGalleryPage(1);

  document.querySelectorAll('#galleryFilter .category-chip').forEach(btn => {
    btn.setAttribute('aria-pressed', String((btn.dataset.cat || "") === activeCategory));
  });
}

// Branche les boutons de filtre une seule fois (idempotent via data-wired).
function setupGalleryFilter() {
  const bar = document.getElementById('galleryFilter');
  if (!bar || bar.dataset.wired) return;
  bar.dataset.wired = "1";
  bar.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => filterGallery(btn.dataset.cat || ""));
  });
}


// --- Step 10: handle 'other' for ring-size, bracelet-size, collier-size ---
function setupSizeOther(selectId, inputId, stepNum) {
  const select = document.getElementById(selectId);
  const input = document.getElementById(inputId);
  if (!select || !input) return;
  select.addEventListener('change', function() {
    if (select.value === 'other') {
      input.style.display = 'inline-block';
      input.focus();
    } else {
      input.style.display = 'none';
      input.value = '';
    }
  });
  function tryAdvance() {
    if (select.value === 'other' && input.value.trim()) {
      
      select.value = input.value.trim();
      goToStep(stepNum + 1);
    }
  }
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryAdvance();
    }
  });
  input.addEventListener('blur', function() {
    tryAdvance();
  });
}
setupSizeOther('ring-size', 'ring-size-other', 10);
setupSizeOther('bracelet-size', 'bracelet-size-other', 10);
setupSizeOther('collier-size', 'collier-size-other', 10);

// --- Handle 'other' options for precious_stone, shape, carat ---
document.addEventListener('DOMContentLoaded', function() {
  // Step 4: precious_stone
  const preciousOtherRadio = document.getElementById('precious_stone_other_radio');
  const preciousOtherInput = document.getElementById('precious_stone_other_input');
  if (preciousOtherRadio && preciousOtherInput) {
    preciousOtherRadio.addEventListener('change', function() {
      if (preciousOtherRadio.checked) {
        preciousOtherInput.style.display = 'inline-block';
        preciousOtherInput.focus();
      }
    });
    // Hide input if another radio is selected
    document.querySelectorAll('input[name="precious_stone"]').forEach(radio => {
      if (radio !== preciousOtherRadio) {
        radio.addEventListener('change', function() {
          preciousOtherInput.style.display = 'none';
          preciousOtherInput.value = '';
        });
      }
    });
  }

  // Step 6: shape
  const shapeOtherRadio = document.getElementById('shape_other_radio');
  const shapeOtherInput = document.getElementById('shape_other_input');
  if (shapeOtherRadio && shapeOtherInput) {
    shapeOtherRadio.addEventListener('change', function() {
      if (shapeOtherRadio.checked) {
        shapeOtherInput.style.display = 'inline-block';
        shapeOtherInput.focus();
      }
    });
    document.querySelectorAll('input[name="shape"]').forEach(radio => {
      if (radio !== shapeOtherRadio) {
        radio.addEventListener('change', function() {
          shapeOtherInput.style.display = 'none';
          shapeOtherInput.value = '';
        });
      }
    });
  }

  // Step 7: carat
  const caratOtherRadio = document.getElementById('carat_other_radio');
  const caratOtherInput = document.getElementById('carat_other_input');
  if (caratOtherRadio && caratOtherInput) {
    caratOtherRadio.addEventListener('change', function() {
      if (caratOtherRadio.checked) {
        caratOtherInput.style.display = 'inline-block';
        caratOtherInput.focus();
      }
    });
    document.querySelectorAll('input[name="carat"]').forEach(radio => {
      if (radio !== caratOtherRadio) {
        radio.addEventListener('change', function() {
          caratOtherInput.style.display = 'none';
          caratOtherInput.value = '';
        });
      }
    });
  }

  // Step 20/22/23 (around) - handle 'other' visibility for around step radios
  const preciousOtherRadioAround = document.getElementById('precious_stone_other_radio_around');
  const preciousOtherInputAround = document.getElementById('precious_stone_other_input_around');
  if (preciousOtherRadioAround && preciousOtherInputAround) {
    preciousOtherRadioAround.addEventListener('change', function() {
      if (preciousOtherRadioAround.checked) {
        preciousOtherInputAround.style.display = 'inline-block';
        preciousOtherInputAround.focus();
      }
    });
    document.querySelectorAll('input[name="precious_stone_around"]').forEach(radio => {
      if (radio !== preciousOtherRadioAround) {
        radio.addEventListener('change', function() {
          preciousOtherInputAround.style.display = 'none';
          preciousOtherInputAround.value = '';
        });
      }
    });
  }

  const shapeOtherRadioAround = document.getElementById('shape_other_radio_around');
  const shapeOtherInputAround = document.getElementById('shape_other_input_around');
  if (shapeOtherRadioAround && shapeOtherInputAround) {
    shapeOtherRadioAround.addEventListener('change', function() {
      if (shapeOtherRadioAround.checked) {
        shapeOtherInputAround.style.display = 'inline-block';
        shapeOtherInputAround.focus();
      }
    });
    document.querySelectorAll('input[name="shape_around"]').forEach(radio => {
      if (radio !== shapeOtherRadioAround) {
        radio.addEventListener('change', function() {
          shapeOtherInputAround.style.display = 'none';
          shapeOtherInputAround.value = '';
        });
      }
    });
  }

  const caratOtherRadioAround = document.getElementById('carat_other_radio_around');
  const caratOtherInputAround = document.getElementById('carat_other_input_around');
  if (caratOtherRadioAround && caratOtherInputAround) {
    caratOtherRadioAround.addEventListener('change', function() {
      if (caratOtherRadioAround.checked) {
        caratOtherInputAround.style.display = 'inline-block';
        caratOtherInputAround.focus();
      }
    });
    document.querySelectorAll('input[name="carat_around"]').forEach(radio => {
      if (radio !== caratOtherRadioAround) {
        radio.addEventListener('change', function() {
          caratOtherInputAround.style.display = 'none';
          caratOtherInputAround.value = '';
        });
      }
    });
  }
});

// --- Flip card info for precious stones (step 4, hover version) ---
document.addEventListener('DOMContentLoaded', function() {
  const stoneInfo = {
    'רובי': 'רובי היא אבן חן אדומה עזה, מסמלת תשוקה, אהבה ואומץ. אחת האבנים היקרות בעולם.',
    'ספיר': 'ספיר היא אבן כחולה עוצמתית, מסמלת חכמה, נאמנות והגנה. נפוצה בתכשיטי יוקרה.',
    'אמרלד': 'אמרלד (ברקת) היא אבן ירוקה נדירה, מסמלת התחדשות, שפע ואהבה. מוערכת מאוד לאורך ההיסטוריה.',
    'בלו-טופז': 'בלו טופז היא אבן כחולה-בהירה, מסמלת רוגע, תקווה ויצירתיות.',
    'טורמלין': 'טורמלין מגיעה במגוון צבעים, מסמלת השראה, איזון והגנה אנרגטית.',
    'ציטרין': 'ציטרין היא אבן צהובה-כתומה, מסמלת שמחה, שפע ואנרגיה חיובית.',
    'פנינים': 'פנינים הן תוצר טבעי של צדפות, מסמלות טוהר, חן ואלגנטיות נצחית.',
    'אחר': 'אבן חן ייחודית לבחירתכם. נשמח לספק מידע נוסף בהתאמה אישית.'
  };
  // Set info text for each flip card (apply to all steps that use .stone-flip)
  document.querySelectorAll('.stone-flip').forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if (!radio) return;
    const stone = radio.value;
    const infoText = label.querySelector('.stone-info-text');
    if (infoText && stoneInfo[stone]) {
      infoText.textContent = stoneInfo[stone];
    }
  });
});

function showStep(stepId) {
  document.querySelectorAll(".step").forEach(step => step.classList.remove("active"));
  document.getElementById(stepId).classList.add("active");
}

// Small helper to show a temporary notice to the user
function showTemporaryNotice(text, duration = 4000) {
  let container = document.querySelector('.container') || document.querySelector('.main-content');
  if (!container) return;
  let notice = document.getElementById('flowNotice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'flowNotice';
    notice.style.cssText = 'background:#fff8c6;border-left:4px solid #f0c040;padding:10px 14px;margin-bottom:12px;border-radius:4px;direction:rtl;font-size:0.95em;';
    container.insertBefore(notice, container.firstChild);
  }
  notice.textContent = text;
  notice.style.opacity = '1';
  notice.style.display = 'block';
  setTimeout(() => {
    notice.style.transition = 'opacity 0.4s ease';
    notice.style.opacity = '0';
    setTimeout(() => {
      if (notice && notice.parentNode) notice.parentNode.removeChild(notice);
    }, 450);
  }, duration);
}

function hideHeroSection() {
    const hero = document.querySelector('.hero');
    if (hero) {
        // Ajoute un effet de fondu-enchaîné (fade-out) pour une transition plus douce
        hero.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        hero.style.opacity = '0';
        hero.style.transform = 'translateY(-20px)'; // Léger mouvement vers le haut

        // Une fois la transition terminée, on masque l'élément
        setTimeout(() => {
            hero.style.display = 'none';
        }, 500); // 500ms correspond à la durée de la transition
    }
}

function hideHTitle() {
    const container = document.querySelector('.container h1');
    if (container) {
        // Ajoute un effet de fondu-enchaîné (fade-out) pour une transition plus douce
        container.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        container.style.opacity = '0';
        container.style.transform = 'translateY(-20px)'; // Léger mouvement vers le haut

        // Une fois la transition terminée, on masque l'élément
        setTimeout(() => {
            container.style.display = 'none';
        }, 500); // 500ms correspond à la durée de la transition
    }
}

function updateStep10Options() {
  const ringContainer = document.getElementById('ring-container');
  const braceletContainer = document.getElementById('bracelet-container');
  const collierContainer = document.getElementById('collier-container');
  const bouclesContainer = document.getElementById('boucles-container');
  
  // Masque toutes les options par défaut
  if (ringContainer) ringContainer.style.display = 'none';
  if (braceletContainer) braceletContainer.style.display = 'none';
  if (collierContainer) collierContainer.style.display = 'none';
  if (bouclesContainer) bouclesContainer.style.display = 'none';

  // Affiche l'option pertinente
  if (selectedJewel === "טבעת" && ringContainer) {
    ringContainer.style.display = 'block';
  } else if (selectedJewel === "צמיד" && braceletContainer) {
    braceletContainer.style.display = 'block';
  } else if (selectedJewel === "שרשרת" && collierContainer) {
    collierContainer.style.display = 'block';
  } else if (selectedJewel === "עגילים" && bouclesContainer) {
    bouclesContainer.style.display = 'block';
  }
}

function goToStep(stepNumber) {
  currentStep = stepNumber;
  if (stepHistory[stepHistory.length - 1] !== "step" + stepNumber) {
    stepHistory.push("step" + stepNumber);
  }
  if (stepNumber === 10) {
    updateStep10Options();
  }
  showStep("step" + stepNumber);
  focusContainer();
  updateNavigationButtons();
}

// know when to show/hide the next/previous buttons
function updateNavigationButtons() {
  const previousBtn = document.getElementById("previousBtn");
  const nextBtn = document.getElementById("nextBtn");
  const finalForm = document.getElementById("finalForm");
  const homeBtn = document.getElementById("homeBtn");

  previousBtn.style.display = currentStep > 0 ? "inline-block" : "none";
  homeBtn.style.display = currentStep > 0 ? "inline-block" : "none";
  nextBtn.style.display = (currentStep < 11) ? "inline-block" : "none";
  finalForm.style.display = currentStep === 11 ? "block" : "none";
}


// Avancer à l'étape suivante
function nextStep() {
  hideHeroSection();
  hideHTitle();
  if (currentStep === 0) {
    const choice = document.querySelector('input[name="personalised"]:checked')?.value;
    resetStepInputs();
    selectedPath = PATH_MAP[choice] || "";
    if (choice === "custom") {
      goToStep(1);
    } else if (choice === "upload") {
      goToStep(12);
    } else if (choice === "model") {
      goToStep(13);
    }
    return;
  }

  if (currentStep === 2) {
    const gem = document.querySelector('input[name="gem"]:checked')?.value;
    if (gem === "יהלום"){
      goToStep(5);
    } else if (gem === "אבן-חן") {
      goToStep(4);
    } else if (gem === "משולב") {
      // Show combined step after step 3
      goToStep(3);
    }
    return;
  }

  if (currentStep === 3) {
    const layout = document.querySelector('input[name="layout"]:checked')?.value;
    if (layout) {
      goToStep(14);
    }
    return;
  }

  if (currentStep === 23) {
    // If user chose Halo (yes) in step 18, proceed to central flow (step 2).
    const aroundChoice = document.querySelector('input[name="choice-around"]:checked')?.value;
    if (aroundChoice === 'yes') {
      goToStep(2);
      showTemporaryNotice('בחרתם קודם את האבנים מסביב — עכשיו חזרנו לבחור את האבן המרכזית', 5000);
    } else {
      goToStep(8);
    }
    return;
  }

  // Special flow: after choosing jewel (step 1) go to steps 18-23 flow
  if (currentStep === 1) {
    const jewelChoice = document.querySelector('input[name="jewel"]:checked')?.value;
    if (jewelChoice) selectedJewel = jewelChoice;
    goToStep(18);
    return;
  }

  // If we're on the initial choice of combined layout (step 18) branch according to the user's choice
  if (currentStep === 18) {
    const choice = document.querySelector('input[name="choice-around"]:checked')?.value;
    if (choice === 'yes') {
      goToStep(19);
    } else if (choice === 'no') {
      goToStep(2);
    } else {
      // no selection yet → do nothing (wait for user)
    }
    return;
  }

  // On step 19 decide whether to ask for specific precious stone (step 20) or skip to origin (step 21)
  if (currentStep === 19) {
    const gemAround = document.querySelector('input[name="gem_around"]:checked')?.value;
    if (gemAround === "אבן-חן") {
      goToStep(20);
    } else if (gemAround === "יהלום") {
      goToStep(21);
    } else {
      // default: wait for selection
    }
    return;
  }

  // Avancer dans the normal linear flow for remaining steps
  if ((currentStep >= 1 && currentStep <= 10) || (currentStep >= 14 && currentStep <= 23)) {
    goToStep(currentStep + 1);
    // document.getElementById("user-summary").style.display = "block";
    // updateUserSummary();
  }

}

function previousStep() {
  if (stepHistory.length > 1) {
    stepHistory.pop(); 
    const previousStepId = stepHistory[stepHistory.length - 1];
    currentStep = parseInt(previousStepId.replace("step", ""));
    focusContainer();
    showStep(previousStepId);
  } 
  updateNavigationButtons();
}


function focusContainer(){
  const container = document.querySelector('.main-content')
  if (container){
    container.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    })
  }
}

// Auto-advance logic, but NOT for 'other' in steps 4, 6, 7
document.querySelectorAll('.step[id^="step"] input[type="radio"]').forEach(input => {
  input.addEventListener('change', function() {
    const stepDiv = input.closest('.step');
    if (!stepDiv) return;
    const stepId = stepDiv.id;
    const stepNum = parseInt(stepId.replace('step', ''));

    // Step 4: precious_stone
    if (stepNum === 4 && input.id === 'precious_stone_other_radio') {
      // Do not auto-advance, wait for input
      return;
    }
    // Step 6: shape
    if (stepNum === 6 && input.id === 'shape_other_radio') {
      return;
    }
    // Step 7: carat
    if (stepNum === 7 && input.id === 'carat_other_radio') {
      return;
    }

    if (stepNum === 20 && input.id === 'precious_stone_other_radio_around') {
      // Do not auto-advance, wait for input
      return;
    }

    if (stepNum === 22 && input.id === 'shape_other_radio_around') {
      return;
    }

    if (stepNum === 23 && input.id === 'carat_other_radio_around') {
      return;
    }

    if (stepNum >= 0 && stepNum <= 10 || stepNum >= 14 && stepNum <= 23) {
      nextStep();
    }
  });
});

// When user enters value for 'other', advance on Enter or blur if not empty
function setupOtherInputAdvance(radioId, inputId, stepNum) {
  const radio = document.getElementById(radioId);
  const input = document.getElementById(inputId);
  if (!radio || !input) return;
  function tryAdvance() {
    if (radio.checked && input.value.trim()) {
      nextStep();
    }
  }
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryAdvance();
    }
  });
  input.addEventListener('blur', function() {
    tryAdvance();
  });
}

setupOtherInputAdvance('precious_stone_other_radio', 'precious_stone_other_input', 4);
setupOtherInputAdvance('shape_other_radio', 'shape_other_input', 6);
setupOtherInputAdvance('carat_other_radio', 'carat_other_input', 7);
setupOtherInputAdvance('precious_stone_other_radio_around', 'precious_stone_other_input_around', 20);
setupOtherInputAdvance('shape_other_radio_around', 'shape_other_input_around', 22);
setupOtherInputAdvance('carat_other_radio_around', 'carat_other_input_around', 23);

function resetStepInputs() {
  const radios = document.querySelectorAll(
    '#step1 input[type="radio"], #step2 input[type="radio"], #step3 input[type="radio"], #step4 input[type="radio"], #step5 input[type="radio"], #step6 input[type="radio"], #step7 input[type="radio"], #step8 input[type="radio"], #step9 input[type="radio"], #step10 input[type="radio"], #step18 input[type="radio"], #step19 input[type="radio"], #step20 input[type="radio"], #step21 input[type="radio"], #step22 input[type="radio"], #step23 input[type="radio"]'
  );

  radios.forEach(input => {
    input.checked = false;
  });

  // --- NOUVEAUTÉ : Réinitialisation des variables d'image et des éléments d'UI associés ---
  imgUrl = "";
  our_creation = "";
  our_creation_id = null;
  selectedJewel = ""; // la catégorie est re-choisie à chaque parcours

  // Réinitialiser l'état de l'upload d'inspiration
  const inspirationInput = document.getElementById('inspirationInput');
  if (inspirationInput) inspirationInput.value = "";
  clearImagePreview();
  setUploadStatus(UPLOAD_IDLE_TEXT);
  document.getElementById('confirmBtn').style.display = "none";
  // Réinitialiser le choix de catégorie de l'upload (step 12)
  document.querySelectorAll('input[name="upload_category"]').forEach(r => { r.checked = false; });
  const uploadCatWrap = document.getElementById('uploadCategoryWrap');
  if (uploadCatWrap) uploadCatWrap.hidden = true;

  // Réinitialiser l'état du carousel + le filtre de catégorie (step 13)
  const selectedImages = document.querySelectorAll('.img_carousel.selected');
  selectedImages.forEach(img => img.classList.remove("selected"));
  document.getElementById('selected-name').innerHTML = '<div style="text-align:center"><span style="color:#666;display:block;margin-bottom:6px">לא נבחרו יצירות</span><span style="font-weight:700;font-size:1.05rem;color:#111;display:block">&nbsp;</span></div>';
  document.getElementById('confirmImageBtn').style.display = "none";
  if (typeof filterGallery === "function") filterGallery("");
}

// --- Parcours 'upload' : photo d'inspiration ---------------------------------

function setUploadStatus(text) {
  const el = document.getElementById("uploadStatus");
  if (el) el.textContent = text;
}

function showImagePreview(blob) {
  const wrap = document.getElementById("imagePreviewWrap");
  const img = document.getElementById("imagePreview");
  if (!wrap || !img) return;
  if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
  img.src = URL.createObjectURL(blob);
  wrap.hidden = false;
}

function clearImagePreview() {
  const wrap = document.getElementById("imagePreviewWrap");
  const img = document.getElementById("imagePreview");
  if (img && img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
  if (img) img.removeAttribute("src");
  if (wrap) wrap.hidden = true;
}

function randomId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Redimensionne et recompresse dans le navigateur avant l'envoi : une photo
// d'iPhone de 4 Mo part à ~200 Ko. C'est ce qui remplace les transformations
// CDN payantes — et c'est plus rapide, puisqu'on n'envoie jamais les 4 Mo.
async function downscaleImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("le fichier n'est pas une image");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("format d'image non reconnu"));
      el.src = objectUrl;
    });

    const largest = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = Math.min(1, MAX_IMAGE_DIM / largest);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    // Les navigateurs récents appliquent l'orientation EXIF au <img> avant le
    // dessin : une photo prise en portrait sur iPhone ne se retrouve pas couchée.
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);

    return await encodeCanvas(canvas);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// WebP si le navigateur sait l'encoder, JPEG sinon. Le contrôle sur blob.type
// est ce qui évite le repli silencieux en PNG.
async function encodeCanvas(canvas) {
  for (const fmt of IMAGE_FORMATS) {
    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, fmt.type, fmt.quality)
    );
    if (blob && blob.type === fmt.type) return { blob, ext: fmt.ext };
  }
  throw new Error("compression impossible");
}

// Pousse le blob dans Supabase Storage et renvoie l'URL publique.
async function uploadInspiration(blob, ext) {
  const sb = getSupabase();
  if (!sb) throw new Error("SDK Supabase indisponible");

  const path = `${randomId()}.${ext}`;
  const { error } = await sb.storage.from(INSPIRATION_BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000", // les fichiers sont immuables : nom unique par upload
    upsert: false,
  });
  if (error) throw error;

  const { data } = sb.storage.from(INSPIRATION_BUCKET).getPublicUrl(path);
  if (!data || !data.publicUrl) throw new Error("URL publique introuvable");
  return data.publicUrl;
}

const inspirationInput = document.getElementById("inspirationInput");
const pickImageBtn = document.getElementById("pickImageBtn");

if (inspirationInput && pickImageBtn) {
  pickImageBtn.addEventListener("click", () => inspirationInput.click());

  inspirationInput.addEventListener("change", async () => {
    const file = inspirationInput.files && inspirationInput.files[0];
    if (!file) return;

    const confirmBtn = document.getElementById("confirmBtn");
    // On repart de zéro à chaque choix : sinon une 2e image qui échoue
    // laisserait l'URL de la 1re en place et le client enverrait la mauvaise.
    imgUrl = "";
    if (confirmBtn) confirmBtn.style.display = "none";

    try {
      setUploadStatus("⏳ מכינים את התמונה…");
      const { blob, ext } = await downscaleImage(file);
      showImagePreview(blob);
      console.log(
        `[Upload] ${(file.size / 1024).toFixed(0)} Ko → ${(blob.size / 1024).toFixed(0)} Ko (${ext})`
      );

      setUploadStatus("⏳ מעלים את התמונה…");
      imgUrl = await uploadInspiration(blob, ext);

      setUploadStatus("✅ התמונה נשלחה!");
      // On révèle le choix de catégorie : il faut la photo ET la catégorie
      // avant de pouvoir confirmer.
      const catWrap = document.getElementById("uploadCategoryWrap");
      if (catWrap) catWrap.hidden = false;
      if (confirmBtn) confirmBtn.style.display = "inline-block";
    } catch (err) {
      console.error("[Upload] échec :", err);
      imgUrl = "";
      clearImagePreview();
      const catWrap = document.getElementById("uploadCategoryWrap");
      if (catWrap) catWrap.hidden = true;
      setUploadStatus("❌ העלאת התמונה נכשלה. אנא נסו שוב.");
    }
  });
}

// image event listeners are attached inside initGalleryPagination()

// initialize the new gallery pagination if present
if (typeof initGalleryPagination === 'function') initGalleryPagination();

// Collection : la catégorie (selectedJewel) est déjà posée au clic sur l'image.
// On enchaîne sur couleur → type d'or → taille (step 8→9→10) puis contact.
document.getElementById('confirmImageBtn').addEventListener('click', function () {
  goToStep(8);
});

// Upload : on exige une catégorie avant d'avancer, puis même enchaînement.
document.getElementById('confirmBtn').addEventListener('click', function () {
  const cat = document.querySelector('input[name="upload_category"]:checked')?.value;
  if (!cat) {
    showTemporaryNotice("אנא בחרו סוג תכשיט (טבעת, צמיד, שרשרת או עגילים).", 5000);
    return;
  }
  selectedJewel = CATEGORY_HE[cat] || cat; // slug → hébreu pour l'étape taille
  goToStep(8);
});

updateNavigationButtons();

function openImageModal(imgSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");

  modal.style.display = "block";
  modalImg.src = imgSrc;
}

function closeImageModal(event) {
  if (event.target.id === "imageModal") {
    document.getElementById("imageModal").style.display = "none";
  }
}

function closeModal() {
  const m = document.getElementById('imageModal');
  if (m) m.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', (event) => {
  const audio = document.getElementById('background-audio');
  audio.oncanplay = function() {
      audio.volume = 0.005;
      audio.muted = false;
  };
  if (audio.readyState >= 3) { 
      audio.volume = 0.005;
      audio.muted = false;
  }
});


// Résout un choix "אחר" en la valeur libre saisie par le client.
function resolveOther(radioName, otherInputId, otherValues = ["אחר"]) {
  const picked = document.querySelector(`input[name="${radioName}"]:checked`)?.value || "";
  if (!otherValues.includes(picked)) return picked;
  return document.getElementById(otherInputId)?.value.trim() || picked;
}

// Résout une taille dont l'option "other" ouvre un champ libre.
function resolveSize(selectId, otherInputId) {
  const picked = document.getElementById(selectId)?.value || "";
  if (picked !== "other") return picked;
  return document.getElementById(otherInputId)?.value.trim() || "other";
}

// Couleur, type d'or et tailles : étapes 8-9-10, communes aux 3 parcours.
// (La bonne taille est remplie selon selectedJewel ; les autres restent null.)
function buildColorMetalSize() {
  return {
    jewel_color: nn(document.querySelector('input[name="jewel-color"]:checked')?.value),
    metal_carat: nn(document.querySelector('input[name="metal-carat"]:checked')?.value),
    ring_size: nn(resolveSize("ring-size", "ring-size-other")),
    bracelet_size: nn(resolveSize("bracelet-size", "bracelet-size-other")),
    collier_size: nn(resolveSize("collier-size", "collier-size-other")),
    boucles_type: nn(document.getElementById("boucles-type")?.value),
  };
}

// Construit les colonnes propres au parcours 'custom'.
function buildCustomPayload() {
  const stoneType = resolveOther("precious_stone", "precious_stone_other_input");
  const shape = resolveOther("shape", "shape_other_input");
  const carat = resolveOther("carat", "carat_other_input", ["אחר", "autre"]);

  const stoneTypeAround = resolveOther("precious_stone_around", "precious_stone_other_input_around");
  const shapeAround = resolveOther("shape_around", "shape_other_input_around");
  const caratAround = resolveOther("carat_around", "carat_other_input_around", ["אחר", "autre"]);

  const gem = document.querySelector('input[name="gem"]:checked')?.value || "";
  const origin = document.querySelector('input[name="origin"]:checked')?.value || "";
  const gemAround = document.querySelector('input[name="gem_around"]:checked')?.value || "";
  const originAround = document.querySelector('input[name="origin_around"]:checked')?.value || "";

  // Le client qui choisit le halo renseigne les pierres "autour" avant la
  // pierre centrale : si le central est vide, on retombe sur l'autour.
  const halo = document.querySelector('input[name="choice-around"]:checked')?.value;

  return {
    jewel: nn(document.querySelector('input[name="jewel"]:checked')?.value),
    layout: nn(document.querySelector('input[name="layout"]:checked')?.value),

    gem: nn(gem || gemAround),
    stone_type: nn(stoneType || stoneTypeAround),
    origin: nn(origin || originAround),
    shape: nn(shape || shapeAround),
    stone_carat: nn(carat || caratAround),

    has_halo: halo ? halo === "yes" : null,
    gem_around: nn(gemAround),
    stone_type_around: nn(stoneTypeAround),
    origin_around: nn(originAround),
    shape_around: nn(shapeAround),
    stone_carat_around: nn(caratAround),

    ...buildColorMetalSize(),
  };
}

async function submitForm(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const loadingMessage = document.getElementById('loadingMessage');
  const finalForm = document.getElementById('finalForm');
  const successMessage = document.getElementById('message');

  // Le parcours est mémorisé au step 0 ; on relit le DOM en secours.
  const rawPath =
    selectedPath ||
    PATH_MAP[document.querySelector('input[name="personalised"]:checked')?.value] ||
    "";

  if (!rawPath) {
    showTemporaryNotice("אירעה שגיאה: לא נבחר מסלול. אנא רעננו את הדף.", 6000);
    return;
  }

  const payload = {
    path: rawPath,
    client_name: nn(document.querySelector('input[name="name"]')?.value),
    client_email: nn(document.querySelector('input[name="email"]')?.value),
    client_phone: nn(document.querySelector('input[name="phone"]')?.value),
    comment: nn(document.querySelector('textarea[name="comment"]')?.value),
  };

  if (rawPath === "custom") {
    Object.assign(payload, buildCustomPayload());
  } else if (rawPath === "upload") {
    payload.inspiration_img_url = nn(imgUrl);
    payload.jewel = nn(selectedJewel); // catégorie choisie au step 12
    Object.assign(payload, buildColorMetalSize());
  } else if (rawPath === "collection") {
    payload.creation_name = nn(our_creation);
    payload.creation_id = our_creation_id;
    payload.jewel = nn(selectedJewel); // catégorie de l'image choisie
    Object.assign(payload, buildColorMetalSize());
  }

  // On double la contrainte CHECK côté client pour afficher un message lisible
  // plutôt que de laisser remonter une erreur Postgres brute.
  if (rawPath === "upload" && !payload.inspiration_img_url) {
    showTemporaryNotice("לא נמצאה תמונה. אנא העלו תמונה ונסו שוב.", 6000);
    return;
  }
  if (rawPath === "collection" && !payload.creation_name) {
    showTemporaryNotice("לא נבחרה יצירה. אנא בחרו דגם ונסו שוב.", 6000);
    return;
  }

  // On ne réclame le client qu'ici : si le SDK manque, le client garde son
  // formulaire rempli et peut réessayer, au lieu de perdre sa saisie.
  const sb = getSupabase();
  if (!sb) {
    showTemporaryNotice("החיבור לשרת נכשל. אנא בדקו את החיבור לאינטרנט ונסו שוב.", 6000);
    return;
  }

  if (loadingMessage) loadingMessage.classList.remove('hidden');
  if (submitBtn) submitBtn.style.display = 'none';

  let error = null;
  try {
    ({ error } = await sb.from('submissions').insert(payload));
  } catch (err) {
    error = err; // panne réseau : le SDK rejette au lieu de renvoyer { error }
  }

  if (error) {
    console.error('Supabase insert error:', error);
    finalForm.style.display = 'flex';
    if (submitBtn) submitBtn.style.display = 'block';
    if (loadingMessage) loadingMessage.classList.add('hidden');
    showTemporaryNotice("השליחה נכשלה. אנא נסו שוב.", 6000);
    return;
  }

  finalForm.classList.remove('active');
  successMessage.classList.remove('hidden');
  if (loadingMessage) loadingMessage.classList.add('hidden');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Enrichit la galerie avec le catalogue Supabase. Purement additif : en cas de
// panne (SDK absent, réseau, RLS), on sort sans rien casser et l'étape 13
// continue d'afficher les images codées en dur dans index.html.
async function loadCreations() {
  const container = document.querySelector(".gallery-grid");
  if (!container) return;

  const sb = getSupabase();
  if (!sb) return;

  let creations = null;
  try {
    // `active` est déjà filtré par la RLS, mais on le garde explicite ici :
    // la policy peut évoluer, la requête reste juste.
    const { data, error } = await sb
      .from("creations")
      .select("id, name, img_url, category")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    creations = data;
  } catch (err) {
    console.error("[Supabase] Catalogue indisponible :", err);
    return;
  }

  if (!Array.isArray(creations) || creations.length === 0) return;

  // noms déjà présents dans le HTML
  const existingNames = new Set(
    Array.from(container.querySelectorAll(".img_carousel"))
      .map(img => img.dataset.name)
  );

  let added = 0;
  creations.forEach(c => {
    if (!c.img_url || !c.name) return;
    if (existingNames.has(c.name)) return;

    const img = document.createElement("img");
    img.src = c.img_url;
    img.alt = c.name;
    img.dataset.name = c.name;
    img.dataset.id = c.id;
    if (c.category) img.dataset.category = c.category;
    img.className = "img_carousel";

    container.appendChild(img);
    added++;
  });

  // IMPORTANT : rebrancher tes listeners existants — mais seulement si on a
  // ajouté quelque chose, sinon on redouble les listeners déjà en place.
  if (added > 0) initGalleryPagination();
}

loadCreations();
