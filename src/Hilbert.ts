import * as _ from 'lodash'

export enum X_SIDES {
  LEFT = 0,
  RIGHT = 1,
}

export enum Y_SIDES {
  TOP = 0,
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

// Every 4 bits can be rotated and decoded into a U shape. 00->01 = down, 01->10 = right, 10 -> 11 = up
export function lengthToPoint(length: number, squareSize: number): Point {
  const bitLength = Math.floor(Math.log2(squareSize))

  return  _.range(0, bitLength)
    .reduce(({ remainingLength, currPoint }, shiftCount) => {
      const regionSize = 1 << shiftCount

      const isRight = 1 & (remainingLength >> 1) ? X_SIDES.RIGHT : X_SIDES.LEFT
      const isBottom = 1 & (remainingLength ^ isRight) ? Y_SIDES.BOTTOM : Y_SIDES.TOP

      const { x, y } = rotate(currPoint, regionSize, isRight, isBottom)

      return {
        remainingLength: remainingLength >> 2,
        currPoint: {
          x: x + regionSize * isRight,
          y: y + regionSize * isBottom,
        },
      }
    },
    {
      remainingLength: length,
      currPoint: { x: 0, y: 0 },
    }).currPoint
}

export function getHilbertPath(startLength: number, totalLength: number, size: number) {
  const startPoint = lengthToPoint(startLength, size)

  const points = _.range(startLength + 1, startLength + totalLength)
    .reduce((path, distance) => {
      const nextPoint = lengthToPoint(distance, size)
      path.push(nextPoint)
      return path
    }, [ startPoint ])

  return points
}
