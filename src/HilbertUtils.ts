import * as d3 from 'd3'
import * as d3ScaleChromatic from 'd3-scale-chromatic'
import { getHilbertPath, Point } from './Hilbert'

const margin = { top: 10, right: 10, bottom: 10, left: 10 }

export class HilbertGraph {
  private svg: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>
  private length: number
  private size: number

  private lineGroup: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>
  private graphGroup: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>

  private points: Point[]

  constructor(
    svg: SVGSVGElement,
    private canvasWidth: number,
    order: number,
    playTone: (frequency: number) => void,
  ) {
    this.length = 1 << order
    this.size = 1 << (order / 2)

    this.svg = d3.select(svg)
      .attr('width', canvasWidth + margin.left + margin.right)
      .attr('height', canvasWidth + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    this.graphGroup = this.svg.append('g')
    this.lineGroup = this.svg.append('g')

    this.points = getHilbertPath(0, this.length, this.size)
  }

  public drawLine() {
    const scale = d3.scaleLinear()
      .domain([ 0, this.size ])
      .range([ 0, this.canvasWidth ])

    const line = d3.line<Point>()
      .x((d) => scale(d.x))
      .y((d) => scale(d.y))

    this.lineGroup.append('path')
      .datum(this.points)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', '1.5')
      .attr('d', line)
  }

  public update(fft: Float32Array) {
    const scale = d3.scaleLinear()
      .domain([ 0, this.size ])
      .range([ 0, this.canvasWidth ])

    const dBScale = d3.scaleSequential(d3ScaleChromatic.interpolateSpectral)
      .domain([ -30, -100 ])

    const graph = this.graphGroup.selectAll('rect')
      .data(this.points)

    const pixelSize = this.canvasWidth / this.size

    graph.enter().append('rect')
      .attr('x', (d) => scale(d.x))
      .attr('y', (d) => scale(d.y))
      .attr('transform', `translate(${ - pixelSize / 2}, ${ - pixelSize / 2})`)
      .attr('height', pixelSize)
      .attr('width', pixelSize)
      // .on('mouseover', (d, i, nodes) => {
      //   d3.select(nodes[i])
      //     .attr('fill', () => 'black')
      // })
      // .on('mouseout', (d, i, nodes) => {
      //   d3.select(nodes[i])
      //     .attr('fill', () => dBScale(d.dB))
      // })
      .merge(graph)
        .attr('fill', (d, i) => dBScale(fft[i]) )

    graph.exit().remove()
  }

}
