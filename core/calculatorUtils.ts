import { safeStorage } from '../storage/safeStorage';
// Landed Cost Calculator Utility Functions

export interface CalculationInput {
  productName: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  fobValue: number;
  currency: string;
  weight: number;
  weightUnit: string;
  shippingMethod: 'sea' | 'air' | 'express' | 'rail';
  originCountry: string;
  destinationCountry: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  containerType?: string;
  customFreight?: number;
  customInsurance?: number;
  clearanceCharges?: number;
  inlandTransport?: number;
  otherCharges?: number;
}

export interface CalculationResult {
  // Input Values
  fobValue: number;

  // Calculated Values
  freight: number;
  insurance: number;
  cifValue: number;
  basicCustomsDuty: number;
  socialWelfareSurcharge: number;
  igst: number;
  totalDuties: number;
  clearanceCharges: number;
  inlandTransport: number;
  otherCharges: number;
  totalAdditionalCharges: number;
  totalLandedCost: number;
  landedCostPerUnit: number;

  // Percentages
  dutyPercentage: number;
  freightPercentage: number;
  insurancePercentage: number;
  additionalChargesPercentage: number;

  // Metadata
  exchangeRate: number;
  currency: string;
  calculatedAt: string;
}

// Hardcoded HSN duty rates (first 2-4 digits)
// Based on Indian Customs Tariff Act and CBIC published rates
const hsnDutyRates: { [key: string]: { bcd: number; igst: number; description: string } } = {
  // ─── Chapter 01-05: Live Animals & Animal Products ─────────────────
  '01': { bcd: 30, igst: 0, description: 'Live animals' },
  '02': { bcd: 30, igst: 0, description: 'Meat and edible meat offal' },
  '03': { bcd: 30, igst: 5, description: 'Fish, crustaceans and seafood' },
  '0306': { bcd: 30, igst: 5, description: 'Crustaceans (shrimps, prawns, lobsters)' },
  '04': { bcd: 30, igst: 12, description: 'Dairy products, eggs, honey' },
  '0401': { bcd: 30, igst: 12, description: 'Milk and cream' },
  '0402': { bcd: 60, igst: 12, description: 'Milk powder and condensed milk' },
  '05': { bcd: 10, igst: 5, description: 'Animal products (hair, bones, horns)' },

  // ─── Chapter 06-14: Vegetable Products ─────────────────────────────
  '06': { bcd: 30, igst: 5, description: 'Live plants, bulbs, cut flowers' },
  '07': { bcd: 30, igst: 5, description: 'Edible vegetables and roots' },
  '0713': { bcd: 50, igst: 5, description: 'Dried legumes (lentils, chickpeas, beans)' },
  '08': { bcd: 30, igst: 12, description: 'Edible fruits and nuts' },
  '0801': { bcd: 10, igst: 12, description: 'Coconuts, cashew nuts, Brazil nuts' },
  '0802': { bcd: 30, igst: 12, description: 'Almonds, walnuts, pistachios' },
  '09': { bcd: 30, igst: 5, description: 'Coffee, tea, and spices' },
  '0901': { bcd: 30, igst: 5, description: 'Coffee (roasted and unroasted)' },
  '0902': { bcd: 30, igst: 5, description: 'Tea (green and black)' },
  '0904': { bcd: 30, igst: 5, description: 'Pepper (black, white, long)' },
  '0910': { bcd: 30, igst: 5, description: 'Ginger, turmeric, saffron, cumin' },
  '10': { bcd: 0, igst: 0, description: 'Cereals (wheat, rice, maize)' },
  '1001': { bcd: 0, igst: 0, description: 'Wheat and meslin' },
  '1006': { bcd: 80, igst: 5, description: 'Rice (basmati and non-basmati)' },
  '11': { bcd: 30, igst: 5, description: 'Milling products, malt, starches' },
  '12': { bcd: 30, igst: 5, description: 'Oil seeds and medicinal plants' },
  '1201': { bcd: 30, igst: 5, description: 'Soybeans' },
  '13': { bcd: 30, igst: 18, description: 'Gums, resins, plant extracts' },
  '14': { bcd: 10, igst: 5, description: 'Vegetable plaiting materials' },

  // ─── Chapter 15: Fats & Oils ───────────────────────────────────────
  '15': { bcd: 15, igst: 12, description: 'Fats and oils (animal/vegetable)' },
  '1507': { bcd: 17.5, igst: 5, description: 'Soybean oil' },
  '1509': { bcd: 20, igst: 5, description: 'Olive oil' },
  '1511': { bcd: 7.5, igst: 5, description: 'Palm oil' },
  '1513': { bcd: 45, igst: 5, description: 'Coconut oil' },
  '1515': { bcd: 30, igst: 18, description: 'Linseed, castor, sesame oil' },

  // ─── Chapter 16-24: Prepared Foods, Beverages, Tobacco ─────────────
  '16': { bcd: 30, igst: 12, description: 'Prepared meat, fish, seafood' },
  '17': { bcd: 30, igst: 18, description: 'Sugars and sugar confectionery' },
  '1701': { bcd: 50, igst: 5, description: 'Cane or beet sugar' },
  '18': { bcd: 30, igst: 18, description: 'Cocoa and cocoa preparations' },
  '1806': { bcd: 30, igst: 18, description: 'Chocolate and cocoa food preparations' },
  '19': { bcd: 30, igst: 18, description: 'Bakery, pastry, cereals preparations' },
  '1905': { bcd: 30, igst: 18, description: 'Bread, biscuits, cakes, pastries' },
  '20': { bcd: 30, igst: 12, description: 'Prepared vegetables, fruits, juices' },
  '2009': { bcd: 30, igst: 12, description: 'Fruit juices and vegetable juices' },
  '21': { bcd: 30, igst: 18, description: 'Miscellaneous food preparations' },
  '2101': { bcd: 30, igst: 18, description: 'Instant coffee, tea extracts' },
  '2106': { bcd: 30, igst: 18, description: 'Protein supplements, food preparations' },
  '22': { bcd: 50, igst: 28, description: 'Beverages, spirits, vinegar' },
  '2201': { bcd: 25, igst: 18, description: 'Mineral water and aerated water' },
  '2203': { bcd: 100, igst: 28, description: 'Beer' },
  '2204': { bcd: 150, igst: 28, description: 'Wine' },
  '2208': { bcd: 150, igst: 28, description: 'Spirits, whisky, vodka, rum, gin' },
  '23': { bcd: 15, igst: 0, description: 'Food industry residues, animal feed' },
  '24': { bcd: 30, igst: 28, description: 'Tobacco and manufactured substitutes' },

  // ─── Chapter 25-27: Mineral Products ───────────────────────────────
  '25': { bcd: 10, igst: 5, description: 'Salt, earth, stone, cement, minerals' },
  '2523': { bcd: 10, igst: 28, description: 'Portland cement and other cement' },
  '26': { bcd: 2.5, igst: 5, description: 'Ores, slag, ash' },
  '27': { bcd: 5, igst: 18, description: 'Mineral fuels, oils, waxes' },
  '2709': { bcd: 0, igst: 5, description: 'Crude petroleum oil' },
  '2710': { bcd: 5, igst: 18, description: 'Petroleum oils (petrol, diesel)' },
  '2711': { bcd: 5, igst: 5, description: 'Natural gas and LPG' },

  // ─── Chapter 28-38: Chemicals & Allied ─────────────────────────────
  '28': { bcd: 7.5, igst: 18, description: 'Inorganic chemicals' },
  '29': { bcd: 7.5, igst: 18, description: 'Organic chemicals' },
  '30': { bcd: 10, igst: 12, description: 'Pharmaceutical products' },
  '3003': { bcd: 10, igst: 12, description: 'Medicaments (bulk, not packaged)' },
  '3004': { bcd: 10, igst: 12, description: 'Medicaments (packaged for retail)' },
  '3006': { bcd: 10, igst: 12, description: 'Surgical sutures, dental cements' },
  '31': { bcd: 5, igst: 5, description: 'Fertilizers' },
  '32': { bcd: 10, igst: 18, description: 'Dyes, pigments, paints, varnishes' },
  '3208': { bcd: 10, igst: 18, description: 'Paints and varnishes' },
  '33': { bcd: 10, igst: 18, description: 'Essential oils, perfumery, cosmetics' },
  '3303': { bcd: 20, igst: 28, description: 'Perfumes and toilet waters' },
  '3304': { bcd: 20, igst: 28, description: 'Beauty/makeup/skin care preparations' },
  '3305': { bcd: 20, igst: 18, description: 'Hair care products (shampoo etc.)' },
  '3306': { bcd: 10, igst: 18, description: 'Toothpaste and oral hygiene products' },
  '34': { bcd: 10, igst: 18, description: 'Soap, detergent, candles, wax' },
  '3401': { bcd: 10, igst: 18, description: 'Soap, organic cleansing products' },
  '35': { bcd: 10, igst: 18, description: 'Glues, enzymes, modified starches' },
  '36': { bcd: 10, igst: 18, description: 'Explosives, matches, pyrotechnics' },
  '37': { bcd: 10, igst: 18, description: 'Photographic goods' },
  '38': { bcd: 10, igst: 18, description: 'Miscellaneous chemical products' },
  '3808': { bcd: 10, igst: 18, description: 'Insecticides, herbicides, pesticides' },

  // ─── Chapter 39-40: Plastics & Rubber ──────────────────────────────
  '39': { bcd: 10, igst: 18, description: 'Plastics and plastic products' },
  '3901': { bcd: 7.5, igst: 18, description: 'Polyethylene (PE) in primary forms' },
  '3902': { bcd: 7.5, igst: 18, description: 'Polypropylene (PP) in primary forms' },
  '3907': { bcd: 7.5, igst: 18, description: 'Polyesters, polycarbonates, PET' },
  '3917': { bcd: 10, igst: 18, description: 'Plastic tubes, pipes, fittings' },
  '3920': { bcd: 10, igst: 18, description: 'Plastic plates, sheets, film' },
  '3923': { bcd: 10, igst: 18, description: 'Plastic containers, bottles, caps' },
  '3926': { bcd: 10, igst: 18, description: 'Other plastic articles' },
  '40': { bcd: 10, igst: 18, description: 'Rubber and rubber products' },
  '4011': { bcd: 10, igst: 28, description: 'New rubber tyres' },
  '4012': { bcd: 10, igst: 28, description: 'Retreaded rubber tyres' },

  // ─── Chapter 41-43: Leather, Fur ───────────────────────────────────
  '41': { bcd: 10, igst: 5, description: 'Raw hides, skins, leather' },
  '42': { bcd: 10, igst: 18, description: 'Leather goods, handbags, wallets' },
  '4202': { bcd: 10, igst: 18, description: 'Handbags, suitcases, briefcases' },
  '43': { bcd: 10, igst: 18, description: 'Furskins and artificial fur' },

  // ─── Chapter 44-49: Wood, Paper, Printed Matter ────────────────────
  '44': { bcd: 10, igst: 18, description: 'Wood and articles of wood' },
  '4407': { bcd: 5, igst: 18, description: 'Sawn or chipped wood' },
  '4410': { bcd: 10, igst: 18, description: 'Particle board, MDF, plywood' },
  '45': { bcd: 10, igst: 12, description: 'Cork and articles of cork' },
  '46': { bcd: 10, igst: 12, description: 'Basketware and wickerwork' },
  '47': { bcd: 5, igst: 12, description: 'Wood pulp and paper pulp' },
  '48': { bcd: 10, igst: 12, description: 'Paper, paperboard, articles' },
  '4818': { bcd: 10, igst: 18, description: 'Toilet paper, tissues, napkins' },
  '4819': { bcd: 10, igst: 18, description: 'Cartons, boxes, paper packaging' },
  '49': { bcd: 0, igst: 0, description: 'Printed books, newspapers, pictures' },
  '4901': { bcd: 0, igst: 0, description: 'Printed books and brochures' },

  // ─── Chapter 50-63: Textiles & Apparel ─────────────────────────────
  '50': { bcd: 10, igst: 5, description: 'Silk and silk products' },
  '51': { bcd: 10, igst: 5, description: 'Wool and animal hair' },
  '52': { bcd: 10, igst: 12, description: 'Cotton and cotton products' },
  '5208': { bcd: 10, igst: 12, description: 'Woven cotton fabrics' },
  '53': { bcd: 10, igst: 5, description: 'Vegetable textile fibres (jute, hemp)' },
  '54': { bcd: 10, igst: 12, description: 'Man-made filaments (nylon, polyester)' },
  '55': { bcd: 10, igst: 12, description: 'Man-made staple fibres' },
  '56': { bcd: 10, igst: 12, description: 'Wadding, felt, nonwovens, ropes' },
  '57': { bcd: 20, igst: 12, description: 'Carpets and floor coverings' },
  '58': { bcd: 10, igst: 12, description: 'Special woven fabrics, embroidery' },
  '59': { bcd: 10, igst: 12, description: 'Coated/impregnated textile fabrics' },
  '60': { bcd: 10, igst: 5, description: 'Knitted or crocheted fabrics' },
  '61': { bcd: 20, igst: 12, description: 'Knitted apparel and clothing' },
  '6109': { bcd: 20, igst: 12, description: 'T-shirts, singlets, tank tops (knitted)' },
  '6110': { bcd: 20, igst: 12, description: 'Jerseys, pullovers, sweaters (knitted)' },
  '62': { bcd: 20, igst: 12, description: 'Woven apparel and clothing' },
  '6203': { bcd: 20, igst: 12, description: 'Mens suits, trousers, shirts (woven)' },
  '6204': { bcd: 20, igst: 12, description: 'Womens suits, dresses, skirts (woven)' },
  '63': { bcd: 20, igst: 12, description: 'Made-up textile articles (bed linen, curtains)' },

  // ─── Chapter 64-67: Footwear, Headgear ─────────────────────────────
  '64': { bcd: 20, igst: 18, description: 'Footwear (shoes, sandals, boots)' },
  '6403': { bcd: 20, igst: 18, description: 'Leather footwear' },
  '6404': { bcd: 20, igst: 18, description: 'Sports footwear, textile upper' },
  '65': { bcd: 10, igst: 18, description: 'Headgear (hats, caps, helmets)' },
  '66': { bcd: 10, igst: 18, description: 'Umbrellas, walking sticks' },
  '67': { bcd: 10, igst: 12, description: 'Artificial flowers, human hair' },

  // ─── Chapter 68-70: Stone, Ceramic, Glass ──────────────────────────
  '68': { bcd: 10, igst: 18, description: 'Stone, plaster, cement articles' },
  '69': { bcd: 10, igst: 18, description: 'Ceramic products and tiles' },
  '6907': { bcd: 10, igst: 18, description: 'Ceramic tiles and paving blocks' },
  '70': { bcd: 10, igst: 18, description: 'Glass and glassware' },
  '7010': { bcd: 10, igst: 18, description: 'Glass bottles, jars, containers' },
  '7013': { bcd: 10, igst: 18, description: 'Glassware (drinking, table, kitchen)' },

  // ─── Chapter 71: Precious Metals, Jewellery ────────────────────────
  '71': { bcd: 10, igst: 3, description: 'Precious metals, pearls, jewellery' },
  '7108': { bcd: 12.5, igst: 3, description: 'Gold (unwrought, semi-manufactured)' },
  '7113': { bcd: 20, igst: 3, description: 'Jewellery of precious metals' },
  '7117': { bcd: 20, igst: 18, description: 'Imitation jewellery' },

  // ─── Chapter 72-83: Base Metals ────────────────────────────────────
  '72': { bcd: 7.5, igst: 18, description: 'Iron and steel' },
  '7208': { bcd: 7.5, igst: 18, description: 'Hot-rolled steel flat products' },
  '7210': { bcd: 10, igst: 18, description: 'Galvanized steel sheets' },
  '73': { bcd: 10, igst: 18, description: 'Articles of iron and steel' },
  '7306': { bcd: 10, igst: 18, description: 'Steel tubes and pipes' },
  '7318': { bcd: 10, igst: 18, description: 'Screws, bolts, nuts, washers (steel)' },
  '74': { bcd: 10, igst: 18, description: 'Copper and copper articles' },
  '7408': { bcd: 5, igst: 18, description: 'Copper wire' },
  '75': { bcd: 5, igst: 18, description: 'Nickel and nickel articles' },
  '76': { bcd: 10, igst: 18, description: 'Aluminum and aluminum articles' },
  '7606': { bcd: 10, igst: 18, description: 'Aluminum plates, sheets, strips' },
  '7607': { bcd: 10, igst: 18, description: 'Aluminum foil' },
  '78': { bcd: 5, igst: 18, description: 'Lead and lead articles' },
  '79': { bcd: 5, igst: 18, description: 'Zinc and zinc articles' },
  '80': { bcd: 5, igst: 18, description: 'Tin and tin articles' },
  '81': { bcd: 5, igst: 18, description: 'Other base metals (tungsten, titanium)' },
  '82': { bcd: 10, igst: 18, description: 'Tools, cutlery (knives, scissors)' },
  '8211': { bcd: 10, igst: 18, description: 'Knives with cutting blades' },
  '83': { bcd: 10, igst: 18, description: 'Miscellaneous base metal articles (locks, safes)' },

  // ─── Chapter 84: Machinery ─────────────────────────────────────────
  '84': { bcd: 7.5, igst: 18, description: 'Machinery and mechanical appliances' },
  '8401': { bcd: 7.5, igst: 18, description: 'Nuclear reactors and parts' },
  '8407': { bcd: 7.5, igst: 18, description: 'Spark-ignition engines (petrol)' },
  '8408': { bcd: 7.5, igst: 18, description: 'Diesel engines' },
  '8413': { bcd: 7.5, igst: 18, description: 'Pumps for liquids' },
  '8414': { bcd: 7.5, igst: 18, description: 'Air pumps, compressors, fans' },
  '8415': { bcd: 10, igst: 28, description: 'Air conditioning machines' },
  '8418': { bcd: 10, igst: 18, description: 'Refrigerators, freezers' },
  '8419': { bcd: 7.5, igst: 18, description: 'Heat exchange equipment, water heaters' },
  '8421': { bcd: 7.5, igst: 18, description: 'Centrifuges, filters, purifiers' },
  '8422': { bcd: 7.5, igst: 18, description: 'Dishwashing machines, packaging machines' },
  '8423': { bcd: 7.5, igst: 18, description: 'Weighing machinery and scales' },
  '8428': { bcd: 7.5, igst: 18, description: 'Lifting/handling machinery (cranes, lifts)' },
  '8429': { bcd: 7.5, igst: 18, description: 'Bulldozers, excavators, road rollers' },
  '8431': { bcd: 7.5, igst: 18, description: 'Parts of machinery (Ch 84)' },
  '8433': { bcd: 7.5, igst: 12, description: 'Harvesting/threshing machinery' },
  '8443': { bcd: 0, igst: 18, description: 'Printing machinery and printers' },
  '8450': { bcd: 10, igst: 18, description: 'Washing machines' },
  '8451': { bcd: 7.5, igst: 18, description: 'Ironing/drying machines' },
  '8452': { bcd: 7.5, igst: 12, description: 'Sewing machines' },
  '8467': { bcd: 7.5, igst: 18, description: 'Hand-held power tools' },
  '8471': { bcd: 0, igst: 18, description: 'Computers, laptops, processing units' },
  '8473': { bcd: 0, igst: 18, description: 'Computer parts and accessories' },
  '8479': { bcd: 7.5, igst: 18, description: 'Machines with individual functions' },

  // ─── Chapter 85: Electrical Equipment ──────────────────────────────
  '85': { bcd: 10, igst: 18, description: 'Electrical machinery and equipment' },
  '8501': { bcd: 7.5, igst: 18, description: 'Electric motors and generators' },
  '8502': { bcd: 7.5, igst: 18, description: 'Electric generating sets' },
  '8504': { bcd: 10, igst: 18, description: 'Electrical transformers and converters' },
  '8506': { bcd: 10, igst: 18, description: 'Primary batteries (non-rechargeable)' },
  '8507': { bcd: 15, igst: 18, description: 'Rechargeable batteries (Li-ion, lead-acid)' },
  '8508': { bcd: 10, igst: 18, description: 'Vacuum cleaners' },
  '8509': { bcd: 10, igst: 18, description: 'Electro-mechanical domestic appliances' },
  '8510': { bcd: 10, igst: 18, description: 'Electric shavers, trimmers, epilators' },
  '8511': { bcd: 10, igst: 18, description: 'Ignition/starting equipment for engines' },
  '8516': { bcd: 10, igst: 18, description: 'Electric heaters, ovens, hair dryers' },
  '8517': { bcd: 20, igst: 18, description: 'Mobile phones, telecom equipment, routers' },
  '8518': { bcd: 10, igst: 18, description: 'Microphones, loudspeakers, headphones' },
  '8519': { bcd: 10, igst: 18, description: 'Sound recording/reproducing apparatus' },
  '8521': { bcd: 15, igst: 18, description: 'Video recording apparatus' },
  '8523': { bcd: 0, igst: 18, description: 'Media (discs, flash drives, memory cards)' },
  '8525': { bcd: 15, igst: 18, description: 'Cameras, camcorders, CCTV' },
  '8527': { bcd: 10, igst: 18, description: 'Radio receivers' },
  '8528': { bcd: 15, igst: 18, description: 'Monitors, projectors, televisions' },
  '8529': { bcd: 10, igst: 18, description: 'Parts for TV, radio, radar' },
  '8534': { bcd: 0, igst: 18, description: 'Printed circuits (PCBs)' },
  '8536': { bcd: 10, igst: 18, description: 'Switches, fuses, sockets, plugs' },
  '8541': { bcd: 0, igst: 18, description: 'Semiconductor devices, LEDs, diodes' },
  '8542': { bcd: 0, igst: 18, description: 'Electronic integrated circuits (ICs)' },
  '8544': { bcd: 10, igst: 18, description: 'Insulated wire, cables, connectors' },

  // ─── Chapter 86-89: Transport Equipment ────────────────────────────
  '86': { bcd: 7.5, igst: 18, description: 'Railway locomotives and parts' },
  '87': { bcd: 15, igst: 28, description: 'Vehicles and parts' },
  '8701': { bcd: 10, igst: 12, description: 'Tractors' },
  '8702': { bcd: 25, igst: 28, description: 'Motor vehicles for 10+ persons (buses)' },
  '8703': { bcd: 60, igst: 28, description: 'Cars and motor vehicles (passenger)' },
  '8704': { bcd: 25, igst: 28, description: 'Trucks and goods vehicles' },
  '8708': { bcd: 15, igst: 28, description: 'Motor vehicle parts and accessories' },
  '8711': { bcd: 50, igst: 28, description: 'Motorcycles and scooters' },
  '8712': { bcd: 10, igst: 12, description: 'Bicycles and cycles' },
  '8714': { bcd: 10, igst: 18, description: 'Parts of bicycles and motorcycles' },
  '88': { bcd: 0, igst: 5, description: 'Aircraft, spacecraft, and parts' },
  '89': { bcd: 5, igst: 5, description: 'Ships, boats, floating structures' },

  // ─── Chapter 90: Instruments ───────────────────────────────────────
  '90': { bcd: 7.5, igst: 18, description: 'Optical, measuring, medical instruments' },
  '9001': { bcd: 10, igst: 18, description: 'Optical fibres, lenses' },
  '9004': { bcd: 10, igst: 18, description: 'Spectacles and sunglasses' },
  '9006': { bcd: 10, igst: 18, description: 'Photographic cameras' },
  '9018': { bcd: 7.5, igst: 12, description: 'Medical/surgical instruments' },
  '9019': { bcd: 7.5, igst: 12, description: 'Mechano-therapy, massage, breathing apparatus' },
  '9021': { bcd: 7.5, igst: 12, description: 'Orthopaedic appliances, hearing aids' },
  '9025': { bcd: 7.5, igst: 18, description: 'Thermometers, barometers' },
  '9026': { bcd: 7.5, igst: 18, description: 'Flow meters, level gauges' },
  '9027': { bcd: 7.5, igst: 18, description: 'Instruments for physical/chemical analysis' },
  '9028': { bcd: 7.5, igst: 18, description: 'Gas, liquid, electricity meters' },
  '9029': { bcd: 7.5, igst: 18, description: 'Speedometers, tachometers, stroboscopes' },
  '9030': { bcd: 7.5, igst: 18, description: 'Oscilloscopes, multimeters' },
  '9032': { bcd: 7.5, igst: 18, description: 'Automatic regulating instruments' },

  // ─── Chapter 91: Clocks & Watches ──────────────────────────────────
  '91': { bcd: 10, igst: 18, description: 'Clocks and watches' },
  '9101': { bcd: 20, igst: 18, description: 'Wrist watches (precious metal case)' },
  '9102': { bcd: 20, igst: 18, description: 'Wrist watches (other)' },

  // ─── Chapter 92: Musical Instruments ───────────────────────────────
  '92': { bcd: 10, igst: 18, description: 'Musical instruments and parts' },

  // ─── Chapter 93: Arms & Ammunition ─────────────────────────────────
  '93': { bcd: 10, igst: 18, description: 'Arms and ammunition' },

  // ─── Chapter 94: Furniture ─────────────────────────────────────────
  '94': { bcd: 20, igst: 18, description: 'Furniture, mattresses, lighting' },
  '9401': { bcd: 20, igst: 18, description: 'Seats and chairs' },
  '9403': { bcd: 20, igst: 18, description: 'Other furniture (tables, desks, shelves)' },
  '9404': { bcd: 20, igst: 18, description: 'Mattresses, sleeping bags' },
  '9405': { bcd: 20, igst: 18, description: 'Lamps, light fittings, LEDs' },

  // ─── Chapter 95: Toys, Games, Sports ───────────────────────────────
  '95': { bcd: 20, igst: 18, description: 'Toys, games, and sports equipment' },
  '9503': { bcd: 20, igst: 18, description: 'Toys (dolls, puzzles, models)' },
  '9504': { bcd: 20, igst: 28, description: 'Video game consoles and arcade machines' },
  '9506': { bcd: 10, igst: 18, description: 'Sports equipment (gym, fitness)' },

  // ─── Chapter 96: Miscellaneous Manufactured ────────────────────────
  '96': { bcd: 10, igst: 18, description: 'Miscellaneous manufactured articles' },
  '9608': { bcd: 10, igst: 18, description: 'Pens, markers, pencils' },
  '9613': { bcd: 10, igst: 18, description: 'Lighters and matches' },
  '9616': { bcd: 10, igst: 18, description: 'Perfume sprayers, powder puffs' },
  '9619': { bcd: 10, igst: 12, description: 'Sanitary pads, diapers, napkins' },

  // ─── Chapter 97-98: Art, Antiques, Special ─────────────────────────
  '97': { bcd: 0, igst: 12, description: 'Works of art, antiques, collectibles' },

  // Default rate
  'default': { bcd: 10, igst: 18, description: 'General goods' }
};

// Hardcoded exchange rates (to INR)
export const exchangeRates: { [key: string]: number } = {
  'INR': 1,
  'USD': 83.12,
  'EUR': 90.45,
  'GBP': 105.23,
  'CNY': 11.42,
  'JPY': 0.56,
  'AED': 22.64,
  'SGD': 62.15,
};

// Hazardous HSN chapters (chemicals, fuels, explosives)
const HAZARDOUS_HSN_CHAPTERS = new Set(['27', '28', '29', '36', '38']);

// Clearance charges based on product classification
export const CLEARANCE_CHARGE_DEFAULT = 2700;
export const CLEARANCE_CHARGE_HAZARDOUS = 5000;

// Get duty rates for HSN code
export function getDutyRates(hsnCode: string): { bcd: number; igst: number; description: string; isHazardous: boolean } {
  const chapter = hsnCode.substring(0, 2);
  const isHazardous = HAZARDOUS_HSN_CHAPTERS.has(chapter);

  // Try exact match first (4 digits)
  if (hsnDutyRates[hsnCode.substring(0, 4)]) {
    return { ...hsnDutyRates[hsnCode.substring(0, 4)], isHazardous };
  }
  // Try 2 digit match
  if (hsnDutyRates[hsnCode.substring(0, 2)]) {
    return { ...hsnDutyRates[hsnCode.substring(0, 2)], isHazardous };
  }
  // Return default rates
  return { ...hsnDutyRates['default'], isHazardous };
}

// Calculate freight charges based on shipping method and FOB value
export function calculateFreight(fobValue: number, shippingMethod: string, weight: number = 0): number {
  // If custom freight is provided, use it
  const freightRates = {
    'sea': 0.05,    // 5% of FOB for sea freight
    'air': 0.15,    // 15% of FOB for air freight
    'express': 0.20, // 20% of FOB for express
    'rail': 0.08,   // 8% of FOB for rail
  };

  const rate = freightRates[shippingMethod as keyof typeof freightRates] || 0.08;
  let freight = fobValue * rate;

  // Add weight-based calculation for air/express
  if ((shippingMethod === 'air' || shippingMethod === 'express') && weight > 0) {
    // $5 per kg for air, $8 per kg for express (minimum charges)
    const perKgRate = shippingMethod === 'air' ? 5 : 8;
    const weightBasedFreight = weight * perKgRate * exchangeRates['USD'];
    freight = Math.max(freight, weightBasedFreight);
  }

  return Math.round(freight * 100) / 100;
}

// Calculate insurance (typically 0.5% of FOB + Freight)
export function calculateInsurance(fobValue: number, freight: number): number {
  const insuranceRate = 0.005; // 0.5%
  const insurance = (fobValue + freight) * insuranceRate;
  return Math.round(insurance * 100) / 100;
}

// Calculate CIF value
export function calculateCIF(fobValue: number, freight: number, insurance: number): number {
  return Math.round((fobValue + freight + insurance) * 100) / 100;
}

// Calculate Basic Customs Duty
export function calculateBasicCustomsDuty(cifValue: number, hsnCode: string): number {
  const rates = getDutyRates(hsnCode);
  const duty = cifValue * (rates.bcd / 100);
  return Math.round(duty * 100) / 100;
}

// Calculate Social Welfare Surcharge (10% of BCD)
export function calculateSocialWelfareSurcharge(basicDuty: number): number {
  const sws = basicDuty * 0.10; // 10% of Basic Customs Duty
  return Math.round(sws * 100) / 100;
}

// Calculate IGST
export function calculateIGST(cifValue: number, basicDuty: number, sws: number, hsnCode: string): number {
  const rates = getDutyRates(hsnCode);
  const assessableValue = cifValue + basicDuty + sws;
  const igst = assessableValue * (rates.igst / 100);
  return Math.round(igst * 100) / 100;
}

// Calculate Total Landed Cost
export function calculateLandedCost(input: CalculationInput): CalculationResult {
  // Convert currency if needed
  const exchangeRate = exchangeRates[input.currency] || exchangeRates['USD'];
  const fobValueINR = input.fobValue * exchangeRate;

  // Core calculations
  const freight = input.customFreight || calculateFreight(fobValueINR, input.shippingMethod, input.weight);
  const insurance = input.customInsurance || calculateInsurance(fobValueINR, freight);
  const cifValue = calculateCIF(fobValueINR, freight, insurance);

  // Duties and taxes (fetch rates once, reuse)
  const dutyRates = getDutyRates(input.hsnCode);
  const basicCustomsDuty = Math.round(cifValue * (dutyRates.bcd / 100) * 100) / 100;
  const socialWelfareSurcharge = calculateSocialWelfareSurcharge(basicCustomsDuty);
  const assessableValue = cifValue + basicCustomsDuty + socialWelfareSurcharge;
  const igst = Math.round(assessableValue * (dutyRates.igst / 100) * 100) / 100;
  const totalDuties = basicCustomsDuty + socialWelfareSurcharge + igst;

  // Additional charges
  const clearanceCharges = input.clearanceCharges || (dutyRates.isHazardous ? CLEARANCE_CHARGE_HAZARDOUS : CLEARANCE_CHARGE_DEFAULT);
  const inlandTransport = input.inlandTransport || (cifValue * 0.02); // 2% of CIF as default
  const otherCharges = input.otherCharges || 0;
  const totalAdditionalCharges = clearanceCharges + inlandTransport + otherCharges;

  // Total landed cost
  const totalLandedCost = cifValue + totalDuties + totalAdditionalCharges;
  const landedCostPerUnit = input.quantity > 0 ? totalLandedCost / input.quantity : totalLandedCost;

  // Calculate percentages (guard against division by zero)
  const dutyPercentage = totalLandedCost > 0 ? (totalDuties / totalLandedCost) * 100 : 0;
  const freightPercentage = totalLandedCost > 0 ? (freight / totalLandedCost) * 100 : 0;
  const insurancePercentage = totalLandedCost > 0 ? (insurance / totalLandedCost) * 100 : 0;
  const additionalChargesPercentage = totalLandedCost > 0 ? (totalAdditionalCharges / totalLandedCost) * 100 : 0;

  return {
    fobValue: fobValueINR,
    freight,
    insurance,
    cifValue,
    basicCustomsDuty,
    socialWelfareSurcharge,
    igst,
    totalDuties,
    clearanceCharges,
    inlandTransport,
    otherCharges,
    totalAdditionalCharges,
    totalLandedCost,
    landedCostPerUnit,
    dutyPercentage,
    freightPercentage,
    insurancePercentage,
    additionalChargesPercentage,
    exchangeRate,
    currency: input.currency,
    calculatedAt: new Date().toISOString(),
  };
}


// Get all available currencies
export function getAvailableCurrencies(): { code: string; name: string; rate: number }[] {
  return [
    { code: 'INR', name: 'Indian Rupee', rate: 1 },
    { code: 'USD', name: 'US Dollar', rate: exchangeRates['USD'] },
    { code: 'EUR', name: 'Euro', rate: exchangeRates['EUR'] },
    { code: 'GBP', name: 'British Pound', rate: exchangeRates['GBP'] },
    { code: 'CNY', name: 'Chinese Yuan', rate: exchangeRates['CNY'] },
    { code: 'JPY', name: 'Japanese Yen', rate: exchangeRates['JPY'] },
    { code: 'AED', name: 'UAE Dirham', rate: exchangeRates['AED'] },
    { code: 'SGD', name: 'Singapore Dollar', rate: exchangeRates['SGD'] },
  ];
}

// Get shipping methods
export function getShippingMethods(): { value: string; label: string; description: string }[] {
  return [
    { value: 'sea', label: 'Sea Freight', description: 'Economy option (20-45 days)' },
    { value: 'air', label: 'Air Freight', description: 'Faster delivery (5-10 days)' },
    { value: 'express', label: 'Express Courier', description: 'Fastest option (2-5 days)' },
    { value: 'rail', label: 'Rail Freight', description: 'Land route (15-25 days)' },
  ];
}

// Save calculation to localStorage
export function saveCalculation(calculation: CalculationResult & { input: CalculationInput }): void {
  const saved = safeStorage.getItem('landedCostCalculations');
  const calculations = saved ? JSON.parse(saved) : [];

  const newCalculation = {
    id: Date.now().toString(),
    ...calculation,
    savedAt: new Date().toISOString(),
  };

  calculations.unshift(newCalculation);

  // Keep only last 50 calculations
  if (calculations.length > 50) {
    calculations.pop();
  }

  safeStorage.setItem('landedCostCalculations', JSON.stringify(calculations));
}

// Get saved calculations from localStorage
export function getSavedCalculations(): any[] {
  const saved = safeStorage.getItem('landedCostCalculations');
  return saved ? JSON.parse(saved) : [];
}

// Clear calculation history
export function clearCalculationHistory(): void {
  safeStorage.removeItem('landedCostCalculations');
}

// Search HSN codes (simplified version)
export function searchHSNCodes(query: string): { code: string; description: string; dutyRate: number; igstRate: number }[] {
  const results: { code: string; description: string; dutyRate: number; igstRate: number }[] = [];

  Object.entries(hsnDutyRates).forEach(([code, rates]) => {
    if (code !== 'default' && (code.includes(query) || rates.description.toLowerCase().includes(query.toLowerCase()))) {
      results.push({
        code: code.padEnd(8, '0'),
        description: rates.description,
        dutyRate: rates.bcd,
        igstRate: rates.igst,
      });
    }
  });

  return results.slice(0, 20); // Return top 20 results
}

// ═══════════════════════════════════════════════════════════════════
// Multi-Product Landing Cost Calculator (mirrors Excel formulas)
// ═══════════════════════════════════════════════════════════════════

export interface QuoteProductInput {
  name: string;
  exworksPrice: number;    // per-unit price in INR (already converted)
  weight: number;
  quantity: number;
  unit: string;
  hsnCode: string;
  customDutyPercent: number;  // as decimal, e.g. 0.075 for 7.5%
  gstPercent: number;         // as decimal, e.g. 0.18 for 18%
}

export interface QuoteShippingInput {
  seaAirFreight: number;
  localShipping: number;
  localClearance: number;
  originClearance: number;
  insuranceInspection: number;
}

export interface QuoteServiceInput {
  sourcingChargePercent: number;   // decimal, e.g. 0.02
  handlingChargePercent: number;   // decimal, e.g. 0.02
  serviceChargePercent: number;    // decimal, e.g. 0.012
  transactionalFee: number;        // fixed INR amount
}

export interface QuoteInput {
  quoteId: string;
  airOrSea: 'Air' | 'Sea';
  supplierName: string;
  exchangeRate: number;
  products: QuoteProductInput[];
  shipping: QuoteShippingInput;
  services: QuoteServiceInput;
}

export interface QuoteProductResult {
  name: string;
  weight: number;
  cif: number;
  customs: number;
  sws: number;
  localShipping: number;
  gst: number;
  importCost: number;
  total: number;
  perPiece: number;
  exGstPerPiece: number;
  gstPerPiece: number;
  totalProductCostExGst: number;
  totalGst: number;
}

export interface QuoteServiceResult {
  sourcingCharges: number;
  sourcingGst: number;
  handlingCharges: number;
  handlingGst: number;
  serviceCharges: number;
  serviceGst: number;
}

export interface QuoteFinalBreakup {
  endToEnd: number;
  shipping: number;
  customsAndGst: number;
}

export interface QuoteResult {
  products: QuoteProductResult[];
  services: QuoteServiceResult;
  grandTotal: number;
  finalBreakup: QuoteFinalBreakup;
  numProducts: number;
}

export function calculateQuote(input: QuoteInput): QuoteResult | null {
  const activeProducts = input.products.filter(
    p => p.name && p.name.trim() !== '' && p.exworksPrice > 0
  );
  const N = activeProducts.length;
  if (N === 0) return null;

  const { shipping: sh, services: sv } = input;

  // Shared costs split equally across products
  const sharedCifCost = (sh.seaAirFreight + sh.originClearance + sh.insuranceInspection + sv.transactionalFee) / N;
  const sharedLocalCost = (sh.localShipping + sh.localClearance) / N;

  // Step 1: Calculate CIF for each product (needed for service charges)
  const cifValues = activeProducts.map(p => (p.exworksPrice * p.quantity) + sharedCifCost);
  const totalCif = cifValues.reduce((sum, v) => sum + v, 0);

  // Step 2: Calculate global service charges (sourcing & handling depend on CIF)
  const sourcingCharges = totalCif * sv.sourcingChargePercent;
  const sourcingGst = sourcingCharges * 0.18;
  const handlingCharges = ((totalCif / 5) + sh.seaAirFreight + sh.localShipping + sh.localClearance + sh.originClearance) * sv.handlingChargePercent;
  const handlingGst = handlingCharges * 0.18;

  // Step 3: Calculate per-product results (import cost, before service charges)
  const importCosts: number[] = [];
  const productResults: QuoteProductResult[] = activeProducts.map((p, i) => {
    const cif = cifValues[i];
    const customs = cif * p.customDutyPercent;
    const sws = customs * 0.10;
    const localShippingShare = sharedLocalCost;

    // GST = ((CIF + SWS + Customs) * gst%) + (localShipping * 18%) + (sourcingGST + handlingGST) / N
    const gst =
      ((cif + sws + customs) * p.gstPercent) +
      (localShippingShare * 0.18) +
      (sourcingGst + handlingGst) / N;

    // ImportCost = (CIF + SWS + Customs + GST) + ((localShipping + localClearance + sourcingCharges + handlingCharges) / N) + localShippingShare
    const importCost =
      ((cif + sws + customs + gst) +
       ((sh.localShipping + sh.localClearance + sourcingCharges + handlingCharges) / N) +
       localShippingShare);

    importCosts.push(importCost);

    // Placeholder — total will be filled after service charges
    return {
      name: p.name,
      weight: p.weight,
      cif,
      customs,
      sws,
      localShipping: localShippingShare,
      gst,
      importCost,
      total: 0,
      perPiece: 0,
      exGstPerPiece: 0,
      gstPerPiece: 0,
      totalProductCostExGst: 0,
      totalGst: 0,
    };
  });

  // Step 4: Service charges (based on sum of import costs)
  const totalImportCost = importCosts.reduce((sum, v) => sum + v, 0);
  const serviceCharges = totalImportCost * sv.serviceChargePercent;
  const serviceGst = serviceCharges * 0.18;

  // Step 5: Final per-product totals
  let grandTotal = 0;
  activeProducts.forEach((p, i) => {
    const r = productResults[i];
    // Excel: if N=1, add full service charges; else divide by N
    r.total = N === 1
      ? r.importCost + serviceCharges + serviceGst
      : r.importCost + (serviceCharges + serviceGst) / N;
    r.perPiece = p.quantity > 0 ? r.total / p.quantity : r.total;
    r.exGstPerPiece = r.perPiece / (1 + p.gstPercent);
    r.gstPerPiece = r.perPiece - r.exGstPerPiece;
    r.totalProductCostExGst = r.exGstPerPiece * p.quantity;
    r.totalGst = r.gstPerPiece * p.quantity;
    grandTotal += r.total;
  });

  // Final breakup (matches Excel S28-T32)
  const totalCustomsSws = productResults.reduce((s, r) => s + r.customs + r.sws, 0);
  const totalProductGst = productResults.reduce((s, r) => s + r.gst, 0);
  const finalBreakup: QuoteFinalBreakup = {
    endToEnd: grandTotal,
    shipping: sh.seaAirFreight + sh.localShipping + sh.insuranceInspection + handlingCharges,
    customsAndGst: sh.localClearance + sh.originClearance + totalCustomsSws + totalProductGst,
  };

  return {
    products: productResults,
    services: {
      sourcingCharges,
      sourcingGst,
      handlingCharges,
      handlingGst,
      serviceCharges,
      serviceGst,
    },
    grandTotal,
    finalBreakup,
    numProducts: N,
  };
}