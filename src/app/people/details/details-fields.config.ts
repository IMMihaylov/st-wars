import { DetailField } from '../../shared/details-fields/details-fields.component';
import { Person, Planet, Species, Vehicle } from '../person.model';

export const PERSON_DETAIL_FIELDS: readonly DetailField<Person>[] = [
  { key: 'name', label: 'Name' },
  { key: 'height', label: 'Height' },
  { key: 'mass', label: 'Mass' },
  { key: 'birth_year', label: 'Birth year' },
  { key: 'gender', label: 'Gender' },
];

export const PLANET_DETAIL_FIELDS: readonly DetailField<Planet>[] = [
  { key: 'name', label: 'Name' },
  { key: 'climate', label: 'Climate' },
  { key: 'terrain', label: 'Terrain' },
  { key: 'gravity', label: 'Gravity' },
  { key: 'population', label: 'Population' },
];

export const VEHICLE_DETAIL_FIELDS: readonly DetailField<Vehicle>[] = [
  { key: 'model', label: 'Model' },
  { key: 'vehicle_class', label: 'Class' },
  { key: 'manufacturer', label: 'Manufacturer' },
];

export const SPECIES_DETAIL_FIELDS: readonly DetailField<Species>[] = [
  { key: 'classification', label: 'Classification' },
  { key: 'language', label: 'Language' },
];
