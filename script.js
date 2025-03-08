const apiKey = 'INPUT API KEY';
const recipesContainer = document.getElementById('recipesContainer');
const ingredientInput = document.getElementById('ingredientInput');
const searchButton = document.getElementById('searchButton');

// Function to fetch random recipes
async function fetchRandomRecipes() {
  recipesContainer.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=5&apiKey=${apiKey}`);
    const data = await response.json();

    if (!data.recipes.length) {
      recipesContainer.innerHTML = '<p>No recipes found. Please try again later.</p>';
      return;
    }

    // Display random recipes
    recipesContainer.innerHTML = data.recipes.map(recipe => 
      `<div class="recipe-card" data-id="${recipe.id}">
        <img src="${recipe.image}" alt="${recipe.title}" width="100%">
        <h3>${recipe.title}</h3>
      </div>`
    ).join('');

    document.querySelectorAll('.recipe-card').forEach(card => {
      card.addEventListener('click', () => {
        // Redirect to recipe details page with recipe ID as query parameter
        window.location.href = `recipe.html?id=${card.dataset.id}`;
      });
    });
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    recipesContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  }
}

// Function to search recipes by ingredient
searchButton.addEventListener('click', async () => {
  const ingredient = ingredientInput.value.trim();
  if (!ingredient) return alert('Please enter an ingredient!');

  recipesContainer.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredient}&number=10&apiKey=${apiKey}`);
    const recipes = await response.json();

    if (!recipes.length) {
      recipesContainer.innerHTML = '<p>No recipes found. Please try a different ingredient.</p>';
      return;
    }

    recipesContainer.innerHTML = recipes.map(recipe => 
      `<div class="recipe-card" data-id="${recipe.id}">
        <img src="${recipe.image}" alt="${recipe.title}" width="100%">
        <h3>${recipe.title}</h3>
      </div>`
    ).join('');

    document.querySelectorAll('.recipe-card').forEach(card => {
      card.addEventListener('click', () => {
        // Redirect to recipe details page with recipe ID as query parameter
        window.location.href = `recipe.html?id=${card.dataset.id}`;
      });
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    recipesContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  }
});

// Fetch random recipes on page load
window.onload = fetchRandomRecipes;
