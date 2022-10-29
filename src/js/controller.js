import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// if (module.hot) {
//   module.hot.accept();
// }
// above code keeps pages stay with current status, wont get refreshed when we change codes

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

    if (!id) return;

    recipeView.renderSpinner();

    // 0. update results view to mark selected search result
    resultView.update(model.getSearchResultsPage());

    // 1. updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2. loading recipe
    await model.loadRecipe(id); // this is an exmaple that an async function calling another async function, it returns a promise, so we need to await it

    // 3. rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();

    // 1. get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2. load seach results
    await model.loadSearchResults(query);

    // 3. render result
    // resultView.render(model.state.search.results); all the results
    resultView.render(model.getSearchResultsPage());

    // 4. render initial pagination bottons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1. render NEW result
  resultView.render(model.getSearchResultsPage(goToPage));

  // 2. render NEW pagination bottons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1. update tje recipe serving (in state)
  model.updateServings(newServings);

  // 2. update the recipe view
  // recipeView.render(model.state.recipe); // not render the whole html section, we only replace what changes
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1. add / remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. update recipe view
  recipeView.update(model.state.recipe);

  // 3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();

    // upload new recipe data
    await model.uploadRecipe(newRecipe); // aysn function
    console.log(model.state.recipe);

    // render recipe
    recipeView.render(model.state.recipe);

    // sucess message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addhandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log(123456);
  console.log('newFeature');
};
init();
