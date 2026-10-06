"use client";

import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LocationMapProps {
  mapLat: number;
  mapLon: number;
}

export default function LocationMap({
  mapLat,
  mapLon,
}: LocationMapProps) {
  return (
    <Card className="lg:col-span-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin />
          Node Geo-Location
        </CardTitle>

        <CardDescription>
          <Badge variant="outline">SIM800L Cell LBS</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <iframe
          title="Node Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLon - 0.02}%2C${mapLat - 0.02}%2C${mapLon + 0.02}%2C${mapLat + 0.02}&layer=mapnik&marker=${mapLat}%2C${mapLon}`}
          className="h-40 w-full rounded-lg sm:h-48"
        />
      </CardContent>
    </Card>
  );
}
