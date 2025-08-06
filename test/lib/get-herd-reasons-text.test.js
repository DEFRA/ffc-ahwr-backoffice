import { getHerdReasonsText } from "../../app/lib/get-herd-reasons-text";

describe("getHerdReasonsText", () => {
  test("it returns '-' when provided with no reasons", async () => {
    expect(getHerdReasonsText()).toEqual("-");
  });

  test("it returns bullet point html when provided with an array of one reason", async () => {
    expect(getHerdReasonsText(["onlyHerd"])).toEqual(
      `<ul class="govuk-list govuk-list--bullet"><li>This is the only herd</li></ul>`,
    );
  });

  test("it returns bullet point html when provided with an array of multiple reasons", async () => {
    expect(getHerdReasonsText(["differentBreed", "differentPurpose", "keptSeparate"])).toEqual(
      `<ul class="govuk-list govuk-list--bullet"><li>They are a different breed</li>
<li>They are used for another purpose</li>
<li>They have been kept completely separate</li></ul>`,
    );
  });
});
