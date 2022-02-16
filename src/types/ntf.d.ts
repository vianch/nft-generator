interface NtfNames {
  [key: string]: string;
}

interface Face {
  background: number;
  head: number;
  hair: number;
  eyes: number;
  nose: number;
  mouth: number;
  beard: number;
}

interface ImageAttributes {
  name: string;
  rarity: number;
}

interface MetaData {
  name: string;
  description: string;
  image: string;
  attributes: ImageAttributes[];
}
