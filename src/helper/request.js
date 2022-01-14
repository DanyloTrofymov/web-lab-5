import { token, errorArr } from '../store';
import { get } from 'svelte/store';

class Request {
  // eslint-disable-next-line
  async fetchGraphQL(operationsDoc, operationName, variables) {
    try {
      // eslint-disable-next-line
      const result = await fetch(herokuenv, {
        method: 'POST',
        body: JSON.stringify({
          query: operationsDoc,
          variables,
          operationName,
        }),
        headers: {
          Authorization: `Bearer ${get(token)}`,
        },
      });
      return await result.json(); // eslint-disable-line
    } catch (e) {
      errorArr.update((n) => [...n, e.message]);
    }
  }

  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, 'MyQuery', {});
  }

  async startFetchMyQuery(operationsDoc) {
    const { errors, data } = await this.fetchMyQuery(operationsDoc);

    if (errors) {
      console.error(errors);
      throw new Error(errors.message.join('\n'));
    }

    console.log(data);
    return data;
  }
  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, 'MyMutation', {});
  }

  async startExecuteMyMutation(operationsDoc) {
    const { errors, data } = await this.executeMyMutation(operationsDoc);

    if (errors) {
      console.error(errors);
      throw new Error(errors.message.join('\n'));
    }

    console.log(data);
    return data;
  }
}
export default new Request();
