import { current, Patch, produce, produceWithPatches } from 'immer';

export interface MyState {
  name: string;
  x: number;
  data: number[][];
}

const state: MyState = {
  name: 'bar',
  x: 10,
  data: [
    [1, 2, 3],
    [6, 6, 6],
    [7, 8, 9],
  ],
};

let currentState = produce(state, (d) => d);

export function originalState(): Readonly<MyState> {
  return state;
}

export function getCurrentState(): MyState {
  return currentState;
}

export function setNewState(news: MyState) {
  currentState = news;
}

export function increaseX(): MyState {
  const nes = produce(currentState, (draft) => {
    draft.x++;
  });
  return nes;
}

export function updateData(
  i: number,
  data: number[]
): { state: MyState; redo: Patch[]; undo: Patch[] } {
  const nes = produceWithPatches(currentState, (draft) => {
    draft.data[i] = data;
  });
  console.log('pwp', nes);
  return { state: nes[0], redo: nes[1], undo: nes[2] };
}
