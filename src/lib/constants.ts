export const outPath = "./out/";
export const imagesPath = `${outPath}images/`;
export const jsonPath = `${outPath}json/`;
export const maxNumberNFT = 100;

export enum Logs {
  SHOW = "SHOW_LOGS",
  HIDE = "HIDE_LOGS",
}

export enum SVGImagePart {
  accessories = "<!-- accessories -->",
  background = "<!-- bg -->",
  body = "<!-- body -->",
  beard = "<!-- beard -->",
  eyes = "<!-- eyes -->",
  hair = "<!-- hair -->",
}

export enum AspectRatio {
  WIDTH = 1024,
  HEIGHT = 1024,
}

export enum BodyParts {
  accessories = "accessories",
  background = "background",
  body = "body",
  beard = "beard",
  eyes = "eyes",
  hair = "hair",
}

export enum RarityType {
  COMMON = "common",
  RARE = "rare",
  EPIC = "epic",
}

export enum Rarity {
  accessories = 0.75,
  beard = 0.5,
  hair = 0.5,
}

export const adjectives: string[] =
  "fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical".split(
    " "
  );

export const names: string[] =
  "aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis".split(
    " "
  );
