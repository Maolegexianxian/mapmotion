/**
 * 缓动函数库
 * 提供丰富的缓动函数用于动画过渡
 */

/** 缓动函数类型 */
export type EasingFunction = (t: number) => number;

/** 缓动类型枚举 */
export type EasingType =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'easeInCirc'
  | 'easeOutCirc'
  | 'easeInOutCirc'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce';

/**
 * 缓动函数集合
 */
export const Easing = {
  /** 线性 - 匀速运动 */
  linear: (t: number): number => t,

  /** 二次方缓入 */
  easeInQuad: (t: number): number => t * t,

  /** 二次方缓出 */
  easeOutQuad: (t: number): number => t * (2 - t),

  /** 二次方缓入缓出 */
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  /** 三次方缓入 */
  easeInCubic: (t: number): number => t * t * t,

  /** 三次方缓出 */
  easeOutCubic: (t: number): number => {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  },

  /** 三次方缓入缓出 */
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  /** 四次方缓入 */
  easeInQuart: (t: number): number => t * t * t * t,

  /** 四次方缓出 */
  easeOutQuart: (t: number): number => {
    const t1 = t - 1;
    return 1 - t1 * t1 * t1 * t1;
  },

  /** 四次方缓入缓出 */
  easeInOutQuart: (t: number): number => {
    const t1 = t - 1;
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * t1 * t1 * t1 * t1;
  },

  /** 五次方缓入 */
  easeInQuint: (t: number): number => t * t * t * t * t,

  /** 五次方缓出 */
  easeOutQuint: (t: number): number => {
    const t1 = t - 1;
    return 1 + t1 * t1 * t1 * t1 * t1;
  },

  /** 五次方缓入缓出 */
  easeInOutQuint: (t: number): number => {
    const t1 = t - 1;
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * t1 * t1 * t1 * t1 * t1;
  },

  /** 正弦缓入 */
  easeInSine: (t: number): number => 1 - Math.cos((t * Math.PI) / 2),

  /** 正弦缓出 */
  easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),

  /** 正弦缓入缓出 */
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,

  /** 指数缓入 */
  easeInExpo: (t: number): number => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),

  /** 指数缓出 */
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  /** 指数缓入缓出 */
  easeInOutExpo: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  /** 圆形缓入 */
  easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),

  /** 圆形缓出 */
  easeOutCirc: (t: number): number => Math.sqrt(1 - Math.pow(t - 1, 2)),

  /** 圆形缓入缓出 */
  easeInOutCirc: (t: number): number =>
    t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

  /** 回弹缓入 */
  easeInBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },

  /** 回弹缓出 */
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  /** 回弹缓入缓出 */
  easeInOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  /** 弹性缓入 */
  easeInElastic: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },

  /** 弹性缓出 */
  easeOutElastic: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  /** 弹性缓入缓出 */
  easeInOutElastic: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c5 = (2 * Math.PI) / 4.5;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },

  /** 弹跳缓出 */
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  /** 弹跳缓入 */
  easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),

  /** 弹跳缓入缓出 */
  easeInOutBounce: (t: number): number =>
    t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2,
};

/**
 * 根据类型获取缓动函数
 * @param type - 缓动类型
 * @returns 缓动函数
 */
export function getEasingFunction(type: EasingType): EasingFunction {
  return Easing[type] || Easing.linear;
}

/**
 * 创建贝塞尔曲线缓动函数
 * @param x1 - 控制点1 x
 * @param y1 - 控制点1 y
 * @param x2 - 控制点2 x
 * @param y2 - 控制点2 y
 * @returns 缓动函数
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
  const NEWTON_ITERATIONS = 4;
  const NEWTON_MIN_SLOPE = 0.001;
  const SUBDIVISION_PRECISION = 0.0000001;

  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;

  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;

  function sampleCurveX(t: number): number {
    return ((ax * t + bx) * t + cx) * t;
  }

  function sampleCurveY(t: number): number {
    return ((ay * t + by) * t + cy) * t;
  }

  function sampleCurveDerivativeX(t: number): number {
    return (3 * ax * t + 2 * bx) * t + cx;
  }

  function solveCurveX(x: number): number {
    let t2 = x;
    let derivative: number;
    let x2: number;

    // Newton's method
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < SUBDIVISION_PRECISION) {
        return t2;
      }
      derivative = sampleCurveDerivativeX(t2);
      if (Math.abs(derivative) < NEWTON_MIN_SLOPE) {
        break;
      }
      t2 = t2 - x2 / derivative;
    }

    // Binary subdivision
    let t0 = 0;
    let t1 = 1;
    t2 = x;

    while (t0 < t1) {
      x2 = sampleCurveX(t2);
      if (Math.abs(x2 - x) < SUBDIVISION_PRECISION) {
        return t2;
      }
      if (x > x2) {
        t0 = t2;
      } else {
        t1 = t2;
      }
      t2 = (t1 - t0) * 0.5 + t0;
    }

    return t2;
  }

  return (t: number): number => {
    if (t === 0 || t === 1) return t;
    return sampleCurveY(solveCurveX(t));
  };
}

/**
 * 预设的贝塞尔曲线缓动
 */
export const BezierPresets = {
  /** CSS ease */
  ease: cubicBezier(0.25, 0.1, 0.25, 1),
  /** CSS ease-in */
  easeIn: cubicBezier(0.42, 0, 1, 1),
  /** CSS ease-out */
  easeOut: cubicBezier(0, 0, 0.58, 1),
  /** CSS ease-in-out */
  easeInOut: cubicBezier(0.42, 0, 0.58, 1),
};

export default Easing;
