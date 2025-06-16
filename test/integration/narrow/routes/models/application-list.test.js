import {
  createModel,
  getApplicationTableHeader,
} from "../../../../../app/routes/models/application-list";
import { applicationsData } from "../../../../data/applications.js";
import { getApplications } from "../../../../../app/api/applications";
import { permissions } from "../../../../../app/auth/permissions";

jest.mock("../../../../../app/api/applications");

const { administrator } = permissions;

describe("Application-list model test", () => {
  test.each([
    { n: 0, field: "Reference", direction: "DESC" },
    { n: 0, field: "Reference", direction: "ASC" },
    { n: 2, field: "Organisation", direction: "DESC" },
    { n: 2, field: "Organisation", direction: "ASC" },
    { n: 3, field: "SBI", direction: "DESC" },
    { n: 3, field: "SBI", direction: "ASC" },
    { n: 4, field: "Apply date", direction: "DESC" },
    { n: 4, field: "Apply date", direction: "ASC" },
    { n: 5, field: "Status", direction: "DESC" },
    { n: 5, field: "Status", direction: "ASC" },
  ])("getApplicationTableHeader $field $direction", async ({ n, field, direction }) => {
    const sortField = { field, direction };
    const ariaSort = direction === "DESC" ? "descending" : "ascending";
    const res = getApplicationTableHeader(sortField);
    expect(res).not.toBeNull();
    expect(res[n].attributes["aria-sort"]).toEqual(ariaSort);
  });

  test.each([
    { n: 0, field: "Reference", direction: "DESC" },
    { n: 0, field: "Reference", direction: "ASC" },
    { n: 2, field: "Organisation", direction: "DESC" },
    { n: 2, field: "Organisation", direction: "ASC" },
    { n: 3, field: "SBI", direction: "DESC" },
    { n: 3, field: "SBI", direction: "ASC" },
    { n: 4, field: "Apply date", direction: "DESC" },
    { n: 4, field: "Apply date", direction: "ASC" },
    { n: 5, field: "Status", direction: "DESC" },
    { n: 5, field: "Status", direction: "ASC" },
  ])("getApplicationTableHeader $field $direction", async ({ n, field, direction }) => {
    const sortField = { field, direction };
    const res = getApplicationTableHeader(sortField);
    expect(res).not.toBeNull();
  });
});

describe("Application-list createModel", () => {
  beforeAll(() => {
    getApplications.mockImplementation(() => applicationsData);
  });

  afterAll(() => {
    getApplications.mockClear();
  });

  test("createModel should return view claims when type EE", async () => {
    const request = {
      yar: { get: jest.fn() },
      query: {},
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: [administrator],
          account: { username: "unit-tester" },
        },
      },
    };
    const result = await createModel(request, 1);
    expect(result.applications[0][6].html).toContain("View claims");
  });
});
