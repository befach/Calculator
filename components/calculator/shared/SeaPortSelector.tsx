'use client';

import { useState, useRef, useEffect } from 'react';
import { Anchor, ChevronDown, Search, X } from 'lucide-react';
import { SEA_PORTS, type SeaPort } from '@/core/seaFreightRates';

interface Props {
  value: string;
  onChange: (port: SeaPort) => void;
}

export default function SeaPortSelector({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPort = SEA_PORTS.find(p => p.code === value);
  const filteredPorts = search
    ? SEA_PORTS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()) ||
        p.state.toLowerCase().includes(search.toLowerCase())
      )
    : SEA_PORTS;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-brand-brown">Destination Sea Port</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-all ${
            isOpen
              ? 'border-brand-orange ring-2 ring-brand-orange/30'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-brand-orange" />
            {selectedPort ? (
              <span className="text-brand-brown font-medium">{selectedPort.name}</span>
            ) : (
              <span className="text-gray-400">Select a sea port</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search ports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-orange/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredPorts.map((port) => (
                <button
                  key={port.code}
                  type="button"
                  onClick={() => {
                    onChange(port.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    value === port.code ? 'bg-brand-orange/5' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-brand-brown">{port.name}</p>
                  <p className="text-[11px] text-gray-500">{port.city}, {port.state}</p>
                </button>
              ))}
              {filteredPorts.length === 0 && (
                <p className="px-3 py-4 text-sm text-gray-400 text-center">No ports found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
