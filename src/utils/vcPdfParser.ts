 import * as pdfjsLib from 'pdfjs-dist';
 
 // Set up the worker using CDN for v3.x compatibility
 pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
 
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
 
// Multiple pattern variations for each field to handle different naming conventions
const PATTERN_GROUPS: Record<string, RegExp[]> = {
  fullName: [
    /full\s*Name[:\s"]+([A-Za-z0-9\s\-]+)/i,
    /fullName[:\s"]+([A-Za-z0-9\s\-]+)/i,
    /"fullName"\s*:\s*"([^"]+)"/i,
  ],
  address: [
    /full\s*Address[:\s"]+([^\n"]+)/i,
    /fullAddress[:\s"]+([^\n"]+)/i,
    /"fullAddress"\s*:\s*"([^"]+)"/i,
    /"address"\s*:\s*"([^"]+)"/i,
  ],
  consumerNumber: [
    /consumer\s*Number[:\s"]+(\d+)/i,
    /consumerNumber[:\s"]+(\d+)/i,
    /"consumerNumber"\s*:\s*"?(\d+)"?/i,
  ],
  meterNumber: [
    /meter\s*Number[:\s"]+(\d+)/i,
    /meterNumber[:\s"]+(\d+)/i,
    /"meterNumber"\s*:\s*"?(\d+)"?/i,
  ],
  serviceConnectionDate: [
    /service\s*Connection\s*Date[:\s"]+([^\n\|"]+)/i,
    /serviceConnectionDate[:\s"]+([^\n\|"]+)/i,
    /"serviceConnectionDate"\s*:\s*"([^"]+)"/i,
  ],
  issuerName: [
    /issuer\s*Name[:\s"]+([^\n\|"]+)/i,
    /issuerName[:\s"]+([^\n\|"]+)/i,
    /"issuerName"\s*:\s*"([^"]+)"/i,
  ],
  premisesType: [
    /premises\s*Type[:\s"]+([^\n\|"]+)/i,
    /premisesType[:\s"]+([^\n\|"]+)/i,
    /"premisesType"\s*:\s*"([^"]+)"/i,
  ],
  connectionType: [
    /connection\s*Type[:\s"]+([^\n\|"]+)/i,
    /connectionType[:\s"]+([^\n\|"]+)/i,
    /"connectionType"\s*:\s*"([^"]+)"/i,
  ],
  sanctionedLoad: [
    /sanctioned\s*Load\s*(?:\(?\s*KW\s*\)?)?[:\s"]+(\d+)/i,
    /sanctionedLoadKW[:\s"]+(\d+)/i,
    /sanctionedLoad[:\s"]+(\d+)/i,
    /"sanctionedLoadKW"\s*:\s*"?(\d+)"?/i,
    /"sanctionedLoad"\s*:\s*"?(\d+)"?/i,
  ],
  tariffCategory: [
    /tariff\s*Category\s*(?:Code)?[:\s"]+([^\n\|"]+)/i,
    /tariffCategoryCode[:\s"]+([^\n\|"]+)/i,
    /tariffCategory[:\s"]+([^\n\|"]+)/i,
    /"tariffCategoryCode"\s*:\s*"([^"]+)"/i,
    /"tariffCategory"\s*:\s*"([^"]+)"/i,
  ],
  generationType: [
    /generation\s*Type[:\s"]+([^\n\|"]+)/i,
    /generationType[:\s"]+([^\n\|"]+)/i,
    /"generationType"\s*:\s*"([^"]+)"/i,
  ],
  generationCapacity: [
    /(?:generation\s*)?capacity\s*(?:\(?\s*KW\s*\)?)?[:\s"]+(\d+)/i,
    /generationCapacity[:\s"]+(\d+)/i,
    /capacityKW[:\s"]+(\d+)/i,
    /"generationCapacity"\s*:\s*"?(\d+)"?/i,
    /"capacityKW"\s*:\s*"?(\d+)"?/i,
  ],
  commissioningDate: [
    /commissioning\s*Date[:\s"]+([^\n\|"]+)/i,
    /commissioningDate[:\s"]+([^\n\|"]+)/i,
    /"commissioningDate"\s*:\s*"([^"]+)"/i,
  ],
  manufacturer: [
    /manufacturer[:\s"]+([^\n\|"]+)/i,
    /"manufacturer"\s*:\s*"([^"]+)"/i,
  ],
  modelNumber: [
    /model\s*Number[:\s"]+([^\n\|"]+)/i,
    /modelNumber[:\s"]+([^\n\|"]+)/i,
    /"modelNumber"\s*:\s*"([^"]+)"/i,
  ],
};

// Try multiple patterns and return the first match
function extractField(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = match[1].trim();
      if (value && value !== '|' && value !== '-') {
        return value;
      }
    }
  }
  return undefined;
}
 
 export async function parseVCPdf(file: File): Promise<VCExtractedData> {
   try {
     const arrayBuffer = await file.arrayBuffer();
     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
     
     let fullText = '';
     
     // Extract text from all pages
     for (let i = 1; i <= pdf.numPages; i++) {
       const page = await pdf.getPage(i);
       const textContent = await page.getTextContent();
       const pageText = textContent.items
         .map((item: any) => item.str)
         .join(' ');
       fullText += pageText + '\n';
     }
     
     console.log('Extracted PDF text:', fullText);
     
    // Extract data using pattern groups
     const extractedData: VCExtractedData = {};
     
    for (const [key, patterns] of Object.entries(PATTERN_GROUPS)) {
      const value = extractField(fullText, patterns);
      if (value) {
        (extractedData as any)[key] = value;
       }
     }
     
     // Derive device information from extracted data
     if (extractedData.generationCapacity) {
       // Generation capacity indicates solar inverter capacity
       extractedData.inverterCapacity = `${extractedData.generationCapacity} kW`;
     } else if (extractedData.sanctionedLoad) {
       // Fallback to sanctioned load for inverter sizing
       extractedData.inverterCapacity = `${extractedData.sanctionedLoad} kW`;
     }
     
     // Estimate battery capacity (typically 2x inverter capacity for solar systems)
     if (extractedData.generationCapacity) {
       const capacity = parseInt(extractedData.generationCapacity);
       if (!isNaN(capacity)) {
         // Reasonable battery estimate: capacity * 2 for storage
         extractedData.batteryCapacity = `${Math.min(capacity * 2, 100)} kWh`;
       }
     }
     
     // Set meter type based on generation presence
     if (extractedData.generationType) {
       extractedData.meterType = 'Bi-directional';
     } else {
       extractedData.meterType = 'Standard';
     }
     
     console.log('Parsed VC data:', extractedData);
     return extractedData;
     
   } catch (error) {
     console.error('Error parsing VC PDF:', error);
     throw new Error('Failed to parse VC document');
   }
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