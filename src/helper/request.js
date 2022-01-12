import { token } from '../store';
import { get } from 'svelte/store';

class Request {
  async fetchGraphQL(operationsDoc, operationName, variables) {
    try {
      const result = await fetch(
        'https://web-lab-5-jwt.herokuapp.com/v1/graphql',
        {
          method: 'POST',
          body: JSON.stringify({
            query: operationsDoc,
            variables,
            operationName,
          }),
          headers: {
            Authorization: `Bearer ${get(token)}`,
          },
        },
      );
      return await result.json(); // eslint-disable-line
    } catch (e) {
      modalText.set(e.message);
    }
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, 'MyQuery', {});
  }

  async startFetchMyQuery(operationsDoc) {
    const { errors, data } = await this.fetchMyQuery(operationsDoc);

    if (errors) {
      console.error(errors);
      throw new Error(errors[0].message);
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
      throw new Error(errors[0].message);
    }

    console.log(data);
    return data;
  }
}
export default new Request();
