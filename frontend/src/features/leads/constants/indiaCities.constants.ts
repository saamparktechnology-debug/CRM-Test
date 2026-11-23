// City & District data is resolved dynamically via Pincode API (/api/pincode/:pin)
export const CITIES_BY_DISTRICT: Record<string, string[]> = {}

export function getDistrictsForState(_stateName: string): string[] {
  return []
}

export function getCitiesForDistrict(_stateName: string, _districtName?: string): string[] {
  return []
}
