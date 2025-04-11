
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GarageInfo } from "@/hooks/useGarageManagement";

interface GarageTableProps {
  garages: GarageInfo[];
  loading: boolean;
}

const GarageTable = ({ garages, loading }: GarageTableProps) => {
  if (loading) {
    return <div>Loading garages data...</div>;
  }
  
  if (garages.length === 0) {
    return <div>No garages found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Installation Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {garages.map((garage) => (
            <TableRow key={garage.id}>
              <TableCell className="font-mono text-xs">{garage.id}</TableCell>
              <TableCell>{garage.name}</TableCell>
              <TableCell>{garage.location}</TableCell>
              <TableCell>{garage.area || '-'}</TableCell>
              <TableCell>{garage.installationFee ? `$${garage.installationFee.toFixed(2)}` : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GarageTable;
