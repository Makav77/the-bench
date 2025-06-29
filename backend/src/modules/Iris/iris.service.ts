import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import fs from "fs";
import path from "path";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point as turfPoint } from "@turf/helpers";

interface CityFromAPI {
    nom: string;
}

interface IrisFeature {
    properties: {
        code_iris: string;
        nom_iris: string;
        commune: string;
        code_insee: string;
    };
    geometry: any;
}

@Injectable()
export class IrisService {
    private readonly API_CITIES = "https://geo.api.gouv.fr/communes?codePostal=";
    private readonly irisFeatures: IrisFeature[];

    constructor() {
        const irisPath = path.resolve(process.cwd(), "src/data/iris-idf.geojson");
        const geojsonData = JSON.parse(fs.readFileSync(irisPath, "utf-8"));
        this.irisFeatures = geojsonData.features;
        console.log(`[IRIS] Chargé ${this.irisFeatures.length} quartiers IRIS d'Île-de-France`);
    }

    async getCitiesByPostalCode(postalCode: string): Promise<string[]> {
        const response = await axios.get(this.API_CITIES + encodeURIComponent(postalCode));
        const cities: CityFromAPI[] = response.data;
        return cities.map((city) => city.nom);
    }

    async resolveIris(street: string, postalCode: string, city: string): Promise<{ irisCode: string, irisName: string }> {
        const query = `${street}, ${postalCode} ${city}`;
        const geocodeUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`;

        let lat: number, lon: number;
        try {
            const geoRes = await axios.get(geocodeUrl);
            const feature = geoRes.data.features?.[0];
            if (!feature) {
                throw new NotFoundException("Adresse introuvable");
            }
            lat = feature.geometry.coordinates[1];
            lon = feature.geometry.coordinates[0];
        } catch (error) {
            throw new BadRequestException("Erreur lors du géocodage de l'adresse");
        }

        const userPoint = turfPoint([lon, lat]);
        for (const iris of this.irisFeatures) {
            if (booleanPointInPolygon(userPoint, iris.geometry)) {
                return {
                    irisCode: iris.properties.code_iris,
                    irisName: iris.properties.nom_iris
                };
            }
        }
        throw new NotFoundException("Aucun quartier IRIS trouvé à cette adresse (Île-de-France uniquement)");
    }
}
