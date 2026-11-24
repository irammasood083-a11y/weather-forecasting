const searchInput = document.querySelector(".search-box input");
const searchButton = document.querySelector(".search-box button");
const cityName = document.querySelector(".city-name");
const temperatureDisplay = document.querySelector(".temperature");
const humidityDisplay = document.querySelector(".humidity");
const windDisplay = document.querySelector(".wind-speed");
const pressureDisplay = document.querySelector(".pressure");
const visibilityDisplay = document.querySelector(".visibility");
const weatherIcon = document.querySelector(".weather-icon");
const conditionDisplay = document.querySelector(".weather-condition");
const dateDisplay = document.querySelector(".current-date");
const forecastCards = document.querySelectorAll(".forecast-card");

function getWeatherCondition(code) {
  if (code === 0) {
    return ["☀️", "Clear sky"];
  }
  else if (code <= 3) {
    return ["⛅", "Cloudy"];
  }
  else if (code >= 51 && code <= 57) {
    return ["🌧️", "Rain"];
  }
  else if (code >= 80 && code <= 82) {
    return ["🌧️", "Rain"];
  }
  else if (code >= 95) {
    return ["⛈️", "Thunderstorm"];
  }
  return ["🌤️", "Unknown"];
}

searchButton.addEventListener("click", async () => {
  const city = searchInput.value;
  if (city === "") {
    alert("please enter a city name");
    return;
  }
  searchButton.textContent = "Loading...";
  searchButton.disabled = true;

  //fetching latitude and longitude
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      alert("city not found");
      return;
    }


    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;
    const locationName = data.results[0].name;

    //fetching actual weather data
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min`);
    const weatherData = await weatherResponse.json();
    const daily = weatherData.daily;

    forecastCards.forEach((card, index) => {
      const forecastDate = daily.time[index];
      const maxTemp = daily.temperature_2m_max[index];
      const minTemp = daily.temperature_2m_min[index];
      const code = daily.weather_code[index];
      const [icon, condition] = getWeatherCondition(code);
      card.querySelector("h3").textContent = new window.Date(forecastDate).toLocaleDateString("en-IN", {
        weekday: "short"
      });
      card.querySelector("p").textContent = new window.Date(forecastDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
      })
      card.querySelectorAll("h3")[1].textContent = `${maxTemp}°C`;
      card.querySelectorAll("p")[1].textContent = `${minTemp}°C`;
      card.querySelector("span").textContent = icon;
      card.querySelectorAll("p")[2].textContent = condition;
    })

    const temperature = weatherData.current.temperature_2m;
    const humidity = weatherData.current.relative_humidity_2m;
    const windSpeed = weatherData.current.wind_speed_10m;
    const pressure = weatherData.current.surface_pressure;
    const visibility = weatherData.current.visibility;
    const weatherCode = weatherData.current.weather_code;
    const today = new Date();

    const [icon, condition] = getWeatherCondition(weatherCode);
    weatherIcon.textContent = icon;
    conditionDisplay.textContent = condition;

    //changing value
    dateDisplay.textContent = today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
    cityName.textContent = locationName;
    temperatureDisplay.textContent = `${temperature}°C`;
    humidityDisplay.textContent = `${humidity}%`;
    windDisplay.textContent = `${windSpeed} km/h`;
    pressureDisplay.textContent = `${pressure} hPa`;
    visibilityDisplay.textContent = `${visibility / 1000} km`;

    //after updating data
    console.log("done");
  }
  catch (error) {
    console.log(error);
    alert("Something went wrong. Please try again.");
  }
  finally {
    searchButton.textContent = "Search";
    searchButton.disabled = false;
  }
})