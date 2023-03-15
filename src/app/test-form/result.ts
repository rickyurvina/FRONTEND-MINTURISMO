import { Establishment } from "./establishment";

export interface Result {
  id:number,
  score:any,
  establishment:Establishment,
  resultable:any,
  answer:string
}
