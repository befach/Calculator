export interface ComplianceProduct {
  productName: string;
  hsnCode: string;
}

export interface ComplianceNote {
  title: string;
  description: string;
}

function getChapter(hsnCode: string): string {
  return hsnCode.replace(/\D/g, '').slice(0, 2);
}

function getHeading(hsnCode: string): string {
  return hsnCode.replace(/\D/g, '').slice(0, 4);
}

function addUnique(notes: ComplianceNote[], note: ComplianceNote) {
  if (!notes.some((existing) => existing.title === note.title)) {
    notes.push(note);
  }
}

export function getImportComplianceNotes(products: ComplianceProduct[]): ComplianceNote[] {
  const notes: ComplianceNote[] = [
    {
      title: 'IEC / GST / KYC',
      description: 'Keep the importer IEC, GST details, KYC, AD code/bank details and consignee information ready before clearance.',
    },
    {
      title: 'Invoice & Packing List',
      description: 'Commercial invoice, packing list, bill of lading or airway bill, purchase order, payment proof and product catalogue may be required for customs assessment.',
    },
    {
      title: 'HSN / Import Policy',
      description: 'Verify the final HSN code, duty rate and ITC(HS) import policy on official portals before placing the order.',
    },
  ];

  for (const product of products) {
    const chapter = getChapter(product.hsnCode);
    const heading = getHeading(product.hsnCode);

    if (['02', '03', '04', '05', '16', '17', '18', '19', '20', '21', '22', '23'].includes(chapter)) {
      addUnique(notes, {
        title: 'FSSAI',
        description: 'FSSAI licence, product label review, ingredient details, shelf life and food safety documentation may be needed for edible products.',
      });
    }

    if (['06', '07', '08', '09', '10', '11', '12', '13', '14', '44'].includes(chapter)) {
      addUnique(notes, {
        title: 'Plant Quarantine',
        description: 'Plant quarantine, fumigation, phytosanitary certificate or treatment certificate may apply for plant, seed, agriculture or wood-based products.',
      });
    }

    if (['01', '02', '03', '04', '05', '41', '42', '43'].includes(chapter)) {
      addUnique(notes, {
        title: 'Animal Quarantine / CITES',
        description: 'Animal quarantine, sanitary certificate, wildlife/CITES checks or leather-related documentation may apply depending on the material and species.',
      });
    }

    if (chapter === '30' || ['9018', '9019', '9020', '9021', '9022'].includes(heading)) {
      addUnique(notes, {
        title: 'CDSCO',
        description: 'CDSCO registration, import licence, test reports or medical device documentation may be required.',
      });
    }

    if (['3303', '3304', '3305', '3306', '3307'].includes(heading)) {
      addUnique(notes, {
        title: 'Cosmetics Registration',
        description: 'Cosmetic import registration, label compliance and ingredient documentation may be required before sale in India.',
      });
    }

    if (['27', '28', '29', '32', '34', '35', '36', '37', '38'].includes(chapter)) {
      addUnique(notes, {
        title: 'MSDS / Dangerous Goods',
        description: 'MSDS, technical data sheet, dangerous goods classification, labelling and special handling approval may be required.',
      });
    }

    if (heading === '3808') {
      addUnique(notes, {
        title: 'CIBRC',
        description: 'CIBRC or other agriculture-chemical approvals may apply for pesticides, insecticides and similar products.',
      });
    }

    if (['72', '73'].includes(chapter)) {
      addUnique(notes, {
        title: 'BIS - Steel / Metals',
        description: 'BIS quality control order coverage may apply to some steel and metal products.',
      });
    }

    if (['84', '85', '90', '95'].includes(chapter) || heading === '9503') {
      addUnique(notes, {
        title: 'BIS / Product Safety',
        description: 'BIS registration, CRS/ISI marking, test reports or product safety certification may apply for electronics, appliances, machinery, toys and selected goods.',
      });
    }

    if (['8517', '8525', '8526', '8527'].includes(heading)) {
      addUnique(notes, {
        title: 'WPC / TEC',
        description: 'WPC ETA, TEC or telecom-related approval may apply if the product has Wi-Fi, Bluetooth, RF, cellular or telecom functionality.',
      });
    }

    if (['50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63'].includes(chapter)) {
      addUnique(notes, {
        title: 'Textile Labelling',
        description: 'Labelling, fibre composition, care instructions and applicable textile quality control orders may need review.',
      });
    }
  }

  const finalNote: ComplianceNote = {
    title: 'Final Verification',
    description: 'This is a basic guidance list, not a legal clearance. Confirm applicability with a customs broker or compliance expert before shipment.',
  };

  return [...notes.slice(0, 7), finalNote];
}
