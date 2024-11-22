import './style.css';
import typescriptLogo from './typescript.svg';
import viteLogo from '/vite.svg';
import {
  getCurrentState,
  increaseX,
  MyState,
  setNewState,
  updateData,
} from './state.ts';
import { enableMapSet, enablePatches } from 'immer';
import { UndoRedoStack } from './undo-redo-stack.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button">INC</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);
enablePatches();
enableMapSet();
const btn = document.querySelector<HTMLButtonElement>('#counter');

const unDoStack = new UndoRedoStack<MyState>();

btn?.addEventListener('click', (e: Event) => {
  if ((e as any).shiftKey) {
    if ((e as any).altKey) {
      const redone = unDoStack.applyPatchesOnRedo(getCurrentState());
      setNewState(redone);
    } else {
      const undone = unDoStack.applyPatchesOnUndo(getCurrentState());
      setNewState(undone);
    }
  } else {
    const stp = updateData(
      1,
      getCurrentState().data[1].map((v) => v + 1)
    );

    setNewState(stp.state);
    unDoStack.populateUndoRedoStack(stp.redo, stp.undo, true);
  }
  const cs = getCurrentState();
  console.log(
    `currentState is : ${JSON.stringify(cs.data[1])} `,
    cs,
    unDoStack
  );
});
