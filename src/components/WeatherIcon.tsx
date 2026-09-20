import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Umbrella,
  Footprints,
  Activity,
  Flame,
  Wind,
  Car,
  Sparkles,
  AlertTriangle,
  Droplets,
  Compass,
  Thermometer,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = 'w-6 h-6', size }) => {
  switch (name) {
    case 'Sun':
      return <Sun className={className} size={size} />;
    case 'SunDim':
      return <Sun className={className} size={size} />;
    case 'CloudSun':
      return <CloudSun className={className} size={size} />;
    case 'Cloud':
      return <Cloud className={className} size={size} />;
    case 'CloudFog':
      return <CloudFog className={className} size={size} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={className} size={size} />;
    case 'CloudRain':
      return <CloudRain className={className} size={size} />;
    case 'CloudSnow':
      return <CloudSnow className={className} size={size} />;
    case 'Snowflake':
      return <Snowflake className={className} size={size} />;
    case 'CloudLightning':
      return <CloudLightning className={className} size={size} />;
    case 'Umbrella':
      return <Umbrella className={className} size={size} />;
    case 'Footprints':
      return <Footprints className={className} size={size} />;
    case 'Activity':
      return <Activity className={className} size={size} />;
    case 'Flame':
      return <Flame className={className} size={size} />;
    case 'Wind':
      return <Wind className={className} size={size} />;
    case 'Car':
      return <Car className={className} size={size} />;
    case 'Sparkles':
      return <Sparkles className={className} size={size} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} size={size} />;
    case 'Droplets':
      return <Droplets className={className} size={size} />;
    case 'Compass':
      return <Compass className={className} size={size} />;
    case 'Thermometer':
      return <Thermometer className={className} size={size} />;
    case 'Eye':
      return <Eye className={className} size={size} />;
    case 'ArrowUpRight':
      return <ArrowUpRight className={className} size={size} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} size={size} />;
    case 'Zap':
      return <Zap className={className} size={size} />;
    default:
      return <CloudSun className={className} size={size} />;
  }
};
