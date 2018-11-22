
(async function load(){
  //Solicitar datos a una api
  async function getData(url){
    const response = await fetch(url)
    const data = await response.json()
    return data;
  }
  const BASE_API = 'https://yts.am/api/v2/';


  //<------- SEARCH

  const $form = document.getElementById('form');
  const $modalImage = document.getElementById('modalImage');
  const $modalTitle = document.getElementById('modalLabel');
  const $modalDescription = document.getElementById('modalDescription');
  const $btnPlay = document.getElementById('btnPlay');
  const $modalGener = document.getElementById('modalGener');
  const $runTime = document.getElementById('runtime');

  $form.addEventListener('submit', async (event)=>{
    event.preventDefault();

    const text = new FormData($form);
    const result = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${text.get('name')}`)
    .then(function(result) {
      console.log(result);
      if($btnPlay.classList !== 'hide'){ $btnPlay.classList.remove('hide') }
      $modalImage.setAttribute('src', result.data.movies[0].large_cover_image);
      $modalTitle.textContent = result.data.movies[0].title;
      $modalDescription.textContent = result.data.movies[0].title_long;
      $modalGener.textContent = result.data.movies[0].genres[0];
      const time = (result.data.movies[0].runtime/60).toFixed(2);
      $runTime.textContent = time.toString().replace('.', 'h. ');
    })
    .catch(function(){
      if($btnPlay.classList !== 'hide'){ $btnPlay.classList.add('hide') }
      $modalImage.setAttribute('src', "./src/images/no-results.gif");
      $modalTitle.textContent = 'No results';
    });

  })

//   //<------- TEMPLATES

    function videoItemTemplate(movie, category) {
    return (
      `<div class="col-md-3 no-gutters card bg-dark text-white" data-toggle="collapse" href="#multiCollapseExample1" role="button" aria-expanded="false" aria-controls="multiCollapseExample1">
        <img class="card-img" src="${movie.medium_cover_image}" alt="Card image">
        <div class="card-img-overlay" >
          <h5 class="card-text d-inline-block align-middle"> ${movie.title} </h5>

          <div class="footerCard">
            <p class="card-text d-inline-block align-middle">Gener: ${movie.genres[0]} | Ranting: </p>
            <p class="card-text d-inline-block align-middle" style="color: green;"> ${movie.rating}</p>
        </div>
      </div>`
    )
  }

   function maysPrimera(string){
     return string.charAt(0).toUpperCase() + string.slice(1);
   }

   function friendsTemplate(user){
     return(
       `<a class="dropdown-item" data-toggle="modal" data-target="#userModal" href="#" data-id="${user.login.username}">
         <img src="${user.picture.thumbnail}" width="30" height="30" class="d-inline-block align-top" alt=""/>
         <div class="d-inline-block align-middle">${maysPrimera(user.name.first)} ${maysPrimera(user.name.last)}</div>
       </a>`
     )
   }

   function constructorTemplate(HTMLString){
     const html = document.implementation.createHTMLDocument();
     html.body.innerHTML = HTMLString;
     return html.body.children[0];
   }

  // <----- RENDER LISTAS

 // Movies
  function render(list, $container, category){
    $container.children[0].remove();
    $container.children[0].remove();
    $container.children[0].remove();
    $container.children[0].remove();
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = constructorTemplate(HTMLString);
      $container.append(movieElement);
      const img = movieElement.querySelector('img');
      img.addEventListener('load', (event) => {
        movieElement.classList.add('fadeIn');
      })
    })
  }

   // Friends
  function renderFriends(){
    $friendsContainer.children[0].remove();
    $friendsContainer.children[0].remove();
    $friendsContainer.children[0].remove();
    friends.forEach((user) =>{
      const HTMLString = friendsTemplate(user);
      const userElement = constructorTemplate(HTMLString);
      $friendsContainer.insertBefore(userElement, $divider);
      addEventClickModalUser(userElement);
    })
  }

  // <----- Peticones al API

  async function cacheExist(category) {
    const listName = `${category}List`;
    const cacheList = window.localStorage.getItem(listName);

    if (cacheList) {
      return JSON.parse(cacheList);
    }
    // si no hay listas en caché hace una petición
    const { data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}&&sort_by=year&&`);
    window.localStorage.setItem(listName, JSON.stringify(data));
    return data;


  }

  //<-------- APP ---------->

  const actionList = await cacheExist('action')
  const $actionContainer = document.getElementById('action');
  render(actionList, $actionContainer, 'action');

  const dramaList = await cacheExist('drama')
  const $dramaContainer = document.getElementById('drama');
  render(dramaList, $dramaContainer, 'drama');

  const $divider = document.getElementById('divider');
  const { results: friends } = await getData('https://randomuser.me/api/?nat=es&results=5')
  const $friendsContainer = document.getElementById('friendsContainer');
  renderFriends();


  // <------ User modal

  const $userModalImage = document.getElementById('userModalImage');
  const $userModalNick = document.getElementById('userModalNick')
  const $userModalName = document.getElementById('userModalName');
  const $userModalEmail = document.getElementById('userModalEmail');
  const $from = document.getElementById('from')

  function addEventClickModalUser($element) {
    $element.addEventListener('click', () => {
      showUserModal($element);
    })
  }

  function showUserModal($element){
    const idUser = $element.dataset.id;
    const userSelct = friends.find( user => user.login.username === idUser );
    $userModalImage.setAttribute('src', userSelct.picture.medium);
    $userModalNick.textContent = userSelct.login.username;
    $userModalName.textContent =`Name: ${maysPrimera(userSelct.name.first)} ${maysPrimera(userSelct.name.last)}`;
    $userModalEmail.textContent = `Email: ${userSelct.email}`;
    $from.textContent = `From: ${maysPrimera(userSelct.location.city)}`;
    }
})()
