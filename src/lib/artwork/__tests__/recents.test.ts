import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ArtworkSummary } from "@/lib/api/types";
import {
  loadRecents,
  pushRecent,
  saveRecents,
} from "@/lib/artwork";

function artwork(id: number): ArtworkSummary {
  return {
    id,
    title: `Obra ${id}`,
    artist_display: "Artist",
    image_url: null,
    image_width: null,
    image_height: null,
    date_display: null,
    classification_title: null,
    is_public_domain: true,
  };
}

describe("recents storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("keeps at most 10 recientes and drops the oldest", async () => {
    for (let id = 1; id <= 12; id += 1) {
      await pushRecent(artwork(id));
    }
    const recents = await loadRecents();
    expect(recents).toHaveLength(10);
    expect(recents.map((item) => item.id)).toEqual([
      12, 11, 10, 9, 8, 7, 6, 5, 4, 3,
    ]);
  });

  it("trims and rewrites oversized lists on load", async () => {
    const oversized = Array.from({ length: 15 }, (_, index) =>
      artwork(index + 1),
    );
    await AsyncStorage.setItem("@tenpo/recents", JSON.stringify(oversized));

    const loaded = await loadRecents();
    expect(loaded).toHaveLength(10);
    expect(loaded[0].id).toBe(1);
    expect(loaded[9].id).toBe(10);

    const raw = await AsyncStorage.getItem("@tenpo/recents");
    expect(JSON.parse(raw ?? "[]")).toHaveLength(10);
  });

  it("moves an existing recent to the front", async () => {
    await saveRecents([artwork(1), artwork(2), artwork(3)]);
    const next = await pushRecent(artwork(2));
    expect(next.map((item) => item.id)).toEqual([2, 1, 3]);
  });
});
