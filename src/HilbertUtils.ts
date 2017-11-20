import * as d3 from 'd3'
import * as _ from 'lodash'
import { getHilbertPath } from './Hilbert'

const margin = { top: 5, right: 5, bottom: 5, left: 5 }

const MIN_COLOR = d3.rgb('white')
const MAX_COLOR = d3.rgb('red')

export class HilbertGraph {
  private svg: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>
  private length: number
  private size: number

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
  }

  public getData(fft: Float32Array) {
    const points = getHilbertPath(0, this.length, this.size)

    return _(points).map((point, i) => ({
      ...point,
      dB: fft[i],
    })).value()
  }

  public update(fft: Float32Array) {
    const scale = d3.scaleLinear()
      .domain([ 0, this.size ])
      .range([ 0, this.canvasWidth ])

    const dBScale = d3.scaleLinear<d3.RGBColor>()
      .domain([ -90, -10 ])
      .interpolate(d3.interpolateHcl)
      .range([ MIN_COLOR, MAX_COLOR ])

    const data = this.getData(fft)

    const graph = this.svg.selectAll('circle')
      .data(data, (d, i, nodes) => d ? (d as any).dB : (nodes[i] as any).id)

    const t = d3.transition().duration(5)

    graph.enter().append('circle')
      .attr('cx', (d) => scale(d.x))
      .attr('cy', (d) => scale(d.y))
      .attr('r', 3)
      .attr('fill', (d, i) => dBScale(d.dB))
      .style('fill-opacity', 1e-6)
      .on('mouseover', (d, i, nodes) => {
        d3.select(nodes[i])
          .attr('fill', () => 'black')
          .attr('r', 6)
      })
      .on('mouseout', (d, i, nodes) => {
        d3.select(nodes[i])
          .attr('fill', () => dBScale(d.dB))
          .attr('r', 3)
      })
      .transition(t)
        .style('fill-opacity', 1)

    graph.exit()
      .transition(t)
        .style('fill-opacity', 1e-6)
        .remove()
  }

}
