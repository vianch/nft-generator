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
  BodyParts,
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
import { getRangeRandomInt, randomElement } from "../utils/random.utils";
import { countOccurrences } from "../utils/arrays.utils";
import logger, { consoleColors } from "./logger";

const SVGtemplate = `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="3000px" height="3000px" viewBox="0 0 3000 3000"
 preserveAspectRatio="xMidYMid meet">
    ${SVGImagePart.background}
    ${SVGImagePart.body}
    ${SVGImagePart.eyes}
    ${SVGImagePart.hair}
    ${SVGImagePart.beard}
    ${SVGImagePart.accessories}
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

function getRarity(bodyId: string): string {
  const bodyPartsIds = bodyId.split("");
  const numberOfMissingParts = countOccurrences<string>(bodyPartsIds, "0");
  return numberOfMissingParts > 2
    ? RarityType.COMMON
    : numberOfMissingParts === 2
    ? RarityType.RARE
    : RarityType.EPIC;
}

function getRandomBodyPart(
  combinations: number,
  rarityPercentage = 0.0
): number {
  const randomNumber = getRangeRandomInt(1, combinations);

  return Math.random() > rarityPercentage ? randomNumber : 0;
}

function getRandomBody(combinations = 7): CompleteBodyInfo {
  const bodyPart = {
    background: getRandomBodyPart(combinations),
    body: 0,
    eyes: getRandomBodyPart(combinations),
    hair: getRandomBodyPart(combinations, Rarity.hair),
    beard: getRandomBodyPart(combinations, Rarity.beard),
    accessories: getRandomBodyPart(combinations, Rarity.accessories),
  };
  const bodyId = Object.values(bodyPart).join("");

  return {
    bodyId,
    bodyPart,
    rarity: getRarity(bodyId),
  };
}

function getLayer(name: string, version: number): string {
  const filePath = `./layers/${name}/${name}${version}.svg`;
  const existFile = existsSync(filePath);

  if (existFile) {
    const svgFile = readFileSync(filePath, "utf8");
    const regularExpression = /(?<=<svg\s*[^>]*>)([\s\S]*?)(?=<\/svg>)/g || [
      "",
    ];
    const match = svgFile?.match(regularExpression);
    return match ? match[0] : "";
  }

  return "";
}

function getBodyTemplate(bodyPart: BodyPart): string {
  return SVGtemplate.replace(
    SVGImagePart.background,
    getLayer(BodyParts.background, bodyPart.background)
  )
    .replace(SVGImagePart.body, getLayer(BodyParts.body, bodyPart.body))
    .replace(SVGImagePart.eyes, getLayer(BodyParts.eyes, bodyPart.eyes))
    .replace(SVGImagePart.hair, getLayer(BodyParts.hair, bodyPart.hair))
    .replace(SVGImagePart.beard, getLayer(BodyParts.beard, bodyPart.beard))
    .replace(
      SVGImagePart.accessories,
      getLayer(BodyParts.accessories, bodyPart.accessories)
    );
}

function getMetaData(name: string, rarity: RarityType): MetaData {
  return {
    name,
    description: `A drawing of ${name.split("-").join(" ")}`,
    image: `${name}.png`,
    rarity,
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
  const randomBody = getRandomBody();

  if (takenFaces[randomBody.bodyId]) {
    logger.info(
      consoleColors.Yellow,
      `bodyId ${randomBody.bodyId} already exists, trying again`
    );
    createImage();
  } else {
    const name = getRandomName();
    const completeImage = getBodyTemplate(randomBody.bodyPart);
    const imageMetaData = getMetaData(name, randomBody.rarity as RarityType);

    // Export final SVG image and JSON Metadata
    writeFileSync(`${imagesPath}${name}.svg`, completeImage || "");
    writeFileSync(`${jsonPath}${name}.json`, JSON.stringify(imageMetaData));
    svgToPng(name);
    takenFaces[randomBody.bodyId] = randomBody.bodyId;
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
