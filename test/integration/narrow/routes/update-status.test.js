const createServer = require("../../../../app/server");
const { administrator } = require("../../../../app/auth/permissions");
const getCrumbs = require("../../../utils/get-crumbs");
const { inCheck, readyToPay } = require("../../../../app/constants/application-status");

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/routes/utils/crumb-cache");
jest.mock("../../../../app/auth");

test("success: update claim", async () => {
  const server = await createServer();
  const auth = {
    strategy: "session-auth",
    credentials: {
      account: {},
      scope: [administrator],
    },
  };
  const crumb = await getCrumbs(server);

  const reference = "FUSH-1010-2020";
  const returnPage = "claims";
  const claimOrAgreement = "claim";
  const page = "1";

  const res = await server.inject({
    method: "post",
    url: "/update-status",
    auth,
    headers: { cookie: `crumb=${crumb}` },
    payload: {
      reference,
      claimOrAgreement,
      page,
      status: inCheck,
      note: "test",
      returnPage,
      crumb,
    },
  });

  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe(
    `/view-${claimOrAgreement}/${reference}?page=${page}&returnPage=${returnPage}`,
  );
});

test("success: update agreement", async () => {
  const server = await createServer();
  const auth = {
    strategy: "session-auth",
    credentials: {
      account: {},
      scope: [administrator],
    },
  };
  const crumb = await getCrumbs(server);

  const reference = "AHWR-1010-2020";
  const claimOrAgreement = "agreement";
  const page = "1";

  const res = await server.inject({
    method: "post",
    url: "/update-status",
    auth,
    headers: { cookie: `crumb=${crumb}` },
    payload: {
      reference,
      claimOrAgreement,
      page,
      status: inCheck,
      note: "test",
      crumb,
    },
  });

  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe(`/view-${claimOrAgreement}/${reference}?page=${page}`);
});

test("success: authorise agreement", async () => {
  const server = await createServer();
  const auth = {
    strategy: "session-auth",
    credentials: {
      account: {},
      scope: [administrator],
    },
  };
  const crumb = await getCrumbs(server);

  const reference = "AHWR-1010-2020";
  const claimOrAgreement = "agreement";
  const page = "1";

  const res = await server.inject({
    method: "post",
    url: "/update-status",
    auth,
    headers: { cookie: `crumb=${crumb}` },
    payload: {
      reference,
      claimOrAgreement,
      page,
      status: readyToPay,
      note: "test",
      crumb,
    },
  });

  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe(`/view-${claimOrAgreement}/${reference}?page=${page}`);
});

test("failure: update claim, missing note", async () => {
  const server = await createServer();
  const auth = {
    strategy: "session-auth",
    credentials: {
      account: {},
      scope: [administrator],
    },
  };
  const crumb = await getCrumbs(server);

  const reference = "FUSH-1010-2020";
  const returnPage = "claims";
  const claimOrAgreement = "claim";
  const page = "1";

  const res = await server.inject({
    method: "post",
    url: "/update-status",
    auth,
    headers: { cookie: `crumb=${crumb}` },
    payload: {
      reference,
      claimOrAgreement,
      page,
      status: inCheck,
      returnPage,
      crumb,
    },
  });

  const errors = [
    {
      text: "Enter note",
      href: "#update-status",
      key: "note",
    },
  ];
  const encodedErrors = Buffer.from(JSON.stringify(errors)).toString("base64");

  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe(
    `/view-${claimOrAgreement}/${reference}?page=${page}&updateStatus=true&errors=${encodedErrors}&returnPage=${returnPage}`,
  );
});

test("failure: update agreement, missing note", async () => {
  const server = await createServer();
  const auth = {
    strategy: "session-auth",
    credentials: {
      account: {},
      scope: [administrator],
    },
  };
  const crumb = await getCrumbs(server);

  const reference = "AJWR-3030-4040";
  const claimOrAgreement = "agreement";
  const page = "1";

  const res = await server.inject({
    method: "post",
    url: "/update-status",
    auth,
    headers: { cookie: `crumb=${crumb}` },
    payload: {
      reference,
      claimOrAgreement,
      page,
      status: inCheck,
      crumb,
    },
  });

  const errors = [
    {
      text: "Enter note",
      href: "#update-status",
      key: "note",
    },
  ];
  const encodedErrors = Buffer.from(JSON.stringify(errors)).toString("base64");

  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe(
    `/view-${claimOrAgreement}/${reference}?page=${page}&updateStatus=true&errors=${encodedErrors}`,
  );
});
