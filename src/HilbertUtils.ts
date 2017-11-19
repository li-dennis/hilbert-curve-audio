import * as d3 from 'd3'
import * as Hilbert from './Hilbert'

export class HilbertGraph {
  constructor(
    context: CanvasRenderingContext2D,
    canvasWidth: number,
    order: number,
  ) {
    const length = 1 << order
    const size = 1 << (order / 2)
    const data = Hilbert.getHilbertPath(0, length, size)

    const scale = d3.scaleLinear()
      .domain([ 0, size ])
      .range([ 0, canvasWidth ])

    const line = d3.line<Hilbert.Point>()
      .x((d) => scale(d.x))
      .y((d) => scale(d.y))
      .context(context)

    context.beginPath()
    line(data)
    context.lineWidth = 1.5
    context.strokeStyle = 'steelblue'
    context.stroke()
  }

}
