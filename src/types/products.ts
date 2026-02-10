export interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  primaryProblem?: string;
  mainReason?: string;
  moment?: string;
  whyPreviousFailed?: string;
  whatTheyWantToFeel?: string;
  bestProof?: string;
}
