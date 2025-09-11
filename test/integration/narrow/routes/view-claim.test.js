import * as cheerio from "cheerio";
import { getClaim, getClaims } from "../../../../app/api/claims";
import { permissions } from "../../../../app/auth/permissions";
import { getApplication, getApplicationHistory } from "../../../../app/api/applications";
import { config } from "../../../../app/config/index";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";
import { getPigTestResultRows } from "../../../../app/routes/view-claim";
import { getClaimViewStates } from "../../../../app/routes/utils/get-claim-view-states";
const { administrator } = permissions;

jest.mock("../../../../app/routes/utils/get-claim-view-states");
jest.mock("../../../../app/auth");
jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/applications");
jest.mock("@hapi/wreck", () => ({
  get: jest.fn().mockResolvedValue({ payload: [] }),
}));

describe("View claim test", () => {
  config.pigUpdatesEnabled = false;
  config.superAdmins = ['test']
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
    applicationRedacts: []
  };
  const claims = [
    {
      id: "58b297c9-c983-475c-8bdb-db5746899cec",
      reference: "AHWR-1111-6666",
      applicationReference: "AHWR-1234-APP1",
      data: {
        claimType: "R",
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
        claimType: "E",
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

  const pigFollowUpClaimElisa = {
    id: "58b297c9-c983-475c-8bdb-db5746899cec",
    reference: "FUPI-1111-6666",
    applicationReference: "AHWR-1234-APP1",
    data: {
      amount: 923,
      herdId: "d6242c45-20df-4c69-bf49-a213604dd254",
      vetsName: "Tim",
      claimType: "E",
      biosecurity: {
        biosecurity: "yes",
        assessmentPercentage: "30",
      },
      dateOfVisit: "2025-07-30T00:00:00.000Z",
      herdVersion: 1,
      dateOfTesting: "2025-07-30T00:00:00.000Z",
      laboratoryURN: "22222",
      vetRCVSNumber: "1112223",
      speciesNumbers: "yes",
      typeOfLivestock: "pigs",
      herdAssociatedAt: "2025-07-30T09:50:09.258Z",
      pigsFollowUpTest: "elisa",
      reviewTestResults: "negative",
      numberAnimalsTested: "30",
      pigsElisaTestResult: "positive",
      herdVaccinationStatus: "notVaccinated",
      numberOfSamplesTested: "30",
    },
    statusId: 8,
    type: "E",
    createdAt: "2024-03-25T12:20:18.307Z",
    updatedAt: "2024-03-25T12:20:18.307Z",
    createdBy: "sql query",
    updatedBy: null,
    status: "PAID",
    flags: [],
  };
  getApplicationHistory.mockReturnValue({ historyRecords: [] });
  afterEach(async () => {
    jest.clearAllMocks();
  });

  let server;

  beforeAll(async () => {
    jest.clearAllMocks();
    server = await createServer();

    getClaimViewStates.mockReturnValue({
      moveToInCheckAction: false,
      moveToInCheckForm: false,
      recommendAction: false,
      recommendToPayForm: false,
      recommendToRejectForm: false,
      authoriseAction: false,
      authoriseForm: false,
      rejectAction: false,
      rejectForm: false,
      updateStatusAction: false,
      updateStatusForm: false,
      updateVetsNameAction: false,
      updateVetsNameForm: false,
      updateVetRCVSNumberAction: false,
      updateVetRCVSNumberForm: false,
      updateDateOfVisitAction: false,
      updateDateOfVisitForm: false
    });
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

      const expectedContent = [
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
        { key: "Test result", value: "Positive" },
      ];
      // Summary list rows expect
      expect($(".govuk-summary-list__row").length).toEqual(31);
      // Application summary details expects
      for (const expected of expectedContent) {
        expect($(".govuk-summary-list__key").text()).toMatch(expected.key);
        expect($(".govuk-summary-list__value").text()).toMatch(expected.value);
      }
    });
    test("returns 200 with endemics claim and sheep species", async () => {
      config.superAdmins = ['test']

      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[1]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);
      getClaimViewStates.mockReturnValue({
        moveToInCheckAction: false,
        moveToInCheckForm: false,
        recommendAction: false,
        recommendToPayForm: false,
        recommendToRejectForm: false,
        authoriseAction: false,
        authoriseForm: false,
        rejectAction: false,
        rejectForm: false,
        updateStatusAction: true,
        updateStatusForm: true,
        updateVetsNameAction: true,
        updateVetsNameForm: true,
        updateVetRCVSNumberAction: true,
        updateVetRCVSNumberForm: true,
        updateDateOfVisitAction: true,
        updateDateOfVisitForm: true
      });


      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const expectedContent = [
        { key: "Flagged", value: "No" },
        { key: "Status", value: "Recommended to pay", actions: true },
        { key: "Claim date", value: "20/03/2024" },
        { key: "Business name", value: "Test Farm Lodge" },
        { key: "Livestock", value: "Sheep" },
        { key: "Type of visit", value: "Endemic disease follow-ups" },
        { key: "Date of visit", value: "22/03/2024", actions: true },
        { key: "Date of sampling", value: "22/03/2024" },
        { key: "21 or more sheep", value: "Yes" },
        { key: "Vet's name", value: "12312312312sdfsdf", actions: true },
        { key: "Vet's RCVS number", value: "1233211", actions: true },
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
      expect($(".govuk-summary-list__row").length).toEqual(34);
      // Claim summary details expected
      for (const expected of expectedContent) {
        expect($(".govuk-summary-list__key").text()).toMatch(expected.key);
        expect($(".govuk-summary-list__value").text()).toMatch(expected.value);
        if (expected.actions) {
          expect($(".govuk-summary-list__actions a").text()).toMatch("Change");
        }
      }
    });

    test("should not show actions when agreement is redacted and has permissions", async () => {
      config.superAdmins = ['test']
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };
      getClaim.mockReturnValue(claims[1]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue({ ...application, applicationRedacts: [{ success: 'Y' }] });
      getClaimViewStates.mockReturnValue({
        moveToInCheckAction: false,
        moveToInCheckForm: false,
        recommendAction: false,
        recommendToPayForm: false,
        recommendToRejectForm: false,
        authoriseAction: false,
        authoriseForm: false,
        rejectAction: false,
        rejectForm: false,
        updateStatusAction: true,
        updateStatusForm: true,
        updateVetsNameAction: true,
        updateVetsNameForm: true,
        updateVetRCVSNumberAction: true,
        updateVetRCVSNumberForm: true,
        updateDateOfVisitAction: true,
        updateDateOfVisitForm: true
      });

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect($(".govuk-summary-list__row").length).toEqual(34);
      expect($(".govuk-summary-list__actions").length).toEqual(0);
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
      expect($(".govuk-summary-list__row").length).toEqual(34);
      // Claim summary details expects
      const expectedContent = [
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
      for (const eachEntry of expectedContent) {
        expect($(".govuk-summary-list__key").text()).toMatch(eachEntry.key);
        expect($(".govuk-summary-list__value").text()).toMatch(eachEntry.value);
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

    test("Returns 200 for pigs", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const herd = {
        herdId: "d6242c45-20df-4c69-bf49-a213604dd254",
        herdVersion: 1,
        herdName: "Fattening herd",
        cph: "22/333/4444",
        herdReasons: ["onlyHerd"],
        species: "pigs",
      };

      getClaim.mockReturnValue({
        ...pigFollowUpClaimElisa,
        herd,
      });
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    test("Returns 200 pigs for a follow up", async () => {
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

    test("Returns 200 with no herd in claim", async () => {
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

    test("Returns 200 for sheep", async () => {
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

  describe("getPigTestResultRows", () => {
    it("returns the review test result when the claim is a review", () => {
      const result = getPigTestResultRows(claims[0].data);

      expect(result).toEqual([{ key: { text: "Test result" }, value: { html: "Positive" } }]);
    });

    it("returns the disease status category when the claim is a follow up and the feature flag is turned OFF", () => {
      config.pigUpdatesEnabled = false;
      const result = getPigTestResultRows(claims[2].data);

      expect(result).toEqual([{ key: { text: "Disease status category" }, value: { html: "4" } }]);
    });

    it("returns the ELISA positive when the claim is a follow up and the feature flag is turned ON", () => {
      config.pigUpdatesEnabled = true;
      const result = getPigTestResultRows(pigFollowUpClaimElisa.data);

      expect(result).toEqual([{ key: { text: "Test result" }, value: { html: "ELISA positive" } }]);
    });

    it("returns the ELISA positive when the claim is a follow up and the feature flag is turned ON", () => {
      config.pigUpdatesEnabled = true;
      const pigsFollowUpPcr = {
        ...pigFollowUpClaimElisa,
        data: {
          ...pigFollowUpClaimElisa,
          pigsFollowUpTest: "pcr",
          pigsPcrTestResult: "positive",
          pigsGeneticSequencing: "mlv",
        },
      };
      const result = getPigTestResultRows(pigsFollowUpPcr.data);

      expect(result).toEqual([
        { key: { text: "Test result" }, value: { html: "PCR positive" } },
        {
          key: { text: "Genetic sequencing test results" },
          value: { html: "Modified Live virus (MLV) only" },
        },
      ]);
    });
  });
});
