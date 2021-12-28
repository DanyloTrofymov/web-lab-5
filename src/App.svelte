<script>
  import request from './helper/request';
  import { Operations } from './helper/operation';
  import { todos, isAuthenticated, user, token } from './store';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import auth from './auth-service';

  let titleValue = '';
  let bodyValue = '';
  let deadlineValue = '';
  let loaderEnabled = false;

  window.onload = async () => {
    if (get(isAuthenticated)) {
      const { lab5_todo } = await request.startFetchMyQuery(
        Operations.queryGetAll(),
      );
      todos.set(lab5_todo);
    }
  };

  token.subscribe(async (tokenValue) => {
    console.log(tokenValue);
    if (tokenValue != '') {
      const lab5_todo = await request.startFetchMyQuery(
        Operations.queryGetAll(),
      );
      todos.set(lab5_todo);
    }
  });

  let auth0Client;
  onMount(async () => {
    auth0Client = await auth.createClient();
    isAuthenticied.set(await auth0Client.isAuthenticied());
    const accessToken = await auth0Client.getIdTokenClaims();
    if (accessToken) {
      token.set(accessToken.__raw);
    }
    user.set(await auth0Client.getUser());
  });

  function login() {
    auth.loginWithPopup(auth0Client);
  }
  function logout() {
    auth.logout(auth0Client);
  }

  const addTask = async () => {
    try {
      if (titleValue == '') {
        alert('Title can`t be empty!');
        loaderEnabled = false;
        return;
      }
      if (deadlineValue == '') {
        const { inserted } = await request.startExecuteMyMutation(
          Operations.mutationInsertWithoutDeadline(titleValue, bodyValue),
        );
        todos.update((n) => [...n, inserted.returning[0]]);
      } else {
        const { inserted } = await request.startExecuteMyMutation(
          Operations.mutationInsert(titleValue, bodyValue, deadlineValue),
        );
        todos.update((n) => [...n, inserted.returning[0]]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      loaderEnabled = false;
    }
  };
  const deleteTask = async (id) => {
    loaderEnabled = true;
    const { deleted } = await request.startExecuteMyMutation(
      Operations.mutationDelete(id),
    );
    todos.update((n) => n.filter((item) => item.id != id));
    loaderEnabled = false;
  };
  const updateChecked = async (id, checked) => {
    loaderEnabled = true;
    await request.startExecuteMyMutation(
      Operations.mutationChecked(id, checked),
    );
    loaderEnabled = false;
  };
</script>

<main>
  <div>
    {#if $isAuthenticated}
      {#if $todos.loading}
        <div class="loader" />
      {:else if $todos.error}
        <h1 class="message">error</h1>
      {:else if $todos.data}
        {#if loaderEnabled}
          <div class="loader" />
        {/if}
        <form class="form" on:submit|preventDefault={addTask}>
          <div class="form__section">
            <input
              type="text"
              name="Title"
              placeholder="Title"
              on:input={(event) => (titleValue = event.target.value)}
            />
            <input
              type="text"
              body="body"
              placeholder="body"
              on:input={(event) => (bodyValue = event.target.value)}
            />
            <input
              type="date"
              body="deadline"
              placeholder="deadline"
              on:input={(event) => (deadlineValue = event.target.value)}
            />
          </div>
          <button>Add task</button>
        </form>
        <table border="1">
          <caption>ToDo</caption>
          <tr>
            <th>Done</th>
            <th>Id</th>
            <th>Title</th>
            <th>Body</th>
            <th>Deadline</th>
            <th>Delete</th>
          </tr>
          {#each $todos.data.todo_pinkpanther as task (task.id)}
            <tr>
              <td
                ><input
                  type="checkbox"
                  checked={task.done}
                  on:click={() => updateChecked(task.id, !task.done)}
                /></td
              >
              <td>{task.id}</td>
              <td>{task.noteTitle}</td>
              <td>{task.noteBody}</td>
              <td>{task.deadline}</td>
              <td
                ><button class="delete" on:click={() => deleteTask(task.id)}
                  >Delete</button
                ></td
              >
            </tr>
          {/each}
        </table>
      {/if}
    {:else}
      <button on:click={login}>Log in</button>
    {/if}
  </div>
</main>

<style>
  :root {
    --background-color: lightblue;
    --form-background-color: #fff;
    --light-color: #eee;
    --dark-color: #000;
    --button-hover-color: gray;
    --loader-color: gray;
    --delete-color: rgb(163, 13, 13);
    --table-color: #3e3cca;
    --button-color: #4caf50;
  }
  main {
    margin: 0;
    max-width: 100%;
  }
  .form {
    background-color: var(--form-background-color);
    border-radius: 3px;
    padding: 20px;
    width: 700px;
    margin: auto;
    display: flex;
    gap: 20px;
    position: relative;
    border: 1px solid var(--light-color);
  }
  .form input,
  .form button {
    background-color: var(--light-color);
    outline: none;
    border: 1px solid var(--light-color);
    border-radius: 3px;
    padding: 10px;
  }

  .message {
    position: absolute;
    top: 40%;
    left: 50%;
  }

  table {
    border-collapse: collapse;
    margin: auto;
    width: 90%;
    border-left: 3px solid var(--table-color);
    border-right: 3px solid var(--table-color);
    border-bottom: 3px solid var(--table-color);
  }
  button {
    cursor: pointer;
  }
  caption {
    background: var(--table-color);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    padding: 10px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    color: var(--light-color);
    font-family: 'Roboto Slab', serif;
    font-style: normal;
    font-size: 26px;
    text-align: center;
    margin: 0;
  }
  td,
  th {
    padding: 10px;
  }
  th {
    text-align: left;
    font-size: 18px;
  }
  tr:nth-child(2n) {
    background: var(--light-color);
  }
  tr:nth-child(2n-1) {
    background: var(--background-color);
  }
  td:last-of-type {
    text-align: center;
  }
  .delete {
    display: inline-block;
    padding: 5px 10px;
    background: var(--delete-color);
    color: var(--light-color);
    box-shadow: 2px 2px 0 0 var(--delete-color);
    position: relative;
  }
  .delete:hover {
    box-shadow: none;
    top: 2px;
    left: 2px;
  }

  .loader {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
  }
  .loader:after {
    background: rgba(0, 0, 0, 0.7);
    content: ' ';
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid;
    border-color: var(--button-hover-color) transparent
      var(--button-hover-color) transparent;
    animation: loader 1.2s linear infinite;
  }
  @keyframes loader {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
