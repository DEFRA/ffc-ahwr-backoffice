const {
  getClaimViewStates,
} = require("../../../../app/routes/utils/get-claim-view-states");
const { status } = require("../../../../app/constants/status");
const {
  administrator,
  recommender,
  authoriser,
  user,
} = require("../../../../app/auth/permissions");

jest.mock("../../../../app/config", () => ({
  ...jest.requireActual("../../../../app/config"),
  superAdmins: ["currentuser@test"],
}));

const currentUser = "testUser";

test("status: agreed, user: admin", () => {
  const request = {
    query: {
      withdraw: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const state = getClaimViewStates(request, status.AGREED);

  expect(state).toEqual({
    withdrawAction: true,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: agreed, user: recommender", () => {
  const request = {
    query: {
      withdraw: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const state = getClaimViewStates(request, status.AGREED);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: agreed, user: authoriser", () => {
  const request = {
    query: {
      withdraw: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const state = getClaimViewStates(request, status.AGREED);

  expect(state).toEqual({
    withdrawAction: true,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: agreed, query: withdraw, user: admin", () => {
  const request = {
    query: {
      withdraw: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const state = getClaimViewStates(request, status.AGREED);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: true,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: agreed, query: withdraw, user: recommender", () => {
  const request = {
    query: {
      withdraw: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const state = getClaimViewStates(request, status.AGREED);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: agreed, query: withdraw, user: authoriser", () => {
  const request = {
    query: {
      withdraw: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const state = getClaimViewStates(request, status.AGREED);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: true,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: on hold, user: admin", () => {
  const request = {
    query: {
      moveToInCheck: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const state = getClaimViewStates(request, status.ON_HOLD);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: true,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: on hold, user: recommender", () => {
  const request = {
    query: {
      moveToInCheck: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const state = getClaimViewStates(request, status.ON_HOLD);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: true,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: on hold, user: authoriser", () => {
  const request = {
    query: {
      moveToInCheck: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const state = getClaimViewStates(request, status.ON_HOLD);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: true,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: on hold, user: user", () => {
  const request = {
    query: {
      moveToInCheck: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [user],
      },
    },
  };
  const state = getClaimViewStates(request, status.ON_HOLD);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: on hold, query: moveToInCheck, user: admin", () => {
  const request = {
    query: {
      moveToInCheck: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const state = getClaimViewStates(request, status.ON_HOLD);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: true,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: on hold, query: moveToInCheck, user: recommender", () => {
  const request = {
    query: {
      moveToInCheck: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const state = getClaimViewStates(request, status.ON_HOLD);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: true,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: on hold, query: moveToInCheck, user: authoriser", () => {
  const request = {
    query: {
      moveToInCheck: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const state = getClaimViewStates(request, status.ON_HOLD);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: true,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, user: admin", () => {
  const request = {
    query: {
      recommendToPay: false,
      recommendToReject: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: true,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, user: recommender", () => {
  const request = {
    query: {
      recommendToPay: false,
      recommendToReject: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: true,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, user: authoriser", () => {
  const request = {
    query: {
      recommendToPay: false,
      recommendToReject: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, query: recommendToPay, user: admin", () => {
  const request = {
    query: {
      recommendToPay: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: true,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, query: recommendToPay, user: recommender", () => {
  const request = {
    query: {
      recommendToPay: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: true,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, query: recommendToPay, user: authoriser", () => {
  const request = {
    query: {
      recommendToPay: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, query: recommendToReject, user: admin", () => {
  const request = {
    query: {
      recommendToReject: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: true,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, query: recommendToReject, user: recommender", () => {
  const request = {
    query: {
      recommendToReject: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: true,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in check, query: recommendToReject, user: authoriser", () => {
  const request = {
    query: {
      recommendToReject: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const state = getClaimViewStates(request, status.IN_CHECK);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to pay, user: admin, recommender: different person", () => {
  const request = {
    query: {
      approve: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_PAY,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: true,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to pay, user: admin, recommender: same person", () => {
  const request = {
    query: {
      approve: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: currentUser,
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_PAY,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to pay, user: recommender, recommender: different person", () => {
  const request = {
    query: {
      approve: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_PAY,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to pay, user: authoriser, recommender: different person", () => {
  const request = {
    query: {
      approve: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_PAY,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: true,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to pay, query: approve, user: admin, recommender: different person", () => {
  const request = {
    query: {
      approve: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_PAY,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: true,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to pay, query: approve, user: recommender, recommender: different person", () => {
  const request = {
    query: {
      approve: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_PAY,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to pay, query: approve, user: authoriser, recommender: different person", () => {
  const request = {
    query: {
      approve: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_PAY,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: true,
    rejectAction: false,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to reject, user: admin, recommender: different person", () => {
  const request = {
    query: {
      reject: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_REJECT,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: true,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to reject, user: admin, recommender: same person", () => {
  const request = {
    query: {
      reject: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: currentUser,
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_REJECT,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to reject, user: recommender, recommender: different person", () => {
  const request = {
    query: {
      reject: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_REJECT,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to reject, user: authoriser, recommender: different person", () => {
  const request = {
    query: {
      reject: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_REJECT,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: true,
    rejectForm: false,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to reject, query: reject, user: admin, recommender: different person", () => {
  const request = {
    query: {
      reject: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_REJECT,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: true,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to reject, query: reject, user: admin, recommender: same person", () => {
  const request = {
    query: {
      reject: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [administrator],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: currentUser,
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_REJECT,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to reject, query: reject, user: recommender, recommender: different person", () => {
  const request = {
    query: {
      reject: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [recommender],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_REJECT,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("status: in recommended to reject, query: reject, user: authoriser, recommender: different person", () => {
  const request = {
    query: {
      reject: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "" },
        scope: [authoriser],
      },
    },
  };
  const currentStatusEvent = {
    updatedBy: "someone else",
  };
  const state = getClaimViewStates(
    request,
    status.RECOMMENDED_TO_REJECT,
    currentStatusEvent,
  );

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: true,
    updateStatusAction: false,
    updateStatusForm: false,
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("statusUpdateAction, status: any, user: admin", () => {
  const request = {
    query: {
      updateStatus: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "notSuperAdmin@test" },
        scope: [administrator],
      },
    },
  };

  const state = getClaimViewStates(request, status.REJECTED);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("statusUpdateAction, status: any, user: admin & super admin", () => {
  const request = {
    query: {
      updateStatus: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "currentUser@test" },
        scope: [administrator],
      },
    },
  };

  const state = getClaimViewStates(request, status.REJECTED);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateStatusForm: false,
    updateDateOfVisitAction: true,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: true,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: true,
    updateVetsNameForm: false,
  });
});

test("statusUpdateForm, status: any, query: update, user: admin", () => {
  const request = {
    query: {
      update: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "notSuperAdmin@test" },
        scope: [administrator],
      },
    },
  };

  const state = getClaimViewStates(request, status.REJECTED);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: false,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: false,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: false,
    updateVetsNameForm: false,
  });
});

test("statusUpdateForm, status: any, query: updateStatus, user: admin & super admin", () => {
  const request = {
    query: {
      updateStatus: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "currentUser@test" },
        scope: [administrator],
      },
    },
  };

  const state = getClaimViewStates(request, status.REJECTED);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: true,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: true,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: true,
    updateVetsNameForm: false,
  });
});

test("statusUpdateForm, status: ready to pay, query: updateStatus, user: admin & super admin", () => {
  const request = {
    query: {
      updateStatus: true,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "currentUser@test" },
        scope: [administrator],
      },
    },
  };

  const state = getClaimViewStates(request, status.READY_TO_PAY);

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
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
    updateDateOfVisitAction: true,
    updateDateOfVisitForm: false,
    updateVetRCVSNumberAction: true,
    updateVetRCVSNumberForm: false,
    updateVetsNameAction: true,
    updateVetsNameForm: false,
  });
});
