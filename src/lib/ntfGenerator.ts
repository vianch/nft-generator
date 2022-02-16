import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from "fs";
import sharp from "sharp";

// Constants
import {
  adjectives,
  FaceParts,
  imagesPath,
  jsonPath,
  maxNumberNFT,
  names,
  outPath,
  Rarity,
  SVGImagePart,
} from "./constants";

// Utils
import { getRandomInt, randomElement } from "@/utils/random.utils";

const SVGtemplate = `
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    ${SVGImagePart.background}
    ${SVGImagePart.head}
    ${SVGImagePart.hair}
    ${SVGImagePart.eyes}
    ${SVGImagePart.nose}
    ${SVGImagePart.mouth}
    ${SVGImagePart.beard}
</svg>`;
const takenNames: NtfNames = {} as NtfNames;
const takenFaces: NtfNames = {} as NtfNames;

function getRandomName(): string {
  const randomAdjective = randomElement(adjectives);
  const randomName = randomElement(names);
  const fullName = `${randomAdjective}-${randomName}`;

  if (takenNames[fullName] || !fullName) {
    return getRandomName();
  } else {
    takenNames[fullName] = fullName;
    return fullName;
  }
}

function getRandomFace(combinations = 4): { faceId: string; face: Face } {
  const face = {
    background: getRandomInt(combinations),
    head: getRandomInt(combinations),
    hair: getRandomInt(combinations),
    eyes: getRandomInt(combinations),
    nose: getRandomInt(combinations),
    mouth: getRandomInt(combinations),
    beard: getRandomInt(combinations),
  };
  const faceId = Object.values(face).join("");

  return {
    faceId,
    face,
  };
}

function getLayer(name: string, version: number, skipPercentage = 0.0): string {
  const svgFile = readFileSync(`./svg/${name}/${name}${version}.svg`, "utf8");
  const regularExpression = /(?<=<svg\s*[^>]*>)([\s\S]*?)(?=<\/svg>)/g;
  const layer = svgFile.match(regularExpression)[0];
  return Math.random() > skipPercentage ? layer : "";
}

function getFaceTemplate(face: Face): string {
  return SVGtemplate.replace(
    SVGImagePart.background,
    getLayer(FaceParts.background, face.background)
  )
    .replace(SVGImagePart.head, getLayer(FaceParts.head, face.head))
    .replace(SVGImagePart.hair, getLayer(FaceParts.hair, face.hair))
    .replace(SVGImagePart.eyes, getLayer(FaceParts.eyes, face.eyes))
    .replace(SVGImagePart.nose, getLayer(FaceParts.nose, face.nose))
    .replace(SVGImagePart.mouth, getLayer(FaceParts.mouth, face.mouth))
    .replace(
      SVGImagePart.beard,
      getLayer(FaceParts.beard, face.beard, Rarity.beard)
    );
}

function getMetaData(name): MetaData {
  return {
    name,
    description: `A drawing of ${name.split("-").join(" ")}`,
    image: `${name}.png`,
    attributes: [
      {
        name: FaceParts.beard,
        rarity: Rarity.beard,
      },
    ],
  };
}

async function svgToPng(name: string): Promise<void> {
  try {
    const svgSource = `${imagesPath}${name}.svg`;
    const destination = `${imagesPath}${name}.png`;
    const image = await sharp(svgSource).png();
    const imageResized = await image.resize(1024, 1024);

    await imageResized.toFile(destination);
  } catch (error) {
    throw new Error(error);
  }
}

function createImage(): void {
  const randomFace = getRandomFace();

  if (takenFaces[randomFace.faceId]) {
    createImage();
  } else {
    const name = getRandomName();
    const finalSVGImage = getFaceTemplate(randomFace.face);
    const imageMetaData = getMetaData(name);

    // Export final SVG image and JSON Metadata
    writeFileSync(`${imagesPath}${name}.svg`, finalSVGImage);
    writeFileSync(`${jsonPath}${name}.json`, JSON.stringify(imageMetaData));
    svgToPng(name);
    takenFaces[randomFace.faceId] = randomFace.faceId;
  }
}

function buildSetup(): void {
  if (existsSync(outPath)) {
    rmSync(outPath);
  }

  mkdirSync(outPath);
}

export default function nftGenerator(): void {
  buildSetup();

  for (let i = 0; i < maxNumberNFT; i++) {
    createImage();
  }
}
