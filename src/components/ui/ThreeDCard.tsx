import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

interface ThreeDCardProps {
  children: ReactNode;
  className?: string;
  maximumTilt?: number;
}

interface MotionState {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
  glareOpacity: number;
}

type ThreeDCardStyle =
  CSSProperties &
  Record<`--${string}`, string | number>;

const SMOOTHING_FACTOR = 0.12;
const STOP_THRESHOLD = 0.01;

function createInitialMotion(): MotionState {
  return {
    rotateX: 0,
    rotateY: 0,
    glareX: 0,
    glareY: 0,
    glareOpacity: 0.08,
  };
}

function interpolate(
  current: number,
  target: number,
  amount: number,
): number {
  return (
    current +
    (target - current) * amount
  );
}

export default function ThreeDCard({
  children,
  className = "",
  maximumTilt = 7,
}: ThreeDCardProps) {
  const cardRef =
    useRef<HTMLDivElement>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const targetMotionRef =
    useRef<MotionState>(
      createInitialMotion(),
    );

  const currentMotionRef =
    useRef<MotionState>(
      createInitialMotion(),
    );

  const applyStyles = () => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const current =
      currentMotionRef.current;

    card.style.setProperty(
      "--rotate-x",
      `${current.rotateX.toFixed(3)}deg`,
    );

    card.style.setProperty(
      "--rotate-y",
      `${current.rotateY.toFixed(3)}deg`,
    );

    card.style.setProperty(
      "--glare-x",
      `${current.glareX.toFixed(2)}px`,
    );

    card.style.setProperty(
      "--glare-y",
      `${current.glareY.toFixed(2)}px`,
    );

    card.style.setProperty(
      "--glare-opacity",
      current.glareOpacity.toFixed(3),
    );

    card.style.setProperty(
      "--shadow-x",
      `${(
        current.rotateY * -1.3
      ).toFixed(2)}px`,
    );

    card.style.setProperty(
      "--shadow-y",
      `${(
        24 +
        current.rotateX * 0.8
      ).toFixed(2)}px`,
    );
  };

  const animate = () => {
    const current =
      currentMotionRef.current;

    const target =
      targetMotionRef.current;

    current.rotateX = interpolate(
      current.rotateX,
      target.rotateX,
      SMOOTHING_FACTOR,
    );

    current.rotateY = interpolate(
      current.rotateY,
      target.rotateY,
      SMOOTHING_FACTOR,
    );

    current.glareX = interpolate(
      current.glareX,
      target.glareX,
      SMOOTHING_FACTOR,
    );

    current.glareY = interpolate(
      current.glareY,
      target.glareY,
      SMOOTHING_FACTOR,
    );

    current.glareOpacity =
      interpolate(
        current.glareOpacity,
        target.glareOpacity,
        SMOOTHING_FACTOR,
      );

    applyStyles();

    const isMoving =
      Math.abs(
        current.rotateX -
          target.rotateX,
      ) > STOP_THRESHOLD ||
      Math.abs(
        current.rotateY -
          target.rotateY,
      ) > STOP_THRESHOLD ||
      Math.abs(
        current.glareX -
          target.glareX,
      ) > STOP_THRESHOLD ||
      Math.abs(
        current.glareY -
          target.glareY,
      ) > STOP_THRESHOLD ||
      Math.abs(
        current.glareOpacity -
          target.glareOpacity,
      ) > STOP_THRESHOLD;

    if (isMoving) {
      animationFrameRef.current =
        window.requestAnimationFrame(
          animate,
        );

      return;
    }

    currentMotionRef.current = {
      ...target,
    };

    applyStyles();

    animationFrameRef.current = null;
  };

  const startAnimation = () => {
    if (
      animationFrameRef.current !==
      null
    ) {
      return;
    }

    animationFrameRef.current =
      window.requestAnimationFrame(
        animate,
      );
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType === "touch") {
      return;
    }

    const card = event.currentTarget;

    const rectangle =
      card.getBoundingClientRect();

    const relativeX =
      (event.clientX - rectangle.left) /
      rectangle.width;

    const relativeY =
      (event.clientY - rectangle.top) /
      rectangle.height;

    const normalizedX = Math.min(
      Math.max(relativeX, 0),
      1,
    );

    const normalizedY = Math.min(
      Math.max(relativeY, 0),
      1,
    );

    targetMotionRef.current = {
      rotateX:
        (0.5 - normalizedY) *
        maximumTilt *
        2,

      rotateY:
        (normalizedX - 0.5) *
        maximumTilt *
        2,

      glareX:
        (normalizedX - 0.5) * 90,

      glareY:
        (normalizedY - 0.5) * 90,

      glareOpacity: 0.38,
    };

    startAnimation();
  };

  const resetCard = () => {
    targetMotionRef.current = {
      rotateX: 0,
      rotateY: 0,
      glareX: 0,
      glareY: 0,
      glareOpacity: 0.08,
    };

    startAnimation();
  };

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, []);

  const initialStyle: ThreeDCardStyle = {
    "--rotate-x": "0deg",
    "--rotate-y": "0deg",
    "--glare-x": "0px",
    "--glare-y": "0px",
    "--glare-opacity": "0.08",
    "--shadow-x": "0px",
    "--shadow-y": "24px",
  };

  return (
    <div
      className={[
        "three-d-scene",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        ref={cardRef}
        className="three-d-card"
        style={initialStyle}
        onPointerMove={
          handlePointerMove
        }
        onPointerLeave={resetCard}
        onPointerCancel={resetCard}
      >
        <span
          className="three-d-card__shadow"
          aria-hidden="true"
        />

        <div className="three-d-card__content">
          {children}
        </div>

        <span
          className="three-d-card__glare"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}