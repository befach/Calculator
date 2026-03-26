'use client';

import { useState, useMemo } from 'react';
import { Truck, MapPin, Anchor, Search } from 'lucide-react';
import { INDIAN_CITIES } from '@/core/inlandRates';
import type { ClearancePort } from '@/core/inlandRates';

interface Props {
  includeInlandDelivery: boolean;
  clearancePort: string;
  destinationCity: string;
  inlandZone: string;
  onFieldChange: (field: string, value: unknown) => void;
}

const ZONE_CARDS: { zone: 'A' | 'B' | 'C' | 'D' | 'E'; label: string; desc: string }[] = [
  { zone: 'A', label: 'Zone A', desc: 'Local / Same City (0–50 km)' },
  { zone: 'B', label: 'Zone B', desc: 'Intra-State (50–500 km)' },
  { zone: 'C', label: 'Zone C', desc: 'Metro-to-Metro (500–1,400 km)' },
  { zone: 'D', label: 'Zone D', desc: 'Rest of India (1,400–2,500 km)' },
  { zone: 'E', label: 'Zone E', desc: 'Remote / NE (2,500+ km)' },
];

const CLEARANCE_PORTS: ClearancePort[] = ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad', 'Kolkata'];

export default function InlandDeliverySection({
  includeInlandDelivery,
  clearancePort,
  destinationCity,
  inlandZone,
  onFieldChange,
}: Props) {
  const [portSearch, setPortSearch] = useState('');
  const [showPortDropdown, setShowPortDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showZones, setShowZones] = useState(false);

  const filteredPorts = useMemo(() => {
    if (!portSearch) return CLEARANCE_PORTS;
    const q = portSearch.toLowerCase();
    return CLEARANCE_PORTS.filter((p) => p.toLowerCase().includes(q));
  }, [portSearch]);

  const cities = useMemo(() => INDIAN_CITIES.map((c) => c.name).sort(), []);

  const filteredCities = useMemo(() => {
    if (!citySearch) return cities;
    const q = citySearch.toLowerCase();
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [cities, citySearch]);

  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      {/* Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={includeInlandDelivery}
            onChange={(e) => onFieldChange('includeInlandDelivery', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-brand-orange peer-checked:border-brand-orange transition-all flex items-center justify-center">
            {includeInlandDelivery && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-orange" />
          <span className="text-sm font-medium text-brand-brown">Include Inland Delivery</span>
        </div>
      </label>

      {/* Expanded Section */}
      {includeInlandDelivery && (
        <div className="mt-4 space-y-4 pl-2 sm:pl-8">
          {/* Clearance Port */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5" />
                Clearance Port <span className="text-red-400">*</span>
              </span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={showPortDropdown ? portSearch : clearancePort}
                onChange={(e) => {
                  setPortSearch(e.target.value);
                  setShowPortDropdown(true);
                }}
                onFocus={() => {
                  setShowPortDropdown(true);
                  setPortSearch('');
                }}
                onBlur={() => setTimeout(() => setShowPortDropdown(false), 200)}
                placeholder="Search clearance port..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
              />
            </div>
            {showPortDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredPorts.map((port) => (
                  <button
                    key={port}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onFieldChange('clearancePort', port);
                      // Auto-fill zone if city is already selected
                      if (destinationCity) {
                        const cityData = INDIAN_CITIES.find((c) => c.name === destinationCity);
                        if (cityData && cityData.zones[port]) {
                          onFieldChange('inlandZone', cityData.zones[port]);
                        }
                      }
                      setPortSearch('');
                      setShowPortDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-brand-orange/5"
                  >
                    {port}
                  </button>
                ))}
                {filteredPorts.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-400">No ports found</div>
                )}
              </div>
            )}
          </div>

          {/* Destination City */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Destination City
              </span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={showCityDropdown ? citySearch : destinationCity}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => {
                  setShowCityDropdown(true);
                  setCitySearch('');
                }}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                placeholder="Search Indian city..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
              />
            </div>
            {showCityDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredCities.slice(0, 30).map((city) => (
                  <button
                    key={city}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onFieldChange('destinationCity', city);
                      // Auto-fill zone based on city + clearance port
                      const cityData = INDIAN_CITIES.find((c) => c.name === city);
                      if (cityData && clearancePort && cityData.zones[clearancePort as ClearancePort]) {
                        onFieldChange('inlandZone', cityData.zones[clearancePort as ClearancePort]);
                      }
                      setCitySearch('');
                      setShowCityDropdown(false);
                      setShowZones(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-brand-orange/5"
                  >
                    {city}
                  </button>
                ))}
                {filteredCities.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-400">No cities found</div>
                )}
              </div>
            )}
          </div>

          {/* "Didn't find your city?" fallback */}
          {!showZones && (
            <button
              type="button"
              onClick={() => {
                setShowZones(true);
                onFieldChange('destinationCity', '');
                onFieldChange('inlandZone', '');
              }}
              className="text-xs text-brand-orange hover:underline transition-colors"
            >
              You didn&apos;t find your city?
            </button>
          )}

          {/* Delivery Region Zone Cards (shown only when user clicks fallback) */}
          {showZones && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Region <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ZONE_CARDS.map((z) => (
                  <button
                    key={z.zone}
                    type="button"
                    onClick={() => onFieldChange('inlandZone', z.zone)}
                    className={`p-2.5 sm:p-3 rounded-lg border-2 text-left transition-all ${inlandZone === z.zone
                        ? 'border-brand-orange bg-brand-orange/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <p className={`text-xs sm:text-sm font-semibold ${inlandZone === z.zone ? 'text-brand-orange' : 'text-brand-brown'}`}>
                      {z.label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight">{z.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
