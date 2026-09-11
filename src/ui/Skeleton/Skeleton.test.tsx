import { renderWithProviders } from "@/test/render";
import {
  ArtworkListSkeleton,
  ArtworkRowSkeleton,
  Skeleton,
} from "./index";

describe("Skeleton", () => {
  it("renders a base skeleton block", async () => {
    const { toJSON } = await renderWithProviders(
      <Skeleton className="h-4 w-20" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders artwork row skeleton", async () => {
    const { toJSON } = await renderWithProviders(<ArtworkRowSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders the requested list skeleton count", async () => {
    const { toJSON } = await renderWithProviders(
      <ArtworkListSkeleton count={3} />,
    );

    expect(toJSON()).toBeTruthy();
  });
});
