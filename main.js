let currentStep = 0;
let imgUrl = "";
let our_creation = "";
let stepHistory = ["step0"];
const track = document.querySelector(".carousel-track");
const images_carousel = track.querySelectorAll(".img_carousel");
const selectedName = document.getElementById("selected-name");
let selectedJewel = ""; 


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
      // Set select value to input value for submission
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
  // Set info text for each flip card
  document.querySelectorAll('#step4 .stone-flip').forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
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
  nextBtn.style.display = currentStep < 11 ? "inline-block" : "none";
  finalForm.style.display = currentStep === 11 ? "block" : "none";
}


// Avancer à l'étape suivante
function nextStep() {
  hideHeroSection();
  hideHTitle();
  if (currentStep === 0) {
    const choice = document.querySelector('input[name="personalised"]:checked')?.value;
    resetStepInputs();
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

  if (currentStep === 14) {
    const gemCentral = document.querySelector('input[name="gem_central"]:checked')?.value;
    if (gemCentral === "אבן-חן") {
      goToStep(15);
    } else if (gemCentral === "יהלום" ) {
      goToStep(16);
    }
    return;
  }

  if (currentStep === 23) {
    goToStep(8);
    return;
  }

  if (currentStep === 1) {
    const jewelChoice = document.querySelector('input[name="jewel"]:checked')?.value;
    if (jewelChoice) {
      selectedJewel = jewelChoice;
    }
  }

  // Avancer dans le flow normal
  if (currentStep >= 1 && currentStep <= 10 || currentStep >= 14 && currentStep <= 23) {
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
  // if (currentStep < 1) {
  //   document.getElementById("user-summary").style.display = "none";
  // }
  updateNavigationButtons();
}

// function homePage() {
//   currentStep = 0;
//   stepHistory = ["step0"];
//   showStep("step0");
//   updateNavigationButtons();
//   resetStepInputs();
//   document.getElementById('uploadStatus').textContent = "";
//   document.getElementById('confirmBtn').style.display = "none";
// }

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

    if (stepNum === 15 && input.id === 'precious_stone_other_radio_central') {
      // Do not auto-advance, wait for input
      return;
    }

    if (stepNum === 17 && input.id === 'shape_other_radio_central') {
      return;
    }

    if (stepNum === 18 && input.id === 'carat_other_radio_central') {
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

setupOtherInputAdvance('precious_stone_other_radio', 'precious_stone_other_input', 4);
setupOtherInputAdvance('shape_other_radio', 'shape_other_input', 6);
setupOtherInputAdvance('carat_other_radio', 'carat_other_input', 7);
setupOtherInputAdvance('precious_stone_other_radio_central', 'precious_stone_other_input_central', 15);
setupOtherInputAdvance('shape_other_radio_central', 'shape_other_input_central', 17);
setupOtherInputAdvance('carat_other_radio_central', 'carat_other_input_central', 18);
setupOtherInputAdvance('precious_stone_other_radio_around', 'precious_stone_other_input_around', 20);
setupOtherInputAdvance('shape_other_radio_around', 'shape_other_input_around', 22);
setupOtherInputAdvance('carat_other_radio_around', 'carat_other_input_around', 23);

function resetStepInputs() {
  const radios = document.querySelectorAll(
    '#step1 input[type="radio"], #step2 input[type="radio"], #step3 input[type="radio"], #step4 input[type="radio"], #step5 input[type="radio"], #step6 input[type="radio"], #step7 input[type="radio"], #step8 input[type="radio"], #step9 input[type="radio"], #step10 input[type="radio"],#step14 input[type="radio"], #step15 input[type="radio"], #step16 input[type="radio"], #step17 input[type="radio"], #step18 input[type="radio"], #step19 input[type="radio"], #step20 input[type="radio"], #step21 input[type="radio"], #step22 input[type="radio"], #step23 input[type="radio"]'
  );

  radios.forEach(input => {
    input.checked = false;
  });

  // --- NOUVEAUTÉ : Réinitialisation des variables d'image et des éléments d'UI associés ---
  imgUrl = "";
  our_creation = "";
  
  // Réinitialiser l'état du champ d'upload Care
  const uploadcareInput = document.getElementById('uploadcareInput');
  if (uploadcareInput && uploadcareInput.widget) {
    uploadcareInput.widget.value(null);
  }
  document.getElementById('uploadStatus').textContent = "📎 Aucun fichier envoyé";
  document.getElementById('confirmBtn').style.display = "none";

  // Réinitialiser l'état du carousel
  const selectedImages = document.querySelectorAll('.img_carousel.selected');
  selectedImages.forEach(img => img.classList.remove("selected"));
  document.getElementById('selected-name').textContent = "Aucune création sélectionnée";
  document.getElementById('confirmImageBtn').style.display = "none";
}

uploadcare.Widget('[role=uploadcare-uploader]').onUploadComplete(function(info) {
  const imagUrl = info.cdnUrl; // <- L'URL finale de l’image uploadée
  console.log("Image URL:", imagUrl);
  imgUrl = imagUrl; 

  document.getElementById('uploadStatus').textContent = "✅ Image envoyée !";
        
  document.getElementById('confirmBtn').style.display = "inline-block";
});

images_carousel.forEach(img => {
  img.addEventListener('dblclick', function () {
    openImageModal(this.src);
    // console.log("Image double-cliquée");
  });
  img.addEventListener("click", () => {
    // Retire la sélection des autres
    images_carousel.forEach(i => i.classList.remove("selected"));
    // Ajoute la classe sélectionnée
    img.classList.add("selected");
    // console.log("Image sélectionnée :", img.dataset.name);
    our_creation = img.dataset.name;

    // const name = img.dataset.name;
    // localStorage.setItem("selectedCreation", name);
    selectedName.textContent = `Création sélectionnée : ${our_creation}`;
    document.getElementById('confirmImageBtn').style.display = "inline-block";
  });
});

document.querySelector(".prev").onclick = () => track.scrollBy({ left: -220, behavior: "smooth" });
document.querySelector(".next").onclick = () => track.scrollBy({ left: 220, behavior: "smooth" });

document.getElementById('confirmImageBtn').addEventListener('click', function () {
  goToStep(11)
});
document.getElementById('confirmBtn').addEventListener('click', function () {
  goToStep(11)
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


function submitForm(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const loadingMessage = document.getElementById('loadingMessage');
  const finalForm = document.getElementById('finalForm');
  const successMessage = document.getElementById('message');

  if (loadingMessage) {
    loadingMessage.classList.remove('hidden');
  }

  if (submitBtn) {
    submitBtn.style.display = 'none';
  }

  const data = new URLSearchParams();

  // --- Collecte des données avec gestion des champs "autre" ---

  // Données de contact
  data.append("name", document.querySelector('input[name="name"]')?.value || "");
  data.append("email", document.querySelector('input[name="email"]')?.value || "");
  data.append("phone", document.querySelector('input[name="phone"]')?.value || "");
  data.append("comment", document.querySelector('textarea[name="comment"]')?.value || "");

  // Type de bijou
  data.append("jewel", document.querySelector('input[name="jewel"]:checked')?.value || "");
  data.append("gem", document.querySelector('input[name="gem"]:checked')?.value || "");
  data.append("layout", document.querySelector('input[name="layout"]:checked')?.value || "");
  data.append("origin", document.querySelector('input[name="origin"]:checked')?.value || "");
  data.append("color", document.querySelector('input[name="jewel-color"]:checked')?.value || "");
  data.append("metal_carat", document.querySelector('input[name="metal-carat"]:checked')?.value || "");

  // Champs "autre" pour la pierre précieuse
  let preciousStoneValue = document.querySelector('input[name="precious_stone"]:checked')?.value || "";
  if (preciousStoneValue === "אחר") {
    const preciousOtherInput = document.getElementById('precious_stone_other_input');
    preciousStoneValue = preciousOtherInput?.value.trim() || "אחר";
  }
  data.append("stone_type", preciousStoneValue);

  // Champs "autre" pour la forme
  let shapeValue = document.querySelector('input[name="shape"]:checked')?.value || "";
  if (shapeValue === "אחר") {
    const shapeOtherInput = document.getElementById('shape_other_input');
    shapeValue = shapeOtherInput?.value.trim() || "אחר";
  }
  data.append("shape", shapeValue);

  // Champs "autre" pour le carat
  let caratValue = document.querySelector('input[name="carat"]:checked')?.value || "";
  if (caratValue === "autre" || caratValue === "אחר") { // J'ai inclus "אחר" au cas où
    const caratOtherInput = document.getElementById('carat_other_input');
    caratValue = caratOtherInput?.value.trim() || "autre";
  }
  data.append("stone_carat", caratValue);

  // Champs pour la pierre central
  data.append("gem_central", document.querySelector('input[name="gem_central"]:checked')?.value || "");
  data.append("origin_central", document.querySelector('input[name="origin_central"]:checked')?.value || "");

  let preciousStoneCentralValue = document.querySelector('input[name="precious_stone_central"]:checked')?.value || "";
  if (preciousStoneCentralValue === "אחר") {
      const preciousOtherInput = document.getElementById('precious_stone_other_input_central');
      preciousStoneCentralValue = preciousOtherInput?.value.trim() || "אחר";
  }
  data.append("stone_type_central", preciousStoneCentralValue);

  let shapeCentralValue = document.querySelector('input[name="shape_central"]:checked')?.value || "";
  if (shapeCentralValue === "אחר") {
      const shapeOtherInput = document.getElementById('shape_other_input_central');
      shapeCentralValue = shapeOtherInput?.value.trim() || "אחר";
  }
  data.append("shape_central", shapeCentralValue);

  let caratCentralValue = document.querySelector('input[name="carat_central"]:checked')?.value || "";
  if (caratCentralValue === "autre" || caratCentralValue === "אחר") { // J'ai inclus "אחר" au cas où
      const caratOtherInput = document.getElementById('carat_other_input_central');
      caratCentralValue = caratOtherInput?.value.trim() || "autre";
  }
  data.append("stone_carat_central", caratCentralValue);

  // Champs pour la pierre autour
  data.append("gem_around", document.querySelector('input[name="gem_around"]:checked')?.value || "");
  data.append("origin_around", document.querySelector('input[name="origin_around"]:checked')?.value || "");

  let preciousStoneAroundValue = document.querySelector('input[name="precious_stone_around"]:checked')?.value || "";
  if (preciousStoneAroundValue === "אחר") {
      const preciousOtherInput = document.getElementById('precious_stone_other_input_around');
      preciousStoneAroundValue = preciousOtherInput?.value.trim() || "אחר";
  }
  data.append("stone_type_around", preciousStoneAroundValue);

  let shapeAroundValue = document.querySelector('input[name="shape_around"]:checked')?.value || "";
  if (shapeAroundValue === "אחר") {
      const shapeOtherInput = document.getElementById('shape_other_input_around');
      shapeAroundValue = shapeOtherInput?.value.trim() || "אחר";
  }
  data.append("shape_around", shapeAroundValue);

  let caratAroundValue = document.querySelector('input[name="carat_around"]:checked')?.value || "";
  if (caratAroundValue === "autre" || caratAroundValue === "אחר") { // J'ai inclus "אחר" au cas où
      const caratOtherInput = document.getElementById('carat_other_input_around');
      caratAroundValue = caratOtherInput?.value.trim() || "autre";
  }
  data.append("stone_carat_around", caratAroundValue);

  // Champs "autre" pour les tailles (ring, bracelet, collier)
  let ringSizeValue = document.getElementById("ring-size")?.value || "";
  if (ringSizeValue === "other") {
    ringSizeValue = document.getElementById("ring-size-other")?.value.trim() || "other";
  }
  data.append("ring_size", ringSizeValue);

  let braceletSizeValue = document.getElementById("bracelet-size")?.value || "";
  if (braceletSizeValue === "other") {
    braceletSizeValue = document.getElementById("bracelet-size-other")?.value.trim() || "other";
  }
  data.append("bracelet_size", braceletSizeValue);

  let collierSizeValue = document.getElementById("collier-size")?.value || "";
  if (collierSizeValue === "other") {
    collierSizeValue = document.getElementById("collier-size-other")?.value.trim() || "other";
  }
  data.append("collier_size", collierSizeValue);
  
  // Type de boucle d'oreille
  data.append("boucles_size", document.getElementById("boucles-type")?.value || "");

  // Gestion des images
  data.append("image", imgUrl || "");
  data.append("creations", our_creation || "");


  // --- Envoi du formulaire ---
  fetch('https://script.google.com/macros/s/AKfycbwR_hiMi_2NFworplMp_m2idf7MIB6bfxWS-p6T4F_w8XdAMrdJTvGWTW48YfmVwFo/exec', {
    method: 'POST',
    body: data,
    mode: "no-cors"
  }).then(() => {
    finalForm.classList.remove('active');
    successMessage.classList.remove('hidden');
    if (loadingMessage) {
        loadingMessage.classList.add('hidden');
    }
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }).catch(() => {
    finalForm.style.display = 'flex'
    if (submitBtn) {
        submitBtn.style.display = 'block';
    }
    if (loadingMessage) {
        loadingMessage.classList.add('hidden');
    }
  });

}

// function updateUserSummary() {
//   document.getElementById("summary-jewel").textContent = document.querySelector('input[name="jewel"]:checked')?.value || "-";
//   document.getElementById("summary-gem").textContent = document.querySelector('input[name="gem"]:checked')?.value || "-";
//   document.getElementById("summary-layout").textContent = document.querySelector('input[name="layout"]:checked')?.value || "-";
//   document.getElementById("summary-origin").textContent = document.querySelector('input[name="origin"]:checked')?.value || "-";
//   document.getElementById("summary-stone-type").textContent = document.querySelector('input[name="precious_stone"]:checked')?.value || "-";
//   document.getElementById("summary-shape").textContent = document.querySelector('input[name="shape"]:checked')?.value || "-";
//   document.getElementById("summary-stone-carat").textContent = document.querySelector('input[name="carat"]:checked')?.value || "-";
//   document.getElementById("summary-color").textContent = document.querySelector('input[name="jewel-color"]:checked')?.value || "-";
//   document.getElementById("summary-metal-carat").textContent = document.querySelector('input[name="metal-carat"]:checked')?.value || "-";
//   document.getElementById("summary-bracelet-size").textContent = document.getElementById("bracelet-size")?.value || "-";
//   document.getElementById("summary-ring-size").textContent = document.getElementById("ring-size")?.value || "-";
//   document.getElementById("summary-collier-size").textContent = document.getElementById("collier-size")?.value || "-";
//   document.getElementById("summary-boucles-size").textContent = document.getElementById("boucles-type")?.value || "-";
// }