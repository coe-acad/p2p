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
   const inverterCapacity = vcData.inverterCapacity || vcData.generationCapacity 
     ? `${vcData.generationCapacity || '5'} kW` 
     : '5 kW';
   
   const batteryCapacity = vcData.batteryCapacity || '10 kWh';
   
   return {
     inverter: {
       capacity: inverterCapacity,
       detail: `Solar • ${inverterCapacity}`,
       expanded: {
         type: vcData.generationType || 'Solar',
         capacity: inverterCapacity,
         commissioningDate: vcData.commissioningDate || 'N/A',
         manufacturer: vcData.manufacturer || 'N/A',
         model: vcData.modelNumber || 'N/A',
       }
     },
     battery: {
       capacity: batteryCapacity,
       detail: `Storage • ${batteryCapacity}`,
       expanded: {
         capacity: batteryCapacity,
         type: 'Lithium-ion',
         estimatedCycles: '6000+',
       }
     },
     meter: {
       type: vcData.meterType || 'Bi-directional',
       detail: `${vcData.issuerName?.split(' ')[0] || 'DISCOM'} • ${vcData.meterType || 'Bi-directional'}`,
       expanded: {
         meterNumber: vcData.meterNumber || 'N/A',
         sanctionedLoad: vcData.sanctionedLoad ? `${vcData.sanctionedLoad} kW` : 'N/A',
         connectionType: vcData.connectionType || 'N/A',
         premisesType: vcData.premisesType || 'N/A',
       }
     },
     profile: {
       detail: `${vcData.fullName || 'User'}, ${locality || 'Location'}`,
       expanded: {
         name: vcData.fullName || 'N/A',
         consumerNumber: vcData.consumerNumber || 'N/A',
         address: vcData.address || 'N/A',
         tariffCategory: vcData.tariffCategory || 'N/A',
         serviceDate: vcData.serviceConnectionDate || 'N/A',
       }
     },
     // Summary stats for the card
     summary: {
       inverterKw: vcData.generationCapacity || vcData.sanctionedLoad || '5',
       batteryKwh: vcData.batteryCapacity?.replace(' kWh', '') || '10',
       meterType: vcData.meterType === 'Bi-directional' ? 'Bi-dir' : 'Std',
     }
   };
 }
