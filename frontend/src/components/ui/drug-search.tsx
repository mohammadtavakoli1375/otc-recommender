'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Drug {
  id: string;
  name_fa: string;
  name_en: string;
  generic_name: string;
  min_age_months?: number;
  max_age_years?: number;
}

interface DrugSearchProps {
  drugs: Drug[];
  selectedDrug: string;
  onDrugSelect: (drugId: string) => void;
  placeholder?: string;
  label?: string;
  ageFilter?: 'INFANT' | 'CHILD' | 'ADULT' | null;
  specialConditions?: string[];
}

export function DrugSearch({
  drugs,
  selectedDrug,
  onDrugSelect,
  placeholder = "نام دارو را تایپ کنید یا از لیست انتخاب کنید",
  label = "انتخاب دارو",
  ageFilter = null,
  specialConditions = []
}: DrugSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>(drugs);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected drug info
  const selectedDrugInfo = drugs.find(drug => drug.id === selectedDrug);

  // Filter drugs based on search term, age, and special conditions
  useEffect(() => {
    let filtered = drugs;

    // Apply age filter
    if (ageFilter) {
      filtered = filtered.filter(drug => {
        if (ageFilter === 'INFANT' && drug.min_age_months && drug.min_age_months > 24) return false;
        if (ageFilter === 'CHILD' && drug.min_age_months && drug.min_age_months > 144) return false; // 12 years
        if (ageFilter === 'ADULT' && drug.max_age_years && drug.max_age_years < 12) return false;
        return true;
      });
    }

    // Apply special conditions filter
     if (specialConditions.length > 0) {
       filtered = filtered.filter(() => {
         // This would need contraindications data from the drug object
         // For now, we'll implement basic filtering
         return true; // Placeholder - would check drug.contraindications
       });
     }

    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(drug => (
        drug.name_fa.toLowerCase().includes(searchLower) ||
        drug.name_en.toLowerCase().includes(searchLower) ||
        drug.generic_name.toLowerCase().includes(searchLower)
      ));
    }

    setFilteredDrugs(filtered);
    setHighlightedIndex(-1);
  }, [searchTerm, drugs, ageFilter, specialConditions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredDrugs.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredDrugs.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredDrugs[highlightedIndex]) {
          handleDrugSelect(filteredDrugs[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle drug selection
  const handleDrugSelect = (drug: Drug) => {
    onDrugSelect(drug.id);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur with delay to allow clicks
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Clear selection
  const clearSelection = () => {
    onDrugSelect('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-2">
      <Label htmlFor="drug-search">{label}</Label>
      
      {/* Selected Drug Display */}
      {selectedDrugInfo && !isOpen && (
        <div className="flex items-center justify-between p-3 border rounded-md bg-blue-50 border-blue-200">
          <div className="flex-1">
            <div className="font-medium text-blue-900">
              {selectedDrugInfo.name_fa}
            </div>
            <div className="text-sm text-blue-700">
              {selectedDrugInfo.name_en} • {selectedDrugInfo.generic_name}
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Input */}
      {(!selectedDrugInfo || isOpen) && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              id="drug-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pr-10"
              autoComplete="off"
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <Card 
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto border shadow-lg"
            >
              {filteredDrugs.length > 0 ? (
                <div className="py-1">
                  {filteredDrugs.map((drug, index) => (
                    <button
                      key={drug.id}
                      onClick={() => handleDrugSelect(drug)}
                      className={cn(
                        "w-full text-right px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors",
                        index === highlightedIndex && "bg-blue-50 text-blue-900",
                        selectedDrug === drug.id && "bg-blue-100 text-blue-900"
                      )}
                      type="button"
                    >
                      <div className="font-medium">{drug.name_fa}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {drug.name_en} • {drug.generic_name}
                      </div>
                      {drug.min_age_months && (
                        <div className="text-xs text-gray-500 mt-1">
                          حداقل سن: {drug.min_age_months} ماه
                          {drug.max_age_years && ` • حداکثر سن: ${drug.max_age_years} سال`}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <div>هیچ داروی مطابقی یافت نشد</div>
                  <div className="text-sm mt-1">لطفاً عبارت جستجو را تغییر دهید</div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Search Results Count */}
      {isOpen && searchTerm && (
        <div className="text-xs text-gray-500">
          {filteredDrugs.length} دارو یافت شد
        </div>
      )}
    </div>
  );
}