import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { StoryFn, StoryContext } from "@storybook/react";
import {useMove} from '@use-gesture/react';
import isChromatic from "chromatic/isChromatic";

import { RenderFrameProvider } from "../src/RenderFrame.component";
import {Canvas} from "../src/components/Canvas";

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

type MousePos = [number, number];

const MousePositionContext = createContext<MousePos>([0, 0]);

export function useMousePos(): MousePos {
  const ctx = useContext(MousePositionContext);
  
  if (!ctx) {
    throw new Error('useMousePos() must be rendered in a story using the withMousePosition decorator');
  }

  return ctx;
}

export function withMousePosition(Story: StoryFn, ctx: StoryContext) {
  const [mousePos, setMousePos] = useState<[number, number]>([0, 0]);

  const bind = useMove((state) => {
    setMousePos(state.values);
  });

  return (
    <MousePositionContext.Provider value={mousePos}>
      <div {...bind()}>
        <Story />
      </div>
    </MousePositionContext.Provider>
  );
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
