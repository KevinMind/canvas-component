import React, { ComponentProps, useState, useRef, useEffect } from "react";
import { StoryFn, StoryContext } from "@storybook/react";
import isChromatic from "chromatic/isChromatic";

import { CanvasProvider } from "../src/components/Canvas/Canvas.provider";

export function withCanvasProvider(Story: StoryFn, ctx: StoryContext) {
  const customParams = ctx.parameters?.canvasProvider ?? {};

  const { height } =
    window.parent.document
      .getElementById("storybook-preview-iframe")
      ?.getBoundingClientRect() ?? {};

  const args: ComponentProps<typeof CanvasProvider> = {
    width: ctx.canvasElement.offsetWidth,
    height,
    ...customParams,
  };

  return (
    <div id="custom">
      <CanvasProvider {...args} style={{ border: "1px solid black" }}>
        <Story />
      </CanvasProvider>
    </div>
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
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        <Story />
      </div>
      <div style={{ position: "absolute", top: 0, left: 0 }}>
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
    </div>
  );
}
