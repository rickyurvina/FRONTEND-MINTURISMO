export interface GeographichClassifier {
  code:string,
  description:string,
  full_code:string,
  type:string,
  children:any[],
  parent:GeographichClassifier,
}
