import { sanitizeMuseumHtml, wrapRichHtml } from "../museum";

describe("sanitizeMuseumHtml", () => {
  it("strips script and event handlers", () => {
    const dirty =
      '<p onclick="alert(1)">Hi</p><script>evil()</script><a href="javascript:void(0)">x</a>';
    const clean = sanitizeMuseumHtml(dirty);
    expect(clean).not.toMatch(/script/i);
    expect(clean).not.toMatch(/onclick/i);
    expect(clean).not.toMatch(/javascript:/i);
    expect(clean).toContain("Hi");
  });
});

describe("wrapRichHtml", () => {
  it("returns empty for blank input", () => {
    expect(wrapRichHtml("   ")).toBe("");
  });

  it("wraps plain text in a paragraph", () => {
    expect(wrapRichHtml("Hello")).toBe("<p>Hello</p>");
  });

  it("keeps existing markup", () => {
    expect(wrapRichHtml("<em>Hello</em>")).toBe("<em>Hello</em>");
  });
});
