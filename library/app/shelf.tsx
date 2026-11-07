// A decorative row of book spines under the masthead. The pattern is fixed, so
// the row looks the same on every page and every visit.
const colours = ["#7c2a23", "#8a6420", "#2f4a6b", "#4d3320", "#5b3d5e", "#3f5d4a", "#a3753a"];
const heights = [78, 100, 86, 94, 70, 100, 82, 90, 74, 96];
const widths = [14, 20, 12, 24, 16, 12, 22, 14, 18, 26, 12];

const spines = Array.from({ length: 150 }, (_, n) => ({
  colour: colours[(n * 3 + (n % 4)) % colours.length],
  height: heights[(n * 7) % heights.length],
  width: widths[(n * 5) % widths.length],
  banded: n % 3 === 0,
}));

export function Shelf() {
  return (
    <div aria-hidden="true" className="overflow-hidden bg-moss-deep">
      <div className="flex h-11 items-end justify-center gap-px px-px">
        {spines.map((spine, n) => (
          <span
            key={n}
            className="relative block shrink-0 rounded-t-[1px] shadow-[inset_-2px_0_2px_rgb(0_0_0/0.3),inset_1px_0_0_rgb(255_255_255/0.12)]"
            style={{
              backgroundColor: spine.colour,
              height: `${spine.height}%`,
              width: spine.width,
            }}
          >
            {spine.banded && (
              <span className="absolute inset-x-0 top-1.5 h-1 border-y border-brass/70" />
            )}
          </span>
        ))}
      </div>
      {/* The wooden shelf the books stand on. */}
      <div className="h-2 border-t border-[#8a5f33] bg-[#5e3d1f] shadow-[inset_0_-2px_2px_rgb(0_0_0/0.3)]" />
    </div>
  );
}
