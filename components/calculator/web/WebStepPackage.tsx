'use client';

import { motion } from 'framer-motion';
import { Box } from 'lucide-react';
import ProductInfoFields from '../shared/ProductInfoFields';
import PackageDimensionFields from '../shared/PackageDimensionFields';
import InlandDeliverySection from '../shared/InlandDeliverySection';

interface Props {
  productName: string;
  unitPrice: number;
  quantity: number;
  fobValue: number;
  currency: string;
  exchangeRate: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;
  includeInlandDelivery: boolean;
  clearancePort: string;
  destinationCity: string;
  inlandZone: string;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function WebStepPackage(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Box className="w-5 h-5 text-brand-orange" />
        Package Details
      </h3>

      <ProductInfoFields
        productName={props.productName}
        unitPrice={props.unitPrice}
        quantity={props.quantity}
        fobValue={props.fobValue}
        currency={props.currency}
        exchangeRate={props.exchangeRate}
        onFieldChange={props.onFieldChange}
      />

      <div className="border-t border-gray-100 pt-4">
        <PackageDimensionFields
          lengthCm={props.lengthCm}
          widthCm={props.widthCm}
          heightCm={props.heightCm}
          actualWeightKg={props.actualWeightKg}
          numPackages={props.numPackages}
          volumetricWeight={props.volumetricWeight}
          grossWeight={props.grossWeight}
          chargeableWeight={props.chargeableWeight}
          cbm={props.cbm}
          onFieldChange={props.onFieldChange}
        />
      </div>

      <InlandDeliverySection
        includeInlandDelivery={props.includeInlandDelivery}
        clearancePort={props.clearancePort}
        destinationCity={props.destinationCity}
        inlandZone={props.inlandZone}
        onFieldChange={props.onFieldChange}
      />
    </motion.div>
  );
}
