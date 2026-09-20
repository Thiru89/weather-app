import { WeatherConditionInfo, WeatherInsight } from '../types/weather';

interface RecommendationParams {
  temperature: number;
  weathercode: number;
  condition: WeatherConditionInfo;
  windSpeed: number;
  humidity: number;
  precipitationSum: number;
}

export function generateWeatherInsights(params: RecommendationParams): WeatherInsight[] {
  const { temperature, condition, windSpeed, humidity, precipitationSum } = params;
  const insights: WeatherInsight[] = [];

  // 1. Umbrella & Precipitation Insight
  const isWet =
    precipitationSum > 0.2 ||
    ['rain', 'drizzle', 'thunderstorm'].includes(condition.category) ||
    condition.severity === 'severe';

  if (isWet) {
    const rainLevel = precipitationSum > 10 || condition.category === 'thunderstorm' ? 'Heavy' : 'Scattered';
    insights.push({
      id: 'umbrella-yes',
      title: 'Umbrella Essential',
      category: 'umbrella',
      advice: `${rainLevel} precipitation detected (~${precipitationSum.toFixed(1)} mm). Keep an umbrella or waterproof jacket with you.`,
      type: 'warning',
      icon: 'Umbrella',
    });
  } else {
    insights.push({
      id: 'umbrella-no',
      title: 'No Umbrella Needed',
      category: 'umbrella',
      advice: `Dry conditions expected with zero rain chance today. Enjoy the clear skies.`,
      type: 'success',
      icon: 'Sun',
    });
  }

  // 2. Outdoor Activities Insight
  if (condition.category === 'thunderstorm') {
    insights.push({
      id: 'outdoor-storm',
      title: 'Indoor Activities Recommended',
      category: 'outdoor',
      advice: 'Lightning and thunderstorms in the forecast. Avoid open parks, trails, and outdoor sports.',
      type: 'warning',
      icon: 'AlertTriangle',
    });
  } else if (condition.category === 'rain' || condition.category === 'snow') {
    insights.push({
      id: 'outdoor-wet',
      title: 'Wet Grounds for Outdoors',
      category: 'outdoor',
      advice: 'Slick surfaces and ongoing precipitation. Consider gym sessions or covered walking routes.',
      type: 'caution',
      icon: 'Footprints',
    });
  } else if (temperature >= 16 && temperature <= 25 && windSpeed < 25) {
    insights.push({
      id: 'outdoor-great',
      title: 'Great Day for Outdoor Activities',
      category: 'outdoor',
      advice: `Optimal thermal comfort (${Math.round(temperature)}°C) and gentle breezes. Perfect for running, cycling, or picnics.`,
      type: 'success',
      icon: 'Activity',
    });
  } else if (temperature > 30) {
    insights.push({
      id: 'outdoor-heat',
      title: 'High Heat Alert',
      category: 'outdoor',
      advice: 'Elevated daytime temperatures. Hydrate frequently and avoid strenuous workouts during peak afternoon hours.',
      type: 'caution',
      icon: 'Flame',
    });
  } else if (temperature < 5) {
    insights.push({
      id: 'outdoor-cold',
      title: 'Brisk Cold Outdoors',
      category: 'outdoor',
      advice: 'Cold ambient air. Warm up thoroughly before running and protect exposed skin from wind chill.',
      type: 'info',
      icon: 'Wind',
    });
  } else {
    insights.push({
      id: 'outdoor-moderate',
      title: 'Fair for Outdoor Activities',
      category: 'outdoor',
      advice: 'Mild conditions overall. Comfortable for casual strolls, park visits, and everyday commuting.',
      type: 'info',
      icon: 'Activity',
    });
  }

  // 3. Driving & Commute Conditions
  if (condition.category === 'fog') {
    insights.push({
      id: 'driving-fog',
      title: 'Drive Carefully: Reduced Visibility',
      category: 'driving',
      advice: 'Dense fog layers ahead. Use low-beam headlights, maintain generous following distance, and watch for slow traffic.',
      type: 'warning',
      icon: 'Car',
    });
  } else if (condition.category === 'snow' || condition.severity === 'severe' || condition.category === 'thunderstorm') {
    insights.push({
      id: 'driving-hazard',
      title: 'Drive with Caution: Adverse Weather',
      category: 'driving',
      advice: 'Slick roadways and sudden bursts of precipitation. Expect slower travel times and brake earlier.',
      type: 'warning',
      icon: 'Car',
    });
  } else if (isWet || windSpeed > 35) {
    insights.push({
      id: 'driving-rain',
      title: 'Drive Carefully: Wet Roadways',
      category: 'driving',
      advice: `Wet pavements and wind gusts of ${Math.round(windSpeed)} km/h. Keep both hands on the wheel and allow extra stopping distance.`,
      type: 'caution',
      icon: 'Car',
    });
  } else {
    insights.push({
      id: 'driving-optimal',
      title: 'Optimal Driving Conditions',
      category: 'driving',
      advice: 'Clear visibility and dry roadways across major transit routes. Smooth commuting expected.',
      type: 'success',
      icon: 'Car',
    });
  }

  // 4. Clothing & Attire Suggestion
  if (temperature < 0) {
    insights.push({
      id: 'clothing-freezing',
      title: 'Heavy Winter Layers',
      category: 'clothing',
      advice: 'Sub-zero temperatures. Thermal innerwear, heavy coat, beanie, and insulated gloves advised.',
      type: 'info',
      icon: 'Sparkles',
    });
  } else if (temperature < 12) {
    insights.push({
      id: 'clothing-chilly',
      title: 'Warm Jacket & Sweater',
      category: 'clothing',
      advice: 'Chilly air throughout the day. A wind-resistant jacket or fleece will keep you comfortable.',
      type: 'info',
      icon: 'Sparkles',
    });
  } else if (temperature < 20) {
    insights.push({
      id: 'clothing-mild',
      title: 'Light Layers Recommended',
      category: 'clothing',
      advice: 'Mild weather. A casual hoodie, long-sleeve tee, or light denim jacket is well-suited.',
      type: 'info',
      icon: 'Sparkles',
    });
  } else if (temperature <= 27) {
    insights.push({
      id: 'clothing-warm',
      title: 'Breathable Everyday Wear',
      category: 'clothing',
      advice: 'Comfortable warm conditions. Breathable cotton garments or lightweight short-sleeve tops work best.',
      type: 'success',
      icon: 'Sparkles',
    });
  } else {
    insights.push({
      id: 'clothing-hot',
      title: 'Summer Essentials & Sunglasses',
      category: 'clothing',
      advice: 'High temperatures. Wear ultra-light linen or sportswear, apply sunscreen, and carry sunglasses.',
      type: 'caution',
      icon: 'Sparkles',
    });
  }

  return insights;
}
