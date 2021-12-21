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
      //athens,gr
      if (inputVal.includes(",")) {
        //athens,grrrrrr->invalid country code, so we keep only the first part of inputVal
        if (inputVal.split(",")[1].length > 2) {
          inputVal = inputVal.split(",")[0];
          content = el
            .querySelector(".city-name span")
            .textContent.toLowerCase();
        } else {
          content = el.querySelector(".city-name").dataset.name.toLowerCase();
        }
      } else {
        //athens
        content = el.querySelector(".city-name span").textContent.toLowerCase();
      }
      return content == inputVal.toLowerCase();
    });

    if (filteredArray.length > 0) {
      msg.textContent = `You already know the weather for ${
        filteredArray[0].querySelector(".city-name span").textContent
      } ...otherwise be more specific by providing the country code as well 😉`;
      form.reset();
      input.focus();
      return;
    }
  }

  // fetch weather data
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;
  const url1 = `https://api.openweathermap.org/data/2.5/onecall?lat=33.44&lon=-94.04&exclude=hourly,daily&appid=${apiKey}`

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const { main, coord, name, sys, weather, wind, dt } = data;
      const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
        weather[0]["icon"]
      }.svg`;

      const unixTime = data.dt;
      const date = new Date(unixTime*1000);
      const date1= date.toLocaleDateString("en-US");

      const li = document.createElement("li");
      li.classList.add("city");
      const markup = `
        <h2 class="city-name" data-name="${name},${sys.country}">
          <span>${name}, ${sys.country} (${date1})</span>
        </h2>
        <div class="city-temp">Temp: ${Math.round(main.temp)}<sup>°</sup>C</div>
        <div class="city-wind">Wind: ${wind.speed} Km/h</div>
        <div class="city-humidity">Humidity: ${main.humidity}%</div>>
        <figure>
          <img class="city-icon" src="${icon}" alt="${
        weather[0]["description"]}">
          <figcaption>${weather[0]["description"]}</figcaption>
        </figure>
      `;
      li.innerHTML = markup;
      list.appendChild(li);
    })
    .catch(() => {
      msg.textContent = "Please search for a valid city 😩";
    });

  msg.textContent = "";
  form.reset();
  input.focus();

});

// save city

const cities = JSON.parse(localStorage.getItem("input")) || [];

function saveCity() {
    var cityInput = document.getElementById("input").value;
    const cityList = {
        name: cityInput
    };
    cities.push(cityList);

    localStorage.setItem("cities", JSON.stringify(cities));
    console.log(cities);
};

function cityListHandler(event) {

    saveCity();

    const cityList = document.getElementById("cityList");
    const cities = JSON.parse(localStorage.getItem("input")) || [];

    const li = document.createElement("li");
    li.classList.add("cityList");
    li.innerHTML = cities;
    list.appendChild(li);

    // cityList.innerHTML = cities
    //     .map(cities => {
    //         return `<li>${cities.name}</li>`;
    //     })
    //     .join("");
}

submit_btn.addEventListener("click", cityListHandler);