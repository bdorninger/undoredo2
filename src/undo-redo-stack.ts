import {
  Patch,
  applyPatches,
  enableMapSet,
  enablePatches,
  immerable,
} from 'immer';

/**
 *
 * interface for holding undo redo patches generated post any operation
 */
export interface Patches {
  redo: Patch[];
  undo: Patch[];
}

enablePatches();
enableMapSet();
/**
 * Class for handling undo redo.
 * This class manages the patches, inverse patches generated using Immerjs on user actions(add, delete) for undo redo feature
 */
export class UndoRedoStack<
  TSTATE extends {
    [key: string]: any;
  }
> {
  [immerable] = true;
  public undoRedoPatches: Patches[] = [];
  // We may not want to allow an infinite number of undo-redo as it requires us to store an infinite number of patches and inverse patches.
  public currentUndoRedoVersion = -1;
  private undoBufferCount = 0;
  private redoBufferCount = 0;

  /**
   *
   * populates undo redo patches array with patches and inverse patches after any action in reducer
   */
  public populateUndoRedoStack(
    patches: Patch[],
    inversePatches: Patch[],
    truncate: 'truncate-redo' | undefined = undefined
  ) {
    if (this.undoRedoPatches.length > 0) {
      // if additional actions are done amidst undo/redo
      // the redo buffer will be truncated
      if (truncate === 'truncate-redo') {
        this.undoRedoPatches = this.undoRedoPatches.slice(
          0,
          this.currentUndoRedoVersion + 1
        );
        this.redoBufferCount = 0;
      }
      this.currentUndoRedoVersion = this.undoRedoPatches.length;
    } else {
      this.currentUndoRedoVersion++;
    }
    this.undoBufferCount++;
    this.undoRedoPatches[this.currentUndoRedoVersion] = {
      redo: patches,
      undo: inversePatches,
    };
  }

  /**
   *
   * resets the undo, redo buffer counters and patches
   */
  public resetUndoRedoStack() {
    this.undoRedoPatches = [];
    this.undoBufferCount = 0;
    this.redoBufferCount = 0;
  }

  /**
   *
   * performs undo operation on the modified state by applying inverse patch
   */
  public applyPatchesOnUndo(state: TSTATE) {
    if (this.undoBufferCount <= 0) {
      return state;
      // throw new Error('NO UNDO');
    }
    const result = applyPatches(
      state,
      this.undoRedoPatches[this.currentUndoRedoVersion--].undo
    );
    this.setUndoRedoCountersOnUndo();

    return result;
  }

  /**
   *
   * performs redo operation on the modified state by applying patch to bring it back to original state
   */
  public applyPatchesOnRedo(state: TSTATE) {
    if (this.redoBufferCount <= 0) {
      return state;
      // throw new Error('NO REDO');
    }
    const result = applyPatches(
      state,
      this.undoRedoPatches[++this.currentUndoRedoVersion].redo
    );
    this.setUndoRedoCountersOnRedo();

    return result;
  }

  /**
   *
   * removes a patch in case after undo, user performs another action, without corresponding redo operation.
   */
  public updateStackOnActionsBetweenUndoRedo() {
    if (this.redoBufferCount > 0) {
      this.undoRedoPatches[this.currentUndoRedoVersion - 1] =
        this.undoRedoPatches[this.currentUndoRedoVersion];
      this.undoRedoPatches.splice(this.currentUndoRedoVersion, 1);
      this.currentUndoRedoVersion--;
      this.redoBufferCount = 0;
    }
  }

  /**
   *
   * returns undo buffer count
   */
  public getUndoBufferCount() {
    return this.undoBufferCount;
  }

  /**
   *
   * returns redo buffer count
   */
  public getRedoBufferCount() {
    return this.redoBufferCount;
  }

  /**
   *
   * updates the undo and redo buffer counters on Undo
   */
  private setUndoRedoCountersOnUndo() {
    this.undoBufferCount--;
    this.redoBufferCount++;
  }

  /**
   *
   * updates the undo and redo buffer counters on Redo
   */
  private setUndoRedoCountersOnRedo() {
    this.redoBufferCount--;
    this.undoBufferCount++;
  }
}
