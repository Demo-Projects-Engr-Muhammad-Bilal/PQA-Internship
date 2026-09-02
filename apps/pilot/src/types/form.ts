export interface PilotForm {
  id: string;
  
  // Activity
  activityType: 'ARRIVAL' | 'DEPARTURE' | 'SHIFTING' | 'SWINGING' | 'CANCELLATION';
  activityDateTime?: string; // Single ISO string
  cancellationDateTime?: string; // Single ISO string
  
  // Vessel
  vesselType?: 'LNGC' | 'LPG' | 'TANKER' | 'CONTAINER' | 'BULK_CARRIER' | 'OTHERS';
  vesselName?: string;
  registrationNo?: string;
  pic?: string;
  localAgency?: string;
  
  // Measurements
  loa?: number;
  beam?: number;
  gt?: number;
  nt?: number;
  dwt?: number;
  draftFwd?: number;
  draftAft?: number;
  
  // Pilot Operations
  pilotBoardingDateTime?: string;
  pilotDisembarkationDateTime?: string;
  
  // Berth & Mooring
  berthSide?: string;
  unmooredTime?: string;
  unmooredPlace?: string;
  mooredTime?: string;
  mooredPlace?: string;
  
  // Extra Pilotage
  extraPilotageNight?: boolean;
  extraPilotageHoliday?: boolean;
  dispensation?: string;
  
  // Cargo
  cargoForPortQasim?: number;
  deckCargo?: number;
  dgCargo?: number;
  totalCargo?: number;
  
  // DG Declarations
  abnormalRiseDG?: boolean;
  leakageLiquidDG?: boolean;
  stowagePlanAttached?: boolean;
  
  // Crafts Used
  craftsUsed?: Array<{
    craftName?: string;
    fromLocation?: string;
    toLocation?: string;
  }>;
  
  additionalRemarks?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}