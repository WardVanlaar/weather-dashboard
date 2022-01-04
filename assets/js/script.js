//adapted from: https://webdesign.tutsplus.com/tutorials/build-a-simple-weather-app-with-vanilla-javascript--cms-33893
//adapted from https://medium.com/@arifkabir/building-a-weather-app-using-javascript-css-1f05f160a3b0

// references to index-file
const form = document.querySelector("#input-form");
const input = document.querySelector("#input");
const msg = document.querySelector("#message");
const list = document.querySelector("#city");

// API key obtained from https://home.openweathermap.org
const apiKey = "9173d4a8ceb0b3884e0d4a9dd7768ed0";

// capture city
form.addEventListener("submit", e => {
  e.preventDefault();
  let inputVal = input.value;
  cityListHandler();

  // fetch weather data, including nested fetch statement to get UV-index
  // adapted from https://stackoverflow.com/questions/40981040/using-a-fetch-inside-another-fetch-in-javascript

  const urlOuter = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;
  let urlInner = '';

  fetch(urlOuter)
  .then(responseO => responseO.json())
  .then(data => {
    const { main, coord, name, sys, weather, wind, dt } = data;
    const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
      weather[0]["icon"]
    }.svg`;
    
    const unixTime = data.dt;
    const date = new Date(unixTime*1000);
    const date1= date.toLocaleDateString("en-US");

    const neededValue1 = data.coord.lat;
    const neededValue2 = data.coord.lon;

    urlInner = `https://api.openweathermap.org/data/2.5/onecall?lat=${neededValue1}&lon=${neededValue2}&appid=${apiKey}`;
    return fetch(urlInner)
      .then(responseI => responseI.json())
      .then(data2 => {
        const {current, daily} = data2;
        // localStorage.setItem("uvi", JSON.stringify(data2));
        // console.log(data2);

        city.textContent = "";

        const li = document.createElement("span");
        li.classList.add("city");
        const markup = `
          <h2 class="city-name" data-name="${name},${sys.country}">
            <span>${name}, ${sys.country} (${date1}) <figure> <img class="city-icon" src="${icon}" alt="${weather[0]["description"]}"></figure>
            </span>
          </h2>
          <div class="city-temp">Temp: ${Math.round(main.temp)}<sup>°</sup>C</div>
          <div class="city-wind">Wind: ${wind.speed} Km/h</div>
          <div class="city-humidity">Humidity: ${main.humidity}%</div>
          <div class="city-UVI" id="UVI"> UV index: <span>${current.uvi}</span></div>
        `;

        li.innerHTML = markup;
        list.appendChild(li);
        
        colorCode(data2.current.uvi);
        loadForecast(data2);

        }).catch(err => {
          console.error('Failed to fetch - ' + urlInner);   
          console.log(urlOuter);
          console.log(urlInner);
        });

      }).catch(err => {
        console.error('Failed to fetch - ' + urlOuter);
      });
});

// 5-day forecast, adapted from Jacob Liberty
// Create the Daily Forecast divs
function loadForecast(data) {
  console.log(data)
  // Create divs if none
  if ( $('#forecast').children().length == 0 ){
    for (let i=0; i<5; i++){
      let day = moment().add(i, 'days').format('L');
      let icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${data.daily[i].weather[0].icon}.svg`;
      $('#forecast').append(`<div class='dailyForecast' id='forecast${i}'></div>`);
      $(`#forecast${i}`).append(`<h3 class='forecastDate' id='date${i}'>${day}</h3>`);
      $(`#forecast${i}`).append(`<image class='forecastIcon' id='icon${i}' src='${icon}'></image>`);
      $(`#forecast${i}`).append(`<p class='forecastText' id='temp${i}'>Temp: ${data.daily[i].temp.day}°C</p>`);
      $(`#forecast${i}`).append(`<p class='forecastText' id='wind${i}'>Wind: ${data.daily[i].wind_speed}kph</p>`);
      $(`#forecast${i}`).append(`<p class='forecastText' id='humid${i}'>Humidity: ${data.daily[i].humidity}%</p>`);
    };
  }
  // Rewrite content if there are divs 
  else {
    for (let i=0; i<5; i++){
      let day = moment().add(i, 'days').format('L');
      let icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${data.daily[i].weather[0].icon}.svg`;
      document.getElementById(`date${i}`).innerHTML = day;
      document.getElementById(`icon${i}`).src = icon;
      document.getElementById(`temp${i}`).innerHTML = `Temp: ${data.daily[i].temp.day}`;
      document.getElementById(`wind${i}`).innerHTML = `Wind: ${data.daily[i].wind_speed}`;
      document.getElementById(`humid${i}`).innerHTML = `Humidity: ${data.daily[i].humidity}`;
    }
  }
}

// save city
const cities = JSON.parse(localStorage.getItem("input")) || [];

function saveCity() {

    var cityInput = document.getElementById("input").value;
    const newList = {
        name: cityInput
    };
    cities.push(newList);

    localStorage.setItem("cities", JSON.stringify(cities));
    console.log(cities);
};

function cityListHandler(event) {

    saveCity();

    const cityList = document.getElementById("cityList");
    const cities = JSON.parse(localStorage.getItem("cities")) || [];
    console.log(cityList);
    console.log(cities);

    cityList.textContent = "";

    for (var i = 0; i < cities.length; i++) {
     
      var cityEl = document.createElement("button");
      cityEl.classList = "btn btn-secondary list-item";
      // cityEl.onclick = fetchWeatherData();
      var titleEl = document.createElement("span");
      titleEl.textContent = cities[i].name;
      cityEl.appendChild(titleEl);
      cityList.appendChild(cityEl);
    } 
}

function colorCode(uvi) {
  console.log(uvi)

if (uvi < 2) {
  $("#UVI").children('span').addClass("favorable");
  } else if (uvi > 5) {
  $("#UVI").children('span').addClass("severe");
  } else {
  $("#UVI").children('span').addClass("moderate");
  }
};

// // To load city from search history
// function fetchWeatherData(event) {
//     let inputVal = event.target.innerText;
//     const urlOuter = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;
//     let urlInner = '';

//     fetch(urlOuter)
//     .then(responseO => responseO.json())
//     .then(data => {
//       const { main, coord, name, sys, weather, wind, dt } = data;
//       const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
//         weather[0]["icon"]
//       }.svg`;
      
//       const unixTime = data.dt;
//       const date = new Date(unixTime*1000);
//       const date1= date.toLocaleDateString("en-US");

//       const neededValue1 = data.coord.lat;
//       const neededValue2 = data.coord.lon;

//       urlInner = `https://api.openweathermap.org/data/2.5/onecall?lat=${neededValue1}&lon=${neededValue2}&appid=${apiKey}`;
//       return fetch(urlInner)
//         .then(responseI => responseI.json())
//         .then(data2 => {
//           const {current, daily} = data2;
//           // localStorage.setItem("uvi", JSON.stringify(data2));
//           // console.log(data2);

//           city.textContent = "";

//           const li = document.createElement("span");
//           li.classList.add("city");
//           const markup = `
//             <h2 class="city-name" data-name="${name},${sys.country}">
//               <span>${name}, ${sys.country} (${date1}) <figure> <img class="city-icon" src="${icon}" alt="${weather[0]["description"]}"></figure>
//               </span>
//             </h2>
//             <div class="city-temp">Temp: ${Math.round(main.temp)}<sup>°</sup>C</div>
//             <div class="city-wind">Wind: ${wind.speed} Km/h</div>
//             <div class="city-humidity">Humidity: ${main.humidity}%</div>
//             <div class="city-UVI" id="UVI"> UV index: <span>${current.uvi}</span></div>
//           `;

//           li.innerHTML = markup;
//           list.appendChild(li);
          
//           colorCode(data2.current.uvi);
//           loadForecast(data2);

//           }).catch(err => {
//             console.error('Failed to fetch - ' + urlInner);   
//             console.log(urlOuter);
//             console.log(urlInner);
//           });
//         }).catch(err => {
//           console.error('Failed to fetch - ' + urlOuter);
//       });
//     // cityEl.addEventListener("click", fetchWeatherData);
//   };

   
