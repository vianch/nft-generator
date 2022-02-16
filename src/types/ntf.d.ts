interface NtfNames {
  [key: string]: string;
}

interface BodyPart {
  accessories: number;
  background: number;
  body: number;
  beard: number;
  hair: number;
  eyes: number;
}

interface CompleteBodyInfo {
  bodyId: string;
  bodyPart: BodyPart;
  rarity: string;
}

interface MetaData {
  name: string;
  description: string;
  image: string;
  rarity;
}
