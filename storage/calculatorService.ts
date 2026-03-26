import type { CalculationInput, CalculationResult, CalculationRecord } from './historyStorage';
import { safeStorage } from './safeStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class CalculatorService {
  private headers = {
    'Content-Type': 'application/json',
  };

  /**
   * Save a new calculation to the backend
   */
  async saveCalculation(input: CalculationInput, result: CalculationResult): Promise<CalculationRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator/calculations`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          input,
          result,
          metadata: {
            calculatedAt: new Date().toISOString(),
            source: 'web',
            version: 2,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save calculation: ${response.statusText}`);
      }

      const data = await response.json();

      // Also save to localStorage as backup
      this.saveToLocalStorage(data);

      return data;
    } catch (error) {
      console.error('Error saving to backend, falling back to localStorage:', error);

      // Fallback to localStorage
      const localRecord = this.createLocalRecord(input, result);
      this.saveToLocalStorage(localRecord);
      return localRecord;
    }
  }

  /**
   * Get all calculations with optional filters
   */
  async getCalculations(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    shippingMode?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: CalculationRecord[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/calculator/calculations?${params}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch calculations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching from backend, falling back to localStorage:', error);

      // Fallback to localStorage
      return this.getFromLocalStorage(filters);
    }
  }

  /**
   * Get a single calculation by ID
   */
  async getCalculationById(id: string): Promise<CalculationRecord | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator/calculations/${id}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch calculation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching from backend, falling back to localStorage:', error);

      // Fallback to localStorage
      return this.getFromLocalStorageById(id);
    }
  }

  /**
   * Delete a calculation
   */
  async deleteCalculation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator/calculations/${id}`, {
        method: 'DELETE',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete calculation: ${response.statusText}`);
      }

      // Also remove from localStorage
      this.removeFromLocalStorage(id);

      return true;
    } catch (error) {
      console.error('Error deleting from backend, removing from localStorage:', error);

      // Fallback to localStorage removal
      this.removeFromLocalStorage(id);
      return true;
    }
  }

  /**
   * Get recent calculations for dashboard
   */
  async getRecentCalculations(limit: number = 5): Promise<CalculationRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator/recent?limit=${limit}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent calculations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent from backend, falling back to localStorage:', error);

      // Fallback to localStorage
      const { data } = this.getFromLocalStorage({ limit, sortBy: 'date', sortOrder: 'desc' });
      return data.slice(0, limit);
    }
  }

  /**
   * Update calculation metadata (e.g., favorite status, notes)
   */
  async updateCalculation(id: string, updates: Partial<CalculationRecord>): Promise<CalculationRecord | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator/calculations/${id}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update calculation: ${response.statusText}`);
      }

      const updated = await response.json();

      // Update in localStorage too
      this.updateInLocalStorage(id, updated);

      return updated;
    } catch (error) {
      console.error('Error updating in backend, updating localStorage only:', error);

      // Fallback to localStorage update
      return this.updateInLocalStorage(id, updates);
    }
  }

  /**
   * Sync local storage data to backend (one-time sync)
   */
  async syncLocalToBackend(): Promise<{ synced: number; failed: number }> {
    const localData = this.getAllFromLocalStorage();
    let synced = 0;
    let failed = 0;

    for (const record of localData) {
      try {
        const response = await fetch(`${API_BASE_URL}/calculator/calculations/sync`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(record),
        });

        if (response.ok) {
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { synced, failed };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    totalCalculations: number;
    averageLandedCost: number;
    totalDutiesSaved: number;
    recentCalculations: CalculationRecord[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator/dashboard-stats`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stats from backend, calculating from localStorage:', error);

      // Calculate from localStorage
      const allData = this.getAllFromLocalStorage();
      const recentCalculations = allData.slice(0, 5);

      const totalCalculations = allData.length;
      const averageLandedCost = allData.reduce((sum, record) =>
        sum + ((record.result as any)?.totalCost?.landedCost || (record.result as any)?.totalLandedCost || 0), 0) / totalCalculations || 0;

      const totalDutiesSaved = allData.reduce((sum, record) => {
        const duties = (record.result as any)?.duties || {};
        return sum + (duties.totalDuty || 0) * 0.1; // Assuming 10% savings
      }, 0);

      return {
        totalCalculations,
        averageLandedCost,
        totalDutiesSaved,
        recentCalculations,
      };
    }
  }

  // Local Storage Helper Methods
  private saveToLocalStorage(record: CalculationRecord): void {
    const key = 'befach-calculations-v2';
    const existing = this.getAllFromLocalStorage();
    existing.unshift(record);
    safeStorage.setItem(key, JSON.stringify(existing));
  }

  private getAllFromLocalStorage(): CalculationRecord[] {
    const key = 'befach-calculations-v2';
    try {
      const data = safeStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getFromLocalStorage(filters?: any): { data: CalculationRecord[]; total: number } {
    let data = this.getAllFromLocalStorage();

    // Apply filters
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(record =>
        ((record.input as any).productDetails?.productName || (record.input as any).productName || '').toLowerCase().includes(search) ||
        ((record.input as any).productDetails?.hsnCode || (record.input as any).hsnCode || '').toLowerCase().includes(search)
      );
    }

    if (filters?.shippingMode) {
      data = data.filter(record =>
        ((record.input as any).shippingDetails?.shippingMode || (record.input as any).shippingMethod) === filters.shippingMode
      );
    }

    // Sort
    if (filters?.sortBy === 'date') {
      data.sort((a, b) => {
        const dateA = new Date(a.metadata.calculatedAt).getTime();
        const dateB = new Date(b.metadata.calculatedAt).getTime();
        return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    const total = data.length;

    // Pagination
    if (filters?.page && filters?.limit) {
      const start = (filters.page - 1) * filters.limit;
      data = data.slice(start, start + filters.limit);
    }

    return { data, total };
  }

  private getFromLocalStorageById(id: string): CalculationRecord | null {
    const data = this.getAllFromLocalStorage();
    return data.find(record => record.id === id) || null;
  }

  private removeFromLocalStorage(id: string): void {
    const data = this.getAllFromLocalStorage();
    const filtered = data.filter(record => record.id !== id);
    safeStorage.setItem('befach-calculations-v2', JSON.stringify(filtered));
  }

  private updateInLocalStorage(id: string, updates: Partial<CalculationRecord>): CalculationRecord | null {
    const data = this.getAllFromLocalStorage();
    const index = data.findIndex(record => record.id === id);

    if (index === -1) return null;

    data[index] = { ...data[index], ...updates };
    safeStorage.setItem('befach-calculations-v2', JSON.stringify(data));

    return data[index];
  }

  private createLocalRecord(input: CalculationInput, result: CalculationResult): CalculationRecord {
    return {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: 2,
      input,
      result,
      metadata: {
        calculatedAt: new Date().toISOString(),
        isFavorite: false,
      } as any
    };
  }
}

export default new CalculatorService();