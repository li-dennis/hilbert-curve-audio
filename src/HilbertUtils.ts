import * as d3 from 'd3'
import { hilbert as d3Hilbert } from 'd3-hilbert'

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

export function d3Digest(hilbert: any, svg: d3.Selection<any, any, any, any>, canvasWidth: number, length: number) {
  const hilbertData = {
    start: 0,
    length,
  }

  hilbert.order(Math.floor(Math.log(length) / Math.log(4))).layout(hilbertData)

  svg.selectAll('path')
    .datum(hilbertData)
    .attr('d', (d: any) => getHilbertPath(d.pathVertices))
    .attr('transform', (d: any) =>
      `scale(${d.cellWidth}) translate(${d.startCell[0] + 0.5}, ${d.startCell[1] + 0.5})`)

  svg.select('path:not(.skeleton)')
      .transition()
      .duration(length * 1000)
      .ease(d3.easePoly)
}

export function init(svg: d3.Selection<any, any, any, any>, canvasWidth: number, order: number) {
  const hilbert = d3Hilbert()
    .order(order)
    .canvasWidth(canvasWidth)
    .simplifyCurves(false)

  svg.attr('width', canvasWidth).attr('height', canvasWidth)

  const canvas = svg.append('g')

  canvas.append('path').attr('class', 'skeleton')
  canvas.append('path')

  d3Digest(hilbert, svg, canvasWidth, order)
}
