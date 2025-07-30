import { getHerdBreakdown } from "../../app/lib/get-herd-breakdown";

const sheepClaimOneWithSheepiesHerd = {
  id: "4e62d9cb-0046-421e-8296-7051a584723b",
  reference: "RESH-DQY4-8HY1",
  applicationReference: "IAHW-B5TU-EXLN",
  data: {
    herdId: "ac50d45b-f264-4cb0-b044-73d268b24b54",
    herdVersion: 1,
    herdAssociatedAt: "2025-05-29T12:29:19.256Z",
    typeOfLivestock: "sheep",
  },
  herd: {
    id: "ac50d45b-f264-4cb0-b044-73d268b24b54",
    version: 1,
    applicationReference: "IAHW-B5TU-EXLN",
    species: "sheep",
    herdName: "Sheepies",
    cph: "11/222/3333",
    herdReasons: ["separateManagementNeeds", "uniqueHealthNeeds"],
    isCurrent: true,
    createdBy: "admin",
    createdAt: "2025-05-29T12:29:19.247Z",
    updatedBy: null,
    updatedAt: null,
  },
};

const pigsClaimWithHerd = {
  id: "b318fd90-bf09-48a9-9eff-2bb867329bd2",
  reference: "REPI-3AHD-TCZ4",
  applicationReference: "IAHW-B5TU-EXLN",
  data: {
    herdId: "3a8f0534-cef1-4d59-b8b2-256b99a406d3",
    herdVersion: 1,
    typeOfLivestock: "pigs",
    herdAssociatedAt: "2025-05-29T08:33:30.076Z",
  },
  herd: {
    id: "3a8f0534-cef1-4d59-b8b2-256b99a406d3",
    version: 1,
    applicationReference: "IAHW-B5TU-EXLN",
    species: "pigs",
    herdName: "Piggies",
    cph: "11/222/3333",
    herdReasons: [
      "differentBreed",
      "differentPurpose",
      "keptSeparate",
      "other",
      "separateManagementNeeds",
      "uniqueHealthNeeds",
    ],
    isCurrent: true,
    createdBy: "admin",
    createdAt: "2025-05-29T08:33:30.034Z",
    updatedBy: null,
    updatedAt: null,
  },
};

const beefClaimWithHerd = {
  id: "9f572ce2-74da-4479-83ae-b6fa41cbf588",
  reference: "REBC-GIKY-AA7F",
  applicationReference: "IAHW-B5TU-EXLN",
  data: {
    herdId: "749908bc-072c-462b-a004-79bff170cbba",
    herdVersion: 1,
    typeOfLivestock: "beef",
    herdAssociatedAt: "2025-05-22T14:03:33.971Z",
  },
  herd: {
    id: "749908bc-072c-462b-a004-79bff170cbba",
    version: 1,
    applicationReference: "IAHW-B5TU-EXLN",
    species: "beef",
    herdName: "Fattening herd",
    cph: "22/333/4444",
    herdReasons: ["onlyHerd"],
    isCurrent: true,
    createdBy: "admin",
    createdAt: "2025-05-22T14:03:33.965Z",
    updatedBy: null,
    updatedAt: null,
  },
};

const beefClaimNoHerd = {
  id: "8e0ba13b-cbc4-4cf4-853b-d4b00f54a1df",
  reference: "REBC-8WWT-W7V5",
  applicationReference: "IAHW-B5TU-EXLN",
  data: {
    typeOfLivestock: "beef",
  },
};

const sheepClaimTwoWithSheepiesHerd = {
  id: "f3fe787c-d0ec-4b83-9dc9-df7f1421e4cd",
  reference: "RESH-3UC6-B6GS",
  applicationReference: "IAHW-B5TU-EXLN",
  data: {
    herdId: "ac50d45b-f264-4cb0-b044-73d268b24b54",
    herdVersion: 1,
    typeOfLivestock: "sheep",
    herdAssociatedAt: "2025-05-29T12:29:19.256Z",
    numberAnimalsTested: "21",
  },
  herd: {
    id: "ac50d45b-f264-4cb0-b044-73d268b24b54",
    version: 1,
    applicationReference: "IAHW-B5TU-EXLN",
    species: "sheep",
    herdName: "Sheepies",
    cph: "11/222/3333",
    herdReasons: ["separateManagementNeeds", "uniqueHealthNeeds"],
    isCurrent: true,
    createdBy: "admin",
    createdAt: "2025-05-29T12:29:19.247Z",
    updatedBy: null,
    updatedAt: null,
  },
};

describe("getHerdBreakdown", () => {
  test("it returns a proper breakdown if all the herds are different", () => {
    const strippedDownClaims = [
      sheepClaimOneWithSheepiesHerd,
      pigsClaimWithHerd,
      beefClaimWithHerd,
    ];
    const result = getHerdBreakdown(strippedDownClaims);

    expect(result).toEqual({
      herdBreakdown: { beef: 1, dairy: 0, pigs: 1, sheep: 1 },
    });
  });

  test("it returns a proper breakdown if two of the claims have the same herd", () => {
    const strippedDownClaims = [
      sheepClaimOneWithSheepiesHerd,
      pigsClaimWithHerd,
      beefClaimWithHerd,
      sheepClaimTwoWithSheepiesHerd,
    ];
    const result = getHerdBreakdown(strippedDownClaims);

    expect(result).toEqual({
      herdBreakdown: { beef: 1, dairy: 0, pigs: 1, sheep: 1 },
    });
  });

  test("it returns a proper breakdown if there is a claim with no herd (so it is counted as an unnamed herd)", () => {
    const strippedDownClaims = [
      sheepClaimOneWithSheepiesHerd,
      pigsClaimWithHerd,
      beefClaimWithHerd,
      beefClaimNoHerd,
    ];
    const result = getHerdBreakdown(strippedDownClaims);

    expect(result).toEqual({
      herdBreakdown: { beef: 2, dairy: 0, pigs: 1, sheep: 1 },
    });
  });

  test("it returns a proper breakdown if there is are many claims all with no herd information (they are all counted as the same unnamed herd)", () => {
    const strippedDownClaims = [
      sheepClaimOneWithSheepiesHerd,
      pigsClaimWithHerd,
      beefClaimWithHerd,
      beefClaimNoHerd,
      beefClaimNoHerd,
      beefClaimNoHerd,
      beefClaimNoHerd,
      beefClaimNoHerd,
      beefClaimNoHerd,
    ];
    const result = getHerdBreakdown(strippedDownClaims);

    expect(result).toEqual({
      herdBreakdown: { beef: 2, dairy: 0, pigs: 1, sheep: 1 },
    });
  });
});
