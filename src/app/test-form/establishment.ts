import { EstablishmentType } from "./establishment-type";

export interface Establishment {
  id:number,
  name:string,
  code:string,
  company:string,
  email:string,
  percentage:string,
  results:any[],
  questions:any[],
  establishmentType:EstablishmentType,
  ruc:string,
  type_of_taxpayer:string,
  province:string,
  canton:string,
  parrish:string,
  direction:string,
  start_year_operations:string,
  has_register_tourist:string,
  register_number:string,
  location:string,
  progress?:string
}
