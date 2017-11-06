import * as d3 from 'd3'
import { hilbert as d3Hilbert } from 'd3-hilbert'

export function getOrder(length: number) {
  return Math.floor(Math.log(length) / Math.log(4))
}

export function getHilbertPath(vertices: any[]) {
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
  cellWidth?: number,
  pathVerticies?: string[],
  startCell?: [number, number],
  fft?: number[],
}

export class HilbertGraph {
  private hilbert: any

  constructor(
    private svg: d3.Selection<any, any, any, any>,
    canvasWidth: number,
    private length: number,
  ) {
    this.hilbert = d3Hilbert()
      .order(getOrder(length))
      .canvasWidth(canvasWidth)
      .simplifyCurves(false)

    svg
      .attr('width', canvasWidth)
      .attr('height', canvasWidth)

    const canvas = svg.append('g')

    canvas.append('path')
      .attr('class', 'skeleton')

    canvas.append('path')

    const valTooltip = d3.select('#val-tooltip')
    svg.on('mouseover', () => { valTooltip.style('display', 'inline') })
      .on('mouseout', () => { valTooltip.style('display', 'none') })
      .on('mousemove', () => {
        const coords = d3.mouse(canvas.node() as d3.ContainerElement)
        valTooltip.text(this.hilbert.getValAtXY(coords[0], coords[1]))
          .style('left', d3.event.pageX)
          .style('top', d3.event.pageY)
      })

    this.d3Digest()
  }

  public updateData(buffer: Float32Array) {
    this.svg.selectAll('path').datum(buffer)
  }

  public d3Digest() {
    const hilbertData: HilbertData = {
      start: 0,
      length: this.length,
    }

    this.hilbert.order(getOrder(this.length)).layout(hilbertData)

    this.svg.selectAll('path')
      .datum(hilbertData)
      .attr('d', (d: any) => getHilbertPath(d.pathVertices))
      .attr('transform', (d: any) =>
        `scale(${d.cellWidth}) translate(${d.startCell[0] + 0.5}, ${d.startCell[1] + 0.5})`)

    // this.svg.select('path:not(.skeleton)')
    //     .transition()
    //     .duration(1000)
    //     .ease(d3.easeLinear)
    //     .attrTween('stroke-dasharray', function() {
    //       const l = (this as SVGPathElement).getTotalLength()
    //       const i = d3.interpolateString('0,' + l, l + ',' + l);
    //       return t => i(t)
    //     })
  }
}
