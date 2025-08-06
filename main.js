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

// On form submit, use the custom value if 'other' was selected
document.addEventListener('DOMContentLoaded', function() {
  const finalForm = document.getElementById('finalForm');
  if (!finalForm) return;
  finalForm.addEventListener('submit', function() {
    const ringSelect = document.getElementById('ring-size');
    const ringOther = document.getElementById('ring-size-other');
    if (ringSelect && ringOther && ringSelect.value === 'other' && ringOther.value.trim()) {
      ringSelect.value = ringOther.value.trim();
    }
    const braceletSelect = document.getElementById('bracelet-size');
    const braceletOther = document.getElementById('bracelet-size-other');
    if (braceletSelect && braceletOther && braceletSelect.value === 'other' && braceletOther.value.trim()) {
      braceletSelect.value = braceletOther.value.trim();
    }
    const collierSelect = document.getElementById('collier-size');
    const collierOther = document.getElementById('collier-size-other');
    if (collierSelect && collierOther && collierSelect.value === 'other' && collierOther.value.trim()) {
      collierSelect.value = collierOther.value.trim();
    }
  });
});
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

  // On form submit, replace 'other' value with input if filled
  const finalForm = document.getElementById('finalForm');
  if (finalForm) {
    finalForm.addEventListener('submit', function(e) {
      // Step 4
      if (preciousOtherRadio && preciousOtherInput && preciousOtherRadio.checked && preciousOtherInput.value.trim()) {
        preciousOtherRadio.value = preciousOtherInput.value.trim();
      } else if (preciousOtherRadio) {
        preciousOtherRadio.value = 'אחר';
      }
      // Step 6
      if (shapeOtherRadio && shapeOtherInput && shapeOtherRadio.checked && shapeOtherInput.value.trim()) {
        shapeOtherRadio.value = shapeOtherInput.value.trim();
      } else if (shapeOtherRadio) {
        shapeOtherRadio.value = 'אחר';
      }
      // Step 7
      if (caratOtherRadio && caratOtherInput && caratOtherRadio.checked && caratOtherInput.value.trim()) {
        caratOtherRadio.value = caratOtherInput.value.trim();
      } else if (caratOtherRadio) {
        caratOtherRadio.value = 'autre';
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

let currentStep = 0;
let imgUrl = "";
let our_creation = "";
let stepHistory = ["step0"];
const track = document.querySelector(".carousel-track");
const images_carousel = track.querySelectorAll(".img_carousel");
const selectedName = document.getElementById("selected-name");
let selectedJewel = ""; 

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
  if (currentStep === 0) {
    const choice = document.querySelector('input[name="personalised"]:checked')?.value;

    if (choice === "custom") {
      goToStep(1);
    } else if (choice === "upload") {
      resetStepInputs();
      goToStep(12);
    } else if (choice === "model") {
      resetStepInputs();
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

  if (currentStep === 1) {
    const jewelChoice = document.querySelector('input[name="jewel"]:checked')?.value;
    if (jewelChoice) {
      selectedJewel = jewelChoice;
    }
  }

  // Avancer dans le flow normal
  if (currentStep >= 1 && currentStep <= 10) {
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
    showStep(previousStepId);
  } 
  // if (currentStep < 1) {
  //   document.getElementById("user-summary").style.display = "none";
  // }
  updateNavigationButtons();
}

function homePage() {
  currentStep = 0;
  stepHistory = ["step0"];
  showStep("step0");
  updateNavigationButtons();
  resetStepInputs();
  document.getElementById('uploadStatus').textContent = "";
  document.getElementById('confirmBtn').style.display = "none";
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

    if (stepNum >= 0 && stepNum <= 10) {
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

function resetStepInputs() {
  const radios = document.querySelectorAll(
    '#step1 input[type="radio"], #step2 input[type="radio"], #step3 input[type="radio"], #step4 input[type="radio"], #step5 input[type="radio"], #step6 input[type="radio"], #step7 input[type="radio"], #step8 input[type="radio"], #step9 input[type="radio"], #step10 input[type="radio"]'
  );

  // console.log("Nombre de boutons radio ciblés :", radios.length);

  radios.forEach(input => {
    // if (input.checked) {
    //   console.log(`Décoché : ${input.name} => ${input.value}`);
    // }
    input.checked = false;
  });
}

uploadcare.Widget('[role=uploadcare-uploader]').onUploadComplete(function(info) {
  const imagUrl = info.cdnUrl; // <- L'URL finale de l’image uploadée
  console.log("Image URL:", imagUrl);
  imgUrl = imagUrl; 

  document.getElementById('uploadStatus').textContent = "✅ Image envoyée !";
        
  document.getElementById('confirmBtn').style.display = "inline-block";
});

// Soumission finale du formulaire
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

  data.append("name", document.querySelector('input[name="name"]')?.value || "");
  data.append("email", document.querySelector('input[name="email"]')?.value || "");
  data.append("phone", document.querySelector('input[name="phone"]')?.value || "");
  data.append("comment", document.querySelector('textarea[name="comment"]')?.value || "");
  data.append("jewel", document.querySelector('input[name="jewel"]:checked')?.value || "");
  data.append("gem", document.querySelector('input[name="gem"]:checked')?.value || "");
  data.append("layout", document.querySelector('input[name="layout"]:checked')?.value || "");
  data.append("stone_type", document.querySelector('input[name="precious_stone"]:checked')?.value || "");
  data.append("origin", document.querySelector('input[name="origin"]:checked')?.value || "");
  data.append("shape", document.querySelector('input[name="shape"]:checked')?.value || "");
  data.append("stone_carat", document.querySelector('input[name="carat"]:checked')?.value || "");
  data.append("color", document.querySelector('input[name="jewel-color"]:checked')?.value || "");
  data.append("metal_carat", document.querySelector('input[name="metal-carat"]:checked')?.value || "");
  data.append("bracelet_size", document.getElementById("bracelet-size")?.value || "");
  data.append("ring_size", document.getElementById("ring-size")?.value || "");
  data.append("collier_size", document.getElementById("collier-size")?.value || "");
  data.append("boucles_size", document.getElementById("boucles-type")?.value || "");
  data.append("image", imgUrl || ""); 
  data.append("creations", our_creation || "");

  fetch('https://script.google.com/macros/s/AKfycbx90TwxknQ09GYNZhkGFWTkn2QHPE6gP1ry9O4n46jfkie-PcR4TldMncoCRd2nsabJ/exec', {
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

  // Définir le volume une fois que l'élément est prêt à jouer
  audio.oncanplay = function() {
      // Volume à 30%
      audio.volume = 0.005;
      // Optionnel : Retirer 'muted' si vous l'avez ajouté en HTML
      audio.muted = false;
  };

  // Si l'audio a déjà été chargé (par exemple, si la page est en cache),
  // il se peut que l'événement 'oncanplay' ne se déclenche pas.
  // On vérifie donc aussi directement.
  if (audio.readyState >= 3) { // readyState 3 = HAVE_FUTURE_DATA
      audio.volume = 0.005;
      audio.muted = false;
  }

  // Pour gérer les blocages d'autoplay, on pourrait aussi vouloir déclencher
  // la lecture et le volume après la première interaction de l'utilisateur.
  // Par exemple, en ajoutant un bouton "Activer le son".
});

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