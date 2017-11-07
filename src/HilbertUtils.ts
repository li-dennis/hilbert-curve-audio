import * as d3 from 'd3'
import * as Hilbert from './Hilbert'

export function getOrder(length: number) {
  return Math.floor(Math.log(length) / Math.log(4))
}

export function getHilbertPath(vertices: string[]) {
  let path = 'M0 0L0 0'
  vertices.forEach((vert) => {
    switch (vert) {
      case 'U':
        path += 'v-1'
        break
      case 'D':
        path += 'v1'
        break
      case 'L':
        path += 'h-1'
        break
      case 'R':
        path += 'h1'
        break
    }
  })

  return path
}

export type HilbertData = {
  start: number,
  length: number,
  cellWidth: number,
  pathVertices: string[],
  startPoint: Hilbert.Point,
  fft?: number[],
}

export class HilbertGraph {
  private hilbert: any

  constructor(
    private svg: d3.Selection<any, any, any, any>,
    canvasWidth: number,
    private order: number,
  ) {

    this.hilbert = new Hilbert.HilbertCurve(order, canvasWidth)

    svg
      .attr('width', canvasWidth)
      .attr('height', canvasWidth)

    const canvas = svg.append('g')

    canvas.append('path')
      .attr('class', 'skeleton')

    canvas.append('path')

    this.d3Digest()
  }

  public updateData(buffer: Float32Array) {
    this.svg.selectAll('path').datum(buffer)
  }

  public d3Digest() {
    const range = {
      start: 0,
      length: 1 << this.order,
    }

    const path = this.hilbert.layout(range)

    const hilbertData: HilbertData = { ...range, ...path }

    this.svg.selectAll('path')
      .datum(hilbertData)
      .attr('d', (d: HilbertData) => getHilbertPath(d.pathVertices))
      .attr('transform', (d: HilbertData) =>
        `scale(${d.cellWidth}) translate(${d.startPoint.x + 0.5}, ${d.startPoint.y + 0.5})`)

    this.svg.select('path:not(.skeleton)')
        .transition()
        .duration(10000)
        .ease(d3.easePoly)
        .attrTween('stroke-dasharray', function() {
          const l = (this as SVGPathElement).getTotalLength()
          const i = d3.interpolateString('0,' + l, l + ',' + l)
          return (t) => i(t)
        })
  }
}
