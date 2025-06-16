import { getPagination, getPagingData } from "../../app/pagination";

describe("Pagination", () => {
  test("getPagination test", () => {
    const result = getPagination(100, 10);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(990);
  });
  test("getPagination test for first page", () => {
    const result = getPagination(1, 20);
    expect(result.pages).toBe(undefined);
    expect(result.previous).toBe(undefined);
    expect(result.next).toBe(undefined);
  });
  test("getPagination test for first page without parameter", () => {
    const result = getPagination();
    expect(result.pages).toBe(undefined);
    expect(result.previous).toBe(undefined);
    expect(result.next).toBe(undefined);
  });
  test("getPagingData test", () => {
    const totalPages = 100;
    const result = getPagingData(totalPages, 20, { page: 1 });
    expect(result.pages).not.toBeNull();
    expect(result.previous).toBeNull();
    expect(result.next).toStrictEqual({ href: "?page=2" });
  });

  test("getPagingData test for page 4/5", () => {
    const totalPages = 100;
    const result = getPagingData(totalPages, 20, { page: 4 });
    expect(result.pages).toStrictEqual([
      { current: false, href: "?page=2", number: 2 },
      { current: false, href: "?page=3", number: 3 },
      { current: true, href: "?page=4", number: 4 },
      { current: false, href: "?page=5", number: 5 },
    ]);
    expect(result.previous).toStrictEqual({ href: "?page=3" });
    expect(result.next).toStrictEqual({ href: "?page=5" });
  });

  test("getPagingData test for page 5/5", () => {
    const totalPages = 100;
    const result = getPagingData(totalPages, 20, { page: 5 });
    expect(result.pages).toStrictEqual([
      { current: false, href: "?page=3", number: 3 },
      { current: false, href: "?page=4", number: 4 },
      { current: true, href: "?page=5", number: 5 },
    ]);
    expect(result.previous).toStrictEqual({ href: "?page=4" });
    expect(result.next).toBeNull();
  });
});
