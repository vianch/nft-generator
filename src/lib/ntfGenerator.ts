import {
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "fs";
import sharp from "sharp";

// Constants
import {
  adjectives,
  AspectRatio,
  FaceParts,
  imagesPath,
  jsonPath,
  maxNumberNFT,
  names,
  outPath,
  Rarity,
  RarityType,
  SVGImagePart,
} from "./constants";

// Utils
import { getRandomInt, randomElement } from "../utils/random.utils";
import logger, { consoleColors } from "./logger";

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
  const randomAdjective = randomElement<string>(adjectives);
  const randomName = randomElement<string>(names);
  const fullName = `${randomAdjective}-${randomName}`;

  if (takenNames[fullName] || !fullName) {
    logger.info(
      consoleColors.Yellow,
      `Name ${fullName} already exists, trying again`
    );
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
  const svgFile = readFileSync(
    `./layers/${name}/${name}${version}.svg`,
    "utf8"
  );
  const regularExpression = /(?<=<svg\s*[^>]*>)([\s\S]*?)(?=<\/svg>)/g || [""];
  const match = svgFile?.match(regularExpression);
  const layer = match ? match[0] : "";
  return Math.random() > skipPercentage && layer ? layer : "";
}

function getFaceTemplate(face: Face): { image: string; rarity: RarityType } {
  const beardLayer = getLayer(FaceParts.beard, face.beard, Rarity.beard);
  const image = SVGtemplate.replace(
    SVGImagePart.background,
    getLayer(FaceParts.background, face.background)
  )
    .replace(SVGImagePart.head, getLayer(FaceParts.head, face.head))
    .replace(SVGImagePart.hair, getLayer(FaceParts.hair, face.hair))
    .replace(SVGImagePart.eyes, getLayer(FaceParts.eyes, face.eyes))
    .replace(SVGImagePart.nose, getLayer(FaceParts.nose, face.nose))
    .replace(SVGImagePart.mouth, getLayer(FaceParts.mouth, face.mouth))
    .replace(SVGImagePart.beard, beardLayer);

  // TODO: Change rarity return to a rarity calculation method
  return {
    image,
    rarity: beardLayer?.length > 0 ? RarityType.RARE : RarityType.COMMON,
  };
}

function getMetaDataAttributes(rarity: RarityType): ImageAttributes[] {
  return rarity === RarityType.RARE
    ? [
        {
          name: FaceParts.beard,
          rarity: Rarity.beard,
        },
      ]
    : [];
}

function getMetaData(name: string, rarity: RarityType): MetaData {
  return {
    name,
    description: `A drawing of ${name.split("-").join(" ")}`,
    image: `${name}.png`,
    rarity,
    attributes: getMetaDataAttributes(rarity),
  };
}

async function svgToPng(name: string): Promise<void> {
  try {
    const svgSource = `${imagesPath}${name}.svg`;
    const destination = `${imagesPath}${name}.png`;
    const image = await sharp(svgSource).png();
    const imageResized = await image.resize(
      AspectRatio.WIDTH,
      AspectRatio.HEIGHT
    );

    await imageResized.toFile(destination);
  } catch (error) {
    const errorMessage = "Cannot convert SVG to PNG";
    logger.error(consoleColors.Red, errorMessage);
    throw new Error(errorMessage);
  }
}

function createImage(): void {
  const randomFace = getRandomFace();

  if (takenFaces[randomFace.faceId]) {
    logger.info(
      consoleColors.Yellow,
      `FaceId ${randomFace.faceId} already exists, trying again`
    );
    createImage();
  } else {
    const name = getRandomName();
    const faceTemplate = getFaceTemplate(randomFace.face);
    const imageMetaData = getMetaData(name, faceTemplate.rarity);

    // Export final SVG image and JSON Metadata
    writeFileSync(`${imagesPath}${name}.svg`, faceTemplate.image || "");
    writeFileSync(`${jsonPath}${name}.json`, JSON.stringify(imageMetaData));
    svgToPng(name);
    takenFaces[randomFace.faceId] = randomFace.faceId;
    logger.info(consoleColors.Green, `- ${name} created`);
  }
}

function buildSetup(): void {
  // Create dir if not exists
  if (!existsSync(outPath)) {
    logger.info(consoleColors.Yellow, `Creating ${outPath} and subfolders`);
    mkdirSync(outPath);
    mkdirSync(imagesPath);
    mkdirSync(jsonPath);
  } else {
    logger.info(consoleColors.Yellow, `Cleaning ${outPath}`);

    // Cleanup dir before each run
    readdirSync(imagesPath).forEach((file: string) =>
      rmSync(`${imagesPath}${file}`)
    );

    readdirSync(jsonPath).forEach((file: string) =>
      rmSync(`${jsonPath}${file}`)
    );
  }
}

export default function nftGenerator(): void {
  logger.info(consoleColors.Green, `STARTING NFT GENERATION`);
  buildSetup();

  for (let i = 0; i < maxNumberNFT; i++) {
    createImage();
  }
}
