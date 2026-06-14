import React, { useState, useEffect } from "react";

const weatherCodeMap = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function Weather() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getHourlyValue = (hourly, time, field) => {
    if (!hourly || !hourly.time) return null;
    const index = hourly.time.indexOf(time);
    return index >= 0 ? hourly[field]?.[index] ?? null : null;
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError("");

      const weatherUrl =
        "https://api.open-meteo.com/v1/forecast?latitude=17.38&longitude=78.48&current_weather=true&hourly=relativehumidity_2m,pressure_msl,visibility,uv_index,precipitation_probability&daily=sunrise,sunset,uv_index_max&forecast_days=1&timezone=Asia%2FKolkata";

      const [weatherResponse, aqiResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(
          "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=17.38&longitude=78.48&hourly=us_aqi&forecast_days=1&timezone=Asia%2FKolkata"
        ),
      ]);

      if (!weatherResponse.ok) {
        throw new Error("Unable to fetch weather data");
      }

      if (!aqiResponse.ok) {
        throw new Error("Unable to fetch air quality data");
      }

      const weatherData = await weatherResponse.json();
      const aqiData = await aqiResponse.json();
      const current = weatherData.current_weather;

      const humidity = getHourlyValue(weatherData.hourly, current.time, "relativehumidity_2m");
      const pressure = getHourlyValue(weatherData.hourly, current.time, "pressure_msl");
      const visibility = getHourlyValue(weatherData.hourly, current.time, "visibility");
      const uvIndex = getHourlyValue(weatherData.hourly, current.time, "uv_index");
      const chanceOfRain = getHourlyValue(weatherData.hourly, current.time, "precipitation_probability");
      const aqi = getHourlyValue(aqiData.hourly, current.time, "us_aqi");

      setWeather({
        location: "Hyderabad",
        temperatureC: current.temperature,
        temperatureF: (current.temperature * 9) / 5 + 32,
        conditionCode: current.weathercode,
        condition: weatherCodeMap[current.weathercode] || "Unknown",
        humidity,
        pressure,
        visibility,
        uvIndex,
        chanceOfRain,
        sunrise: weatherData.daily?.sunrise?.[0] || null,
        sunset: weatherData.daily?.sunset?.[0] || null,
        windSpeedKmh: current.windspeed,
        windSpeedMs: current.windspeed / 3.6,
        windDirection: current.winddirection,
        aqi,
      });
    } catch (err) {
      setError(err.message || "Unable to fetch weather details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return <h2>Loading Weather Information...</h2>;
  }

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  return (
    <div className="weather-container">
      <h1>Weather Information System</h1>
      <h3>Location: {weather.location}</h3>

      <div className="weather-grid">
        <div className="weather-stat">
          <span className="label">Temperature</span>
          <span className="value">{weather.temperatureC.toFixed(1)} °C / {weather.temperatureF.toFixed(1)} °F</span>
        </div>

        <div className="weather-stat">
          <span className="label">Condition</span>
          <span className="value">{weather.condition}</span>
        </div>

        <div className="weather-stat">
          <span className="label">Humidity</span>
          <span className="value">{weather.humidity != null ? `${weather.humidity}%` : "N/A"}</span>
        </div>

        <div className="weather-stat">
          <span className="label">Wind Speed</span>
          <span className="value">{weather.windSpeedKmh.toFixed(1)} km/h ({weather.windSpeedMs.toFixed(1)} m/s)</span>
        </div>

        <div className="weather-stat">
          <span className="label">Wind Direction</span>
          <span className="value">{weather.windDirection}°</span>
        </div>

        <div className="weather-stat">
          <span className="label">Pressure</span>
          <span className="value">{weather.pressure != null ? `${weather.pressure} hPa` : "N/A"}</span>
        </div>

        <div className="weather-stat">
          <span className="label">Visibility</span>
          <span className="value">{weather.visibility != null ? `${weather.visibility} km` : "N/A"}</span>
        </div>

        <div className="weather-stat">
          <span className="label">UV Index</span>
          <span className="value">{weather.uvIndex != null ? weather.uvIndex : "N/A"}</span>
        </div>

        <div className="weather-stat">
          <span className="label">Chance of Rain</span>
          <span className="value">{weather.chanceOfRain != null ? `${weather.chanceOfRain}%` : "N/A"}</span>
        </div>

        <div className="weather-stat">
          <span className="label">Sunrise</span>
          <span className="value">{weather.sunrise || "N/A"}</span>
        </div>

        <div className="weather-stat">
          <span className="label">Sunset</span>
          <span className="value">{weather.sunset || "N/A"}</span>
        </div>

        <div className="weather-stat">
          <span className="label">Air Quality Index</span>
          <span className="value">{weather.aqi != null ? weather.aqi : "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

export default Weather;
