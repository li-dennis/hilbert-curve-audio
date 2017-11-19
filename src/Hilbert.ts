import * as _ from 'lodash'

export enum X_SIDES {
  LEFT = 0,
  RIGHT = 1,
}

export enum Y_SIDES {
  UP = 0,
  BOTTOM = 1,
}

export type Point = {
  x: number,
  y: number,
}

export function rotate(
  point: Point,
  regionSize: number,
  xSide: X_SIDES,
  ySide: Y_SIDES,
): Point {
  if (ySide === Y_SIDES.BOTTOM) {
    return point
  }

  // rotate top right qudrant CW 90 deg
  if (xSide === X_SIDES.RIGHT) {
    return {
      x: regionSize - 1 - point.y,
      y: regionSize - 1 - point.x,
    }
    // rotate top left quadrant CCW 90deg
  } else {
    return {
      x: point.y,
      y: point.x,
    }
  }
}

// Note: this function will start breaking down for n > 2^26 (MAX_SAFE_INTEGER = 2^53)
export function pointToDistance(point: Point, maxSize: number): number {
  const bitLength = Math.floor(Math.log2(maxSize))

  return _.range(1, bitLength + 1)
    .reduce(({ currDistance, currPoint }, shiftCount) => {
      const boundaryLine = maxSize >> shiftCount

      const xSide = (currPoint.y & boundaryLine) > 0 ? X_SIDES.RIGHT : X_SIDES.LEFT
      const ySide = (currPoint.x & boundaryLine) > 0 ? Y_SIDES.BOTTOM : Y_SIDES.UP

      const dx = (boundaryLine * boundaryLine * (3 * xSide)) ^ ySide
      const nextPoint = rotate(currPoint, boundaryLine, xSide, ySide)

      return {
        currDistance: currDistance + dx,
        currPoint: nextPoint,
      }
    }, {
      currDistance: 0,
      currPoint: point,
    }).currDistance
}

// Every 4 bits can be rotated and decoded into a U shape. 00->01 = down, 01->10 = right, 10 -> 11 = up
export function distanceToPoint(distance: number, maxSize: number): Point {
  const bitLength = Math.floor(Math.log2(maxSize))

  return  _.range(0, bitLength)
    .reduce(({ currDistance, currPoint }, shiftCount) => {
      const regionSize = 1 << shiftCount

      const xSide = 1 & (currDistance >> 1) ? X_SIDES.RIGHT : X_SIDES.LEFT
      const ySide = 1 & (currDistance ^ xSide) ? Y_SIDES.BOTTOM : Y_SIDES.UP

      const { x, y } = rotate(currPoint, regionSize, xSide, ySide)

      return {
        currDistance: currDistance >> 2,
        currPoint: {
          x: x + regionSize * xSide,
          y: y + regionSize * ySide,
        },
      }
    },
    {
      currDistance: distance,
      currPoint: { x: 0, y: 0 },
    }).currPoint
}

export class HilbertCurve {
  public path: any
  // Note: Maximum safe order is 26, due to JS numbers upper-boundary of 53 bits
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
  constructor(
    public order: number,
    public canvasWidth: number,
  ) {
  }

  public layout(range: { start: number; length: number }) {
    this.path = getHilbertPath(
      range.start,
      range.length,
      this.order,
      this.canvasWidth,
    )

    return this.path
  }

  public getDistance(point: Point) {
    const n = 1 << this.order

    const scale = (coord: number) => Math.floor(coord * n / this.canvasWidth)

    const scaledPoint: Point = {
      x: scale(point.x),
      y: scale(point.y),
    }

    return pointToDistance(scaledPoint, n)
  }
}

export function getHilbertPath(start: number, length: number, order: number, canvasSize: number) {
  // const maxPos = 4 << (2 * order)
  // if (start > maxPos || start < 0) {
  //   throw new Error('Start exceeds maximum or minimum position')
  // } else if (length > maxPos || length < 0) {
  //   throw new Error('Length exceeds maximum or minimum position ')
  // }

  const sideSize = 1 << (order / 2)
  const cellWidth = canvasSize / sideSize

  const startPoint = distanceToPoint(start, sideSize)
  const vertices = []

  let prevPoint = startPoint
  let nextPoint: Point

  for (let i = 1; i < length; i++) {
    nextPoint = distanceToPoint(start + i, sideSize)

    vertices.push(
      nextPoint.x > prevPoint.x ? 'R' : (
        nextPoint.x < prevPoint.x ? 'L' : (
          nextPoint.y > prevPoint.y ? 'D' : 'U'
        )
      ),
    )

    prevPoint = nextPoint
  }

  return {
    cellWidth,
    startPoint,
    pathVertices: vertices,
  }
}
