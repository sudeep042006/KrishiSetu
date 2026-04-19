import React from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Weather condition → background image mapping
// IMAGES YOU NEED TO ADD in your assets/weather/ folder:
//   sunny.jpg       — bright sunny farm/field
//   haze.jpg        — hazy/foggy morning farm
//   cloudy.jpg      — overcast cloudy sky over fields
//   rainy.jpg       — rain on green crops
//   night.jpg       — night sky over farm
const WEATHER_IMAGES = {
  sunny: {uri: 'https://res.cloudinary.com/dwji50nl9/image/upload/v1776281240/Partly_Cloud_Image_xfpkea.png'},
  haze:  {uri: 'https://res.cloudinary.com/dwji50nl9/image/upload/v1776281241/Haze_wsscho.png'},
  cloudy: {uri: 'https://res.cloudinary.com/dwji50nl9/image/upload/v1776281237/overCast_hgh8xu.png'},
  rainy:  {uri: 'https://res.cloudinary.com/dwji50nl9/image/upload/v1776281234/Rainy_sokhvw.png'},
  night:  {uri: 'https://res.cloudinary.com/dwji50nl9/image/upload/v1776281231/Night_jlsjex.png'},
  mist: {uri: 'https://res.cloudinary.com/dwji50nl9/image/upload/v1776416632/ChatGPT_Image_Apr_17_2026_02_23_37_PM_asqukv.png'},
};

// Weather condition emoji map
const WEATHER_EMOJI = {
  // OpenWeatherMap descriptions (kept for backward compat)
  'clear sky': '☀️',
  'few clouds': '🌤️',
  'scattered clouds': '⛅',
  'broken clouds': '🌥️',
  'overcast clouds': '☁️',
  'light rain': '🌦️',
  'moderate rain': '🌧️',
  'heavy intensity rain': '⛈️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'haze': '',
  'fog': '🌫️',
  'smoke': '🌫️',
  'dust': '🌫️',
  // WeatherAPI.com condition texts
  'sunny': '☀️',
  'clear': '🌙',
  'partly cloudy': '⛅',
  'cloudy': '☁️',
  'overcast': '☁️',
  'mist': '🌫️',
  'patchy rain possible': '🌦️',
  'light rain shower': '🌦️',
  'moderate rain at times': '🌧️',
  'light drizzle': '🌦️',
  'freezing drizzle': '🌨️',
  'heavy rain': '⛈️',
  'heavy freezing drizzle': '🌨️',
  'blizzard': '❄️',
  'blowing snow': '🌨️',
  'thundery outbreaks possible': '⛈️',
  'patchy light drizzle': '🌦️',
  'patchy light rain': '🌦️',
  'moderate or heavy rain shower': '⛈️',
  'torrential rain shower': '⛈️',
  'patchy snow possible': '🌨️',
  'patchy sleet possible': '🌨️',
  'fog': '🌫️',
  'freezing fog': '🌫️',
  'smoke': '🌫️',
  'dust': '🌫️',
  'haze': '🌫️',
};

const getWeatherKey = (condition, isDay) => {
  if (!isDay) return 'night';
  const c = condition?.toLowerCase() || '';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) return 'rainy';
  if (c.includes('cloud')) return 'cloudy';
  if (c.includes('haze') || c.includes('mist') || c.includes('fog') || c.includes('smoke') || c.includes('dust')) return 'haze';
  if (c.includes('clear') || c.includes('sun')) return 'sunny';
  return 'sunny';
};

const getGradient = (condition, isDay) => {
  if (!isDay) return ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.2)'];

  return ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.08)'];
};

const getAccent = (condition, isDay) => {
  if (!isDay) return '#7eb8f7';
  const c = condition?.toLowerCase() || '';
  if (c.includes('rain') || c.includes('thunder')) return '#74b9ff';
  if (c.includes('cloud')) return '#cbd5e0';
  if (c.includes('haze') || c.includes('mist') || c.includes('fog')) return '#b8d4b0';
  return '#f6d860';
};

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const WeatherCard = ({ weather, loading, containerStyle, isCompact }) => {
  if (loading || !weather) {
    return (
      <View style={[styles.loadingContainer, containerStyle]}>
        <ActivityIndicator size="large" color="#123524" />
        <Text style={styles.loadingText}>Fetching farm weather... 🌱</Text>
      </View>
    );
  }

  const locationName = weather.name || '';
  const region = weather.sys?.country || '';
  const isDay = weather.weather[0].icon?.includes('d') ?? true;
  const conditionMain = weather.weather[0].main || '';
  const descriptionText = weather.weather[0].description || '';
  const tempC = Math.round(weather.main.temp ?? 0);
  const tempHigh = Math.round(weather.main.temp_max ?? weather.main.temp ?? 0);
  const tempLow = Math.round(weather.main.temp_min ?? weather.main.temp ?? 0);
  const humidity = weather.main.humidity ?? 0;
  // wind.speed is stored in m/s, so *3.6 gives km/h
  const windKph = Math.round((weather.wind != null ? weather.wind.speed ?? 0 : 0) * 3.6);
  const feelsLike = Math.round(weather.main.feels_like ?? weather.main.temp ?? 0);

  const weatherKey = getWeatherKey(conditionMain, isDay);
  const gradientColors = getGradient(conditionMain, isDay);
  const accentColor = getAccent(conditionMain, isDay);
  const emoji = WEATHER_EMOJI[descriptionText.toLowerCase()] || (isDay ? '🌤️' : '🌙');

  return (
    <View style={[styles.cardWrapper, containerStyle]}>
      {/* Background scenic image */}
      <Image source={WEATHER_IMAGES[weatherKey]} style={styles.bgImage} resizeMode="cover" />

      {/* Gradient overlay */}
      <LinearGradient colors={gradientColors} style={[styles.gradientOverlay, isCompact && { padding: 14 }]}>

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.locationRow}>
            <Text style={[styles.locationPin, { color: accentColor }]}>📍</Text>
            <Text style={styles.locationText}>
              {locationName}{region ? `, ${region}` : ''}
            </Text>
          </View>
          <View style={[styles.liveBadge, { borderColor: accentColor + '66', backgroundColor: accentColor + '28' }]}>
            <View style={[styles.liveDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.liveBadgeText, { color: accentColor }]}>Live</Text>
          </View>
        </View>

        {/* Main weather */}
        <View style={[styles.mainRow, isCompact && { marginBottom: 0 }]}>
          <View style={styles.tempBlock}>
            <Text style={[styles.tempText, isCompact && { fontSize: 32, lineHeight: 38 }]}>{tempC}°C</Text>
            <Text style={[styles.conditionLabel, isCompact && { fontSize: 13 }]}>{capitalize(descriptionText)}</Text>
            {!isCompact && <Text style={styles.hiLow}>H: {tempHigh}°C  •  L: {tempLow}°C</Text>}
          </View>
          
        </View>

        {/* Stats */}
        {!isCompact && (
          <View style={[styles.statsRow, { borderTopColor: accentColor + '40' }]}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💧</Text>
              <Text style={styles.statValue}>{humidity}%</Text>
              <Text style={styles.statLabel}>Humidity</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: accentColor + '40' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}></Text>
              <Text style={styles.statValue}>{windKph} km/h</Text>
              <Text style={styles.statLabel}>Wind</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: accentColor + '40' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🌡️</Text>
              <Text style={styles.statValue}>{feelsLike}°C</Text>
              <Text style={styles.statLabel}>Feels Like</Text>
            </View>
          </View>
        )}

      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    height: 225,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontWeight: '600',
    color: '#123524',
    fontSize: 14,
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    height: 250,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  gradientOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationPin: { fontSize: 14 },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempBlock: { flex: 1 },
  tempText: {
    fontSize: 58,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 66,
  },
  conditionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
    marginTop: 2,
  },
  hiLow: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 3,
    fontWeight: '500',
  },
  weatherEmoji: {
    fontSize: 72,
    lineHeight: 80,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statIcon: { fontSize: 18 },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 36,
  },
});

export default WeatherCard;