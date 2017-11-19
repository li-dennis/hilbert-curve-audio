import * as d3 from 'd3'
import { getHilbertPath } from './Hilbert'

const margin = { top: 5, right: 5, bottom: 5, left: 5 }

export class HilbertGraph {
  constructor(
    svg: SVGSVGElement,
    canvasWidth: number,
    order: number,
  ) {
    const length = 1 << order
    const size = 1 << (order / 2)
    const data = getHilbertPath(0, length, size)

    const svgSelection = d3.select(svg)
      .attr('width', canvasWidth + margin.left + margin.right)
      .attr('height', canvasWidth + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    const scale = d3.scaleLinear()
      .domain([ 0, size ])
      .range([ 0, canvasWidth ])

    const colorScale = d3.scaleLinear<d3.RGBColor>()
      .domain([ 0, length ])
      .interpolate(d3.interpolateHcl)
      .range([ d3.rgb('#007AFF'), d3.rgb('#FFF500') ])

    // const circleGroup = svgSelection.append('g')

    // const line = d3.line<Point>()
    //   .x((d) => scale(d.x))
    //   .y((d) => scale(d.y))

    svgSelection.selectAll('circle')
      .data(data)
      .enter().append('circle')
        .attr('cx', (d) => scale(d.x))
        .attr('cy', (d) => scale(d.y))
        .attr('r', 2)
        .attr('fill', (d, i) => colorScale(i))

  }

}
