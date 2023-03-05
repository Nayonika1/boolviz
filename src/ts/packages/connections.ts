import Coord from "./coord.js"
import { GateTable, Gate } from "./gates.js"
import Grid from "./grid.js"

const CONNECTION_JOIN_GAP = 15 // px

type ConnectionArgs = [number, number[]][]

export class Connections {
  private c: Map<number, Set<number>>

  constructor(args: ConnectionArgs) {
    this.c = new Map(args.map(
      ([idx, idxs]) => [idx, new Set(idxs)]
    ))
  }

  static Default(): Connections {
    return new Connections([])
  }

  asPlain(): ConnectionArgs {
    return [...this.c].map(
      ([idx, idxSet]) => [idx, [...idxSet]]
    )
  }

  add(from: number, to: number) {
    if (!this.c.has(from)) {
      this.c.set(from, new Set())
    }
    this.c.get(from)?.add(to)
  }

  delete(from: number, to: number) {
    this.c.get(from)?.delete(to)
  }

  has(from: number, to: number): boolean {
    return this.c.has(from) && (this.c.get(from) as Set<number>).has(to)
  }

  deleteAll(from: number) {
    this.c.delete(from)
    this.c.forEach(tos => tos.delete(from))
  }

  forEach(callback: (from: number, to: number) => void) {
    this.c.forEach((tos, from) => tos.forEach(to => callback(from, to)))
  }

  table(): Map<number, Set<number>> { return this.c }

  invert(): Connections {
    const m = Connections.Default()
    this.c.forEach((tos, from) => {
      tos.forEach(to => {
        m.add(to, from)
      })
    })
    return m
  }
}

const getCoord = (adjuster: (c: Coord) => Coord) => (gt: GateTable) => (index: number): Coord => {
  const { coord } = gt.get(index) as Gate
  return adjuster(coord)
}

const getAdjustedCoord = (left: boolean) => (g: Grid) => getCoord(c => {
  const rect = g.getGridRect(c)
  return new Coord(
    (left) ? (rect.x + CONNECTION_JOIN_GAP) : (rect.x + rect.w - CONNECTION_JOIN_GAP),
    rect.y + (rect.h / 2)
  )
})

const getFromCoord = getAdjustedCoord(false)
const getToCoord = getAdjustedCoord(true)

const getControlPoints = (from: Coord, to: Coord): [Coord, Coord] => {
  const xavg = (from.x + to.x) / 2
  return [
    new Coord(xavg, from.y), new Coord(xavg, to.y)
  ]
}

export type IndexCoordMapper = (index: number) => Coord

export const getCoordMappers = (g: Grid) => (gt: GateTable) => [getFromCoord(g)(gt), getToCoord(g)(gt)]

export const drawConnection = (
  (ctx: CanvasRenderingContext2D) =>
  (fromCoordMap: IndexCoordMapper, toCoordMap: IndexCoordMapper) =>
  (from: number, to: number) => {
    const [fcoord, tcoord] = [fromCoordMap(from), toCoordMap(to)]
    const [cp1, cp2] = getControlPoints(fcoord, tcoord)
    ctx.beginPath()
    ctx.moveTo(fcoord.x, fcoord.y)
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tcoord.x, tcoord.y)
    ctx.stroke()
    ctx.closePath()
  }
)

export const drawConnections = (g: Grid) => (gt: GateTable) => (c: Connections, configure: (f: [number, number], ctx: CanvasRenderingContext2D) => void) => {
  const { ctx } = g
  const [gfcoord, gtcoord] = getCoordMappers(g)(gt)
  ctx.save()
  ctx.lineWidth = 2
  const drawer = drawConnection(ctx)(gfcoord, gtcoord)
  c.forEach((from, to) => {
    configure([from, to], ctx)
    drawer(from, to)
  })
  ctx.restore()
}
