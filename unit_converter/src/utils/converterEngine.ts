export type CategoryId = 'length' | 'weight' | 'temperature' | 'area' | 'volume';

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // MaterialCommunityIcons name
  units: Unit[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'length',
    name: 'Length',
    icon: 'ruler',
    units: [
      { id: 'mm', name: 'Millimeter', symbol: 'mm' },
      { id: 'cm', name: 'Centimeter', symbol: 'cm' },
      { id: 'm', name: 'Meter', symbol: 'm' },
      { id: 'km', name: 'Kilometer', symbol: 'km' },
      { id: 'in', name: 'Inch', symbol: 'in' },
      { id: 'ft', name: 'Foot', symbol: 'ft' },
      { id: 'yd', name: 'Yard', symbol: 'yd' },
      { id: 'mi', name: 'Mile', symbol: 'mi' },
    ],
  },
  {
    id: 'weight',
    name: 'Weight & Mass',
    icon: 'weight-kilogram',
    units: [
      { id: 'mg', name: 'Milligram', symbol: 'mg' },
      { id: 'g', name: 'Gram', symbol: 'g' },
      { id: 'kg', name: 'Kilogram', symbol: 'kg' },
      { id: 'oz', name: 'Ounce', symbol: 'oz' },
      { id: 'lb', name: 'Pound', symbol: 'lb' },
      { id: 'st', name: 'Stone', symbol: 'st' },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: 'thermometer',
    units: [
      { id: 'C', name: 'Celsius', symbol: '°C' },
      { id: 'F', name: 'Fahrenheit', symbol: '°F' },
      { id: 'K', name: 'Kelvin', symbol: 'K' },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    icon: 'floor-plan',
    units: [
      { id: 'sqm', name: 'Square Meter', symbol: 'm²' },
      { id: 'sqkm', name: 'Square Kilometer', symbol: 'km²' },
      { id: 'sqft', name: 'Square Foot', symbol: 'ft²' },
      { id: 'ac', name: 'Acre', symbol: 'ac' },
      { id: 'ha', name: 'Hectare', symbol: 'ha' },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: 'beaker-outline',
    units: [
      { id: 'ml', name: 'Milliliter', symbol: 'ml' },
      { id: 'l', name: 'Liter', symbol: 'l' },
      { id: 'cup', name: 'Cup', symbol: 'cup' },
      { id: 'pt', name: 'Pint', symbol: 'pt' },
      { id: 'qt', name: 'Quart', symbol: 'qt' },
      { id: 'gal', name: 'Gallon', symbol: 'gal' },
    ],
  },
];

const LENGTH_RATES: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1.0,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const WEIGHT_RATES: Record<string, number> = {
  mg: 0.000001,
  g: 0.001,
  kg: 1.0,
  oz: 0.028349523125,
  lb: 0.45359237,
  st: 6.35029318,
};

const AREA_RATES: Record<string, number> = {
  sqm: 1.0,
  sqkm: 1000000,
  sqft: 0.09290304,
  ac: 4046.8564224,
  ha: 10000,
};

const VOLUME_RATES: Record<string, number> = {
  ml: 0.001,
  l: 1.0,
  cup: 0.2365882365,
  pt: 0.473176473,
  qt: 0.946352946,
  gal: 3.785411784,
};

const convertTemperature = (value: number, from: string, to: string): number => {
  let celsius = 0;
  if (from === 'C') {
    celsius = value;
  } else if (from === 'F') {
    celsius = ((value - 32) * 5) / 9;
  } else if (from === 'K') {
    celsius = value - 273.15;
  } else {
    return value;
  }

  if (to === 'C') {
    return celsius;
  } else if (to === 'F') {
    return (celsius * 9) / 5 + 32;
  } else if (to === 'K') {
    return celsius + 273.15;
  }
  return value;
};

export const convertValue = (
  value: number,
  fromUnit: string,
  toUnit: string,
  category: CategoryId
): number => {
  if (fromUnit === toUnit) return value;
  if (isNaN(value)) return 0;

  if (category === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit);
  }

  let rates: Record<string, number>;
  switch (category) {
    case 'length':
      rates = LENGTH_RATES;
      break;
    case 'weight':
      rates = WEIGHT_RATES;
      break;
    case 'area':
      rates = AREA_RATES;
      break;
    case 'volume':
      rates = VOLUME_RATES;
      break;
    default:
      return 0;
  }

  const fromRate = rates[fromUnit];
  const toRate = rates[toUnit];
  if (fromRate === undefined || toRate === undefined) return 0;

  // Convert to base unit first, then to target unit
  const valueInBase = value * fromRate;
  return valueInBase / toRate;
};

export const formatResult = (value: number): string => {
  if (value === 0) return '0';
  if (isNaN(value) || !isFinite(value)) return '0';

  const absVal = Math.abs(value);
  
  // Use scientific notation for very large or tiny decimal numbers
  if (absVal > 1e12 || (absVal < 1e-6 && absVal > 0)) {
    return value.toExponential(5);
  }

  // Otherwise, format up to 8 decimal places and strip trailing zeros
  const formatted = value.toFixed(8);
  return parseFloat(formatted).toString();
};
