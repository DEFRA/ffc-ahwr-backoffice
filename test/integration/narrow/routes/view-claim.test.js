import * as cheerio from "cheerio";
import { getClaim, getClaims } from "../../../../app/api/claims";
import { permissions } from "../../../../app/auth/permissions";
import { getApplication, getApplicationHistory } from "../../../../app/api/applications";
import { config } from "../../../../app/config/index";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";
const { administrator, recommender } = permissions;

jest.mock("../../../../app/auth");
jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/applications");
jest.mock("@hapi/wreck", () => ({
  get: jest.fn().mockResolvedValue({ payload: [] }),
}));

describe("View claim test", () => {
  config.multiHerdsEnabled = false;
  const url = "/view-claim";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test" } },
  };
  const application = {
    id: "787b407f-29da-4d75-889f-1c614d47e87e",
    reference: "AHWR-1234-APP1",
    data: {
      type: "EE",
      reference: null,
      declaration: true,
      offerStatus: "accepted",
      organisation: {
        sbi: "113494460",
        name: "Test Farm Lodge",
        email: "russelldaviese@seivadllessurm.com.test",
        orgEmail: "orgEmail@gmail.com",
        address:
          "Tesco Stores Ltd,Harwell,Betton,WHITE HOUSE FARM,VINCENT CLOSE,LEIGHTON BUZZARD,HR2 8AN,United Kingdom",
        userType: "newUser",
        farmerName: "Russell Paul Davies",
      },
      confirmCheckDetails: "yes",
    },
    claimed: false,
    createdAt: "2024-03-22T12:19:04.696Z",
    updatedAt: "2024-03-22T12:19:04.696Z",
    createdBy: "sql query",
    updatedBy: null,
    statusId: 1,
    type: "EE",
    status: "AGREED",
    flags: [],
  };
  const claims = [
    {
      id: "58b297c9-c983-475c-8bdb-db5746899cec",
      reference: "AHWR-1111-6666",
      applicationReference: "AHWR-1234-APP1",
      data: {
        typeOfLivestock: "pigs",
        vetsName: "Vet one",
        dateOfVisit: "2024-03-22T00:00:00.000Z",
        dateOfTesting: "2024-03-22T00:00:00.000Z",
        vetRCVSNumber: "1233211",
        laboratoryURN: "123456",
        speciesNumbers: "yes",
        numberOfOralFluidSamples: "6",
        numberAnimalsTested: "40",
        testResults: "positive",
      },
      statusId: 8,
      type: "R",
      createdAt: "2024-03-25T12:20:18.307Z",
      updatedAt: "2024-03-25T12:20:18.307Z",
      createdBy: "sql query",
      updatedBy: null,
      status: "PAID",
      flags: [],
    },
    {
      id: "5e8558ee-31d7-454b-a061-b8c97bb91d56",
      reference: "AHWR-0000-4444",
      applicationReference: "AHWR-1234-APP1",
      data: {
        vetsName: "12312312312sdfsdf",
        dateOfVisit: "2024-03-22T00:00:00.000Z",
        dateOfTesting: "2024-03-22T00:00:00.000Z",
        vetRCVSNumber: "1233211",
        speciesNumbers: "yes",
        typeOfLivestock: "sheep",
        laboratoryURN: "123456",
        numberAnimalsTested: "40",
        sheepEndemicsPackage: "reducedLameness",
        testResults: [
          {
            result: "clinicalSymptomsPresent",
            diseaseType: "heelOrToeAbscess",
          },
          {
            result: "clinicalSymptomsNotPresent",
            diseaseType: "shellyHoof",
          },
          {
            result: "clinicalSymptomsPresent",
            diseaseType: "tickPyaemia",
          },
          {
            result: [
              {
                result: "123",
                diseaseType: "yyyyy",
              },
              {
                result: "ccc",
                diseaseType: "bbbb",
              },
            ],
            diseaseType: "other",
          },
        ],
      },
      statusId: 12,
      type: "E",
      createdAt: "2024-03-20T12:20:18.307Z",
      updatedAt: "2024-03-20T12:20:18.307Z",
      createdBy: "sql query",
      updatedBy: null,
      status: "Recommended to Pay",
      flags: [],
    },
    {
      id: "58b297c9-c983-475c-8bdb-db5746899cec",
      reference: "AHWR-1111-6666",
      applicationReference: "AHWR-1234-APP1",
      data: {
        vetsName: "12312312312sdfsdf",
        biosecurity: {
          biosecurity: "yes",
          assessmentPercentage: "100",
        },
        dateOfVisit: "2024-03-22T00:00:00.000Z",
        dateOfTesting: "2024-03-22T00:00:00.000Z",
        vetRCVSNumber: "1233211",
        speciesNumbers: "yes",
        typeOfLivestock: "pigs",
        numberOfSamplesTested: "6",
        numberAnimalsTested: "40",
        herdVaccinationStatus: "vaccinated",
        diseaseStatus: "4",
        laboratoryURN: "123456",
        reviewTestResults: "positive",
        vetVisitsReviewTestResults: "positive",
      },
      statusId: 8,
      type: "E",
      createdAt: "2024-03-25T12:20:18.307Z",
      updatedAt: "2024-03-25T12:20:18.307Z",
      createdBy: "sql query",
      updatedBy: null,
      status: "PAID",
      flags: [],
    },
    {
      id: "58b297c9-c983-475c-8bdb-db5746899cec",
      reference: "AHWR-1111-6666",
      applicationReference: "AHWR-1234-APP1",
      data: {
        vetsName: "12312312312sdfsdf",
        biosecurity: "no",
        dateOfVisit: "2024-03-22T00:00:00.000Z",
        dateOfTesting: "2024-03-22T00:00:00.000Z",
        vetRCVSNumber: "1233211",
        speciesNumbers: "yes",
        typeOfLivestock: "beef",
        numberOfSamplesTested: "6",
        numberAnimalsTested: "40",
        laboratoryURN: "123456",
        vetVisitsReviewTestResults: "positive",
        testResults: "positive",
        reviewTestResults: "positive",
      },
      statusId: 8,
      type: "E",
      createdAt: "2024-03-25T12:20:18.307Z",
      updatedAt: "2024-03-25T12:20:18.307Z",
      createdBy: "sql query",
      updatedBy: null,
      status: "PAID",
      flags: [],
    },
  ];
  getApplicationHistory.mockReturnValue({ historyRecords: [] });
  afterEach(async () => {
    jest.clearAllMocks();
  });

  let server;

  beforeAll(async () => {
    jest.clearAllMocks();
    server = await createServer();
  });

  describe(`GET ${url} route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "GET",
        url: `${url}/123`,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 200 with review claim type and Pigs species", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const content = [
        { key: "Agreement number", value: "AHWR-1234-APP1" },
        { key: "Agreement date", value: "22/03/2024" },
        { key: "Agreement holder", value: "Russell Paul Davies" },
        {
          key: "Agreement holder email",
          value: "russelldaviese@seivadllessurm.com.test",
        },
        { key: "SBI number", value: "113494460" },
        {
          key: "Address",
          value:
            "Tesco Stores Ltd, Harwell, Betton, WHITE HOUSE FARM, VINCENT CLOSE, LEIGHTON BUZZARD, HR2 8AN, United Kingdom",
        },
        { key: "Business email", value: "orgEmail@gmail.com" },
        { key: "Flagged", value: "No" },
        { key: "Status", value: "Paid" },
        { key: "Claim date", value: "25/03/2024" },
        { key: "Business name", value: "Test Farm Lodge" },
        { key: "Livestock", value: "Pigs" },
        { key: "Type of visit", value: "Animal health and welfare review" },
        { key: "Date of visit", value: "22/03/2024" },
        { key: "Date of sampling", value: "22/03/2024" },
        { key: "51 or more pigs", value: "Yes" },
        { key: "Number of oral fluid samples taken", value: "6" },
        { key: "Vet's name", value: "Vet one" },
        { key: "Vet's RCVS number", value: "1233211" },
        { key: "Number of animals tested", value: "40" },
        { key: "URN", value: "123456" },
      ];
      // Summary list rows expect
      expect($(".govuk-summary-list__row").length).toEqual(21);
      // Application summary details expects
      for (let i = 0; i < 6; i++) {
        expect($(".govuk-summary-list__key").eq(i).text()).toMatch(content[i].key);
        expect($(".govuk-summary-list__value").eq(i).text()).toMatch(content[i].value);
      }
      // Claim summary details expects
      for (let i = 6; i < 20; i++) {
        expect($(".govuk-summary-list__key").eq(i).text()).toMatch(content[i].key);
        expect($(".govuk-summary-list__value").eq(i).text()).toMatch(content[i].value);
      }
    });
    test("returns 200 with endemics claim and sheep species", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[1]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const content = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        { key: "Flagged", value: "No" },
        { key: "Status", value: "Recommended to pay" },
        { key: "Claim date", value: "20/03/2024" },
        { key: "Business name", value: "Test Farm Lodge" },
        { key: "Livestock", value: "Sheep" },
        { key: "Type of visit", value: "Endemic disease follow-ups" },
        { key: "Date of visit", value: "22/03/2024" },
        { key: "Date of sampling", value: "22/03/2024" },
        { key: "21 or more sheep", value: "Yes" },
        { key: "Vet's name", value: "12312312312sdfsdf" },
        { key: "Vet's RCVS number", value: "1233211" },
        { key: "URN", value: "123456" },
        { key: "Number of animals tested", value: "40" },
        { key: "Sheep health package", value: "Lameness" },
        {
          key: "Disease or condition test result",
          value: "Heel or toe abscess (Clinical symptoms present)",
        },
        { key: "", value: "Shelly hoof (Clinical symptoms not present)" },
        { key: "", value: "Tick pyaemia (Clinical symptoms present)" },
        { key: "", value: "yyyyy (123) bbbb (ccc)" },
      ];

      // Summary list rows expect
      expect($(".govuk-summary-list__row").length).toEqual(25);
      // Claim summary details expects
      for (let i = 7; i < 24; i++) {
        expect($(".govuk-summary-list__key").eq(i).text()).toMatch(content[i].key);
        expect($(".govuk-summary-list__value").eq(i).text()).toMatch(content[i].value);
      }
    });
    test.each([
      { type: "R", rows: 8 },
      { type: undefined, rows: 8 },
    ])("returns 200 without claim data", async ({ type, rows }) => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue({ ...claims[0], data: undefined, type });
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue({
        ...application,
        data: { ...application.data, organisation: { address: "" } },
      });

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      // Summary list rows expect to show only application data or if type is provided show application data and type of review
      expect($(".govuk-summary-list__row").length).toEqual(rows);
    });
    test("returns 200 whithout claim data", async () => {
      const encodedErrors =
        "W3sidGV4dCI6IlNlbGVjdCBib3RoIGNoZWNrYm94ZXMiLCJocmVmIjoiI3JlamVjdC1jbGFpbS1wYW5lbCJ9XQ%3D%3D";
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [recommender], account: "test user" },
      };
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444?errors=${encodedErrors}`,
        auth,
      };

      getClaim.mockReturnValue({
        ...claims[0],
        statusId: 5,
        data: undefined,
        type: "R",
      });
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue({
        ...application,
        data: { ...application.data, organisation: { address: "" } },
      });

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      expect($(".govuk-summary-list__row").length).toEqual(8);
    });
    test("returns 200 with endemics claim and pigs species", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[2]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      // Summary list rows expect
      expect($(".govuk-summary-list__row").length).toEqual(25);
      // Claim summary details expects
      const content = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        { key: "Review test result", value: "Positive" },
        { key: "Herd vaccination status", value: "Vaccinated" },
        { key: "URN", value: "123456" },
        { key: "Samples tested", value: "6" },
        { key: "Disease status category", value: "4" },
        {
          key: "Biosecurity assessment",
          value: "Yes, Assessment percentage: 100%",
        },
      ];
      for (let i = 19; i < 24; i++) {
        expect($(".govuk-summary-list__key").eq(i).text()).toMatch(content[i].key);
        expect($(".govuk-summary-list__value").eq(i).text()).toMatch(content[i].value);
      }
    });

    test("the back link should go to agreement details if the user is coming from agreement details page", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444?returnPage=agreement`,
        auth,
      };

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect($(".govuk-back-link").attr("href")).toEqual("/agreement/AHWR-1234-APP1/claims");
    });
    test("the back link should go to all claims main tab if the user is coming from all claims main tab", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect($(".govuk-back-link").attr("href")).toEqual("/claims?page=1");
    });

    test("Multi herds enabled - returns 200", async () => {
      config.multiHerdsEnabled = true;

      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const herd = {
        herdId: "749908bc-072c-462b-a004-79bff170cbba",
        herdVersion: 1,
        herdName: "Fattening herd",
        cph: "22/333/4444",
        herdReasons: ["onlyHerd"],
        species: "pigs",
      };

      getClaim.mockReturnValue({
        ...claims[0],
        herd,
      });
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    test("Multi herds enabled - returns 200 with no herd in claim", async () => {
      config.multiHerdsEnabled = true;

      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    test("Multi herds enabled - returns 200 for sheep", async () => {
      config.multiHerdsEnabled = true;

      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const herd = {
        herdId: "749908bc-072c-462b-a004-79bff170cbba",
        herdVersion: 1,
        herdName: "Fattening herd",
        cph: "22/333/4444",
        herdReasons: ["onlyHerd"],
        species: "sheep",
      };

      getClaim.mockReturnValue({
        ...claims[0],
        data: { ...claims[0].data, typeOfLivestock: "sheep" },
        herd,
      });
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });
  });
});
