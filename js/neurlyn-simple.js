// Simple initialization script without dark mode
document.addEventListener('DOMContentLoaded', function () {
  // Initialize consent checkboxes
  const consentCheck = document.getElementById('consent-check');
  const ageCheck = document.getElementById('age-check');
  const acceptBtn = document.getElementById('accept-disclaimer');

  // Setup pricing tab selection
  const pricingTabs = document.querySelectorAll('.selector-tab');
  const selectedDescription = document.getElementById('selected-description');

  if (pricingTabs.length > 0) {
    pricingTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active from all tabs
        pricingTabs.forEach(t => t.classList.remove('active'));
        // Add active to clicked tab
        tab.classList.add('active');

        // Update description and button text based on selection
        const plan = tab.dataset.plan;
        if (plan === 'free') {
          if (selectedDescription) {
            selectedDescription.textContent =
              'Get your basic personality profile with key traits - completely free';
          }
          if (acceptBtn) {
            acceptBtn.textContent = 'Start Free Assessment';
          }
        } else if (plan === 'premium') {
          if (selectedDescription) {
            selectedDescription.textContent =
              'Complete neurodiversity screening with detailed analysis and downloadable report';
          }
          if (acceptBtn) {
            acceptBtn.textContent = 'Start In-Depth Analysis - £1.99';
          }
        }
      });
    });
  }

  // Handle consent checkboxes
  if (consentCheck && ageCheck && acceptBtn) {
    const checkConsent = () => {
      acceptBtn.disabled = !(consentCheck.checked && ageCheck.checked);
    };

    consentCheck.addEventListener('change', checkConsent);
    ageCheck.addEventListener('change', checkConsent);

    acceptBtn.addEventListener('click', () => {
      // For now, just show the welcome screen
      const disclaimerScreen = document.getElementById('disclaimer-screen');
      const welcomeScreen = document.getElementById('welcome-screen');

      if (disclaimerScreen) {
        disclaimerScreen.classList.add('hidden');
        disclaimerScreen.classList.remove('active');
      }

      if (welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
        welcomeScreen.classList.add('active');
      }
    });
  }

  // Basic assessment flow
  const trackOptions = document.querySelectorAll('.track-option');
  const modeOptions = document.querySelectorAll('.mode-option');
  const startBtn = document.getElementById('start-assessment');

  let selectedTrack = null;
  let selectedMode = null;

  trackOptions.forEach(option => {
    option.addEventListener('click', () => {
      trackOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedTrack = option.dataset.track;
      checkCanStart();
    });
  });

  modeOptions.forEach(option => {
    option.addEventListener('click', () => {
      modeOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedMode = option.dataset.mode;
      checkCanStart();
    });
  });

  function checkCanStart() {
    if (startBtn && selectedTrack && selectedMode) {
      startBtn.disabled = false;
    }
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      // Simple transition to question screen
      const welcomeScreen = document.getElementById('welcome-screen');
      const questionScreen = document.getElementById('question-screen');

      if (welcomeScreen) {
        welcomeScreen.classList.add('hidden');
      }

      if (questionScreen) {
        questionScreen.classList.remove('hidden');
      }

      // Simple demo question
      const questionContent = document.getElementById('question-content');
      if (questionContent) {
        questionContent.innerHTML = `
                    <h3>I enjoy spending time with large groups of people.</h3>
                    <div class="likert-scale">
                        <label><input type="radio" name="q1" value="1"> Strongly Disagree</label>
                        <label><input type="radio" name="q1" value="2"> Disagree</label>
                        <label><input type="radio" name="q1" value="3"> Neutral</label>
                        <label><input type="radio" name="q1" value="4"> Agree</label>
                        <label><input type="radio" name="q1" value="5"> Strongly Agree</label>
                    </div>
                `;
      }
    });
  }

  // Navigation buttons
  const nextBtn = document.getElementById('next-button');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // Simple transition to results
      const questionScreen = document.getElementById('question-screen');
      const resultsScreen = document.getElementById('results-screen');

      if (questionScreen) {
        questionScreen.classList.add('hidden');
      }

      if (resultsScreen) {
        resultsScreen.classList.remove('hidden');

        const resultsContent = document.getElementById('results-content');
        if (resultsContent) {
          resultsContent.innerHTML = `
                        <h3>Sample Results</h3>
                        <p>This is a demo of the assessment results page.</p>
                        <ul>
                            <li>Openness: 75%</li>
                            <li>Conscientiousness: 60%</li>
                            <li>Extraversion: 45%</li>
                            <li>Agreeableness: 80%</li>
                            <li>Neuroticism: 35%</li>
                        </ul>
                    `;
        }
      }
    });
  }

  // Home button
  const homeBtn = document.getElementById('home-button');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }

  // Retake button
  const retakeBtn = document.getElementById('retake-assessment');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }
});
