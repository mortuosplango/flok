import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  layer,
  LayerMarker,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import getRhymingPart from "rhyming-part";
import { syllable } from "syllable";

const arKrDec = new MatchDecorator({
  regexp: /\.[aki]r/g,
  decoration: Decoration.mark({
    attributes: {
      style: "opacity: 0.4;",
    },
  }),
});

function poetryDeco(view: EditorView) {
  let builder = new RangeSetBuilder<Decoration>();
  for (let { from, to } of view.visibleRanges) {
    let rhymes: string[] = [];
    for (let pos = from; pos <= to; ) {
      let line = view.state.doc.lineAt(pos);
      const text = line.text;
      if (/^\/\*\s+[0-9]\s+\*\//.test(text)) {
        const from = text.indexOf("{");
        const to = text.indexOf("}");
        const simplifiedText = text.slice(from, to).replace(/\.[aik]r/g, " ");
        const simplifiedTextWithNumbers = simplifiedText
          .replace(/1/g, " one ")
          .replace(/2/g, " two ")
          .replace(/3/g, " three ")
          .replace(/4/g, " four ")
          .replace(/5/g, " five ")
          .replace(/6/g, " six ")
          .replace(/7/g, " seven ")
          .replace(/8/g, " eight ")
          .replace(/9/g, " nine ")
          .replace(/0/g, " zero ")
          .replace(/\*/g, " times ")
          .replace(/\+/g, " plus ")
          .replace(/\-/g, " minus ")
          .replace(/\//g, " divided by ")
          .replace(/tanh/g, "tan h")
          .replace(/unipolar/g, "uni polar")
          .replace(/Osc/g, "Mosk")
          .replace(/[{}()[\,\]\|\.\!]/g, " ")
          .replace(/\Win\W/g, " Bin ")
          .replace(/[A-Z][a-z]*/g, (x) => x + " ");
        // const syllablesOld = [
        //   ...simplifiedTextWithNumbers.matchAll(/[aeiou0-9]+/gi),
        // ].length;

        const syllablesNo = syllable(simplifiedTextWithNumbers)
        const words = [...text.matchAll(/\W([a-zA-Z0-9]+)\W/g)].filter(
          (word) => !["ar", "ir", "kr"].includes(word[1])
        );

        if (syllablesNo) {
          builder.add(
            line.from,
            line.from + 7,
            Decoration.mark({
              attributes: {
                style: `background-color: hsl(${
                    syllablesNo * 2
                } 90% 90%) !important;`,
              },
            })
          );
        }
        builder.add(
          line.from + 7,
          line.from + from + 1,
          Decoration.mark({
            attributes: { style: `opacity: 0.5` },
          })
        );

        if (words.length && simplifiedTextWithNumbers) {
          const lastWord = words[words.length - 1][1]
            .replace(/one/g, "1")
            .replace(/two/g, "2")
            .replace(/three/g, "3")
            .replace(/four/g, "4")
            .replace(/five/g, "5")
            .replace(/six/g, "6")
            .replace(/seven/g, "7")
            .replace(/eight/g, "8")
            .replace(/nine/g, "9")
            .replace(/zero/g, "0")
            .replace(/ Bin /g, " in ")
            .replace(/Mosk/g, "Osc");
          const rhyme = getRhymingPart(simplifiedTextWithNumbers) as string;
          if (rhyme) {
            if (!rhymes.includes(rhyme)) {
              rhymes.push(rhyme);
            }

            let lastWordPos = 0;
            let moreWords = true;
            while (moreWords) {
              const newPos = text.indexOf(
                lastWord,
                lastWordPos + lastWord.length
              );
              if (newPos !== -1) {
                lastWordPos = newPos;
              } else {
                moreWords = false;
              }
            }
            builder.add(
              line.from + lastWordPos,
              line.from + lastWordPos + lastWord.length,
              Decoration.mark({
                attributes: {
                  style: `background-color: hsl(${Math.floor(
                    rhymes.indexOf(rhyme) * 200
                  )} 90% 90%) !important;`,
                },
              })
            );
          } else {
            console.warn(
              "how do I rhyme",
              lastWord,
              "in",
              simplifiedTextWithNumbers
            );
          }
        }
      }
      pos = line.to + 1;
    }
  }
  return builder.finish();
}

const layerMarkerMaker = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
) => {
  const lm: LayerMarker & { coordinates: [number, number, number, number] } = {
    eq: (
      other: LayerMarker & { coordinates?: [number, number, number, number] }
    ) =>
      !!other.coordinates &&
      other.coordinates?.filter((x, i) => x == [x1, y1, x2, y2][i]).length ===
        4,
    draw: () => {
      const div = document.createElement("div");
      div.className = "hmhm-svg";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      div.appendChild(svg);
      svg.setAttribute("width", "1500px");
      svg.setAttribute("height", "1500px");
    
      // Create filter definitions
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      svg.appendChild(defs);
      
      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "drop-shadow");
      defs.appendChild(filter);
    
      const feDropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow");
      feDropShadow.setAttribute("dx", "2");
      feDropShadow.setAttribute("dy", "2");
      feDropShadow.setAttribute("stdDeviation", "2");
      feDropShadow.setAttribute("flood-color", "black");
      feDropShadow.setAttribute("flood-opacity", "0.5");
      filter.appendChild(feDropShadow);
    
      // Create cubic Bézier path
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      
      // Calculate control points (values change curvature)
      const cx1 = x1 + 0;  // First control point X
      const cy1 = y1 + 0;   // First control point Y
      const cx2 = x2 - 0;  // Second control point X
      const cy2 = y2 - 0;   // Second control point Y
    
      // Cubic Bézier path command (C cx1 cy1, cx2 cy2, x2 y2)
      const pathData = `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
      
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-width", "3px");
      path.setAttribute("stroke-dasharray", "1,5");
      path.setAttribute("filter", "url(#drop-shadow)");
      
      svg.appendChild(path);
      return div;
    },
    coordinates: [x1, y1, x2, y2],
  };
  return lm;
};

const backlayer = layer({
  above: false,
  update: (update) => update.docChanged,
  markers: (view) => {
    const offsetTop = 20;
    let rhymes: { x: number; y: number; name: string }[] = [];
    const newMarkers: LayerMarker[] = [];
    for (let { from, to } of view.visibleRanges) {
      for (let pos = from; pos <= to; ) {
        let line = view.state.doc.lineAt(pos);
        const text = line.text;
        if (/^\/\*\s+[0-9]\s+\*\//.test(text)) {
          const ugens = [...text.matchAll(/[A-Z][a-zA-Z0-9]+/g)];

          if (ugens.length) {
            ugens.forEach((ugen) => {
              const { left = 0, top = 0 } =
                view.coordsAtPos(pos + text.indexOf(ugen[0])) || {};

              rhymes.push({ x: left, y: top - offsetTop, name: ugen[0] });
            });
          }
        }
        pos = line.to + 1;
      }
    }
    rhymes.forEach((rhyme, i) => {
      const rw = rhymes.slice(i + 1).find((r) => r.name === rhyme.name);
      if (rw) {
        newMarkers.push(
          layerMarkerMaker(
            rhyme.x,
            rhyme.y,
            rw.x,
            rw.y,
            `hsl(${Math.floor(i * 2) + 40} 90% 50%)`
          )
        );
      }
    });
    return newMarkers;
  },
});

const poetryExtensions = [
  ViewPlugin.define(
    (view) => ({
      decorations: arKrDec.createDeco(view),
      update(u) {
        //   console.info("decorations update", u)
        this.decorations = arKrDec.updateDeco(u, this.decorations);
      },
      destroy() {
        //   console.info("decorations destroy")
      },
    }),
    {
      decorations: (v) => v.decorations,
    }
  ),
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = poetryDeco(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = poetryDeco(update.view);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  ),
  backlayer,
];

export default poetryExtensions;
