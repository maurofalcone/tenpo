import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  labelForFilters,
  loadFilterHistory,
  pushFilterHistory,
} from "@/lib/artwork";

describe("filter history", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("builds a readable label", () => {
    expect(
      labelForFilters({
        q: "moon",
        artist: "Monet",
        classification: "Painting",
        publicDomainOnly: true,
      }),
    ).toBe("“moon” · Monet · Painting · Dominio público");
  });

  it("ignores empty filters and dedupes by signature", async () => {
    expect(await pushFilterHistory({})).toEqual([]);

    await pushFilterHistory({ q: "lake" });
    await pushFilterHistory({ q: "lake" });
    await pushFilterHistory({ artist: "Degas" });

    const history = await loadFilterHistory();
    expect(history).toHaveLength(2);
    expect(history[0].filters.artist).toBe("Degas");
    expect(history[1].filters.q).toBe("lake");
  });

  it("caps history at 8 entries", async () => {
    for (let i = 0; i < 10; i += 1) {
      await pushFilterHistory({ q: `q-${i}` });
    }
    const history = await loadFilterHistory();
    expect(history).toHaveLength(8);
    expect(history[0].filters.q).toBe("q-9");
  });
});
