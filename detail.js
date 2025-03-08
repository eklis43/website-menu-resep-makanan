const apiKey = 'INPUT API KEY';
const recipeTitle = document.getElementById('recipeTitle');
const recipeDescription = document.getElementById('recipeDescription');
const recipeInstructions = document.getElementById('recipeInstructions');
const recipeImage = document.getElementById('recipeImage');
const recipeIngredients = document.getElementById('recipeIngredients');
const nutritionChartBar = document.getElementById('nutritionChart');

let barChartInstance;

// Extract recipe ID from query parameters
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');

if (!recipeId) {
  document.body.innerHTML = '<p>Invalid recipe ID. Please go back to the homepage.</p>';
} else {
  loadRecipeDetails(recipeId);
}

async function loadRecipeDetails(recipeId) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${apiKey}`);
    const recipe = await response.json();

    // Update title, description, and instructions
    recipeTitle.textContent = recipe.title;
    recipeDescription.innerHTML = recipe.summary.replace(/<[^>]*>?/gm, ''); // Clean HTML tags
    recipeInstructions.innerHTML = recipe.analyzedInstructions.length > 0
      ? recipe.analyzedInstructions[0].steps.map(step => `<li>${step.step}</li>`).join('')
      : '<p>No instructions available.</p>';

    // Set the recipe image
    if (recipe.image) {
      recipeImage.src = recipe.image;
      recipeImage.alt = recipe.title;
      recipeImage.style.width = '100%';
    } else {
      recipeImage.style.display = 'none';
    }

    // Display ingredients
    if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
      recipeIngredients.innerHTML = '<h3>Ingredients:</h3><ul>' +
        recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('') +
        '</ul>';
    } else {
      recipeIngredients.innerHTML = '<p>No ingredients available.</p>';
    }

    // Prepare data for the nutrition charts
    const nutrients = recipe.nutrition.nutrients.slice(0, 5); // Top 5 nutrients
    const labels = nutrients.map(n => n.name);
    const data = nutrients.map(n => n.amount);
    const colors = [
      'rgba(255, 99, 132, 0.6)',   // Red
      'rgba(54, 162, 235, 0.6)',   // Blue
      'rgba(255, 206, 86, 0.6)',   // Yellow
      'rgba(75, 192, 192, 0.6)',   // Teal
      'rgba(153, 102, 255, 0.6)',  // Purple
      'rgba(255, 159, 64, 0.6)',   // Orange
      'rgba(199, 199, 199, 0.6)',  // Grey
      'rgba(90, 200, 250, 0.6)',   // Light Blue
      'rgba(255, 180, 128, 0.6)',  // Peach
      'rgba(144, 238, 144, 0.6)',  // Light Green
      'rgba(255, 105, 180, 0.6)',  // Hot Pink
      'rgba(60, 179, 113, 0.6)',   // Medium Sea Green
      'rgba(238, 130, 238, 0.6)',  // Violet
      'rgba(0, 191, 255, 0.6)',    // Deep Sky Blue
      'rgba(255, 69, 0, 0.6)',     // Red-Orange
      'rgba(186, 85, 211, 0.6)',   // Medium Orchid
      'rgba(255, 99, 71, 0.6)',    // Tomato
      'rgba(0, 128, 128, 0.6)',    // Teal
      'rgba(255, 215, 0, 0.6)'     // Gold
    ];

    // Create Bar Chart
    if (barChartInstance) {
      barChartInstance.destroy();
    }
    barChartInstance = new Chart(nutritionChartBar, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Nutritional Value (per serving)',
          data,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.6', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });

    // Generate Pie Charts for each nutrient
    const pieChartContainer = document.getElementById('pieChartsContainer');
    pieChartContainer.innerHTML = ''; // Clear previous charts

    nutrients.forEach((nutrient, index) => {
      // Create a wrapper for each chart to center it independently
      const chartWrapper = document.createElement('div');
      chartWrapper.style.display = 'flex';
      chartWrapper.style.flexDirection = 'column';
      chartWrapper.style.alignItems = 'center'; // Center horizontally
      chartWrapper.style.justifyContent = 'center'; // Center vertically
      chartWrapper.style.marginBottom = '40px'; // Add space between charts

      // Add a title for each pie chart
      const chartTitle = document.createElement('h4');
      chartTitle.textContent = `Distribution of ${nutrient.name}`;
      chartTitle.style.textAlign = 'center'; // Center the title
      chartWrapper.appendChild(chartTitle);

      // Create a canvas for the pie chart
      const pieCanvas = document.createElement('canvas');
      pieCanvas.id = `pieChart-${index}`;
      pieCanvas.style.width = '600px'; // Set chart width
      pieCanvas.style.height = '600px'; // Set chart height
      chartWrapper.appendChild(pieCanvas);

      // Append the wrapper to the container
      pieChartContainer.appendChild(chartWrapper);

      // Create Pie Chart
      const ingredientDistribution = recipe.extendedIngredients.map(ingredient => {
        const weight = ingredient.amount || 0;
        return weight;
      });

      const totalWeight = ingredientDistribution.reduce((acc, val) => acc + val, 0);
      const normalizedData = ingredientDistribution.map(w => ((w / totalWeight) * 100).toFixed(2));

      new Chart(pieCanvas, {
        type: 'pie',
        data: {
          labels: recipe.extendedIngredients.map(ingredient => ingredient.name),
          datasets: [{
            data: normalizedData,
            backgroundColor: colors,
            hoverBackgroundColor: colors.map(c => c.replace('0.6', '0.8'))
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                }
              }
            }
          }
        }
      });
    });
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    document.body.innerHTML = '<p>Unable to load recipe details. Please try again later.</p>';
  }
}
