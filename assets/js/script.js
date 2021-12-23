//adapted from: https://webdesign.tutsplus.com/tutorials/build-a-simple-weather-app-with-vanilla-javascript--cms-33893
//adapted from https://medium.com/@arifkabir/building-a-weather-app-using-javascript-css-1f05f160a3b0


// references to index-file
const form = document.querySelector("#input-form");
const input = document.querySelector("#input");
const msg = document.querySelector("#message");
const list = document.querySelector("#city");
//will have to add references to 5-day forecast

// API key obtained from https://home.openweathermap.org
const apiKey = "9173d4a8ceb0b3884e0d4a9dd7768ed0";

// capture city
form.addEventListener("submit", e => {
  e.preventDefault();
  let inputVal = input.value;

  //check if there's already a city
  const listItems = list.querySelectorAll("#city");
  const listItemsArray = Array.from(listItems);

  if (listItemsArray.length > 0) {
    const filteredArray = listItemsArray.filter(el => {
      let content = "";

      if (inputVal.includes(",")) {

        if (inputVal.split(",")[1].length > 2) {
          inputVal = inputVal.split(",")[0];
          content = el
            .querySelector(".city-name span")
            .textContent.toLowerCase();
        } else {
          content = el.querySelector(".city-name").dataset.name.toLowerCase();
        }
      } else {
        content = el.querySelector(".city-name span").textContent.toLowerCase();
      }
      return content == inputVal.toLowerCase();
    });

    if (filteredArray.length > 0) {
      msg.textContent = `You already know the weather for ${
        filteredArray[0].querySelector(".city-name span").textContent
      } ...otherwise be more specific by providing the country code as well`;
      form.reset();
      input.focus();
      return;
    }
  }

  // fetch weather data, including nested fetch statement to get UV-index
  // adapted from https://stackoverflow.com/questions/40981040/using-a-fetch-inside-another-fetch-in-javascript

  const urlOuter = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;
  let urlInner = '';
  
  const resultPromise = fetch(urlOuter)
    .then(responseO => responseO.json())
    .then(data => {
      const { main, coord, name, sys, weather, wind, dt } = data;
      const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
        weather[0]["icon"]
      }.svg`;
      
      const unixTime = data.dt;
      const date = new Date(unixTime*1000);
      const date1= date.toLocaleDateString("en-US");

      const neededValue1 = data.coord.lon;
      const neededValue2 = data.coord.lat;

      urlInner = `https://api.openweathermap.org/data/2.5/onecall?lat=${neededValue2}&lon=${neededValue1}&exclude=hourly,daily&appid=${apiKey}`;
      return fetch(urlInner)
        .then(responseI => responseI.json())
        .then(data2 => {
          const {current} = data2;
          // localStorage.setItem("uvi", JSON.stringify(data2));
          // console.log(data2);

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

          }).catch(err => {
            console.error('Failed to fetch - ' + urlInner);    
        });

        }).catch(err => {
          console.error('Failed to fetch - ' + urlOuter);
      });
    });

    const uvi = JSON.parse(localStorage.getItem("uvi")) || [];
    console.log(uvi);

    function colorCode(uvi) {
      console.log("uvi value inside cc f", uvi)
    // const uviID = uvi.id;
    // uvi.removeClass(".favorable .moderate .severe");
      
      if (uvi < 2) {
        $("#UVI").children('span').addClass("favorable");
      } else if (uvi >= 2 & uvi < 5) {
        $("UVI").children('span').addClass("moderate");
      } else {
        $("UVI").children('span').addClass("severe");
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

    for (var i = 0; i < cities.length; i++) {
      var cityEl = document.createElement("a");
      // cityEl.classList = "list-item flex-row justify-space-between align-center";
      // repoEl.setAttribute("href", "./single-repo.html?repo=" + repoName);
      var titleEl = document.createElement("span");
      titleEl.textContent = cities[i].name;
      cityEl.appendChild(titleEl);
      cityList.appendChild(cityEl);
    } 
    
    // cityList.innerHTML = cities
    //     .map(cities => {
    //         return `<span>${cities.name}</span>`;
    //     })
    //     .join("");

}

submit_btn.addEventListener("click", cityListHandler);
