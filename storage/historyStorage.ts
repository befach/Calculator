import { safeStorage } from './safeStorage';
/**
 * Unified History Storage Layer
 * Consolidates all localStorage operations for calculation history
 */

export interface CalculationInput {
  // Product Details
  productName: string;
  hsnCode: string;
  fobValue: string;
  currency: string;
  weight?: string;
  quantity?: number;
  unitPrice?: number;
  dutyRate: string;

  // Shipping Information
  shippingMode: string;
  originPort: string;
  destinationPort: string;
  estimatedDays?: string;
  freightCost: string;
  insuranceRequired?: boolean;
  insuranceRate?: string;
  insuranceAmount?: string;

  // Additional Costs
  packingCharges?: string;
  inlandFreight?: string;
  bankCharges?: string;
  commissionRate?: string;
  customCharges?: any[];
  totalAdditionalCosts?: string;
}

export interface CalculationResult {
  cifValue: number;
  customsDuty: number;
  gst: number;
  totalLandedCost: number;
  breakdownPercentages: {
    fob: number;
    freight: number;
    insurance: number;
    duty: number;
    gst: number;
    additional: number;
  };
}

export interface CalculationMetadata {
  calculatedAt: string;
  lastModified?: string;
  isFavorite?: boolean;
  tags?: string[];
  category?: string;
  notes?: string;
  templateName?: string;
  isTemplate?: boolean;
}

export interface CalculationRecord {
  id: string;
  version: number;
  input: CalculationInput;
  result?: CalculationResult;
  metadata: CalculationMetadata;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'cost' | 'name';
  sortOrder?: 'asc' | 'desc';
  filter?: FilterCriteria;
}

export interface FilterCriteria {
  dateRange?: { start: Date; end: Date };
  costRange?: { min: number; max: number };
  shippingModes?: string[];
  searchQuery?: string;
  tags?: string[];
  categories?: string[];
  isFavorite?: boolean;
  isTemplate?: boolean;
}

export interface HistoryStats {
  totalCalculations: number;
  totalFOBValue: number;
  averageLandedCost: number;
  totalDutiesPaid: number;
  averageDutyRate: number;
  mostUsedShippingMode: string;
  topProducts: { name: string; count: number }[];
  lastCalculated: Date | null;
  thisWeekCount: number;
  lastWeekCount: number;
}

// Storage keys
const STORAGE_KEY = 'befach-calculations-v2';
const LEGACY_KEYS = [
  'befach-calculations-history',
  'landedCostCalculations',
  'calculationHistory'
];

class HistoryStorage {
  private storageKey: string;
  private migrated = false;

  constructor() {
    this.storageKey = STORAGE_KEY;
  }

  private ensureMigrated(): void {
    if (this.migrated) return;
    this.migrated = true;
    this.migrateFromLegacyStorage();
  }

  /**
   * Migrate data from old localStorage keys to new unified key
   */
  private migrateFromLegacyStorage(): void {
    try {
      const existingData = this.getRawData();

      // If new storage already has data, skip migration
      if (existingData.length > 0) {
        return;
      }

      const migratedData: CalculationRecord[] = [];
      let idCounter = 1;

      // Process each legacy key
      LEGACY_KEYS.forEach((key) => {
        const rawData = safeStorage.getItem(key);
        if (!rawData) return;

        try {
          const parsedData = JSON.parse(rawData);
          const calculations = Array.isArray(parsedData) ? parsedData : [parsedData];

          calculations.forEach((calc: any) => {
            // Convert old format to new CalculationRecord format
            const record = this.convertLegacyRecord(calc, `legacy-${idCounter++}`);
            if (record) {
              migratedData.push(record);
            }
          });
        } catch (error) {
          console.error(`Failed to migrate data from ${key}:`, error);
        }
      });

      // Save migrated data if any
      if (migratedData.length > 0) {
        this.saveRawData(migratedData);
        console.log(`Migrated ${migratedData.length} calculations to new storage format`);

        // Clean up old keys after successful migration
        LEGACY_KEYS.forEach(key => safeStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  /**
   * Convert legacy record format to new CalculationRecord format
   */
  private convertLegacyRecord(oldRecord: any, fallbackId: string): CalculationRecord | null {
    try {
      // Handle different legacy formats
      const input: CalculationInput = {
        productName: oldRecord.productName || oldRecord.product || '',
        hsnCode: oldRecord.hsnCode || oldRecord.hsn || '',
        fobValue: oldRecord.fobValue?.toString() || oldRecord.fob?.toString() || '0',
        currency: oldRecord.currency || 'USD',
        weight: oldRecord.weight?.toString() || oldRecord.weightKg?.toString(),
        quantity: oldRecord.quantity,
        unitPrice: oldRecord.unitPrice,
        dutyRate: oldRecord.dutyRate?.toString() || oldRecord.duty?.toString() || '0',
        shippingMode: oldRecord.shippingMode || oldRecord.shipping?.mode || 'sea',
        originPort: oldRecord.originPort || oldRecord.origin || '',
        destinationPort: oldRecord.destinationPort || oldRecord.destination || '',
        estimatedDays: oldRecord.estimatedDays?.toString(),
        freightCost: oldRecord.freightCost?.toString() || oldRecord.freight?.toString() || '0',
        insuranceRequired: oldRecord.insuranceRequired || false,
        insuranceRate: oldRecord.insuranceRate?.toString(),
        insuranceAmount: oldRecord.insuranceAmount?.toString() || oldRecord.insurance?.toString(),
        packingCharges: oldRecord.packingCharges?.toString(),
        inlandFreight: oldRecord.inlandFreight?.toString(),
        bankCharges: oldRecord.bankCharges?.toString(),
        commissionRate: oldRecord.commissionRate?.toString(),
        customCharges: oldRecord.customCharges,
        totalAdditionalCosts: oldRecord.totalAdditionalCosts?.toString(),
      };

      // Extract or calculate result
      const result: CalculationResult | undefined = oldRecord.totalLandedCost ? {
        cifValue: parseFloat(oldRecord.cifValue || oldRecord.cif || '0'),
        customsDuty: parseFloat(oldRecord.customsDuty || oldRecord.duty || '0'),
        gst: parseFloat(oldRecord.gst || oldRecord.igst || '0'),
        totalLandedCost: parseFloat(oldRecord.totalLandedCost || oldRecord.total || '0'),
        breakdownPercentages: oldRecord.breakdownPercentages || {
          fob: 0,
          freight: 0,
          insurance: 0,
          duty: 0,
          gst: 0,
          additional: 0,
        }
      } : undefined;

      return {
        id: oldRecord.id || fallbackId,
        version: 1,
        input,
        result,
        metadata: {
          calculatedAt: oldRecord.calculatedAt || oldRecord.date || new Date().toISOString(),
          isFavorite: oldRecord.isFavorite || false,
          tags: oldRecord.tags || [],
          category: oldRecord.category,
          notes: oldRecord.notes,
        }
      };
    } catch (error) {
      console.error('Failed to convert legacy record:', error);
      return null;
    }
  }

  /**
   * Get raw data from localStorage
   */
  private getRawData(): CalculationRecord[] {
    try {
      const data = safeStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get data from storage:', error);
      return [];
    }
  }

  /**
   * Save raw data to localStorage
   */
  private saveRawData(data: CalculationRecord[]): void {
    try {
      safeStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to storage:', error);

      // Handle storage quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Remove oldest calculations if storage is full
        const trimmedData = data.slice(-1000); // Keep last 1000 calculations
        safeStorage.setItem(this.storageKey, JSON.stringify(trimmedData));
        console.warn('Storage quota exceeded. Kept only last 1000 calculations.');
      }
    }
  }

  /**
   * Save a new calculation
   */
  save(calculation: Omit<CalculationRecord, 'id' | 'version'>): CalculationRecord {
    this.ensureMigrated();
    const data = this.getRawData();
    const newRecord: CalculationRecord = {
      ...calculation,
      id: Date.now().toString(),
      version: 1,
    };

    data.unshift(newRecord); // Add to beginning (newest first)

    // Limit storage to prevent quota issues
    const maxRecords = 1000;
    if (data.length > maxRecords) {
      data.splice(maxRecords);
    }

    this.saveRawData(data);
    return newRecord;
  }

  /**
   * Get a calculation by ID
   */
  get(id: string): CalculationRecord | null {
    this.ensureMigrated();
    const data = this.getRawData();
    return data.find(record => record.id === id) || null;
  }

  /**
   * Get all calculations with optional query options
   */
  getAll(options?: QueryOptions): CalculationRecord[] {
    this.ensureMigrated();
    let data = this.getRawData();

    // Apply filters
    if (options?.filter) {
      data = this.applyFilters(data, options.filter);
    }

    // Apply sorting
    if (options?.sortBy) {
      data = this.applySorting(data, options.sortBy, options.sortOrder || 'desc');
    }

    // Apply pagination
    if (options?.limit) {
      const offset = options.offset || 0;
      data = data.slice(offset, offset + options.limit);
    }

    return data;
  }

  /**
   * Update an existing calculation
   */
  update(id: string, updates: Partial<CalculationRecord>): void {
    const data = this.getRawData();
    const index = data.findIndex(record => record.id === id);

    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...updates,
        version: data[index].version + 1,
        metadata: {
          ...data[index].metadata,
          ...updates.metadata,
          lastModified: new Date().toISOString(),
        }
      };
      this.saveRawData(data);
    }
  }

  /**
   * Delete a calculation
   */
  delete(id: string): void {
    const data = this.getRawData();
    const filteredData = data.filter(record => record.id !== id);
    this.saveRawData(filteredData);
  }

  /**
   * Delete multiple calculations
   */
  bulkDelete(ids: string[]): void {
    const data = this.getRawData();
    const filteredData = data.filter(record => !ids.includes(record.id));
    this.saveRawData(filteredData);
  }

  /**
   * Search calculations
   */
  search(query: string): CalculationRecord[] {
    const data = this.getRawData();
    const lowerQuery = query.toLowerCase();

    return data.filter(record => {
      const searchableText = [
        record.input.productName,
        record.input.hsnCode,
        record.input.originPort,
        record.input.destinationPort,
        record.metadata.notes,
        ...(record.metadata.tags || []),
        record.metadata.category,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(lowerQuery);
    });
  }

  /**
   * Apply filters to data
   */
  private applyFilters(data: CalculationRecord[], filters: FilterCriteria): CalculationRecord[] {
    return data.filter(record => {
      // Date range filter
      if (filters.dateRange) {
        const calculatedDate = new Date(record.metadata.calculatedAt);
        if (calculatedDate < filters.dateRange.start || calculatedDate > filters.dateRange.end) {
          return false;
        }
      }

      // Cost range filter
      if (filters.costRange && record.result) {
        const cost = record.result.totalLandedCost;
        if (cost < filters.costRange.min || cost > filters.costRange.max) {
          return false;
        }
      }

      // Shipping mode filter
      if (filters.shippingModes && filters.shippingModes.length > 0) {
        if (!filters.shippingModes.includes(record.input.shippingMode)) {
          return false;
        }
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          record.input.productName,
          record.input.hsnCode,
          record.metadata.notes
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const recordTags = record.metadata.tags || [];
        if (!filters.tags.some(tag => recordTags.includes(tag))) {
          return false;
        }
      }

      // Favorite filter
      if (filters.isFavorite !== undefined) {
        if (record.metadata.isFavorite !== filters.isFavorite) {
          return false;
        }
      }

      // Template filter
      if (filters.isTemplate !== undefined) {
        if (record.metadata.isTemplate !== filters.isTemplate) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Apply sorting to data
   */
  private applySorting(
    data: CalculationRecord[],
    sortBy: 'date' | 'cost' | 'name',
    sortOrder: 'asc' | 'desc'
  ): CalculationRecord[] {
    const sorted = [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.metadata.calculatedAt).getTime() -
                      new Date(b.metadata.calculatedAt).getTime();
          break;
        case 'cost':
          comparison = (a.result?.totalLandedCost || 0) - (b.result?.totalLandedCost || 0);
          break;
        case 'name':
          comparison = a.input.productName.localeCompare(b.input.productName);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Get statistics from all calculations
   */
  getStats(): HistoryStats {
    this.ensureMigrated();
    const data = this.getRawData();

    if (data.length === 0) {
      return {
        totalCalculations: 0,
        totalFOBValue: 0,
        averageLandedCost: 0,
        totalDutiesPaid: 0,
        averageDutyRate: 0,
        mostUsedShippingMode: '',
        topProducts: [],
        lastCalculated: null,
        thisWeekCount: 0,
        lastWeekCount: 0,
      };
    }

    // Calculate totals and averages
    let totalFOB = 0;
    let totalLandedCost = 0;
    let totalDuties = 0;
    let totalDutyRate = 0;

    const shippingModes: Record<string, number> = {};
    const products: Record<string, number> = {};

    const now = new Date();
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    let thisWeekCount = 0;
    let lastWeekCount = 0;

    data.forEach(record => {
      // FOB and landed cost
      const fob = parseFloat(record.input.fobValue);
      totalFOB += fob;

      if (record.result) {
        totalLandedCost += record.result.totalLandedCost;
        totalDuties += record.result.customsDuty;
      }

      // Duty rate
      totalDutyRate += parseFloat(record.input.dutyRate);

      // Shipping modes
      shippingModes[record.input.shippingMode] = (shippingModes[record.input.shippingMode] || 0) + 1;

      // Products
      products[record.input.productName] = (products[record.input.productName] || 0) + 1;

      // Week counts
      const calculatedDate = new Date(record.metadata.calculatedAt);
      if (calculatedDate >= thisWeekStart) {
        thisWeekCount++;
      } else if (calculatedDate >= lastWeekStart && calculatedDate < thisWeekStart) {
        lastWeekCount++;
      }
    });

    // Find most used shipping mode
    const mostUsedShippingMode = Object.entries(shippingModes)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Get top 5 products
    const topProducts = Object.entries(products)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Get last calculated date
    const lastCalculated = data[0] ? new Date(data[0].metadata.calculatedAt) : null;

    return {
      totalCalculations: data.length,
      totalFOBValue: totalFOB,
      averageLandedCost: data.length > 0 ? totalLandedCost / data.length : 0,
      totalDutiesPaid: totalDuties,
      averageDutyRate: data.length > 0 ? totalDutyRate / data.length : 0,
      mostUsedShippingMode,
      topProducts,
      lastCalculated,
      thisWeekCount,
      lastWeekCount,
    };
  }

  /**
   * Export all data to JSON
   */
  exportToJSON(): string {
    const data = this.getRawData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export to CSV
   */
  exportToCSV(): string {
    const data = this.getRawData();

    if (data.length === 0) {
      return '';
    }

    // CSV headers
    const headers = [
      'ID',
      'Date',
      'Product Name',
      'HSN Code',
      'FOB Value',
      'Currency',
      'Shipping Mode',
      'Origin',
      'Destination',
      'Freight Cost',
      'Insurance',
      'Total Landed Cost',
      'Customs Duty',
      'GST',
      'Tags',
      'Notes',
    ];

    // Create CSV rows
    const rows = data.map(record => [
      record.id,
      record.metadata.calculatedAt,
      record.input.productName,
      record.input.hsnCode,
      record.input.fobValue,
      record.input.currency,
      record.input.shippingMode,
      record.input.originPort,
      record.input.destinationPort,
      record.input.freightCost,
      record.input.insuranceAmount || '0',
      record.result?.totalLandedCost || '0',
      record.result?.customsDuty || '0',
      record.result?.gst || '0',
      (record.metadata.tags || []).join(';'),
      record.metadata.notes || '',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Import from JSON
   */
  importFromJSON(jsonString: string): { success: number; failed: number } {
    try {
      const importedData = JSON.parse(jsonString);

      if (!Array.isArray(importedData)) {
        throw new Error('Invalid data format');
      }

      const existingData = this.getRawData();
      const existingIds = new Set(existingData.map(r => r.id));

      let success = 0;
      let failed = 0;

      importedData.forEach((record: any) => {
        try {
          // Skip if ID already exists
          if (existingIds.has(record.id)) {
            // Generate new ID for duplicate
            record.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          }

          // Validate required fields
          if (!record.input?.productName || !record.input?.hsnCode) {
            failed++;
            return;
          }

          existingData.unshift(record);
          success++;
        } catch {
          failed++;
        }
      });

      this.saveRawData(existingData);
      return { success, failed };
    } catch (error) {
      console.error('Import failed:', error);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Clear all data (use with caution!)
   */
  clearAll(): void {
    if (confirm('Are you sure you want to delete all calculation history? This cannot be undone.')) {
      safeStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Get storage size in bytes
   */
  getStorageSize(): number {
    const data = safeStorage.getItem(this.storageKey) || '';
    return new Blob([data]).size;
  }

  /**
   * Check if storage is near quota
   */
  isNearQuota(): boolean {
    // localStorage typically has 5-10MB limit
    const maxSize = 5 * 1024 * 1024; // 5MB
    const currentSize = this.getStorageSize();
    return currentSize > maxSize * 0.9; // Alert at 90% usage
  }
}

// Export singleton instance
export const historyStorage = new HistoryStorage();