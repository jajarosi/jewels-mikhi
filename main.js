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


function updateUserSummary() {
  document.getElementById("summary-jewel").textContent = document.querySelector('input[name="jewel"]:checked')?.value || "-";
  document.getElementById("summary-gem").textContent = document.querySelector('input[name="gem"]:checked')?.value || "-";
  document.getElementById("summary-layout").textContent = document.querySelector('input[name="layout"]:checked')?.value || "-";
  document.getElementById("summary-origin").textContent = document.querySelector('input[name="origin"]:checked')?.value || "-";
  document.getElementById("summary-stone-type").textContent = document.querySelector('input[name="precious_stone"]:checked')?.value || "-";
  document.getElementById("summary-shape").textContent = document.querySelector('input[name="shape"]:checked')?.value || "-";
  document.getElementById("summary-stone-carat").textContent = document.querySelector('input[name="carat"]:checked')?.value || "-";
  document.getElementById("summary-color").textContent = document.querySelector('input[name="jewel-color"]:checked')?.value || "-";
  document.getElementById("summary-metal-carat").textContent = document.querySelector('input[name="metal-carat"]:checked')?.value || "-";
  document.getElementById("summary-bracelet-size").textContent = document.getElementById("bracelet-size")?.value || "-";
  document.getElementById("summary-ring-size").textContent = document.getElementById("ring-size")?.value || "-";
  document.getElementById("summary-collier-size").textContent = document.getElementById("collier-size")?.value || "-";
  document.getElementById("summary-boucles-size").textContent = document.getElementById("boucles-type")?.value || "-";
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

  previousBtn.style.display = currentStep > 0 ? "inline-block" : "none";
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
    document.getElementById("user-summary").style.display = "block";
    updateUserSummary();
  }
}

function previousStep() {
  if (stepHistory.length > 1) {
    stepHistory.pop(); 
    const previousStepId = stepHistory[stepHistory.length - 1];
    currentStep = parseInt(previousStepId.replace("step", ""));
    showStep(previousStepId);
  } 
  if (currentStep < 1) {
    document.getElementById("user-summary").style.display = "none";
  }
  updateNavigationButtons();
}

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
  data.append("name", document.querySelector('input[name="name"]')?.value || "");
  data.append("email", document.querySelector('input[name="email"]')?.value || "");
  data.append("phone", document.querySelector('input[name="phone"]')?.value || "");
  data.append("comment", document.querySelector('textarea[name="comment"]')?.value || "");

  fetch('https://script.google.com/macros/s/AKfycbzFZOaj-A_7loh-wfz2Jq4Epbu6rKQaBNN5gQEWKf3RkAw0liCYCv7Xiz0yAOz7ldpM9g/exec', {
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