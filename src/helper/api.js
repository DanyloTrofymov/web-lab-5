import request from './request';
import { Operations } from './operation';
import { errorArr, loader, todos } from '../store';

export class Fetches {
  static getTodaysDate = () => {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today;
  };

  static addTask = async (titleValue, bodyValue, deadlineValue) => {
    loader.update((n) => n + 1);
    try {
      if (!titleValue) {
        errorArr.update((n) => [...n, 'Title can not be empty!']);
        return;
      }
      if (!deadlineValue) {
        const { insertLab5Todo } = await request.startExecuteMyMutation(
          Operations.mutationInsertWithoutDeadline(titleValue, bodyValue),
        );
        todos.update((n) => [...n, insertLab5Todo?.returning?.[0] ?? []]);
      } else {
        if (new Date(deadlineValue) < this.getTodaysDate()) {
          errorArr.update((n) => [
            ...n,
            'Deadline can not be earlier than today',
          ]);
          return;
        }
        const { insertLab5Todo } = await request.startExecuteMyMutation(
          Operations.mutationInsert(titleValue, bodyValue, deadlineValue),
        );
        todos.update((n) => [...n, insertLab5Todo?.returning?.[0] ?? []]);
      }
    } catch (e) {
      errorArr.update((n) => [...n, e]);
    } finally {
      loader.update((n) => n - 1);
    }
  };

  static deleteTask = async (id) => {
    loader.update((n) => n + 1);
    await request
      .startExecuteMyMutation(Operations.mutationDelete(id))
      .catch((e) => errorArr.update((n) => [...n, e]));
    todos.update((n) => n.filter((item) => item.id !== id));
    loader.update((n) => n - 1);
  };

  static updateChecked = async (id, checked) => {
    loader.update((n) => n + 1);
    await request
      .startExecuteMyMutation(Operations.mutationChecked(id, checked))
      .catch((e) => errorArr.update((n) => [...n, e]));
    loader.update((n) => n - 1);
  };
}
