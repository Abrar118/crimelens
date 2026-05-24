import districtsData from "@/lib/data/districts.json";
import divisionsData from "@/lib/data/divisions.json";

interface District {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
  lat: string;
  lon: string;
  url: string;
}

interface Division {
  id: string;
  name: string;
  bn_name: string;
  url: string;
}

interface DivisionWithDistricts {
  id: string;
  name: string;
  bn_name: string;
  url: string;
  districts: District[];
}

const districts: District[] = districtsData[2].data as District[];
const divisions: Division[] = divisionsData[2].data as Division[];

export const getDivisionsWithDistricts = (): DivisionWithDistricts[] => {
  return divisions.map((division) => {
    const districtsInDivision = districts.filter(
      (district) => district.division_id === division.id
    );
    return {
      ...division,
      districts: districtsInDivision,
    };
  });
};