import { mapAuth } from "../../../app/auth/map-auth";
import { permissions } from "../../../app/auth/permissions";

const { administrator, processor, user, recommender, authoriser } = permissions;

jest.mock("../../../app/config", () => ({
  config: {
    superAdmins: ["superadmin@test"],
  },
}));

test("roles in scope", () => {
  const request = {
    auth: {
      isAuthenticated: true,
      credentials: {
        account: {
          username: "notSuperAdmin@test",
        },
        scope: [administrator, processor, user, recommender, authoriser],
      },
    },
  };

  expect(mapAuth(request)).toEqual({
    isAuthenticated: true,
    isAdministrator: true,
    isProcessor: true,
    isUser: true,
    isRecommender: true,
    isAuthoriser: true,
    isSuperAdmin: false,
  });
});

test("empty scope", () => {
  const request = {
    auth: {
      isAuthenticated: true,
      credentials: {
        account: {
          username: "notSuperAdmin@test",
        },
        scope: [],
      },
    },
  };

  expect(mapAuth(request)).toEqual({
    isAuthenticated: true,
    isAdministrator: false,
    isProcessor: false,
    isUser: false,
    isRecommender: false,
    isAuthoriser: false,
    isSuperAdmin: false,
  });
});

test("user is in superAdmin list", () => {
  const request = {
    auth: {
      isAuthenticated: true,
      credentials: {
        account: {
          username: "superadmin@test",
        },
        scope: [administrator],
      },
    },
  };

  expect(mapAuth(request)).toEqual({
    isAuthenticated: true,
    isAdministrator: true,
    isProcessor: false,
    isUser: false,
    isRecommender: false,
    isAuthoriser: false,
    isSuperAdmin: true,
  });
});
