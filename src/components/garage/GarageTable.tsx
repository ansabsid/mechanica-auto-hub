
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GarageInfo } from "@/hooks/useGarageManagement";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface GarageTableProps {
  garages: GarageInfo[];
  loading: boolean;
}

const GarageTable = ({ garages, loading }: GarageTableProps) => {
  if (loading) {
    return <div>Loading garages data...</div>;
  }
  
  if (garages.length === 0) {
    return (
      <div className="space-y-4">
        <div>No garages found.</div>
        
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            Debugging Tip: Check the database to ensure garages exist and that your user account has permission to view them.
          </AlertDescription>
        </Alert>
      </div>
    );
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
