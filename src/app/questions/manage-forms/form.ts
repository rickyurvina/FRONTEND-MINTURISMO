import { EstablishmentType } from "src/app/test-form/establishment-type";

export interface Form {
  id:number,
  name:string,
  code:string,
  description:string,
  selectedComponents:[],
  components:[],
  status:string,
}
