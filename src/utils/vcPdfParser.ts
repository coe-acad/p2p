export interface VCExtractedData {
   // Profile
   fullName?: string;
   address?: string;
   consumerNumber?: string;
   meterNumber?: string;
   serviceConnectionDate?: string;
   issuerName?: string;
   
   // Consumption Profile
   premisesType?: string;
   connectionType?: string;
   sanctionedLoad?: string;
   tariffCategory?: string;
   
   // Generation Profile (Solar)
   generationType?: string;
   generationCapacity?: string;
   commissioningDate?: string;
   manufacturer?: string;
   modelNumber?: string;
   
   // Derived device info
   inverterCapacity?: string;
   batteryCapacity?: string;
   meterType?: string;
}
 
 // Helper to format device display data from extracted VC
 export function formatDevicesFromVC(vcData: VCExtractedData, locality: string) {
   const inverterCapacity = vcData.generationCapacity
     ? `${vcData.generationCapacity} kW`
     : '—';
   
   const batteryCapacity = vcData.batteryCapacity || '—';
   
   return {
     inverter: {
       capacity: inverterCapacity,
       detail: `Solar • ${inverterCapacity}`,
       expanded: {
         type: vcData.generationType || '—',
         capacity: inverterCapacity,
         commissioningDate: vcData.commissioningDate || '—',
         manufacturer: vcData.manufacturer || '—',
         model: vcData.modelNumber || '—',
       }
     },
     battery: {
       capacity: batteryCapacity,
       detail: `Storage • ${batteryCapacity}`,
       expanded: {
         capacity: batteryCapacity,
         type: '—',
         estimatedCycles: '—',
       }
     },
     meter: {
       type: vcData.meterType || '—',
       detail: `${vcData.issuerName?.split(' ')[0] || '—'} • ${vcData.meterType || '—'}`,
       expanded: {
         meterNumber: vcData.meterNumber || '—',
         sanctionedLoad: vcData.sanctionedLoad ? `${vcData.sanctionedLoad} kW` : '—',
         connectionType: vcData.connectionType || '—',
         premisesType: vcData.premisesType || '—',
       }
     },
     profile: {
       detail: `${vcData.fullName || '—'}, ${locality || '—'}`,
       expanded: {
         name: vcData.fullName || '—',
         consumerNumber: vcData.consumerNumber || '—',
         address: vcData.address || '—',
         tariffCategory: vcData.tariffCategory || '—',
         serviceDate: vcData.serviceConnectionDate || '—',
       }
     },
     // Summary stats for the card
     summary: {
       inverterKw: vcData.generationCapacity || vcData.sanctionedLoad || '—',
       batteryKwh: vcData.batteryCapacity?.replace(' kWh', '') || '—',
       meterType: vcData.meterType === 'Bi-directional' ? 'Bi-dir' : (vcData.meterType || '—'),
     }
   };
 }
