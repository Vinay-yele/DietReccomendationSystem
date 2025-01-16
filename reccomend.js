// recommend.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('diet-form');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('menu-pdf');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const errorMessage = document.getElementById('error-message');
    const recommendationsContainer = document.getElementById('recommendations-container');

    // Make file input clickable but invisible
    fileInput.style.opacity = '0';
    fileInput.style.position = 'absolute';
    fileInput.style.height = '100%';
    fileInput.style.width = '100%';
    fileInput.style.cursor = 'pointer';
    fileInput.style.top = '0';
    fileInput.style.left = '0';
    fileInput.style.display = 'block'; // Changed from 'none' to 'block'

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = this.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                const uploadText = uploadArea.querySelector('p');
                uploadText.textContent = `Selected file: ${file.name}`;
            } else {
                showError('Please upload a PDF file');
                this.value = ''; // Clear the file input
            }
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        setTimeout(() => {
            errorMessage.classList.remove('active');
        }, 5000);
    }

    function showLoading() {
        loading.classList.add('active');
        results.classList.remove('active');
    }

    function hideLoading() {
        loading.classList.remove('active');
    }

    function displayResults(data) {
        results.classList.add('active');
        recommendationsContainer.innerHTML = '';

        // Create meal cards for each meal type
        const meals = ['Breakfast', 'Lunch', 'Dinner'];
        meals.forEach(meal => {
            const mealData = data[meal.toLowerCase()];
            if (mealData) {
                const mealCard = createMealCard(meal, mealData);
                recommendationsContainer.appendChild(mealCard);
            }
        });
    }

    function createMealCard(mealType, mealData) {
        const card = document.createElement('div');
        card.className = 'meal-card';

        card.innerHTML = `
            <h3>${mealType} Recommendations</h3>
            <p><strong>Recommended Items:</strong> ${mealData.items.join(', ')}</p>
            <div class="nutrition-grid">
                <div class="nutrition-item">
                    <h4>Proteins</h4>
                    <p>${mealData.nutrition.proteins}g</p>
                </div>
                <div class="nutrition-item">
                    <h4>Carbs</h4>
                    <p>${mealData.nutrition.carbs}g</p>
                </div>
                <div class="nutrition-item">
                    <h4>Fats</h4>
                    <p>${mealData.nutrition.fats}g</p>
                </div>
                <div class="nutrition-item">
                    <h4>Calories</h4>
                    <p>${mealData.nutrition.calories} kcal</p>
                </div>
            </div>
        `;

        return card;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!fileInput.files || fileInput.files.length === 0) {
            showError('Please select a PDF file');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', fileInput.files[0]);
        formData.append('goal', document.getElementById('goal').value);

        try {
            showLoading();
            
            const response = await fetch('/api/analyze-menu', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to analyze menu');
            }

            const data = await response.json();
            hideLoading();
            displayResults(data);

        } catch (error) {
            hideLoading();
            showError('Failed to process your request. Please try again.');
            console.error('Error:', error);
        }
    });
});