import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { StoryFn, StoryContext } from "@storybook/react";
import isChromatic from "chromatic/isChromatic";

import { useRenderFrameCanvas, RenderFrameProvider, Canvas, useEllipse, useAnimationFrame } from "../src";

export function withRotation(Story: StoryFn, ctx: StoryContext) {
  const [rotation] = useAnimationFrame({
    from: 0,
    to: 360,
    duration: 3_000,
    auto: true,
    infinite: true,
  });

  ctx.args.rotation = rotation;

  return <Story />
}

export function withCenterDot(Story: StoryFn) {
  const [canvas] = useRenderFrameCanvas();
  let center = {x: 0, y: 0};

  if (canvas) {
    center.x = canvas.width / 2;
    center.y = canvas.height /2;
  }
  useEllipse({center, radius: 1, fillStyle: 'black'});

  return <Story />;
}

export function withRenderFrameProvider(Story: StoryFn, ctx: StoryContext) {
  const customParams = ctx.parameters?.canvasProvider ?? {};

  const { height } =
    window.parent.document
      .getElementById("storybook-preview-iframe")
      ?.getBoundingClientRect() ?? {};

  const args = {
    width: ctx.canvasElement.offsetWidth,
    height,
    ...customParams,
    style: { border: "1px solid black" },
  };

  return (
    <RenderFrameProvider>
      <Story />
      <Canvas  {...args} />
    </RenderFrameProvider>
  );
}

type HandleMouseMove = (x: number, y: number, e: MouseEvent) => void;

type HandleMouseIdle = () => void;

interface UseMouseMoveArgs {
  onMove?: HandleMouseMove;
  onIdle?: HandleMouseIdle;
}

type MousePositionContextType = [number, number, {
  addMoveListener: (handler: HandleMouseMove) => void;
  removeMoveListener: (handler: HandleMouseMove) => void;
  addIdleListener: (handler: HandleMouseIdle) => void;
  removeIdleListener: (handler: HandleMouseIdle) => void;
}]

const MousePositionContext = createContext<MousePositionContextType>([0, 0, {
  addMoveListener: () => {},
  removeMoveListener: () => {},
  addIdleListener: () => {},
  removeIdleListener: () => {},
}]);

export function useMousePos({onIdle= () => {}, onMove = () => {}}: UseMouseMoveArgs = {}): MousePositionContextType {
  const ctx = useContext(MousePositionContext);
  const moveHandler = useRef<HandleMouseMove | null>(null);
  const idleHandler = useRef<HandleMouseIdle | null>(null);
  
  if (!ctx) {
    throw new Error('useMousePos() must be rendered in a story using the withMousePosition decorator');
  }

  useEffect(() => {
    if (!ctx) return;

    const [,, listeners] = ctx;

    if (onMove !== moveHandler.current) {
      listeners.addMoveListener(onMove);
      moveHandler.current = onMove;
    }

    if (onIdle !== idleHandler.current) {
      listeners.addIdleListener(onIdle);
      idleHandler.current = onIdle;
    }

    return () => {
      listeners.removeMoveListener(onMove);
      listeners.removeIdleListener(onIdle);
    }

  }, [ctx, onMove, onIdle]);

  return ctx;
}

export function withMousePosition(Story: StoryFn) {
  const [idle, setIdle] = useState<boolean>(true);
  const [canvas] = useRenderFrameCanvas();
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  const moveListeners = useRef<Map<HandleMouseMove, true>>(new Map());
  const idleListeners = useRef<Map<HandleMouseIdle, true>>(new Map());
  // @TODO: fix typing for timeout
  const idleTimeout = useRef<any>();

  useEffect(() => {
    if (idle) {
      for (let handle of idleListeners.current.keys()) {
        handle();
      }
    }
  }, [idle]);

  function setIdleTimeout() {
    idleTimeout.current = setTimeout(() => {
      setIdle(true);
    }, 60);
  }

  function clearIdle() {
    setIdle(false);
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }
  }

  useEffect(() => {
    function update(e: MouseEvent) {
      if (!canvas) return;

      clearIdle();

      const rect = canvas.getBoundingClientRect();
      
      const insideX = rect.x + rect.width > e.clientX && e.clientX > rect.x;
      const insideY = rect.y + rect.height > e.clientY && e.clientY > rect.y;

      if (insideX && insideY) {
        const x = Math.min(rect.width, Math.max(0, e.clientX - rect.x));
        const y = Math.min(rect.height, Math.max(0, e.clientY - rect.y));
        setPosition([x, y]);

        for (let handler of moveListeners.current.keys()) {
          handler(x, y, e);
        }
      }

      setIdleTimeout();
    }

    window.addEventListener('mousemove', update);

    return () => window.removeEventListener('mousemove', update);

  }, [canvas]);

  function addMoveListener(handler: HandleMouseMove) {
    if (!moveListeners.current.has(handler)) {
      moveListeners.current.set(handler, true);
    }
  }

  function removeMoveListener(handler: HandleMouseMove) {
    if (moveListeners.current.has(handler)) {
      moveListeners.current.delete(handler);
    }
  }

  function addIdleListener(handler: HandleMouseIdle) {
    if (!idleListeners.current.has(handler)) {
      idleListeners.current.set(handler, true);
    }
  }

  function removeIdleListener(handler: HandleMouseIdle) {
    if (idleListeners.current.has(handler)) {
      idleListeners.current.delete(handler);
    }
  }

  const [x, y] = position;

  return (
    <MousePositionContext.Provider value={[x, y, {addMoveListener, removeMoveListener, addIdleListener, removeIdleListener}]}>
      <Story />
    </MousePositionContext.Provider>
  )
}

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export function withTodoList(Story: StoryFn) {
  const [text, setText] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const input = useRef<HTMLInputElement>(null);

  function update(text: string) {
    setText(text);
  }

  function submit() {
    if (text.length > 0) {
      setTodos((curr) => [...curr, { id: Math.random(), done: false, text }]);
      update("");
      input.current?.focus();
    }
  }

  useEffect(() => {
    function onEnter(e: KeyboardEvent) {
      if (e.key === "Enter") {
        submit();
      }
    }

    window.addEventListener("keyup", onEnter);

    return () => {
      window.removeEventListener("keyup", onEnter);
    };
  });

  if (isChromatic()) {
    return <Story />;
  }

  function toggleTodo(id: number) {
    setTodos((curr) =>
      curr.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            done: !todo.done,
          };
        }
        return todo;
      })
    );
  }

  function deleteTodo(id: number) {
    setTodos((curr) => curr.filter((todo) => todo.id !== id));
  }

  function toggle() {
    setVisible((visible) => !visible);
  }

  return (
    <>
    <Story />
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 999 }}>
        <div style={{ padding: 10 }}>
          <div style={{ marginBottom: 10 }}>
            <button onClick={toggle}>{visible ? "hide" : "show"}</button>
          </div>
          {visible ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <input
                  onChange={(e) => update(e.target.value)}
                  value={text}
                  ref={input}
                />
                <button onClick={submit}>Submit</button>
              </div>
              <ul>
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    style={{
                      background: "rgba(200, 200, 200, 0.5)",
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <button onClick={() => deleteTodo(todo.id)}>X</button>
                    {todo.text}
                    <button onClick={() => toggleTodo(todo.id)}>
                      {todo.done ? "undo" : "done"}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
