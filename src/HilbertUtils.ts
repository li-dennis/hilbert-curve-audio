import * as d3 from 'd3'
import { getHilbertPath } from './Hilbert'

const margin = { top: 5, right: 5, bottom: 5, left: 5 }

export class HilbertGraph {
  private svg: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>
  private length: number
  private size: number

  constructor(
    svg: SVGSVGElement,
    private canvasWidth: number,
    order: number,
    private playTone: (frequency: number) => void,
  ) {
    this.length = 1 << order
    this.size = 1 << (order / 2)
    this.svg = d3.select(svg)
      .attr('width', canvasWidth + margin.left + margin.right)
      .attr('height', canvasWidth + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
  }

  public getData() {
    return getHilbertPath(0, this.length, this.size)
  }

  public update(buffer: Float32Array) {
    const scale = d3.scaleLinear()
      .domain([ 0, this.size ])
      .range([ 0, this.canvasWidth ])

    const colorScale = d3.scaleLinear<d3.RGBColor>()
      .domain([ 0, this.length ])
      .interpolate(d3.interpolateHcl)
      .range([ d3.rgb('#007AFF'), d3.rgb('#FFF500') ])

    const freqScale = d3.scaleLinear()
      .domain([ 0, this.length ])
      .range([ 10, 14000 ])
    // const circleGroup = svgSelection.append('g')

    // const line = d3.line<Point>()
    //   .x((d) => scale(d.x))
    //   .y((d) => scale(d.y))

    const data = this.getData()

    this.svg.selectAll('circle')
      .data(data)
      .enter().append('circle')
        .attr('cx', (d) => scale(d.x))
        .attr('cy', (d) => scale(d.y))
        .attr('r', 5)
        .on('mouseover', (d, i, nodes) => {
          d3.select(nodes[i]).attr('fill', () => colorScale(i))
          this.playTone(freqScale(i))
        })
        .on('mouseout', (d, i, nodes) => {
          d3.select(nodes[i]).attr('fill', null)
          this.playTone(0)
        })
  }

}
